import express, { type Router } from 'express';
import Stripe from 'stripe';
import { prisma } from '../lib/db.js';
import { cache } from '../lib/cache.js';
import { validate } from '../middleware/validation.js';
import { z } from 'zod';

// Import types from Prisma client
import type { Payment, PaymentStatus, PaymentProvider, PaymentType } from '@prisma/client';

const router: Router = express.Router();

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2024-06-20' }) : null;
const db = prisma as any;

// Schematy walidacji
const currencyEnum = z.enum(['PLN', 'EUR', 'USD']);

const createCheckoutSchema = z.object({
  auctionId: z.string().uuid('Invalid auction ID format'),
  successUrl: z.string().url('Invalid success URL format').optional(),
  cancelUrl: z.string().url('Invalid cancel URL format').optional()
});

const paymentAmountSchema = z.object({
  amount: z.number()
    .positive('Amount must be positive')
    .min(0.01, 'Minimum amount is 0.01')
    .max(1000000, 'Maximum amount is 1,000,000')
    .finite('Amount must be a valid number'),
  currency: currencyEnum.default('PLN')
});

const listingFee = 10; // PLN
const commissionRate = 0.1; // 10%

router.post('/stripe/checkout', validate(createCheckoutSchema), async (req: any, res) => {
  try {
    if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!prisma) return res.status(500).json({ error: 'Database not available' });

    const { auctionId, successUrl, cancelUrl } = req.body as z.infer<typeof createCheckoutSchema>;

    const auction = await db.auction.findUnique({
      where: { id: auctionId },
      include: { seller: true }
    });
    if (!auction) return res.status(404).json({ error: 'Auction not found' });

    const now = Date.now();
    const endsAt = new Date(auction.endTime).getTime();
    if ((auction.status as string)?.toUpperCase() !== 'ACTIVE' || endsAt <= now) {
      return res.status(400).json({ error: 'Aukcja nieaktywna' });
    }
    if (!auction.buyNowPrice) {
      return res.status(400).json({ error: 'Brak ceny Kup teraz' });
    }

    const amount = Number(auction.buyNowPrice);
    const commission = Number((amount * commissionRate).toFixed(2));
    const amountCents = Math.round(amount * 100);
    const commissionCents = Math.round(commission * 100);
    const currency = (process.env.STRIPE_CURRENCY || 'pln').toLowerCase();
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    const payment = await db.payment.create({
      data: {
        auctionId,
        userId,
        amount: amount + commission,
        currency: currency.toUpperCase(),
        provider: 'STRIPE' as any,
        type: 'BUY_NOW' as any,
        status: 'INITIATED' as any
      }
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            unit_amount: amountCents,
            product_data: {
              name: auction.title
            }
          },
          quantity: 1
        },
        {
          price_data: {
            currency,
            unit_amount: commissionCents,
            product_data: {
              name: 'Prowizja serwisu (10%)'
            }
          },
          quantity: 1
        }
      ],
      success_url: successUrl || `${clientUrl}/auctions/success`,
      cancel_url: cancelUrl || `${clientUrl}/auctions/cancel`,
      metadata: {
        paymentId: payment.id,
        auctionId,
        buyerId: userId,
        paymentType: 'BUY_NOW'
      },
      client_reference_id: payment.id,
      customer_email: (auction as any)?.email ?? undefined
    });

    await db.payment.update({
      where: { id: payment.id },
      data: {
        externalId: session.id,
        approvalUrl: session.url || undefined,
        status: 'PENDING'
      }
    });

    res.json({ url: session.url, paymentId: payment.id });
  } catch (error: any) {
    console.error('Stripe checkout error', error);
    res.status(500).json({ error: error.message || 'Payment init failed' });
  }
});

router.post('/stripe/listing-fee', validate(z.object({
  auctionId: z.string().uuid(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional()
})), async (req: any, res) => {
  try {
    if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!prisma) return res.status(500).json({ error: 'Database not available' });

    const { auctionId, successUrl, cancelUrl } = req.body;
    const auction = await db.auction.findUnique({
      where: { id: auctionId }
    });
    if (!auction) return res.status(404).json({ error: 'Auction not found' });
    if (auction.sellerId !== userId) return res.status(403).json({ error: 'Not owner' });

    const amount = listingFee;
    const amountCents = Math.round(amount * 100);
    const currency = (process.env.STRIPE_CURRENCY || 'pln').toLowerCase();
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    const payment = await db.payment.create({
      data: {
        auctionId,
        userId,
        amount,
        currency: currency.toUpperCase(),
        provider: 'STRIPE' as any,
        type: 'LISTING_FEE' as any,
        status: 'INITIATED' as any
      }
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            unit_amount: amountCents,
            product_data: {
              name: `Opłata za wystawienie aukcji`
            }
          },
          quantity: 1
        }
      ],
      success_url: successUrl || `${clientUrl}/auctions/success`,
      cancel_url: cancelUrl || `${clientUrl}/auctions/cancel`,
      metadata: {
        paymentId: payment.id,
        auctionId,
        buyerId: userId,
        paymentType: 'LISTING_FEE'
      },
      client_reference_id: payment.id,
      customer_email: (auction as any)?.email ?? undefined
    });

    await db.payment.update({
      where: { id: payment.id },
      data: {
        externalId: session.id,
        approvalUrl: session.url || undefined,
        status: 'PENDING'
      }
    });

    res.json({ url: session.url, paymentId: payment.id });
  } catch (error: any) {
    console.error('Stripe checkout error', error);
    res.status(500).json({ error: error.message || 'Payment init failed' });
  }
});

