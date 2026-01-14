import apiClient from './api';

export interface Notification {
  id: string;
  type: 'OUTBID' | 'AUCTION_WON' | 'AUCTION_ENDING' | 'BID_PLACED';
  title: string;
  message: string;
  auctionId?: string;
  createdAt: string;
  read: boolean;
}

export interface NotificationsResponse {
  notifications: Notification[];
}

export const notificationService = {
  /**
   * Pobiera nieprzeczytane powiadomienia użytkownika
   */
  async getUnreadNotifications(token: string | null): Promise<Notification[]> {
    if (!token) throw new Error('Authentication required');
    const response = await apiClient.getWithToken<NotificationsResponse>('/notifications/unread', undefined, token);
    return response.notifications;
  },

  /**
   * Oznacza powiadomienie jako przeczytane
   */
  async markAsRead(notificationId: string, token: string | null): Promise<{ success: boolean }> {
    if (!token) throw new Error('Authentication required');
    return apiClient.patch(`/notifications/${notificationId}/read`, undefined, token);
  },

  /**
   * Oznacza wszystkie powiadomienia jako przeczytane
   */
  async markAllAsRead(token: string | null): Promise<{ success: boolean }> {
    if (!token) throw new Error('Authentication required');
    return apiClient.patch('/notifications/read-all', undefined, token);
  },

  /**
   * Formatuje czas powiadomienia
   */
  formatNotificationTime(createdAt: string): string {
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Teraz';
    if (diffMins < 60) return `${diffMins} min temu`;
    if (diffHours < 24) return `${diffHours} godz temu`;
    if (diffDays < 7) return `${diffDays} dni temu`;
    
    return date.toLocaleDateString('pl-PL');
  },

  /**
   * Zwraca kolor dla typu powiadomienia
   */
  getNotificationColor(type: Notification['type']): string {
    switch (type) {
      case 'OUTBID':
        return 'text-red-600';
      case 'AUCTION_WON':
        return 'text-green-600';
      case 'AUCTION_ENDING':
        return 'text-orange-600';
      case 'BID_PLACED':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  },

  /**
   * Zwraca ikonę dla typu powiadomienia
   */
  getNotificationIcon(type: Notification['type']): string {
    switch (type) {
      case 'OUTBID':
        return '⚠️';
      case 'AUCTION_WON':
        return '🏆';
      case 'AUCTION_ENDING':
        return '⏰';
      case 'BID_PLACED':
        return '💰';
      default:
        return '📢';
    }
  }
};

export default notificationService;
