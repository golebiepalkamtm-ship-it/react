import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  };
  cancelButton?: {
    text: string;
    onClick: () => void;
  };
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  draggable?: boolean;
  bodyScrollable?: boolean;
  containerClassName?: string;
  backdropClassName?: string;
  hideGradient?: boolean;
}

const typeConfig = {
  default: {
    icon: null,
    gradient: 'from-white/15 to-white/5',
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
    gradient: 'from-yellow-500/10 to-amber-500/5',
    iconBg: 'from-yellow-400 to-amber-600',
    iconShadow: 'shadow-yellow-500/30',
    buttonGradient: 'from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700',
    buttonShadow: 'shadow-yellow-500/25',
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

const sizeConfig = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl md:max-w-4xl',
  full: 'max-w-full md:max-w-7xl mx-0 md:mx-4 h-full md:h-auto'
};

export const UnifiedModal: React.FC<UnifiedModalProps> = ({
  isOpen,
  onClose,
  type = 'default',
  title,
  message,
  icon,
  showCloseButton = true,
  closeOnBackdrop = false,
  closeOnEscape = false,
  confirmButton,
  cancelButton,
  children,
  size = 'md',
  draggable = false,
  bodyScrollable = false,
  containerClassName = '',
  backdropClassName = '',
  hideGradient = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const config = typeConfig[type];
  const Icon = icon || config.icon;
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const modalPos = useRef({ x: 0, y: 0 });
  const previousBodyOverflow = useRef<string | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      if (typeof document !== 'undefined') {
        previousBodyOverflow.current = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      if (typeof document !== 'undefined' && previousBodyOverflow.current !== null) {
        document.body.style.overflow = previousBodyOverflow.current;
      }
    };
  }, [isOpen, closeOnEscape, onClose]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (draggable && window.innerWidth >= 768 && modalRef.current) {
      isDragging.current = true;
      startPos.current = {
        x: e.clientX - modalPos.current.x,
        y: e.clientY - modalPos.current.y,
      };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging.current && modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect();
      const boundX = Math.max(window.innerWidth, rect.width) * 2;
      const boundY = Math.max(window.innerHeight, rect.height) * 2;

      let newX = e.clientX - startPos.current.x;
      let newY = e.clientY - startPos.current.y;

      newX = Math.max(-boundX, Math.min(boundX, newX));
      newY = Math.max(-boundY, Math.min(boundY, newY));

      modalPos.current = { x: newX, y: newY };
      modalRef.current.style.transform = `translate(${modalPos.current.x}px, ${modalPos.current.y}px)`;
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalPos.current = { x: 0, y: 0 };
      modalRef.current.style.transform = 'translate(0px, 0px)';
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    if (draggable && window.innerWidth >= 768) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggable, isOpen]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-8 overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={`absolute inset-0 bg-black/60 backdrop-blur-md ${backdropClassName}`}
            onClick={closeOnBackdrop ? onClose : undefined}
          />

          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
              duration: 0.3
            }}
            className={`relative w-full ${sizeConfig[size]} bg-gray-950/95 rounded-2xl shadow-2xl border border-white/20 overflow-visible flex flex-col ${containerClassName} my-auto`}
            style={{ cursor: draggable && window.innerWidth >= 768 ? 'move' : 'default' }}
            onMouseDown={(e) => {
              if (window.innerWidth >= 768 && draggable) {
                const target = e.target as HTMLElement;
                const interactive = target.closest('input,textarea,button,select,label,[role="button"],a');
                if (!interactive) {
                  handleMouseDown(e);
                }
              }
            }}
          >
            {!hideGradient && (
              <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-50 pointer-events-none rounded-2xl`} />
            )}

            <div className="relative z-10 flex items-center justify-between px-6 py-3 border-b border-white/5 modal-header">
              <div className="flex items-center gap-4">
                {Icon && (
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${config.iconBg} shadow-lg ${config.iconShadow}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  {title && (
                    <h2 className="text-lg md:text-xl font-display font-bold text-white leading-tight tracking-tight">{title}</h2>
                  )}
                  {message && (
                    <p className="text-xs text-white/60 mt-0.5">{message}</p>
                  )}
                </div>
              </div>

              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white/40 hover:text-white hover:bg-white/5 transition-all h-8 w-8 rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="relative z-10 flex-1 overflow-hidden">
              <div className="w-full mx-auto px-6 pt-0 pb-4">
                {children}
              </div>
            </div>

            {(confirmButton || cancelButton) && (
              <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 px-6 py-3 border-t border-white/5 w-full">
                {cancelButton && (
                  <Button
                    variant="ghost"
                    onClick={cancelButton.onClick}
                    className="h-12 w-full sm:flex-1 rounded-xl text-base font-semibold bg-black/40 text-white border border-white/10 hover:bg-black/60 hover:text-white hover:border-white/20 transition-all"
                  >
                    {cancelButton.text}
                  </Button>
                )}
                {confirmButton && (
                  <Button
                    onClick={confirmButton.onClick}
                    variant={confirmButton.variant || 'default'}
                    className={`h-12 w-full sm:flex-1 rounded-xl text-base font-semibold bg-gradient-to-r ${config.buttonGradient} text-white border-0 shadow-lg ${config.buttonShadow} hover:scale-[1.02] active:scale-[0.98] transition-all`}
                  >
                    {confirmButton.text}
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