router.post('/stripe/commission', validate(z.object({
  auctionId: z.string().uuid(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional()
})), async (req: any, res) => {
  try {
    if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!prisma) return res.status(500).json({ error: 'Database not available' });

    const { auctionId, successUrl, cancelUrl } = req.body;
    const auction = await db.auction.findUnique({
      where: { id: auctionId }
    });
    if (!auction) return res.status(404).json({ error: 'Auction not found' });
    if ((auction.status as string)?.toUpperCase() !== 'ENDED') {
      return res.status(400).json({ error: 'Aukcja nie jest zakończona' });
    }
    if (auction.winnerId !== userId) {
      return res.status(403).json({ error: 'Tylko zwycięzca może opłacić prowizję' });
    }
    const amountBase = Number(auction.currentPrice || auction.buyNowPrice || auction.startingPrice || 0);
    const commission = Number((amountBase * commissionRate).toFixed(2));
    if (commission <= 0) return res.status(400).json({ error: 'Brak kwoty prowizji' });

    const commissionCents = Math.round(commission * 100);
    const currency = (process.env.STRIPE_CURRENCY || 'pln').toLowerCase();
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    const payment = await db.payment.create({
      data: {
        auctionId,
        userId,
        amount: commission,
        currency: currency.toUpperCase(),
        provider: 'STRIPE' as any,
        type: 'COMMISSION' as any,
        status: 'INITIATED' as any
      }
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            unit_amount: commissionCents,
            product_data: {
              name: 'Prowizja serwisu (10%)'
            }
          },
          quantity: 1
        }
      ],
      success_url: successUrl || `${clientUrl}/auctions/success`,
      cancel_url: cancelUrl || `${clientUrl}/auctions/cancel`,
      metadata: {
        paymentId: payment.id,
        auctionId,
        buyerId: userId,
        paymentType: 'COMMISSION'
      },
      client_reference_id: payment.id
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        externalId: session.id,
        approvalUrl: session.url || undefined,
        status: 'PENDING'
      }
    });

    res.json({ url: session.url, paymentId: payment.id });
  } catch (error: any) {
    console.error('Stripe commission error', error);
    res.status(500).json({ error: error.message || 'Commission init failed' });
  }
});

export const processStripeEvent = async (event: Stripe.Event, dbClient?: any) => {
  const db = dbClient || prisma; // Use injected client or default
  switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const paymentId = session.metadata?.paymentId;
        const auctionId = session.metadata?.auctionId;
        const buyerId = session.metadata?.buyerId;
        const paymentType = session.metadata?.paymentType;
        
        console.log('Processing checkout.session.completed:', {
          paymentId,
          auctionId,
          buyerId,
          paymentType,
          sessionId: session.id
        });

        if (paymentId && auctionId && buyerId && db) {
          const amountTotal = session.amount_total ? session.amount_total / 100 : undefined;
          await db.$transaction(async (tx: any) => {
            await tx.payment.update({
              where: { id: paymentId },
              data: {
                status: 'SUCCEEDED',
                externalId: session.payment_intent as string,
                rawResponse: session as any
              }
            });

            if (paymentType === 'BUY_NOW') {
              await tx.auction.update({
                where: { id: auctionId },
                data: {
                  status: 'ENDED',
                  currentPrice: amountTotal ?? undefined,
                  reserveMet: true,
                  winnerId: buyerId
                } as any
              });
              console.log(`Auction ${auctionId} ended via BUY_NOW for buyer ${buyerId}`);
            } else if (paymentType === 'COMMISSION') {
              await tx.auction.update({
                where: { id: auctionId },
                data: {
                  status: 'ENDED',
                  reserveMet: true,
                  winnerId: buyerId
                } as any
              });
              console.log(`Auction ${auctionId} commission paid by buyer ${buyerId}`);
            } else if (paymentType === 'LISTING_FEE') {
              console.log(`Listing fee paid for auction ${auctionId} by user ${buyerId}`);
            }
          });
          // Invalidate relevant cache entries
          cache.deletePattern('auctions:*');
          cache.delete(`auction:${auctionId}`);
          cache.delete(`auction:${auctionId}:bids`);
          cache.delete(`user:${buyerId}:auctions`);
        } else {
          console.error('Missing required metadata in checkout.session.completed');
        }
        break;
      }
      
      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        const paymentId = session.metadata?.paymentId;
        if (paymentId && db) {
          await db.payment.update({
            where: { id: paymentId },
            data: { status: 'CANCELLED', rawResponse: session as any }
          });
          console.log(`Payment ${paymentId} expired (marked as CANCELLED)`);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const paymentId = pi.metadata?.paymentId;
        if (paymentId && db) {
          await db.payment.update({
            where: { id: paymentId },
            data: { status: 'FAILED', rawResponse: pi as any }
          });
          console.log(`Payment ${paymentId} failed`);
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const paymentId = pi.metadata?.paymentId;
        if (paymentId && db) {
          await db.payment.update({
            where: { id: paymentId },
            data: { 
              status: 'SUCCEEDED',
              externalId: pi.id,
              rawResponse: pi as any 
            }
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
    console.error('Stripe webhook: Missing configuration');
    return res.status(500).send('Stripe not configured');
  }

  const sig = req.headers['stripe-signature'];
  if (!sig) {
    console.error('Stripe webhook: Missing stripe-signature header');
    return res.status(400).send('Missing signature');
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);
    console.log(`Stripe webhook: Verified event ${event.type}`);
  } catch (err: any) {
    console.error('Stripe webhook signature verification failed:', {
      error: err.message,
      signature: sig.substring(0, 20) + '...',
      bodyLength: req.body ? req.body.length : 0
    });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    await processStripeEvent(event);
    res.json({ received: true });
  } catch (err: any) {
    console.error('Stripe webhook processing error:', {
      error: err.message,
      eventType: event.type,
      eventId: event.id
    });
    res.status(500).send('Webhook handler failed');
  }
};

export default router;
