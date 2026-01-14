import { Server, Socket } from 'socket.io';
import { z } from 'zod';
import logger from '../lib/logger.js';
import { bidRateLimiter } from '../middleware/rateLimit.js';
import { prisma } from '../lib/db.js';
import { cache } from '../lib/cache.js';
import { Prisma } from '@prisma/client';
import {
  AuctionErrorCodes,
  createAuctionError
} from '../utils/auctionErrors.js';
import { serializePublicAuction, detailAuctionInclude } from '../utils/auctionSerializer.js';
import { serializeBid, bidInclude } from '../utils/auctionSerializer.js';
import { verifyJWTTokenWithRole, getTokenVerifier } from '../utils/tokenVerifier.js';

// UUID v4 validation regex
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// WebSocket validation schemas
const wsBidSchema = z.object({
  auctionId: z.string().regex(uuidRegex, 'Invalid auction ID format'),
  amount: z.number()
    .positive('Amount must be positive')
    .finite('Amount must be a valid number')
    .min(0.01, 'Minimum bid is 0.01')
    .max(1000000, 'Maximum bid is 1,000,000'),
  isProxy: z.boolean().optional(),
  maxBid: z.number()
    .positive('Max bid must be positive')
    .finite('Max bid must be a valid number')
    .min(0.01, 'Minimum bid is 0.01')
    .max(1000000, 'Maximum bid is 1,000,000')
    .optional(),
}).refine((data) => {
  if (data.isProxy && (!data.maxBid || data.maxBid <= data.amount)) {
    return false;
  }
  return true;
}, {
  message: 'Max bid must be greater than amount for proxy bidding',
  path: ['maxBid']
});

