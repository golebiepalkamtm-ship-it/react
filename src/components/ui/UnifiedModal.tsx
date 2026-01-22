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
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
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
  closeOnBackdrop = true,
  closeOnEscape = true,
  confirmButton,
  cancelButton,
  children,
  size = 'md',
  draggable = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const config = typeConfig[type];
  const Icon = icon || config.icon;
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const modalPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeOnEscape, onClose]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Tylko na desktop (>= 768px)
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
      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height;
      
      let newX = e.clientX - startPos.current.x;
      let newY = e.clientY - startPos.current.y;
      
      // Ograniczenia - nie wychodzić poza ekran
      newX = Math.max(-maxX / 2, Math.min(maxX / 2, newX));
      newY = Math.max(-maxY / 2, Math.min(maxY / 2, newY));
      
      modalPos.current = { x: newX, y: newY };
      modalRef.current.style.transform = `translate(${modalPos.current.x}px, ${modalPos.current.y}px)`;
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    // Reset pozycji przy otwieraniu modala
    if (isOpen && modalRef.current) {
      modalPos.current = { x: 0, y: 0 };
      modalRef.current.style.transform = 'translate(0px, 0px)';
    }
  }, [isOpen]);

  useEffect(() => {
    if (draggable && window.innerWidth >= 768) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggable, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-transparent"
            onClick={closeOnBackdrop ? onClose : undefined}
          />
          
          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 400,
              duration: 0.2
            }}
            className={`relative w-full ${sizeConfig[size]} bg-gray-800/80 backdrop-blur-xl rounded-none md:rounded-2xl shadow-2xl border border-white/30 overflow-hidden max-h-screen md:max-h-[90vh] flex flex-col`}
            style={{ cursor: draggable && window.innerWidth >= 768 ? 'move' : 'default' }}
            onMouseDown={(e) => {
              // Tylko na desktop i tylko gdy kliknięto w header
              if (window.innerWidth >= 768 && draggable && (e.target as HTMLElement).closest('.modal-header')) {
                handleMouseDown(e);
              }
            }}
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} pointer-events-none`} />
            
            {/* Header */}
            <div className="relative z-10 flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-white/10 modal-header">
              <div className="flex items-center gap-3">
                {Icon && (
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${config.iconBg} shadow-lg ${config.iconShadow}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  {title && (
                    <h2 className="text-xl font-semibold text-white">{title}</h2>
                  )}
                  {message && (
                    <p className="text-sm text-white/70 mt-1">{message}</p>
                  )}
                </div>
              </div>
              
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            {/* Content */}
            <div className="relative z-10 flex-1 overflow-y-auto">
              {children}
            </div>
            
            {/* Actions */}
            {(confirmButton || cancelButton) && (
              <div className="relative z-10 flex items-center justify-end gap-3 px-4 md:px-6 py-3 md:py-4 border-t border-white/10">
                {cancelButton && (
                  <Button
                    variant="outline"
                    onClick={cancelButton.onClick}
                    className="border-white/20 text-white/70 hover:bg-white/10 hover:text-white"
                  >
                    {cancelButton.text}
                  </Button>
                )}
                {confirmButton && (
                  <Button
                    onClick={confirmButton.onClick}
                    variant={confirmButton.variant || 'default'}
                    className={`bg-gradient-to-r ${config.buttonGradient} text-white border-0 shadow-lg ${config.buttonShadow}`}
                  >
                    {confirmButton.text}
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
