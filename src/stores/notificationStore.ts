import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'default';
export type NotificationPriority = 'low' | 'normal' | 'high';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number; // 0 = permanent (manual dismiss only)
  priority?: NotificationPriority;
  action?: {
    label: string;
    onClick: () => void;
  };
  groupKey?: string; // For deduplication
  count?: number; // For grouped notifications
}

interface NotificationState {
  notifications: Notification[];
  // Queue operations
  notify: (config: Omit<Notification, 'id'>) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  update: (id: string, config: Partial<Notification>) => void;
  getDisplayedNotifications: () => Notification[]; // Max 2
  getPendingCount: () => number;
}

/**
 * NotificationStore - Global notification queue manager
 * - Max 2 displayed at once
 * - Queue-based with priority handling
 * - No auto-dismiss (manual dismiss only)
 * - Deduplication via groupKey
 */
export const useNotificationStore = create<NotificationState>()(
  devtools(
    (set, get) => {
      const generateId = () => `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      return {
        notifications: [],

        notify: (config) => {
          const id = generateId();
          
          set((state) => {
            const newNotification: Notification = {
              id,
              type: config.type || 'default',
              title: config.title,
              message: config.message,
              duration: config.duration,
              priority: config.priority || 'normal',
              action: config.action,
              groupKey: config.groupKey,
              count: 1,
            };

            // Check for duplicate by groupKey
            if (config.groupKey) {
              const existingIndex = state.notifications.findIndex(
                (n) => n.groupKey === config.groupKey
              );
              if (existingIndex !== -1) {
                // Increment count instead of adding new notification
                const updated = [...state.notifications];
                updated[existingIndex] = {
                  ...updated[existingIndex],
                  count: (updated[existingIndex].count || 1) + 1,
                  id: id, // Update ID to reset timing if needed
                };
                return { notifications: updated };
              }
            }

            // Sort by priority (high -> normal -> low)
            const priorityOrder = { high: 0, normal: 1, low: 2 };
            const allNotifications = [...state.notifications, newNotification].sort(
              (a, b) =>
                priorityOrder[a.priority || 'normal'] -
                priorityOrder[b.priority || 'normal']
            );

            return { notifications: allNotifications };
          });

          return id;
        },

        dismiss: (id) => {
          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          }));
        },

        dismissAll: () => {
          set({ notifications: [] });
        },

        update: (id, config) => {
          set((state) => ({
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, ...config } : n
            ),
          }));
        },

        getDisplayedNotifications: () => {
          // Return only top 2 by priority
          return get().notifications.slice(0, 2);
        },

        getPendingCount: () => {
          return Math.max(0, get().notifications.length - 2);
        },
      };
    },
    { name: 'NotificationStore' }
  )
);

/**
 * Hook for accessing notification store
 * Usage: const { notify, dismiss } = useNotifications();
 */
export const useNotifications = () => {
  return useNotificationStore((state) => ({
    notifications: state.getDisplayedNotifications(),
    notify: state.notify,
    dismiss: state.dismiss,
    dismissAll: state.dismissAll,
    pendingCount: state.getPendingCount(),
  }));
};
