import express, { type Router } from "express";
import Stripe from "stripe";
import { prisma } from "../lib/db.js";
import { cache } from "../lib/cache.js";
import { validate } from "../middleware/validation.js";
import { authMiddleware } from "../middleware/auth.js";
import { z } from "zod";
import { hasCompletePayout, PAYOUT_REQUIRED_ERROR } from "../utils/sellerPayout.js";
import { auctionService } from "../services/AuctionService.js";
import { splitSaleAmount } from "../utils/auctionRules.js";

// Import types from Prisma client
// import type { Payment, PaymentStatus, PaymentProvider, PaymentType } from '@prisma/client';

const router: Router = express.Router();

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripe = stripeSecret
  ? new Stripe(stripeSecret, { apiVersion: "2024-06-20" })
  : null;
const db = prisma as any;

// Schematy walidacji
const currencyEnum = z.enum(["PLN", "EUR", "USD"]);

const createCheckoutSchema = z.object({
  auctionId: z.string().uuid("Invalid auction ID format"),
  successUrl: z.string().url("Invalid success URL format").optional(),
  cancelUrl: z.string().url("Invalid cancel URL format").optional(),
});

const paymentAmountSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be positive")
    .min(0.01, "Minimum amount is 0.01")
    .max(1000000, "Maximum amount is 1,000,000")
    .finite("Amount must be a valid number"),
  currency: currencyEnum.default("PLN"),
});

const listingFee = 20; // PLN
const defaultCommissionRate = 0.1; // 10% default fallback

// While one buyer is at the Stripe checkout for "Kup teraz", nobody else can
// start paying for the same auction. Stripe's shortest session lifetime is 30 min.
const BUY_NOW_HOLD_MS = 31 * 60 * 1000;

const getCommissionRate = (): number => {
  const cached = cache.get<{ commission?: number }>("system:platform_settings");
  if (cached && typeof cached.commission === "number" && cached.commission >= 0) {
    return cached.commission / 100;
  }
  return defaultCommissionRate;
};

