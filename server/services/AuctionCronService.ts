import { prisma } from '../lib/db.js';
import NotificationManager from './NotificationManager.js';
import logger from '../lib/logger.js';
import { Prisma, PaymentType, PaymentStatus, AuctionStatus } from '@prisma/client';

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

    // Run every 1 minute to ensure timely updates
    this.interval = setInterval(async () => {
      if (this.isRunning) return;
      this.isRunning = true;
      try {
        await this.checkEndingAuctions();
      } catch (error) {
        logger.error('Error in auction cron job:', error);
      } finally {
        this.isRunning = false;
      }
    }, 60 * 1000);

    logger.info('Auction cron job started (runs every 1 minute)');
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
      // Fetch and process within a transaction for ACID compliance
      await prisma.$transaction(async (tx) => {
        // 1. Select candidates: Active auctions that have passed their end time
        const endingAuctions = await tx.auction.findMany({
          where: {
            status: AuctionStatus.ACTIVE,
            endTime: {
              lte: now
            }
          },
          include: {
            seller: true
          }
        });

        const bids = await prisma.bid.findMany({
          where: { auctionId: { in: endingAuctions.map(auction => auction.id) } },
          orderBy: { amount: 'desc' },
          select: {
            id: true,
            amount: true,
            maxBid: true,
            bidderId: true,
            auctionId: true
          },
        });

        if (endingAuctions.length > 0) {
          logger.info(`Processing ${endingAuctions.length} ending auctions...`);
        }

        for (const auction of endingAuctions) {
          try {
            const highestBid = bids.find(bid => bid.auctionId === auction.id);

            if (highestBid?.bidderId) {
              // --- SCENARIO A: SOLD ---
              const winnerId = highestBid.bidderId;
              const finalPrice = highestBid.amount;

              // 1. Update Auction Status
              await tx.auction.update({
                where: { id: auction.id },
                data: {
                  status: AuctionStatus.ENDED,
                  winnerId: winnerId,
                  currentPrice: finalPrice
                }
              });

              // 2. Generate Order/Transaction Record (Payment 'INITIATED')
              // Using existing Payment model to track the obligation
              await tx.payment.create({
                data: {
                  auctionId: auction.id,
                  userId: winnerId,
                  amount: finalPrice,
                  type: PaymentType.BUY_NOW, // Treating winning bid as a purchase obligation
                  provider: 'P24', // Default provider, user will select later
                  status: PaymentStatus.INITIATED
                }
              });

              logger.info(`Auction ${auction.id} sold to ${winnerId} for ${finalPrice}`);

              // 3. Emit Events (Notifications) - executed after DB update success
              // Note: Ideally, we'd use an event bus, but direct calls work for this monolith
              this.notifyAuctionSold(auction, winnerId, Number(finalPrice));
              
            } else {
              // --- SCENARIO B: EXPIRED (No Bids) ---
              // Using ENDED status but with no winner to indicate expiration
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
          } catch (err) {
            logger.error(`Failed to close auction ${auction.id}:`, err);
            // Continue loop to not block other auctions
          }
        }
      });

    } catch (error) {
      logger.error('CRITICAL: Transaction failed in checkEndingAuctions', error);
    }
  }

  private async notifyAuctionSold(auction: any, winnerId: string, finalPrice: number) {
    try {
      // Notify Winner
      await NotificationManager.notifyAuctionWon(
        winnerId,
        auction.id,
        auction.title,
        finalPrice
      );

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
