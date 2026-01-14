import NotificationManager from '../services/NotificationManager.js';

/**
 * Cron job do sprawdzania kończących się aukcji
 * Uruchamia się co 5 minut
 */
export class AuctionCronService {
  private static instance: AuctionCronService;
  private interval: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): AuctionCronService {
    if (!AuctionCronService.instance) {
      AuctionCronService.instance = new AuctionCronService();
    }
    return AuctionCronService.instance;
  }

  /**
   * Uruchamia cron job
   */
  public start(): void {
    if (this.interval) {
      console.warn('Auction cron job already running');
      return;
    }

    // Uruchamiaj co 5 minut (300000 ms)
    this.interval = setInterval(async () => {
      try {
        console.log('Running auction ending check...');
        await NotificationManager.checkEndingAuctions();
        console.log('Auction ending check completed');
      } catch (error) {
        console.error('Error in auction cron job:', error);
      }
    }, 5 * 60 * 1000);

    console.log('Auction cron job started (runs every 5 minutes)');
  }

  /**
   * Zatrzymuje cron job
   */
  public stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log('Auction cron job stopped');
    }
  }

  /**
   * Sprawdza czy cron job jest aktywny
   */
  public isActive(): boolean {
    return this.interval !== null;
  }
}

export default AuctionCronService;