router.post(
  "/stripe/checkout",
  validate(createCheckoutSchema, { sanitize: true }),
  async (req: any, res) => {
    try {
      if (!stripe)
        return res.status(500).json({ error: "Stripe not configured" });
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      if (!prisma)
        return res.status(500).json({ error: "Database not available" });

      const { auctionId, successUrl, cancelUrl } = req.body as z.infer<
        typeof createCheckoutSchema
      >;

      const auction = await db.auction.findUnique({
        where: { id: auctionId },
        include: { 
          seller: true,
          payments: {
            where: {
              status: "SUCCEEDED",
              type: { in: ["BUY_NOW", "WON_AUCTION"] }
            }
          }
        },
      });
      if (!auction) return res.status(404).json({ error: "Auction not found" });
      
      if (auction.payments.length > 0) {
        return res.status(400).json({ error: "Ta aukcja została już opłacona." });
      }
      if (auction.sellerId === userId) {
        return res.status(400).json({ error: "Nie możesz kupić własnej aukcji." });
      }
      if (!hasCompletePayout(auction.seller)) {
        return res.status(400).json({ error: PAYOUT_REQUIRED_ERROR });
      }

      const now = Date.now();
      const endsAt = new Date(auction.endTime).getTime();
      
      const statusUpper = (auction.status as string)?.toUpperCase();
      const isWinner =
        auction.winnerId === userId &&
        (statusUpper === "ENDED_WAITING_PAYMENT" || statusUpper === "COMPLETED" || statusUpper === "SOLD");
      const isBuyNow = !isWinner && statusUpper === "ACTIVE" && endsAt > now;

      if (!isBuyNow && !isWinner) {
        return res.status(400).json({ error: "Nie możesz opłacić tej aukcji. Aukcja jest nieaktywna lub nie jesteś zwycięzcą." });
      }

      if (isBuyNow) {
        const role = req.user?.role;
        if (role !== "USER_FULL_VERIFIED" && role !== "ADMIN") {
          return res
            .status(403)
            .json({ error: "Twoje konto nie jest w pełni zweryfikowane." });
        }

        // Two buyers must not both pay for one auction
        const heldByOther = await db.payment.findFirst({
          where: {
            auctionId,
            type: "BUY_NOW",
            status: "PENDING",
            userId: { not: userId },
            createdAt: { gt: new Date(Date.now() - BUY_NOW_HOLD_MS) },
          },
          select: { id: true },
        });
        if (heldByOther) {
          return res.status(409).json({
            error:
              "Ktoś właśnie finalizuje zakup tej aukcji. Spróbuj ponownie za kilka minut.",
            code: "BUY_NOW_IN_PROGRESS",
          });
        }
      }

      let amount = 0;
      let paymentType = "";
      
      if (isWinner) {
        amount = Number(auction.currentPrice);
        paymentType = "WON_AUCTION";
      } else {
        if (!auction.buyNowPrice) {
          return res.status(400).json({ error: "Brak ceny Kup teraz" });
        }
        amount = Number(auction.buyNowPrice);
        paymentType = "BUY_NOW";
      }

      if (!Number.isFinite(amount) || amount <= 0) {
        return res.status(400).json({ error: "Nieprawidłowa kwota do zapłaty" });
      }
      if (amount < 2) {
        return res
          .status(400)
          .json({ error: "Minimalna kwota Stripe to 2.00 PLN" });
      }
      // The buyer pays the sale price and nothing on top of it. The service
      // commission (Terms §3.2) is the seller's cost and comes out of the payout.
      // A seller who already paid it separately under the earlier model is not
      // charged a second time.
      const commissionAlreadyPaid = await db.payment.findFirst({
        where: { auctionId, type: "COMMISSION", status: "SUCCEEDED" },
        select: { id: true },
      });
      const { commission, sellerPayout } = splitSaleAmount(
        amount,
        commissionAlreadyPaid ? 0 : getCommissionRate(),
      );
      const amountCents = Math.round(amount * 100);
      const commissionCents = Math.round(commission * 100);
      const currency = (process.env.STRIPE_CURRENCY || "pln").toLowerCase();
      const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

      const payment = await db.payment.create({
        data: {
          auctionId,
          userId,
          amount,
          provider: "STRIPE" as any,
          type: paymentType as any,
          status: "INITIATED" as any,
        },
      });

      let connectDestination: string | null = null;
      const sellerConnectId = auction.seller?.stripeConnectId as string | undefined;
      if (sellerConnectId && typeof sellerConnectId === "string" && sellerConnectId.startsWith("acct_")) {
        try {
          const acc = await stripe.accounts.retrieve(sellerConnectId);
          if (acc && acc.charges_enabled) {
            connectDestination = sellerConnectId;
          } else {
            console.warn(`[Stripe Checkout] Seller account ${sellerConnectId} charges not enabled. Using direct checkout.`);
          }
        } catch (err: any) {
          console.warn(`[Stripe Checkout] Seller connect account ${sellerConnectId} lookup failed (${err?.message}). Falling back to direct checkout.`);
        }
      }

      const splitEnabled = Boolean(connectDestination);

      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
        {
          price_data: {
            currency,
            unit_amount: amountCents,
            product_data: {
              name: auction.title,
            },
          },
          quantity: 1,
        },
      ];

      // How the sale price is divided, visible on the payment in the Stripe dashboard.
      // With a connected seller account Stripe keeps the commission as the
      // application fee and transfers the rest; otherwise the platform receives
      // the whole amount and pays the seller `sellerPayout`.
      const saleSplitMetadata = {
        auctionId,
        commissionAmount: String(commission),
        sellerPayout: String(sellerPayout),
      };

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: lineItems,
        payment_intent_data:
          splitEnabled && connectDestination
            ? {
                ...(commissionCents > 0
                  ? { application_fee_amount: commissionCents }
                  : {}),
                transfer_data: { destination: connectDestination },
                metadata: {
                  ...saleSplitMetadata,
                  payoutMethod: auction.seller?.payoutMethod ?? "",
                  payoutIban: auction.seller?.payoutIban ?? "",
                  payoutPhone: auction.seller?.payoutPhone ?? "",
                },
              }
            : { metadata: saleSplitMetadata },
        success_url:
          successUrl ||
          `${clientUrl}/auctions/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${clientUrl}/auctions/cancel`,
        // The hold on a "Kup teraz" auction ends when the session does
        ...(isBuyNow
          ? { expires_at: Math.floor((Date.now() + BUY_NOW_HOLD_MS) / 1000) }
          : {}),
        metadata: {
          paymentId: payment.id,
          auctionId,
          buyerId: userId,
          paymentType,
          // Sale price = what the buyer pays; the commission is taken out of it
          baseAmount: String(amount),
          commissionAmount: String(commission),
          sellerPayout: String(sellerPayout),
        },
        client_reference_id: payment.id,
        customer_email: req.user?.email || (auction as any)?.email || undefined,
      });

      await db.payment.update({
        where: { id: payment.id },
        data: {
          externalId: session.id,
          approvalUrl: session.url || undefined,
          status: "PENDING",
        },
      });

      res.json({ url: session.url, paymentId: payment.id });
    } catch (error: any) {
      console.error("❌ Stripe checkout error:", error?.message || error, error?.stack);
      res.status(500).json({ error: error?.message || "Payment init failed" });
    }
  },
);

