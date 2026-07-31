import express, { type Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import NotificationManager from '../services/NotificationManager.js';

const router: Router = express.Router();

// Pobierz nieprzeczytane powiadomienia użytkownika
router.get('/unread', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id ?? req.user?.uid;
    if (!userId) return res.status(401).json({ error: 'Invalid user payload' });

    const notifications = await NotificationManager.getUnreadNotifications(userId);
    res.json({ notifications });
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Oznacz wszystkie powiadomienia jako przeczytane
router.patch('/read-all', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id ?? req.user?.uid;
    
    if (!userId) return res.status(401).json({ error: 'Invalid user payload' });

    const success = await NotificationManager.markAllAsRead(userId);
    
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Oznacz powiadomienie jako przeczytane
router.patch('/:id/read', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id ?? req.user?.uid;
    const notificationId = req.params.id;
    
    if (!userId) return res.status(401).json({ error: 'Invalid user payload' });

    const success = await NotificationManager.markAsRead(notificationId, userId);
    
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Notification not found or access denied' });
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

export default router;
