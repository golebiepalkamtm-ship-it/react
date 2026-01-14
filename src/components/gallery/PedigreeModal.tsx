import React from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PedigreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  pedigreeUrl: string | null;
}

export const PedigreeModal = ({ isOpen, onClose, pedigreeUrl }: PedigreeModalProps) => {
  if (!isOpen || !pedigreeUrl) return null;

  const isPdf = pedigreeUrl.toLowerCase().endsWith('.pdf');

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-[9999] flex items-start justify-center bg-black/95 backdrop-blur-sm p-4 md:p-8 min-h-screen"
        onClick={onClose}
        style={{ top: window.scrollY }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full h-full max-w-5xl max-h-[90vh] flex flex-col items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 md:top-4 md:right-4 z-50 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer"
            aria-label="Zamknij"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Content */}
          <div className="relative w-full h-full flex items-center justify-center bg-zinc-900/50 rounded-lg overflow-hidden border border-white/10">
            {isPdf ? (
              <iframe
                src={pedigreeUrl}
                className="w-full h-full"
                title="Rodowód"
              />
            ) : (
              <img
                src={pedigreeUrl}
                alt="Rodowód"
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>

          {/* Action bar */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md"
            >
              <span>Zamknij</span>
            </button>
            <a
              href={pedigreeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-4 h-4" />
              <span>Otwórz w nowym oknie</span>
            </a>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};