router.post(
  "/stripe/listing-fee",
  validate(
    z.object({
      auctionId: z.string().uuid(),
      successUrl: z.string().url().optional(),
      cancelUrl: z.string().url().optional(),
    }),
    { sanitize: true },
  ),
  async (req: any, res) => {
    try {
      if (!stripe)
        return res.status(500).json({ error: "Stripe not configured" });
      const userId = req.user?.id;
      const userRole = req.user?.role as string | undefined;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      if (!prisma)
        return res.status(500).json({ error: "Database not available" });

      // Admin nie płaci za wystawienie – oznacz aukcję jako opłaconą
      if (userRole === "ADMIN") {
        const { auctionId } = req.body;
        if (auctionId) {
          await db.auction.update({
            where: { id: auctionId },
            data: { listingFeePaid: true },
          });
        }
        return res.json({ free: true });
      }

      const { auctionId, successUrl, cancelUrl } = req.body;
      const auction = await db.auction.findUnique({
        where: { id: auctionId },
      });
      if (!auction) return res.status(404).json({ error: "Auction not found" });
      if (auction.sellerId !== userId)
        return res.status(403).json({ error: "Not owner" });
      if (auction.listingFeePaid) {
        return res
          .status(400)
          .json({ error: "Opłata za wystawienie tej aukcji została już uiszczona." });
      }
      const listingStatus = String(auction.status ?? "").toUpperCase();
      if (!["WAITING_FOR_FEE", "DRAFT", "ACTIVE"].includes(listingStatus)) {
        return res
          .status(400)
          .json({ error: "Tej aukcji nie można już opłacić." });
      }

      const amount = listingFee;
      const amountCents = Math.round(amount * 100);
      const currency = (process.env.STRIPE_CURRENCY || "pln").toLowerCase();
      const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

      const payment = await db.payment.create({
        data: {
          auctionId,
          userId,
          amount,
          provider: "STRIPE" as any,
          type: "LISTING_FEE" as any,
          status: "INITIATED" as any,
        },
      });

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency,
              unit_amount: amountCents,
              product_data: {
                name: `Opłata za wystawienie aukcji`,
              },
            },
            quantity: 1,
          },
        ],
        success_url:
          successUrl ||
          `${clientUrl}/auctions/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${clientUrl}/auctions/cancel`,
        metadata: {
          paymentId: payment.id,
          auctionId,
          buyerId: userId,
          paymentType: "LISTING_FEE",
        },
        client_reference_id: payment.id,
        customer_email: (auction as any)?.email ?? undefined,
      });

      await db.payment.update({
        where: { id: payment.id },
        data: {
          externalId: session.id,
          approvalUrl: session.url || undefined,
          status: "PENDING",
        },
      });

      res.json({ url: session.url, paymentId: payment.id });
    } catch (error: any) {
      console.error("Stripe checkout error", error);
      res.status(500).json({ error: error.message || "Payment init failed" });
    }
  },
);

// The commission is no longer a payment the seller makes: it is taken out of
// the payout when the buyer pays (see /stripe/checkout). The route stays only
// to give a clear answer to a browser still running the previous frontend.
router.post("/stripe/commission", (_req, res) => {
  res.status(410).json({
    error:
      "Prowizja jest potrącana z wypłaty po opłaceniu aukcji przez kupującego — osobna płatność nie jest wymagana.",
    code: "COMMISSION_DEDUCTED_FROM_PAYOUT",
  });
});

