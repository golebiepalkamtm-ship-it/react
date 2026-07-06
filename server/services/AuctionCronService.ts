import { prisma } from '../lib/db.js';
import NotificationManager from './NotificationManager.js';
import logger from '../lib/logger.js';
import { Prisma, PaymentType, PaymentStatus, AuctionStatus } from '@prisma/client';
import redisClient, { getRedisReady } from '../lib/redis.js';

/**
 * Cron job responsible for closing ended auctions.
 * Implements critical business logic for auction expiration and settlement.
 */
export class AuctionCronService {
  private static instance: AuctionCronService;
  private interval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  private constructor() {}

  public static getInstance(): AuctionCronService {
    if (!AuctionCronService.instance) {
      AuctionCronService.instance = new AuctionCronService();
    }
    return AuctionCronService.instance;
  }

  /**
   * Starts the cron job
   */
  public start(): void {
    const disableCron = ['1', 'true', 'yes'].includes(String(process.env.DISABLE_AUCTION_CRON || '').toLowerCase());
    if (disableCron) {
      logger.warn('Auction cron job disabled via DISABLE_AUCTION_CRON env flag');
      return;
    }
    if (this.interval) {
      logger.warn('Auction cron job already running');
      return;
    }

    // Run every 10 seconds for more responsive closing (sniping)
    this.interval = setInterval(async () => {
      // Prevent local re-entry
      if (this.isRunning) return;
      this.isRunning = true;

      // Distributed Lock with Redis (Set if Not Exists with 15s expiry)
      // This prevents multiple server instances from running the job simultaneously
      let lockAcquired = false;
      const LOCK_KEY = 'auction:cron:lock';
      
      try {
        // Use getRedisReady() to perform lock only if connection is active
        // This avoids throwing errors if Redis is configured but unreachable
        if (redisClient && getRedisReady()) {
          const set = await redisClient.set(LOCK_KEY, 'locked', { NX: true, EX: 15 });
          if (!set) {
            // Lock exists, another instance is processing
            return; 
          }
          lockAcquired = true;
        }

        await this.checkEndingAuctions();
        await NotificationManager.checkEndingAuctions();
      } catch (error) {
        logger.error('Error in auction cron job:', error);
      } finally {
        // Release lock
        if (lockAcquired && redisClient && redisClient.isOpen) {
          await redisClient.del(LOCK_KEY).catch((err: any) => 
            logger.error('Failed to release cron lock', err)
          );
        }
        this.isRunning = false;
      }
    }, 10 * 1000);

    logger.info('Auction cron job started (runs every 10 seconds with Redis lock)');

    // Run immediately on start
    this.checkEndingAuctions().catch(e => logger.error('Initial check failed', e));
  }

  /**
   * Stops the cron job
   */
  public stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      logger.info('Auction cron job stopped');
    }
  }

  public isActive(): boolean {
    return this.interval !== null;
  }

  /**
   * Core logic: Transactional check and update of ending auctions
   */
  private async checkEndingAuctions() {
    if (!prisma) {
      logger.error('Database connection (Prisma) not available');
      return;
    }

    const now = new Date();

    try {
      // Pobierz kandydatów poza transakcją (krótsza blokada)
      let endingAuctions = [] as any[];
      try {
        endingAuctions = await prisma.auction.findMany({
          where: {
            status: AuctionStatus.ACTIVE,
            endTime: {
              lte: now
            }
          },
          include: { seller: true },
          orderBy: { endTime: 'asc' },
          take: 25, // batch to avoid long transactions
        });
      } catch (dbErr) {
        // Fail-safe: don't let cron DB issues bubble up to request handlers/tests
        logger.error('Auction cron: DB query failed (skipping run)', dbErr);
        return;
      }

      if (!endingAuctions.length) return;
      logger.info(`Processing ${endingAuctions.length} ending auctions...`);

      // Process ended auctions concurrently in chunks of 5 to protect pool limit
      const CHUNK_SIZE = 5;
      for (let i = 0; i < endingAuctions.length; i += CHUNK_SIZE) {
        const chunk = endingAuctions.slice(i, i + CHUNK_SIZE);
        await Promise.allSettled(chunk.map(async (auction) => {
          try {
            await prisma.$transaction(async (tx) => {
              const highestBid = await tx.bid.findFirst({
                where: { auctionId: auction.id },
                orderBy: { amount: 'desc' },
              });

              if (highestBid?.bidderId) {
                const winnerId = highestBid.bidderId;
                const finalPrice = Number(highestBid.amount);
                const commissionAmount = Number((finalPrice * 0.1).toFixed(2));

                await tx.auction.update({
                  where: { id: auction.id },
                  data: {
                    status: AuctionStatus.ENDED,
                    winnerId,
                    currentPrice: finalPrice
                  }
                });

                const existingCommission = await tx.payment.findFirst({
                  where: {
                    auctionId: auction.id,
                    userId: winnerId,
                    type: PaymentType.COMMISSION,
                  },
                });

                if (!existingCommission && commissionAmount > 0) {
                  await tx.payment.create({
                    data: {
                      auctionId: auction.id,
                      userId: winnerId,
                      amount: commissionAmount,
                      type: PaymentType.COMMISSION,
                      provider: 'STRIPE',
                      status: PaymentStatus.INITIATED
                    }
                  });
                }

                logger.info(`Auction ${auction.id} sold to ${winnerId} for ${finalPrice}`);
                this.notifyAuctionSold(auction, winnerId, finalPrice, commissionAmount);
              } else {
                await tx.auction.update({
                  where: { id: auction.id },
                  data: {
                    status: AuctionStatus.ENDED,
                    winnerId: null
                  }
                });

                logger.info(`Auction ${auction.id} expired without bids`);
                this.notifyAuctionExpired(auction);
              }
            }, { timeout: 15000 }); // allow up to 15s for slow DB
          } catch (err) {
            logger.error(`Failed to close auction ${auction.id}:`, err);
          }
        }));
      }

    } catch (error) {
      logger.error('CRITICAL: Transaction failed in checkEndingAuctions', error);
    }
  }

  private async notifyAuctionSold(auction: any, winnerId: string, finalPrice: number, commissionAmount: number) {
    try {
      // Notify Winner
      await NotificationManager.notifyAuctionWon(
        winnerId,
        auction.id,
        auction.title,
        finalPrice
      );

      if (commissionAmount > 0) {
        await NotificationManager.notifyCommissionDue(
          winnerId,
          auction.id,
          auction.title,
          commissionAmount,
        );
      }

      // Notify Seller
      if (auction.sellerId) {
        await NotificationManager.createNotification({
          userId: auction.sellerId,
          auctionId: auction.id,
          type: 'AUCTION_WON' as any,
          title: 'Aukcja zakończona sukcesem',
          message: `Twoja aukcja "${auction.title}" została sprzedana za ${finalPrice} zł.`
        });
      }
    } catch (e) {
      logger.error('Notification error', e);
    }
  }

  private async notifyAuctionExpired(auction: any) {
    try {
      if (auction.sellerId) {
        await NotificationManager.createNotification({
          userId: auction.sellerId,
          auctionId: auction.id,
          type: 'AUCTION_ENDING' as any,
          title: 'Aukcja zakończona bez ofert',
          message: `Twoja aukcja "${auction.title}" zakończyła się bez sprzedaży.`
        });
      }
    } catch (e) {
      logger.error('Notification error', e);
    }
  }
}

export default AuctionCronService;
