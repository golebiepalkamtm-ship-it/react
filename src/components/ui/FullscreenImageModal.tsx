import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface FullscreenImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  title?: string;
}

export const FullscreenImageModal: React.FC<FullscreenImageModalProps> = ({
  isOpen,
  onClose,
  images,
  currentIndex: initialIndex,
  title,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  const goToPrevious = useCallback(() => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  useEffect(() => {
    setCurrentImageIndex(initialIndex);
    setIsZoomed(false);
  }, [initialIndex]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'ArrowUp':
        case 'ArrowDown':
          e.preventDefault();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious, isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/98 w-screen h-screen overflow-hidden select-none"
        onClick={onClose}
        onContextMenu={(e) => e.preventDefault()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative w-full h-full flex flex-col items-center justify-center p-0 m-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-50 w-12 h-12 flex items-center justify-center bg-black/60 hover:bg-black/80 border border-white/20 rounded-full text-white transition-all hover:scale-110 shadow-2xl"
            aria-label="Zamknij"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Header Title & Counter */}
          <div className="absolute top-6 left-6 z-50 flex items-center gap-3 pointer-events-none">
            {title && (
              <h3 className="text-white font-display font-bold text-lg bg-black/60 border border-[#A68E4E]/40 px-4 py-2 rounded-xl backdrop-blur-md shadow-lg">
                {title}
              </h3>
            )}
            <span className="text-[#A68E4E] font-bold text-sm bg-black/60 border border-[#A68E4E]/30 px-3 py-2 rounded-xl backdrop-blur-md shadow-lg">
              {currentImageIndex + 1} / {images.length}
            </span>
          </div>

          {/* Fullscreen Image Container */}
          <div className="relative w-full h-full flex items-center justify-center p-2 md:p-6 overflow-hidden">
            {images.length > 1 && (
              <button
                onClick={goToPrevious}
                className="absolute left-6 z-40 w-14 h-14 flex items-center justify-center bg-black/60 hover:bg-black/80 border border-white/20 rounded-full text-white transition-all hover:scale-110 shadow-2xl"
                aria-label="Poprzednie zdjęcie"
              >
                <ChevronLeft className="w-8 h-8 text-[#A68E4E]" />
              </button>
            )}

            <div
              className={`relative w-full h-full flex items-center justify-center overflow-hidden cursor-zoom-in ${
                isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
              }`}
              onClick={() => setIsZoomed(!isZoomed)}
              onContextMenu={(e) => e.preventDefault()}
            >
              {/* Image protection transparent shield layer */}
              <div
                className="absolute inset-0 z-30 bg-transparent select-none"
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
              />

              <img
                src={images[currentImageIndex]}
                alt={`Pełny ekran ${currentImageIndex + 1}`}
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                style={{
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  WebkitTouchCallout: 'none',
                }}
                className={`w-full h-full max-w-full max-h-full object-contain transition-transform duration-300 ${
                  isZoomed ? 'scale-150' : 'scale-100'
                } opacity-0 select-none pointer-events-none`}
                loading="eager"
                onLoad={(e) => {
                  const img = e.currentTarget;
                  img.classList.remove('opacity-0');
                }}
              />
            </div>

            {images.length > 1 && (
              <button
                onClick={goToNext}
                className="absolute right-6 z-40 w-14 h-14 flex items-center justify-center bg-black/60 hover:bg-black/80 border border-white/20 rounded-full text-white transition-all hover:scale-110 shadow-2xl"
                aria-label="Następne zdjęcie"
              >
                <ChevronRight className="w-8 h-8 text-[#A68E4E]" />
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};
