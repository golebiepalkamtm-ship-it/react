import { prisma } from "../lib/db.js";
import { getIO } from "../lib/socket.js";
import NotificationManager from "./NotificationManager.js";
import { smsService } from "../lib/sms.js";
import logger from "../lib/logger.js";
import {
  AuctionErrorCodes,
  createAuctionError,
} from "../utils/auctionErrors.js";
import { Prisma } from "@prisma/client";
import type { Bid, Auction, User } from "@prisma/client";
import { cache } from "../lib/cache.js";
import { EventThrottler } from "../utils/eventThrottler.js";

export interface BidResult {
  bid: Bid & {
    bidder: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      email: string | null;
    };
  };
  wasExtended: boolean;
  newEndTime: string | null;
  auctionEnded: boolean;
  winnerInfo: { winnerId: string; finalPrice: number } | null;
}

export class AuctionService {
  private static instance: AuctionService;
  private bidEventThrottler: EventThrottler;

  private constructor() {
    // Throttling: max 1 event na 500ms per auction (leading+trailing)
    this.bidEventThrottler = new EventThrottler({ interval: 500 });
  }

  public static getInstance(): AuctionService {
    if (!AuctionService.instance) {
      AuctionService.instance = new AuctionService();
    }
    return AuctionService.instance;
  }

  /**
   * Zamyka aukcję i ustala zwycięzcę
   */
  async endAuctionWithWinner(auctionId: string, tx: Prisma.TransactionClient) {
    const highestBid = await tx.bid.findFirst({
      where: { auctionId },
      orderBy: { amount: "desc" },
      include: { bidder: true },
    });

    if (highestBid) {
      const auction = await tx.auction.findUnique({
        where: { id: auctionId },
        include: { seller: true },
      });

      await tx.auction.update({
        where: { id: auctionId },
        data: {
          status: "ENDED",
          winnerId: highestBid.bidderId!,
        } as any,
      });

      // Powiadomienie SMS dla zwycięzcy
      if (auction && (highestBid.bidder as any)?.phone) {
        try {
          const seller = auction.seller as any;
          const sellerName =
            seller.first_name || seller.firstName || "Sprzedający";
          await smsService.sendAuctionWonNotification(
            (highestBid.bidder as any).phone,
            auction.title,
            Number(highestBid.amount),
            {
              name: sellerName,
              phone: seller.phone || "",
            },
          );
        } catch (error) {
          logger.error("Failed to send SMS notification:", error);
        }
      }

      // Powiadomienie w systemie
      await NotificationManager.notifyAuctionWon(
        highestBid.bidderId!,
        auctionId,
        auction?.title || "Aukcja",
        Number(highestBid.amount),
      );

      return {
        winnerId: highestBid.bidderId!,
        finalPrice: Number(highestBid.amount),
      };
    } else {
      await tx.auction.update({
        where: { id: auctionId },
        data: { status: "ENDED" },
      });
      return null;
    }
  }