export const setupWebSocketEvents = (io: Server) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('No token provided'));
      }

      // Verify SUPABASE_URL before proceeding
      const supabaseUrl = process.env.SUPABASE_URL;
      if (!supabaseUrl) {
        return next(new Error('Supabase not configured on server'));
      }

      // Use shared token verifier with throttling
      const clientIP = socket.handshake.address || 'unknown';
      const rateLimitKey = `ws_connect:${clientIP}`;
      
      try {
        const verificationResult = await verifyJWTTokenWithRole(token, rateLimitKey);
        
        socket.data.userId = verificationResult.userId;
        socket.data.user = {
          id: verificationResult.userId,
          email: verificationResult.email,
          role: verificationResult.role
        };
        
        next();
      } catch (error) {
        if (error instanceof Error && error.message === 'Rate limit exceeded') {
          return next(new Error('Connection rate limit exceeded'));
        }
        return next(new Error('Invalid or expired token'));
      }
    } catch (error) {
      logger.error('WebSocket auth error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`User connected: ${socket.data.userId}`);

    socket.on('join-auction', (auctionId: string) => {
      socket.join(`auction-${auctionId}`);
      logger.info(`User ${socket.data.userId} joined auction ${auctionId}`);
    });

    socket.on('leave-auction', (auctionId: string) => {
      socket.leave(`auction-${auctionId}`);
      logger.info(`User ${socket.data.userId} left auction ${auctionId}`);
    });

    socket.on('place-bid', async (data: { auctionId: string; amount: number; isProxy?: boolean; maxBid?: number }) => {
      try {
        // Validate input data
        const validationResult = wsBidSchema.safeParse(data);
        if (!validationResult.success) {
          return socket.emit('bid-error', { 
            message: 'Invalid bid data',
            details: validationResult.error.errors.map(e => e.message)
          });
        }

        const { auctionId, amount, isProxy, maxBid } = validationResult.data;
        const userId = socket.data.userId;
        const role = socket.data.user?.role;

        if (!userId) {
          return socket.emit('bid-error', { message: 'Unauthorized' });
        }

        if (role !== 'USER_FULL_VERIFIED' && role !== 'ADMIN') {
          return socket.emit('bid-error', { message: 'Account not fully verified' });
        }

        // Rate limiting
        const rateLimitKey = `${userId}:${auctionId}`;
        if (!bidRateLimiter.isAllowed(rateLimitKey)) {
          return socket.emit('bid-error', {
            message: 'Too many bids. Please wait before placing another bid.'
          });
        }

        // Place bid with transaction and row-level locking
        const result = await prisma.$transaction(async (tx) => {
          // Row-level locking to prevent race conditions
          await tx.$queryRaw`SELECT * FROM auctions WHERE id = ${auctionId} FOR UPDATE`;

          const auction = await tx.auction.findUnique({
            where: { id: auctionId },
            include: detailAuctionInclude,
          });

          if (!auction) {
            throw createAuctionError(AuctionErrorCodes.AUCTION_NOT_FOUND, 'Auction not found');
          }

          // Verify bidder != owner
          if (auction.sellerId === userId) {
            throw createAuctionError(AuctionErrorCodes.INVALID_BID_AMOUNT, 'Cannot bid on your own auction');
          }

          const now = Date.now();
          const endsAt = auction.endTime ? auction.endTime.getTime() : 0;
          const status = auction.status;

          if (status !== 'ACTIVE' || endsAt <= now) {
            if (endsAt <= now && status !== 'ENDED') {
              await tx.auction.update({ where: { id: auctionId }, data: { status: 'ENDED' } });
            }
            throw createAuctionError(AuctionErrorCodes.AUCTION_NOT_ACTIVE, 'Aukcja nie jest aktywna');
          }

          if (!Number.isFinite(amount) || amount <= 0) {
            throw createAuctionError(AuctionErrorCodes.INVALID_BID_AMOUNT, 'Nieprawidłowa kwota oferty');
          }

          const increment = auction.minBidIncrement || 100;
          const minimumAllowed = Number(auction.currentPrice ?? auction.startingPrice ?? 0) + increment;

          if (amount < minimumAllowed) {
            throw createAuctionError(
              AuctionErrorCodes.BID_TOO_LOW,
              `Minimalna oferta to ${minimumAllowed}`
            );
          }

          if (isProxy && (!maxBid || maxBid <= amount)) {
            throw createAuctionError(
              AuctionErrorCodes.INVALID_BID_AMOUNT,
              'Nieprawidłowa kwota maksymalna dla proxy bid'
            );
          }

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

          let reserveMet = auction.reserveMet || false;
          if (auction.reservePrice != null && amount >= Number(auction.reservePrice)) {
            reserveMet = true;
          }

          const bidRecord = await tx.bid.create({
            data: {
              amount: new Prisma.Decimal(amount),
              bidderId: userId,
              auctionId,
              isProxy: Boolean(isProxy),
              maxBid: maxBid ? new Prisma.Decimal(maxBid) : null,
            },
            include: bidInclude,
          });

          const concurrencyGuard = await tx.auction.updateMany({
            where: {
              id: auctionId,
              currentPrice: auction.currentPrice,
            },
            data: {
              currentPrice: new Prisma.Decimal(amount),
              endTime: targetEndDate,
              reserveMet,
            },
          });

          if (concurrencyGuard.count === 0) {
            throw createAuctionError(
              AuctionErrorCodes.CONCURRENT_BID_CONFLICT,
              'Aukcja została już przebita. Spróbuj ponownie.'
            );
          }

          const updatedAuction = await tx.auction.findUnique({
            where: { id: auctionId },
            include: detailAuctionInclude,
          });

          if (!updatedAuction) {
            throw createAuctionError(AuctionErrorCodes.AUCTION_NOT_FOUND, 'Auction not found');
          }

          return {
            bid: serializeBid(bidRecord),
            auction: serializePublicAuction(updatedAuction),
            wasExtended,
            newEndTime,
            auctionEnded: false,
            winnerInfo: null,
          };
        });

        // Notify all users in auction room
        io.to(`auction-${auctionId}`).emit('bid-placed', {
          bid: result.bid,
          auction: result.auction,
          newPrice: Number(result.bid.amount),
          auctionId,
          meta: {
            wasExtended: result.wasExtended,
            newEndTime: result.newEndTime,
            auctionEnded: result.auctionEnded,
            winnerInfo: result.winnerInfo,
          }
        });

        // Invalidate specific cache entries
        cache.delete(`auction:${auctionId}`);
        cache.delete(`auction:${auctionId}:bids`);
        cache.delete(`user:${userId}:auctions`);
        logger.info(`Bid placed via WS: ${amount} by ${userId} on auction ${auctionId}`);

      } catch (error: any) {
        logger.error('WS Bid error:', error);
        socket.emit('bid-error', {
          message: error.message || 'Failed to place bid.'
        });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.data.userId}`);
    });
  });
};
