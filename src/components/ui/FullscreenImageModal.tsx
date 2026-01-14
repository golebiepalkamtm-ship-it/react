import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { Button } from './button';

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
  }, [initialIndex]);

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

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = images[currentImageIndex];
    link.download = `image-${currentImageIndex + 1}.jpg`;
    link.click();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 z-50 flex items-start justify-center bg-black/90 backdrop-blur-sm min-h-screen"
        onClick={onClose}
        style={{ top: window.scrollY }}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="relative w-full h-full max-w-6xl max-h-[90vh] mx-4 my-8"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
            {title && (
              <h3 className="text-white font-semibold text-lg bg-black/50 px-3 py-1 rounded-md">
                {title}
              </h3>
            )}
            <span className="text-white/80 text-sm bg-black/50 px-2 py-1 rounded-md">
              {currentImageIndex + 1} / {images.length}
            </span>
          </div>

          <div className="relative w-full h-full flex items-center justify-center">
            <button
              onClick={goToPrevious}
              className="absolute left-4 z-10 w-12 h-12 flex items-center justify-center bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div
              className={`relative w-full h-full flex items-center justify-center overflow-hidden cursor-zoom-in ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
              onClick={() => setIsZoomed(!isZoomed)}
            >
              <img
                src={images[currentImageIndex]}
                alt={`Fullscreen view ${currentImageIndex + 1}`}
                className={`max-w-full max-h-full object-contain transition-transform duration-300 ${isZoomed ? 'scale-150' : 'scale-100'} opacity-0`}
                loading="eager"
                onLoad={(e) => {
                  const img = e.currentTarget;
                  img.classList.remove('opacity-0');
                }}
              />
            </div>

            <button
              onClick={goToNext}
              className="absolute right-4 z-10 w-12 h-12 flex items-center justify-center bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
            <Button
              onClick={handleDownload}
              variant="outline"
              className="bg-black/50 hover:bg-black/70 text-white border-white/30"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