  /**
   * Składa ofertę na aukcji (Zunifikowana logika z pełną walidacją)
   */
  async placeBid(
    auctionId: string,
    userId: string,
    amount: number,
    isProxy = false,
    maxBid: number | null = null,
  ): Promise<BidResult> {
    if (!prisma) {
      throw new Error("Baza danych nie jest dostępna");
    }

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // STEP 1: Row-level locking - zapobieganie race conditions
      await tx.$queryRaw`SELECT * FROM auctions WHERE id = ${auctionId}::uuid FOR UPDATE`;

      // STEP 2: Pobranie aukcji z pełnymi danymi
      const auction = await tx.auction.findUnique({
        where: { id: auctionId },
        include: {
          bids: { orderBy: { amount: "desc" }, take: 1 },
          seller: true,
        },
      });

      if (!auction) {
        throw createAuctionError(
          AuctionErrorCodes.AUCTION_NOT_FOUND,
          "Nie znaleziono aukcji",
        );
      }

      // STEP 3: Weryfikacja właściciela
      if (auction.sellerId === userId) {
        throw createAuctionError(
          AuctionErrorCodes.INVALID_BID_AMOUNT,
          "Nie możesz licytować we własnej aukcji",
        );
      }

      // STEP 4: Weryfikacja statusu i czasu
      const now = Date.now();
      const endsAt = auction.endTime ? new Date(auction.endTime).getTime() : 0;
      const status = (auction.status as string)?.toUpperCase();

      if (status !== "ACTIVE" || endsAt <= now) {
        if (endsAt <= now && status !== "ENDED") {
          await tx.auction.update({
            where: { id: auctionId },
            data: { status: "ENDED" },
          });
        }
        throw createAuctionError(
          AuctionErrorCodes.AUCTION_NOT_ACTIVE,
          "Aukcja nie jest aktywna",
        );
      }

      // STEP 4b: Weryfikacja czy licytacja jest dozwolona
      if (auction.startingPrice === null) {
        throw createAuctionError(
          AuctionErrorCodes.INVALID_BID_AMOUNT,
          "Ta aukcja nie oferuje licytacji (tylko Kup Teraz)",
        );
      }

      // STEP 5: Weryfikacja kwoty
      if (!Number.isFinite(amount) || amount <= 0) {
        throw createAuctionError(
          AuctionErrorCodes.INVALID_BID_AMOUNT,
          "Nieprawidłowa kwota oferty",
        );
      }

      const increment = auction.minBidIncrement || 5;
      const hasBids = auction.bids.length > 0;
      const minimumAllowed = hasBids
        ? Number(auction.currentPrice) + increment
        : Number(auction.startingPrice || 0);

      if (amount < minimumAllowed) {
        throw createAuctionError(
          AuctionErrorCodes.BID_TOO_LOW,
          `Minimalna oferta to ${minimumAllowed}`,
        );
      }

      // STEP 6: Weryfikacja proxy bidding
      if (isProxy && (!maxBid || maxBid <= amount)) {
        throw createAuctionError(
          AuctionErrorCodes.INVALID_BID_AMOUNT,
          "Nieprawidłowa kwota maksymalna dla proxy bid",
        );
      }

      // STEP 7: Snipe protection
      const thresholdMs = (auction.snipeThresholdMinutes || 5) * 60 * 1000;
      const extensionMs = (auction.snipeExtensionMinutes || 5) * 60 * 1000;
      const timeLeft = endsAt - now;
      let wasExtended = false;
      let newEndTime: string | null = null;
      let targetEndDate = auction.endTime;

      if (timeLeft > 0 && timeLeft <= thresholdMs) {
        targetEndDate = new Date(endsAt + extensionMs);
        newEndTime = targetEndDate.toISOString();
        wasExtended = true;
      }

      // Dynamic increment adjustment: 5 PLN default, 50 PLN if extended
      let nextIncrement = auction.minBidIncrement;
      const finalIsExtended = (auction as any).isExtended || wasExtended;

      if (finalIsExtended) {
        nextIncrement = 50;
      }

      // Reserve price check
      let reserveMet = auction.reserveMet || false;
      if (
        auction.reservePrice != null &&
        amount >= Number(auction.reservePrice)
      ) {
        reserveMet = true;
      }

      // Notify previous highest bidder
      const highestBid = auction.bids[0];
      if (highestBid && highestBid.bidderId !== userId) {
        await NotificationManager.notifyOutbid(
          highestBid.bidderId!,
          auctionId,
          auction.title,
          amount,
        );
      }

      // Create bid record
      const bid = await tx.bid.create({
        data: {
          amount: new Prisma.Decimal(amount),
          bidderId: userId,
          auctionId,
          isProxy,
          maxBid: maxBid ? new Prisma.Decimal(maxBid) : null,
        } as any,
        include: {
          bidder: true,
        },
      });

      // PROXY BIDDING LOGIC: Check if previous highest bidder has active proxy bid
      let finalAmount = amount;
      let finalBidderId = userId;

      if (
        highestBid &&
        highestBid.isProxy &&
        highestBid.maxBid &&
        highestBid.bidderId !== userId
      ) {
        const previousMaxBid = Number(highestBid.maxBid);

        // If previous bidder's max is higher than current bid, auto-counter
        if (previousMaxBid > amount) {
          const autoCounterAmount = Math.min(
            amount + increment,
            previousMaxBid,
          );

          // Create automatic counter-bid for previous bidder
          const autoBid = await tx.bid.create({
            data: {
              amount: new Prisma.Decimal(autoCounterAmount),
              bidderId: highestBid.bidderId!,
              auctionId,
              isProxy: true,
              maxBid: new Prisma.Decimal(previousMaxBid),
            } as any,
            include: {
              bidder: true,
            },
          });

          finalAmount = autoCounterAmount;
          finalBidderId = highestBid.bidderId!;

          // Notify original bidder they were auto-outbid
          await NotificationManager.notifyOutbid(
            userId,
            auctionId,
            auction.title,
            autoCounterAmount,
          );

          logger.info(
            `Proxy bid auto-counter: ${autoCounterAmount} by ${highestBid.bidderId} (max: ${previousMaxBid})`,
          );

          // Emit auto-bid event
          try {
            const io = getIO();
            const autoBidder = (autoBid as any).bidder;
            const autoBidUsername =
              (autoBidder.username as string | undefined)?.trim() ||
              (autoBidder.email as string | undefined)?.split("@")[0] ||
              "użytkownik";
            io.to(`auction-${auctionId}`).emit("auction:bid:placed", {
              bid: {
                ...autoBid,
                bidder: {
                  id: autoBidder.id,
                  username: autoBidUsername,
                },
              },
              newPrice: autoCounterAmount,
              auctionId,
              meta: {
                wasExtended,
                newEndTime,
                auctionEnded: false,
                winnerInfo: null,
                isProxyBid: true,
              },
            });
          } catch (err) {
            logger.error("Failed to emit proxy bid event:", err);
          }
        }
      }

      // Handle case where NEW bidder also has proxy and it's higher than previous
      if (
        isProxy &&
        maxBid &&
        highestBid &&
        highestBid.isProxy &&
        highestBid.maxBid
      ) {
        const previousMaxBid = Number(highestBid.maxBid);
        const currentMaxBid = maxBid;

        // Two proxy bidders competing - jump to second-highest max + increment
        if (currentMaxBid > previousMaxBid) {
          const jumpAmount = Math.min(
            previousMaxBid + increment,
            currentMaxBid,
          );

          if (jumpAmount > finalAmount) {
            const jumpBid = await tx.bid.create({
              data: {
                amount: new Prisma.Decimal(jumpAmount),
                bidderId: userId,
                auctionId,
                isProxy: true,
                maxBid: new Prisma.Decimal(currentMaxBid),
              } as any,
              include: {
                bidder: true,
              },
            });

            finalAmount = jumpAmount;
            finalBidderId = userId;

            logger.info(
              `Proxy vs Proxy: Jumped to ${jumpAmount} (user max: ${currentMaxBid}, prev max: ${previousMaxBid})`,
            );

            // Emit jump bid event
            try {
              const io = getIO();
              const jumpBidder = (jumpBid as any).bidder;
              const jumpBidUsername =
                (jumpBidder.username as string | undefined)?.trim() ||
                (jumpBidder.email as string | undefined)?.split("@")[0] ||
                "użytkownik";
              io.to(`auction-${auctionId}`).emit("auction:bid:placed", {
                bid: {
                  ...jumpBid,
                  bidder: {
                    id: jumpBidder.id,
                    username: jumpBidUsername,
                  },
                },
                newPrice: jumpAmount,
                auctionId,
                meta: {
                  wasExtended,
                  newEndTime,
                  auctionEnded: false,
                  winnerInfo: null,
                  isProxyBid: true,
                },
              });
            } catch (err) {
              logger.error("Failed to emit proxy jump bid event:", err);
            }
          }
        }
      }

      // STEP 8: Concurrency guard - optimistic locking
      const concurrencyGuard = await tx.auction.updateMany({
        where: {
          id: auctionId,
          currentPrice: auction.currentPrice,
        },
        data: {
          currentPrice: new Prisma.Decimal(finalAmount),
          endTime: targetEndDate,
          reserveMet,
          minBidIncrement: nextIncrement,
          isExtended: finalIsExtended,
        },
      });

      if (concurrencyGuard.count === 0) {
        throw createAuctionError(
          AuctionErrorCodes.CONCURRENT_BID_CONFLICT,
          "Aukcja została już przebita. Spróbuj ponownie.",
        );
      }

      // Emit real-time bid event z throttlingiem (leading+trailing)
      try {
        const io = getIO();
        const bidder = (bid as any).bidder;
        const displayUsername =
          (bidder.username as string | undefined)?.trim() ||
          (bidder.email as string | undefined)?.split("@")[0] ||
          "użytkownik";
        const eventData = {
          bid: {
            ...bid,
            bidder: {
              id: bidder.id,
              username: displayUsername,
            },
          },
          newPrice: amount,
          auctionId,
          meta: {
            wasExtended,
            newEndTime,
            auctionEnded: false,
            winnerInfo: null,
          },
        };

        // Throttle: Pierwszy bid natychmiast, kolejne max co 500ms, ostatni zawsze
        this.bidEventThrottler.throttle(
          `auction-${auctionId}`,
          eventData,
          (data) =>
            io.to(`auction-${auctionId}`).emit("auction:bid:placed", data),
        );
      } catch (err) {
        logger.error("Failed to emit bid-placed event:", err);
      }

      // STEP 9: Selektywna invalidacja cache (tylko dotknięte klucze)
      this.invalidateBidCache(auctionId, userId);

      return {
        bid: bid as any,
        wasExtended,
        newEndTime,
        auctionEnded: false,
        winnerInfo: null,
      };
    });
  }

  /**
   * Selektywna invalidacja cache po złożeniu oferty
   * Invaliduje TYLKO konkretne klucze związane z aukcją i użytkownikiem
   */
  async adminCancelAuction(auctionId: string): Promise<Auction> {
    if (!prisma) {
      throw new Error("Połączenie z bazą danych jest niedostępne");
    }

    const updatedAuction = await prisma.$transaction(async (tx) => {
      const auction = await tx.auction.findUniqueOrThrow({
        where: { id: auctionId },
      });

      // Ensure idempotency for cancellation (e.g. already ended)
      if (auction.status === "ENDED" || auction.status === "CANCELLED") {
        return auction;
      }

      const updated = await tx.auction.update({
        where: { id: auctionId },
        data: {
          status: "CANCELLED",
          endTime: new Date(),
        },
      });
      return updated;
    });

    this.invalidateAuctionCache(auctionId);

    return updatedAuction;
  }

  /**
   * Admin End Auction - Set status to ENDED and process winner
   */
  async adminEndAuction(auctionId: string): Promise<Auction> {
    if (!prisma) {
      throw new Error("Połączenie z bazą danych jest niedostępne");
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Check if auction exists and is not already ended/cancelled
      const auction = await tx.auction.findUnique({
        where: { id: auctionId },
      });

      if (!auction) {
        throw createAuctionError(
          AuctionErrorCodes.AUCTION_NOT_FOUND,
          "Nie znaleziono aukcji",
        );
      }

      if (auction.status === "ENDED" || auction.status === "CANCELLED") {
        return auction; // Already done
      }

      // 2. Call internal end logic
      await this.endAuctionWithWinner(auctionId, tx);

      // 3. Return updated auction
      return tx.auction.findUniqueOrThrow({ where: { id: auctionId } });
    });

    this.invalidateAuctionCache(auctionId);
    return result;
  }

  /**
   * Admin Delete Auction - Transactional delete
   */
  async adminDeleteAuction(auctionId: string): Promise<void> {
    if (!prisma) {
      throw new Error("Połączenie z bazą danych jest niedostępne");
    }

    await prisma.$transaction(async (tx) => {
      // 1. Delete auction (cascade deletes related records like bids, images, etc.)
      await tx.auction.delete({
        where: { id: auctionId },
      });
    });

    this.invalidateAuctionCache(auctionId);
  }

  private invalidateBidCache(auctionId: string, userId: string): void {
    // Legacy method delegated to new precise invalidation
    this.invalidateAuctionCache(auctionId);
    if (userId && userId !== "admin") {
      cache.invalidateUserCache(userId);
    }
  }

  /**
   * Precise Cache Invalidation for Auction
   */
  private invalidateAuctionCache(auctionId: string): void {
    cache.invalidateAuctionCache(auctionId);
    // Also invalidate general listings as status might change
    cache.invalidateResource("auctions");
  }
}

export const auctionService = AuctionService.getInstance();
