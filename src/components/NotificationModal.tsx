import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, AlertTriangle, Trophy, Clock, DollarSign, MessageSquare } from 'lucide-react';
import { UnifiedModal } from '@/components/ui/UnifiedModal';
import { useAuth } from '@/contexts/AuthContext';
import { notificationService, type Notification } from '@/services/notificationService';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationsChange?: (unreadCount: number) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ 
  isOpen, 
  onClose,
  onNotificationsChange 
}) => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!session?.access_token) return;

    setLoading(true);
    setError(null);
    try {
      const fetchedNotifications = await notificationService.getUnreadNotifications(session.access_token);
      setNotifications(fetchedNotifications);
      if (onNotificationsChange) {
        onNotificationsChange(fetchedNotifications.length);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Nie udało się pobrać powiadomień.');
    } finally {
      setLoading(false);
    }
  }, [session?.access_token, onNotificationsChange]);

  useEffect(() => {
    if (isOpen && session) {
      fetchNotifications();
    }
  }, [isOpen, session, fetchNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    if (!session?.access_token) return;

    try {
      await notificationService.markAsRead(notificationId, session.access_token);
      const updatedNotifications = notifications.filter(n => n.id !== notificationId);
      setNotifications(updatedNotifications);
      if (onNotificationsChange) {
        onNotificationsChange(updatedNotifications.length);
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!session?.access_token) return;

    try {
      await notificationService.markAllAsRead(session.access_token);
      setNotifications([]);
      if (onNotificationsChange) {
        onNotificationsChange(0);
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification.id);
    if (notification.auctionId) {
      onClose();
      navigate(`/auctions/${notification.auctionId}`);
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'OUTBID': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'AUCTION_WON': return <Trophy className="w-5 h-5 text-gold" />;
      case 'AUCTION_ENDING': return <Clock className="w-5 h-5 text-orange-500" />;
      case 'BID_PLACED': return <DollarSign className="w-5 h-5 text-green-500" />;
      default: return <MessageSquare className="w-5 h-5 text-blue-500" />;
    }
  };

  const getGradient = (type: Notification['type']) => {
    switch (type) {
      case 'OUTBID': return 'from-red-500/20 to-red-900/20 border-red-500/30';
      case 'AUCTION_WON': return 'from-gold/20 to-yellow-900/20 border-gold/30';
      case 'AUCTION_ENDING': return 'from-orange-500/20 to-orange-900/20 border-orange-500/30';
      case 'BID_PLACED': return 'from-green-500/20 to-green-900/20 border-green-500/30';
      default: return 'from-blue-500/20 to-blue-900/20 border-blue-500/30';
    }
  };

  return (
    <UnifiedModal
      isOpen={isOpen}
      onClose={onClose}
      type="default"
      title="Powiadomienia"
      icon={Bell}
      size="md"
      bodyScrollable={true}
    >
      <div className="flex flex-col h-[60vh] md:h-[500px]">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
          <span className="text-white/60 text-sm">
            {notifications.length > 0 
              ? `Masz ${notifications.length} nieprzeczytanych powiadomień` 
              : 'Wszystkie powiadomienia przeczytane'}
          </span>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-gold hover:text-white hover:bg-gold/10 h-8 text-xs"
            >
              <Check className="w-3 h-3 mr-1.5" />
              Oznacz wszystkie
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-white/40 space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold" />
              <p className="text-sm">Ładowanie powiadomień...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-red-400 space-y-2">
              <AlertTriangle className="w-8 h-8 opacity-50" />
              <p className="text-sm">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchNotifications}
                className="mt-2 border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                Ponów
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/20 space-y-4">
              <Bell className="w-12 h-12 stroke-1" />
              <p>Brak nowych powiadomień</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`relative group rounded-xl border p-4 cursor-pointer transition-all hover:bg-white/5 ${getGradient(notification.type)}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-4">
                    <div className="mt-1 p-2 rounded-full bg-black/20 backdrop-blur-sm self-start shrink-0">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-medium text-white text-sm truncate pr-6">
                          {notification.title}
                        </h4>
                        <span className="text-[10px] text-white/40 whitespace-nowrap shrink-0">
                          {notificationService.formatNotificationTime(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-white/70 text-sm mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                  
                  {/* Hover Actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification.id);
                      }}
                      className="p-1.5 rounded-lg bg-black/40 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                      title="Oznacz jako przeczytane"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </UnifiedModal>
  );
};
