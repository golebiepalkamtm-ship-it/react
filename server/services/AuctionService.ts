import { prisma } from '../lib/db.js';
import { getIO } from '../lib/socket.js';
import NotificationManager from './NotificationManager.js';
import { smsService } from '../lib/sms.js';
import logger from '../lib/logger.js';
import { AuctionErrorCodes, createAuctionError } from '../utils/auctionErrors.js';
import type { Prisma, Bid, Auction, User } from '@prisma/client';

export interface BidResult {
  bid: Bid & { bidder: { id: string; firstName: string | null; lastName: string | null; email: string | null } };
  wasExtended: boolean;
  newEndTime: string | null;
  auctionEnded: boolean;
  winnerInfo: { winnerId: string; finalPrice: number } | null;
}

export class AuctionService {
  private static instance: AuctionService;

  private constructor() {}

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
      orderBy: { amount: 'desc' },
      include: { bidder: true }
    });

    if (highestBid) {
      const auction = await tx.auction.findUnique({
        where: { id: auctionId },
        include: { seller: true }
      });

      await tx.auction.update({
        where: { id: auctionId },
        data: {
          status: 'ENDED',
          winnerId: highestBid.bidderId
        } as any
      });

      // Powiadomienie SMS dla zwycięzcy
      if (auction && (highestBid.bidder as any)?.phone) {
        try {
          const seller = auction.seller as any;
          const sellerName = seller.first_name || seller.firstName || 'Sprzedający';
          await smsService.sendAuctionWonNotification(
            (highestBid.bidder as any).phone,
            auction.title,
            Number(highestBid.amount),
            {
              name: sellerName,
              phone: seller.phone || ''
            }
          );
        } catch (error) {
          logger.error('Failed to send SMS notification:', error);
        }
      }

      // Powiadomienie w systemie
      await NotificationManager.notifyAuctionWon(
        highestBid.bidderId,
        auctionId,
        auction?.title || 'Aukcja',
        Number(highestBid.amount)
      );

      return {
        winnerId: highestBid.bidderId,
        finalPrice: Number(highestBid.amount)
      };
    } else {
      await tx.auction.update({
        where: { id: auctionId },
        data: { status: 'ENDED' }
      });
      return null;
    }
  }

  /**
   * Składa ofertę na aukcji (Logika współdzielona)
   */
  async placeBid(auctionId: string, userId: string, amount: number, isProxy = false, maxBid: number | null = null): Promise<BidResult> {
    if (!prisma) {
      throw new Error('Baza danych nie jest dostępna');
    }

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const auction = await tx.auction.findUnique({
        where: { id: auctionId },
        include: { bids: { orderBy: { amount: 'desc' }, take: 1 } }
      });

      if (!auction) {
        throw createAuctionError(AuctionErrorCodes.AUCTION_NOT_FOUND, 'Auction not found');
      }

      const now = Date.now();
      const endsAt = new Date(auction.endTime).getTime();
      const status = (auction.status as string)?.toUpperCase();
      
      if (status !== 'ACTIVE' || endsAt <= now) {
        if (endsAt <= now && status !== 'ENDED') {
          await tx.auction.update({ where: { id: auctionId }, data: { status: 'ENDED' } });
        }
        throw createAuctionError(AuctionErrorCodes.AUCTION_NOT_ACTIVE, 'Aukcja nie jest aktywna');
      }

      const increment = auction.minBidIncrement || 100;
      const minimumAllowed = Number(auction.currentPrice || auction.startingPrice) + increment;
      
      if (!Number.isFinite(amount) || amount < minimumAllowed) {
        throw createAuctionError(
          AuctionErrorCodes.BID_TOO_LOW,
          `Minimalna oferta to ${minimumAllowed}`
        );
      }

      // Proxy bidding validation
      if (isProxy && (!maxBid || maxBid <= amount)) {
        throw createAuctionError(AuctionErrorCodes.INVALID_BID_AMOUNT, 'Nieprawidłowa kwota maksymalna dla proxy bid');
      }

      // Snipe protection
      const thresholdMs = (auction.snipeThresholdMinutes || 2) * 60 * 1000;
      const extensionMs = (auction.snipeExtensionMinutes || 2) * 60 * 1000;
      const timeLeft = endsAt - now;
      let wasExtended = false;
      let newEndTime: string | null = null;
      
      if (timeLeft > 0 && timeLeft <= thresholdMs) {
        const extended = new Date(endsAt + extensionMs);
        newEndTime = extended.toISOString();
        wasExtended = true;
      }

      let reserveMet = auction.reserveMet || false;
      if (auction.reservePrice != null && amount >= Number(auction.reservePrice)) {
        reserveMet = true;
      }

      // Notify previous highest bidder
      const highestBid = auction.bids[0];
      if (highestBid && highestBid.bidderId !== userId) {
        await NotificationManager.notifyOutbid(
          highestBid.bidderId,
          auctionId,
          auction.title,
          amount
        );
      }

      // Create bid
      const bid = await tx.bid.create({
        data: {
          amount,
          bidderId: userId,
          auctionId,
          isProxy,
          maxBid
        } as any,
        include: {
          bidder: true
        }
      });

      // Update auction
      await tx.auction.update({
        where: { id: auctionId },
        data: {
          currentPrice: amount,
          endTime: wasExtended ? new Date(newEndTime!) : new Date(auction.endTime),
          reserveMet
        }
      });

      // Emit real-time bid event
      try {
        const io = getIO();
        const bidder = (bid as any).bidder;
        io.to(`auction-${auctionId}`).emit('bid-placed', {
          bid: {
            ...bid,
            bidder: {
              id: bidder.id,
              firstName: bidder.first_name || bidder.firstName,
              lastName: bidder.last_name || bidder.lastName,
              email: bidder.email
            }
          },
          newPrice: amount,
          auctionId,
          meta: {
            wasExtended,
            newEndTime,
            auctionEnded: false,
            winnerInfo: null
          }
        });
      } catch (err) {
        logger.error('Failed to emit bid-placed event:', err);
      }

      return {
        bid: bid as any,
        wasExtended,
        newEndTime,
        auctionEnded: false,
        winnerInfo: null
      };
    });
  }
}

export const auctionService = AuctionService.getInstance();
