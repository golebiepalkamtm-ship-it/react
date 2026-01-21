import { prisma } from '../lib/db.js';
import { getIO } from '../lib/socket.js';

export enum NotificationType {
  OUTBID = 'OUTBID',
  AUCTION_WON = 'AUCTION_WON', 
  AUCTION_ENDING = 'AUCTION_ENDING',
  BID_PLACED = 'BID_PLACED',
  SAVED_SEARCH_MATCH = 'SAVED_SEARCH_MATCH'
}

export interface NotificationData {
  userId: string;
  auctionId?: string;
  type: NotificationType;
  title: string;
  message: string;
}

export class NotificationManager {
  /**
   * Tworzy i wysyła powiadomienie do użytkownika
   */
  static async createNotification(data: NotificationData): Promise<void> {
    try {
      // Defensive programming - walidacja inputów
      if (!data.userId || !data.type || !data.title || !data.message) {
        throw new Error('Missing required notification fields');
      }

      if (!prisma) {
        console.warn('Prisma not available, skipping notification creation');
        return;
      }

      // Tworzenie powiadomienia w bazie danych
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          auctionId: data.auctionId,
          type: data.type,
          title: data.title,
          message: data.message,
        },
      });

      // Wysyłanie powiadomienia przez WebSocket w czasie rzeczywistym
      try {
        const io = getIO();
        io.to(`user-${data.userId}`).emit('notification', {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          auctionId: notification.auctionId,
          createdAt: notification.createdAt,
          read: false,
        });
      } catch (err) {
        console.error('Failed to emit notification event:', err);
      }

      console.log(`Notification sent to user ${data.userId}: ${data.title}`);
    } catch (error) {
      console.error('Error creating notification:', error);
      // Nie rzucamy błędu dalej, aby nie zablokować głównej logiki biznesowej
    }
  }

  /**
   * Powiadomienie o przeliczeniu
   */
  static async notifyOutbid(
    outbidUserId: string,
    auctionId: string,
    auctionTitle: string,
    newBidAmount: number
  ): Promise<void> {
    await this.createNotification({
      userId: outbidUserId,
      auctionId,
      type: 'OUTBID' as NotificationType,
      title: 'Zostałeś przeliczony!',
      message: `Ktoś złożył wyższą ofertę (${newBidAmount} zł) na aukcji "${auctionTitle}".`,
    });
  }

  /**
   * Powiadomienie o wygranej aukcji
   */
  static async notifyAuctionWon(
    winnerUserId: string,
    auctionId: string,
    auctionTitle: string,
    finalPrice: number
  ): Promise<void> {
    await this.createNotification({
      userId: winnerUserId,
      auctionId,
      type: 'AUCTION_WON' as NotificationType,
      title: 'Wygrałeś aukcję!',
      message: `Gratulacje! Wygrałeś aukcję "${auctionTitle}" za ${finalPrice} zł.`,
    });
  }

  /**
   * Powiadomienie o kończącej się aukcji (dla obserwujących)
   */
  static async notifyAuctionEnding(
    userId: string,
    auctionId: string,
    auctionTitle: string,
    timeLeft: string
  ): Promise<void> {
    await this.createNotification({
      userId,
      auctionId,
      type: 'AUCTION_ENDING' as NotificationType,
      title: 'Aukcja kończy się wkrótce!',
      message: `Aukcja "${auctionTitle}" kończy się ${timeLeft}.`,
    });
  }

  /**
   * Powiadomienie o złożonej ofercie (dla sprzedającego)
   */
  static async notifyBidPlaced(
    sellerUserId: string,
    auctionId: string,
    auctionTitle: string,
    bidAmount: number,
    bidderName: string
  ): Promise<void> {
    await this.createNotification({
      userId: sellerUserId,
      auctionId,
      type: 'BID_PLACED' as NotificationType,
      title: 'Nowa oferta!',
      message: `${bidderName} złożył ofertę ${bidAmount} zł na "${auctionTitle}".`,
    });
  }

  /**
   * Pobiera nieprzeczytane powiadomienia dla użytkownika
   */
  static async getUnreadNotifications(userId: string): Promise<any[]> {
    try {
      if (!userId) throw new Error('User ID is required');

      if (!prisma) {
        console.warn('Prisma not available, returning empty notifications');
        return [];
      }

      const notifications = await prisma.notification.findMany({
        where: {
          userId,
          read: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 50, // Ograniczenie do 50 najnowszych
      });

      return notifications.map((notification) => ({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        auctionId: notification.auctionId,
        createdAt: notification.createdAt,
        read: notification.read,
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  /**
   * Oznacza powiadomienie jako przeczytane
   */
  static async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      if (!notificationId || !userId) {
        throw new Error('Notification ID and User ID are required');
      }

      if (!prisma) {
        console.warn('Prisma not available, cannot mark notification as read');
        return false;
      }

      const result = await prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId, // Bezpieczeństwo - użytkownik może oznaczyć tylko swoje powiadomienia
        },
        data: {
          read: true,
        },
      });

      return result.count > 0;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Oznacza wszystkie powiadomienia użytkownika jako przeczytane
   */
  static async markAllAsRead(userId: string): Promise<boolean> {
    try {
      if (!userId) throw new Error('User ID is required');

      if (!prisma) {
        console.warn('Prisma not available, cannot mark all notifications as read');
        return false;
      }

      await prisma.notification.updateMany({
        where: {
          userId,
          read: false,
        },
        data: {
          read: true,
        },
      });

      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  /**
   * Sprawdza czy aukcja kończy się wkrótce i wysyła powiadomienia
   */
  static async checkEndingAuctions(): Promise<void> {
    try {
      if (!prisma) {
        console.warn('Prisma not available, cannot check ending auctions');
        return;
      }

      // Pobieranie aukcji kończących się w ciągu następnych 30 minut
      const thirtyMinutesFromNow = new Date(Date.now() + 30 * 60 * 1000);
      
      const endingAuctions = await prisma.auction.findMany({
        where: {
          status: 'ACTIVE',
          endTime: {  // Użyj nazwy pola z schematu Prisma
            lte: thirtyMinutesFromNow,
            gte: new Date(),
          },
        },
        // Usuń relacje, które nie istnieją w bazie
      });

      for (const auction of endingAuctions) {
        if (!auction.endTime) continue;
        const timeLeft = this.formatTimeLeft(auction.endTime);  // Użyj endTime
        
        // Na razie pomiń powiadomienia - brakuje tabeli watchlist
        console.log(`Auction ending soon: ${auction.title} ends ${timeLeft}`);
      }
    } catch (error) {
      console.error('Error checking ending auctions:', error);
    }
  }

  /**
   * Formatuje pozostały czas w czytelnym formacie
   */
  private static formatTimeLeft(endTime: Date): string {
    const diff = endTime.getTime() - Date.now();
    
    if (diff <= 0) return 'Zakończona';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `za ${hours}h ${minutes % 60}m`;
    return `za ${minutes}m`;
  }
}

export default NotificationManager;
