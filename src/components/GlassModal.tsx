import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface GlassModalProps {
  open: boolean;
  onClose: () => void;
  headerImage?: string | null;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-5xl',
};

const GlassModal: React.FC<GlassModalProps> = ({ open, onClose, headerImage, title, description, children, size = 'full' }) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const previouslyActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previouslyActiveRef.current = document.activeElement as HTMLElement | null;
    // const prevOverflow = document.body.style.overflow;
    // document.body.style.overflow = 'hidden';

    const container = modalRef.current;
    if (container) {
      const first = container.querySelector<HTMLElement>('input,select,textarea,button,a[href],[tabindex]:not([tabindex="-1"])');
      first?.focus();
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
      // document.body.style.overflow = prevOverflow;
      previouslyActiveRef.current?.focus();
    };
  }, [onClose, open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 z-[100] flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm min-h-screen"
          onClick={onClose}
          style={{ top: window.scrollY }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative w-full ${sizeClasses[size]} bg-gradient-to-br from-[#00172D] to-[#002244] rounded-2xl border border-white/20 shadow-2xl overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 pointer-events-none" />

            {headerImage && (
              <div className="relative">
                <img src={headerImage} alt={title || 'header'} className="w-full h-36 object-cover" />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                  {title && <h3 className="text-2xl font-bold">{title}</h3>}
                  {description && <p className="text-sm text-white/80">{description}</p>}
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Zamknij"
                  onClick={onClose}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </motion.button>
              </div>
            )}

            {!headerImage && (
              <div className="absolute top-4 right-4 z-10">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Zamknij"
                  onClick={onClose}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </motion.button>
              </div>
            )}

            {!headerImage && title && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="pt-8 px-8 pb-4"
              >
                <h3 className="text-2xl md:text-3xl font-bold text-white">{title}</h3>
                {description && <p className="text-white/70 mt-2">{description}</p>}
              </motion.div>
            )}

            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`relative ${!headerImage && !title ? 'pt-12' : ''} px-8 pb-8`}
              onKeyDown={(e) => {
                if (e.key !== 'Tab') return;
                const container = modalRef.current;
                if (!container) return;
                const focusable = Array.from(
                  container.querySelectorAll<HTMLElement>(
                    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
                  )
                ).filter((el) => el.offsetParent !== null);
                if (focusable.length === 0) {
                  e.preventDefault();
                  return;
                }
                const idx = focusable.indexOf(document.activeElement as HTMLElement);
                if (e.shiftKey) {
                  const prev = idx <= 0 ? focusable.length - 1 : idx - 1;
                  focusable[prev].focus();
                  e.preventDefault();
                } else {
                  const next = idx === -1 || idx === focusable.length - 1 ? 0 : idx + 1;
                  focusable[next].focus();
                  e.preventDefault();
                }
              }}
            >
              {children}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlassModal;
