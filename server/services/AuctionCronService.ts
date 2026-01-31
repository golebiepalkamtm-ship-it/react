import { prisma } from '../lib/db.js';
import NotificationManager from './NotificationManager.js';
import logger from '../lib/logger.ts';
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
      // Pobierz kandydatów poza transakcją (krótsza blokada)
      const endingAuctions = await prisma.auction.findMany({
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

      if (!endingAuctions.length) return;
      logger.info(`Processing ${endingAuctions.length} ending auctions...`);

      for (const auction of endingAuctions) {
        try {
          // Krótka transakcja na pojedynczej aukcji z podniesionym timeoutem
          await prisma.$transaction(async (tx) => {
            const highestBid = await tx.bid.findFirst({
              where: { auctionId: auction.id },
              orderBy: { amount: 'desc' },
            });

            if (highestBid?.bidderId) {
              const winnerId = highestBid.bidderId;
              const finalPrice = highestBid.amount;

              await tx.auction.update({
                where: { id: auction.id },
                data: {
                  status: AuctionStatus.ENDED,
                  winnerId,
                  currentPrice: finalPrice
                }
              });

              await tx.payment.create({
                data: {
                  auctionId: auction.id,
                  userId: winnerId,
                  amount: finalPrice,
                  type: PaymentType.BUY_NOW,
                  provider: 'P24',
                  status: PaymentStatus.INITIATED
                }
              });

              logger.info(`Auction ${auction.id} sold to ${winnerId} for ${finalPrice}`);
              this.notifyAuctionSold(auction, winnerId, Number(finalPrice));
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
      }

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
