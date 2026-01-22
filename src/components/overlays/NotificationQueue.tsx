import { useNotifications } from '@/stores/notificationStore';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { createPortal } from 'react-dom';

const notificationConfig = {
  success: {
    icon: CheckCircle,
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    iconColor: 'text-green-600 dark:text-green-400',
    titleColor: 'text-green-900 dark:text-green-100',
    messageColor: 'text-green-700 dark:text-green-300',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    iconColor: 'text-red-600 dark:text-red-400',
    titleColor: 'text-red-900 dark:text-red-100',
    messageColor: 'text-red-700 dark:text-red-300',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    titleColor: 'text-yellow-900 dark:text-yellow-100',
    messageColor: 'text-yellow-700 dark:text-yellow-300',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-600 dark:text-blue-400',
    titleColor: 'text-blue-900 dark:text-blue-100',
    messageColor: 'text-blue-700 dark:text-blue-300',
  },
  default: {
    icon: Info,
    bg: 'bg-gray-50 dark:bg-gray-900/20',
    border: 'border-gray-200 dark:border-gray-800',
    iconColor: 'text-gray-600 dark:text-gray-400',
    titleColor: 'text-gray-900 dark:text-gray-100',
    messageColor: 'text-gray-700 dark:text-gray-300',
  },
};

interface NotificationItemProps {
  id: string;
  type: string;
  title: string;
  message?: string;
  action?: { label: string; onClick: () => void };
  count?: number;
  onDismiss: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  id,
  type,
  title,
  message,
  action,
  count,
  onDismiss,
}) => {
  const config = notificationConfig[type as keyof typeof notificationConfig] || notificationConfig.default;
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 400, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 400, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 400, duration: 0.3 }}
      className={`${config.bg} ${config.border} backdrop-blur-sm rounded-xl shadow-lg border p-4 min-w-[320px] max-w-[480px]`}
    >
      <div className="flex items-start gap-3">
        {/* Icon with adaptive animation */}
        <div className="relative flex-shrink-0">
          {type === 'default' || type === 'info' ? (
            <Icon className={`w-5 h-5 ${config.iconColor} animate-pulse`} />
          ) : type === 'error' || type === 'warning' ? (
            <Icon className={`w-5 h-5 ${config.iconColor} animate-bounce`} />
          ) : (
            <Icon className={`w-5 h-5 ${config.iconColor}`} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <h4 className={`font-semibold text-sm ${config.titleColor}`}>
              {title}
              {count && count > 1 && (
                <span className="ml-2 text-xs opacity-75">
                  ×{count}
                </span>
              )}
            </h4>
          </div>
          {message && (
            <p className={`text-sm mt-1 ${config.messageColor} line-clamp-2`}>
              {message}
            </p>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className={`text-sm font-medium mt-2 ${config.iconColor} hover:underline transition-all`}
            >
              {action.label}
            </button>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={() => onDismiss(id)}
          className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors flex-shrink-0"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

/**
 * NotificationQueue - Global notification display
 * Renders max 2 notifications in the top-right corner
 * Queue-based with priority sorting
 */
export const NotificationQueue: React.FC = () => {
  const { notifications, dismiss, pendingCount } = useNotifications();

  if (!notifications || notifications.length === 0) {
    return null;
  }

  return createPortal(
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((notif) => (
          <div key={notif.id} className="pointer-events-auto">
            <NotificationItem
              id={notif.id}
              type={notif.type}
              title={notif.title}
              message={notif.message}
              action={notif.action}
              count={notif.count}
              onDismiss={dismiss}
            />
          </div>
        ))}
      </AnimatePresence>

      {/* Pending Count Badge */}
      {pendingCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="pointer-events-auto bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full px-3 py-1 text-xs font-semibold flex items-center justify-center min-w-fit mx-auto"
        >
          +{pendingCount} more
        </motion.div>
      )}
    </div>,
    document.body
  );
};