router.post("/stripe/setup-session", authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!stripe) return res.status(503).json({ error: "Stripe disabled" });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "setup",
      customer: customerId,
      payment_method_types: ["card"],
      success_url: `${process.env.CLIENT_URL || "https://react-seven-indol.vercel.app"}?payment_setup=success`,
      cancel_url: `${process.env.CLIENT_URL || "https://react-seven-indol.vercel.app"}?payment_setup=cancel`,
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe setup session error", error);
    res.status(500).json({ error: error.message || "Setup session failed" });
  }
});

router.get("/history", async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!prisma)
      return res.status(500).json({ error: "Database not available" });

    const page = Math.max(1, parseInt(String(req.query.page || "1"), 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(String(req.query.limit || "20"), 10)),
    );
    const skip = (page - 1) * limit;

    // Commission charges that were prepared for sellers under the earlier model
    // and never paid are not debts any more — they are left out of the history.
    const where = {
      userId,
      NOT: { type: "COMMISSION", status: "INITIATED" },
    };

    const [payments, total] = await Promise.all([
      db.payment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          auction: { select: { id: true, title: true } },
        },
      }),
      db.payment.count({ where }),
    ]);

    res.json({
      payments: payments.map((p: any) => ({
        id: p.id,
        amount: Number(p.amount),
        type: p.type,
        status: p.status,
        provider: p.provider,
        createdAt: p.createdAt,
        auctionId: p.auctionId,
        auctionTitle: p.auction?.title ?? null,
      })),
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("Payment history error", error);
    res.status(500).json({ error: error.message || "Failed to load history" });
  }
});

router.get("/session/:sessionId", async (req: any, res) => {
  try {
    if (!stripe)
      return res.status(500).json({ error: "Stripe not configured" });
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { sessionId } = req.params;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const paymentId = session.metadata?.paymentId;
    if (!paymentId) {
      return res.status(404).json({ error: "Payment not found for session" });
    }

    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      include: { auction: { select: { id: true, title: true } } },
    });

    if (!payment || payment.userId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json({
      type: payment.type,
      status: payment.status,
      amount: Number(payment.amount),
      auctionId: payment.auctionId,
      auctionTitle: payment.auction?.title ?? "Aukcja",
      sessionStatus: session.status,
    });
  } catch (error: any) {
    console.error("Payment session lookup error", error);
    res.status(500).json({ error: error.message || "Failed to load session" });
  }
});

