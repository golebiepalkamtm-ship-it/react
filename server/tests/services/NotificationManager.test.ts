import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/db.js', () => ({
  prisma: {
    notification: {
      create: vi.fn(),
      findMany: vi.fn(),
      updateMany: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock('../../lib/socket.js', () => ({
  getIO: vi.fn(() => ({
    to: vi.fn(() => ({
      emit: vi.fn(),
    })),
  })),
}));

import { prisma } from '../../lib/db.js';
import NotificationManager from '../../services/NotificationManager.js';

describe('NotificationManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createNotification', () => {
    it('should create notification successfully (returns void)', async () => {
      const mockNotification = {
        id: 'notif-1',
        userId: 'user-1',
        type: 'OUTBID',
        title: 'You have been outbid',
        message: 'Someone placed a higher bid',
        read: false,
        createdAt: new Date(),
      };
      (prisma!.notification.create as any).mockResolvedValue(mockNotification);

      await NotificationManager.createNotification({
        userId: 'user-1',
        type: 'OUTBID' as any,
        title: 'You have been outbid',
        message: 'Someone placed a higher bid',
      });

      expect(prisma!.notification.create).toHaveBeenCalled();
    });
  });

  describe('getUnreadNotifications', () => {
    it('should return unread notifications for user', async () => {
      const mockNotifications = [
        { id: 'notif-1', type: 'OUTBID', read: false },
        { id: 'notif-2', type: 'AUCTION_WON', read: false },
      ];
      (prisma!.notification.findMany as any).mockResolvedValue(mockNotifications);

      const result = await NotificationManager.getUnreadNotifications('user-1');

      expect(result).toHaveLength(2);
    });

    it('should return empty array if no unread notifications', async () => {
      (prisma!.notification.findMany as any).mockResolvedValue([]);

      const result = await NotificationManager.getUnreadNotifications('user-1');

      expect(result).toHaveLength(0);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      (prisma!.notification.updateMany as any).mockResolvedValue({ count: 1 });

      const result = await NotificationManager.markAsRead('notif-1', 'user-1');

      expect(result).toBeDefined();
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read for user', async () => {
      (prisma!.notification.updateMany as any).mockResolvedValue({ count: 5 });

      const result = await NotificationManager.markAllAsRead('user-1');

      expect(result).toBeDefined();
    });
  });
});
