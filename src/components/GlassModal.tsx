import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GlassModalProps {
  open: boolean;
  onClose: () => void;
  headerImage?: string | null;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  variant?: 'glass' | 'hero';
  position?: 'center' | 'top';
  containerClassName?: string;
  contentClassName?: string;
  hideCloseButton?: boolean;
}

const GlassModal: React.FC<GlassModalProps> = ({
  open,
  onClose,
  headerImage,
  title,
  description,
  children,
  variant = 'glass',
  position = 'center',
  containerClassName,
  contentClassName,
  hideCloseButton = false,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-transparent" 
        onClick={onClose} 
        aria-hidden="true"
      />

      <div className={cn(
        "min-h-full flex px-4 py-8",
        position === 'top' ? 'items-start pt-16' : 'items-center justify-center'
      )}>
        <div 
          className={cn(
            'relative w-full mx-auto transition-all duration-300', 
            containerClassName ? containerClassName : 'max-w-3xl'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={
            variant === 'hero'
              ? 'bg-hero-gradient rounded-2xl border border-white/20 shadow-2xl overflow-hidden'
              : 'bg-hero-gradient rounded-2xl border border-white/20 shadow-2xl overflow-hidden'
          }>
            {headerImage && (
              <div className="relative">
                <img src={headerImage} alt={title || 'header'} className="w-full h-48 object-cover" />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-black bg-opacity-40 text-white">
                  {title && <h3 className="text-2xl font-bold">{title}</h3>}
                  {description && <p className="text-sm opacity-90">{description}</p>}
                </div>
                {!hideCloseButton && (
                  <button aria-label="Zamknij" onClick={onClose} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {!headerImage && !hideCloseButton && (
              <div className="absolute top-4 right-4 z-50">
                <button aria-label="Zamknij" onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className={cn(variant === 'hero' ? 'p-0' : 'p-6', contentClassName)}>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlassModal;