export const processStripeEvent = async (
  event: Stripe.Event,
  dbClient?: any,
) => {
  const db = dbClient || prisma; // Use injected client or default
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentId = session.metadata?.paymentId;
      const auctionId = session.metadata?.auctionId;
      const buyerId = session.metadata?.buyerId;
      const paymentType = session.metadata?.paymentType;

      console.log("Processing checkout.session.completed:", {
        paymentId,
        auctionId,
        buyerId,
        paymentType,
        sessionId: session.id,
      });

      if (paymentId && auctionId && buyerId && db) {
        const amountTotal = session.amount_total
          ? session.amount_total / 100
          : undefined;
        await db.$transaction(async (tx: any) => {
          await tx.payment.update({
            where: { id: paymentId },
            data: {
              status: "SUCCEEDED",
              externalId: session.payment_intent as string,
              rawResponse: session as any,
            },
          });

          if (paymentType === "BUY_NOW") {
            const auction = await tx.auction.findUnique({
              where: { id: auctionId },
              select: { status: true, winnerId: true },
            });
            const auctionStatus = String(auction?.status ?? "").toUpperCase();

            if (auctionStatus === "ACTIVE") {
              // The sale price comes from the session metadata. Sessions opened
              // before the commission moved to the seller's payout have none and
              // their Stripe total still includes the commission.
              const baseAmount = Number(session.metadata?.baseAmount);
              const salePrice =
                Number.isFinite(baseAmount) && baseAmount > 0
                  ? baseAmount
                  : amountTotal;
              await tx.auction.update({
                where: { id: auctionId },
                data: {
                  status: "ENDED",
                  currentPrice: salePrice ?? undefined,
                  reserveMet: true,
                  winnerId: buyerId,
                } as any,
              });
              console.log(
                `Auction ${auctionId} ended via BUY_NOW for buyer ${buyerId}`,
              );
            } else if (auction?.winnerId === buyerId) {
              // Stripe delivered the same event again — the sale is already recorded
              console.log(
                `BUY_NOW for auction ${auctionId} already applied for buyer ${buyerId}`,
              );
            } else {
              // The auction was sold or closed while this buyer was paying.
              // The winner is not replaced; the money has to go back by hand.
              console.error(
                `[Stripe] MANUAL REFUND REQUIRED: BUY_NOW payment ${paymentId} (session ${session.id}) ` +
                  `succeeded for auction ${auctionId}, which is no longer active (status ${auctionStatus || "unknown"}).`,
              );
            }
          } else if (paymentType === "WON_AUCTION") {
            await tx.auction.update({
              where: { id: auctionId },
              data: {
                status: "COMPLETED",
              } as any,
            });
            // A separate commission charge prepared for the seller under the
            // earlier model is obsolete: the commission came out of this payment.
            await tx.payment.updateMany({
              where: { auctionId, type: "COMMISSION", status: "INITIATED" },
              data: { status: "CANCELLED" },
            });
            console.log(
              `Auction ${auctionId} paid via WON_AUCTION by buyer ${buyerId}`,
            );
          } else if (paymentType === "COMMISSION") {
            await tx.auction.update({
              where: { id: auctionId },
              data: {
                status: "COMPLETED",
              } as any,
            });
            console.log(
              `Auction ${auctionId} commission paid by seller ${buyerId}`,
            );
          } else if (paymentType === "LISTING_FEE") {
            await auctionService.markListingFeePaid(auctionId, tx);
            console.log(
              `Listing fee paid for auction ${auctionId} by user ${buyerId}`,
            );
          }
        });
        // Invalidate relevant cache entries
        cache.deletePattern("auctions:*");
        cache.delete(`auction:${auctionId}`);
        cache.delete(`auction:${auctionId}:bids`);
        cache.delete(`user:${buyerId}:auctions`);
      } else {
        console.error(
          "Missing required metadata in checkout.session.completed",
        );
      }
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentId = session.metadata?.paymentId;
      if (paymentId && db) {
        await db.payment.update({
          where: { id: paymentId },
          data: { status: "CANCELLED", rawResponse: session as any },
        });
        console.log(`Payment ${paymentId} expired (marked as CANCELLED)`);
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const pi = event.data.object as Stripe.PaymentIntent;
      const paymentId = pi.metadata?.paymentId;
      if (paymentId && db) {
        await db.payment.update({
          where: { id: paymentId },
          data: { status: "FAILED", rawResponse: pi as any },
        });
        console.log(`Payment ${paymentId} failed`);
      }
      break;
    }

    case "payment_intent.succeeded": {
      const pi = event.data.object as Stripe.PaymentIntent;
      const paymentId = pi.metadata?.paymentId;
      if (paymentId && db) {
        await db.payment.update({
          where: { id: paymentId },
          data: {
            status: "SUCCEEDED",
            externalId: pi.id,
            rawResponse: pi as any,
          },
        });
        console.log(`Payment ${paymentId} succeeded via payment_intent`);
      }
      break;
    }

    default:
      console.log(`Unhandled Stripe event type: ${event.type}`);
      break;
  }
};

export const stripeWebhookHandler = async (req: any, res: any) => {
  if (!stripe || !stripeWebhookSecret) {
    console.error("Stripe webhook: Missing configuration");
    return res.status(500).json({ error: "Stripe not configured" });
  }

  const sig = req.headers["stripe-signature"];
  if (!sig) {
    console.error("Stripe webhook: Missing stripe-signature header");
    return res.status(400).json({ error: "Missing signature" });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);
    console.log(`Stripe webhook: Verified event ${event.type}`);
  } catch (err: any) {
    let bodyInfo = "unknown";
    if (Buffer.isBuffer(req.body)) {
      bodyInfo = "Buffer";
    } else if (typeof req.body === "string") {
      bodyInfo = "String";
    } else if (req.body && typeof req.body === "object") {
      bodyInfo = "Object";
    }

    console.error("Stripe webhook signature verification failed:", {
      error: err.message,
      signature: sig.substring(0, 20) + "...",
      bodyType: bodyInfo,
    });
    return res
      .status(400)
      .json({ error: "Webhook signature verification failed" });
  }

  try {
    await processStripeEvent(event);
    res.json({ received: true });
  } catch (err: any) {
    console.error("Stripe webhook processing error:", {
      error: err.message,
      eventType: event.type,
      eventId: event.id,
    });
    res.status(500).json({ error: "Webhook handler failed" });
  }
};

export default router;
