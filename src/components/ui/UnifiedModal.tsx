import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, XCircle, AlertTriangle, Info, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type ModalType = 'default' | 'success' | 'error' | 'warning' | 'info';

interface UnifiedModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: ModalType;
  title?: string;
  message?: string;
  icon?: LucideIcon;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  confirmButton?: {
    text: string;
    onClick: () => void;
  };
  cancelButton?: {
    text: string;
    onClick: () => void;
  };
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  draggable?: boolean;
}

const typeConfig = {
  default: {
    icon: null,
    gradient: 'from-white/5 to-white/0',
    iconBg: 'from-gold to-amber-600',
    iconShadow: 'shadow-gold/30',
    buttonGradient: 'from-gold to-amber-600 hover:from-gold/90 hover:to-amber-700',
    buttonShadow: 'shadow-gold/25',
  },
  success: {
    icon: CheckCircle2,
    gradient: 'from-green-500/10 to-emerald-500/5',
    iconBg: 'from-green-400 to-emerald-600',
    iconShadow: 'shadow-green-500/30',
    buttonGradient: 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
    buttonShadow: 'shadow-green-500/25',
  },
  error: {
    icon: XCircle,
    gradient: 'from-red-500/10 to-rose-500/5',
    iconBg: 'from-red-400 to-rose-600',
    iconShadow: 'shadow-red-500/30',
    buttonGradient: 'from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700',
    buttonShadow: 'shadow-red-500/25',
  },
  warning: {
    icon: AlertTriangle,
    gradient: 'from-amber-500/10 to-orange-500/5',
    iconBg: 'from-amber-400 to-orange-600',
    iconShadow: 'shadow-amber-500/30',
    buttonGradient: 'from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700',
    buttonShadow: 'shadow-amber-500/25',
  },
  info: {
    icon: Info,
    gradient: 'from-blue-500/10 to-cyan-500/5',
    iconBg: 'from-blue-400 to-cyan-600',
    iconShadow: 'shadow-blue-500/30',
    buttonGradient: 'from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700',
    buttonShadow: 'shadow-blue-500/25',
  },
};

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-5xl',
};

const UnifiedModal: React.FC<UnifiedModalProps> = ({
  isOpen,
  onClose,
  type = 'default',
  title,
  message,
  icon,
  showCloseButton = true,
  closeOnBackdrop = false,
  closeOnEscape = true,
  confirmButton,
  cancelButton,
  children,
  size = 'md',
  draggable = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyActiveRef = useRef<HTMLElement | null>(null);

  const config = typeConfig[type];
  const IconComponent = icon || config.icon;

  useEffect(() => {
    if (!isOpen) return;

    previouslyActiveRef.current = document.activeElement as HTMLElement | null;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      previouslyActiveRef.current?.focus();
    };
  }, [isOpen, onClose, closeOnEscape]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-sm overflow-y-auto"
          onClick={closeOnBackdrop ? onClose : undefined}
        >
          <motion.div
            ref={modalRef}
            drag={draggable}
            dragMomentum={false}
            dragConstraints={{ left: -400, right: 400, top: -200, bottom: 200 }}
            dragElastic={0.1}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative w-full ${sizeClasses[size]} bg-gradient-to-br from-[#00172D] to-[#002244] rounded-2xl border border-white/20 shadow-2xl overflow-hidden ${draggable ? 'cursor-move' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} pointer-events-none`} />

            {showCloseButton && (
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Zamknij"
              >
                <X className="w-4 h-4 text-white" />
              </motion.button>
            )}

            <div className="relative p-8">
              {IconComponent && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', damping: 15 }}
                  className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br ${config.iconBg} flex items-center justify-center shadow-lg ${config.iconShadow}`}
                >
                  <IconComponent className="w-10 h-10 text-white" />
                </motion.div>
              )}

              {title && (
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl md:text-3xl font-bold text-white mb-3 text-center"
                >
                  {title}
                </motion.h2>
              )}

              {message && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/70 mb-6 text-base leading-relaxed whitespace-pre-line text-center"
                >
                  {message}
                </motion.p>
              )}

              {children && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {children}
                </motion.div>
              )}

              {(confirmButton || cancelButton) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col sm:flex-row gap-3 justify-center mt-6"
                >
                  {cancelButton && (
                    <Button
                      variant="outline"
                      onClick={cancelButton.onClick}
                      className="px-6 py-3 border-white/20 text-white hover:bg-white/10"
                    >
                      {cancelButton.text}
                    </Button>
                  )}
                  {confirmButton && (
                    <Button
                      onClick={confirmButton.onClick}
                      className={`px-8 py-3 bg-gradient-to-r ${config.buttonGradient} text-white font-semibold rounded-xl shadow-lg ${config.buttonShadow} transition-all duration-200`}
                    >
                      {confirmButton.text}
                    </Button>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UnifiedModal;
export { UnifiedModal };
