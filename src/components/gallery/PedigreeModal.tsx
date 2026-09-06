import React, { useMemo, useState } from 'react';
import { ExternalLink, Maximize2, Minimize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { UnifiedModal } from '@/components/ui/UnifiedModal';

interface PedigreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  pedigreeUrl: string | null;
  images?: string[];
  startIndex?: number;
}

export const PedigreeModal = ({ isOpen, onClose, pedigreeUrl, images = [], startIndex = 0 }: PedigreeModalProps) => {
  const cleanUrl = (u?: string | null) => (u ? u.split('?')[0].split('#')[0].toLowerCase() : '');

  const isPdf = useMemo(() => {
    return typeof pedigreeUrl === 'string' && (cleanUrl(pedigreeUrl).endsWith('.pdf') || cleanUrl(pedigreeUrl).includes('pdf'));
  }, [pedigreeUrl]);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const imageList = useMemo(() => {
    const isImage = (url: string) => {
      if (!url) return false;
      const clean = cleanUrl(url);
      return (
        /\.(jpg|jpeg|png|gif|webp|bmp|tiff|svg)$/i.test(clean) ||
        (!clean.endsWith('.pdf') && !clean.includes('pdf'))
      );
    };
    const base: string[] = Array.isArray(images) ? images.filter((u) => isImage(u)) : [];
    if (!isPdf && pedigreeUrl && isImage(pedigreeUrl)) {
      if (!base.includes(pedigreeUrl)) base.unshift(pedigreeUrl);
    }
    return Array.from(new Set(base));
  }, [images, isPdf, pedigreeUrl]);

  const [currentIndex, setCurrentIndex] = useState(Math.min(Math.max(0, startIndex), Math.max(0, imageList.length - 1)));
  const goPrev = () => setCurrentIndex((i) => (i === 0 ? imageList.length - 1 : i - 1));
  const goNext = () => setCurrentIndex((i) => (i === imageList.length - 1 ? 0 : i + 1));
  const src = useMemo(() => {
    if (imageList.length > 0) return imageList[currentIndex];
    return pedigreeUrl;
  }, [imageList, currentIndex, pedigreeUrl]);
  const showImages = imageList.length > 0;

  if (!pedigreeUrl && imageList.length === 0) return null;

  return (
    <UnifiedModal
      isOpen={isOpen}
      onClose={onClose}
      title="Rodowód"
      size={isFullscreen ? 'full' : 'xl'}
      draggable
      bodyScrollable={false}
      type="default"
    >
      <div className={`relative w-full ${isFullscreen ? 'h-[85vh]' : 'h-[70vh]'} flex flex-col items-center justify-center`}>
        {/* Fullscreen toggle inside modal content since UnifiedModal doesn't have it natively */}
        <button
          onClick={() => setIsFullscreen((v) => !v)}
          className="absolute top-2 right-2 z-50 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
          aria-label={isFullscreen ? 'Przywróć' : 'Pełny ekran'}
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>

        <div className="relative w-full h-full flex items-center justify-center bg-zinc-900/50 rounded-lg overflow-hidden border border-white/10">
          {isPdf && !showImages ? (
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              <iframe
                src={src || ''}
                className="w-full h-full"
                title="Rodowód"
              />
              {src && (
                <a
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-2 left-2 z-50 px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm transition-colors border border-white/20"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#A68E4E]" />
                  Otwórz w nowej karcie
                </a>
              )}
            </div>
          ) : (
            <>
              {showImages && imageList.length > 1 && (
                <>
                  <button
                    onClick={goPrev}
                    className="absolute left-4 z-10 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors shadow-lg"
                    aria-label="Poprzednie zdjęcie"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={goNext}
                    className="absolute right-4 z-10 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors shadow-lg"
                    aria-label="Następne zdjęcie"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
              <div
                className="absolute inset-0 z-20 bg-transparent select-none"
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
              />
              <img
                src={src || ''}
                alt="Rodowód"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                className="w-full h-full object-contain select-none pointer-events-none"
              />
              {showImages && imageList.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/60 px-2 py-1.5 rounded-xl backdrop-blur-sm">
                  {imageList.map((thumb, idx) => (
                    <button
                      key={thumb + idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-12 h-12 rounded-md overflow-hidden border-2 transition-all ${idx === currentIndex ? 'border-primary' : 'border-transparent hover:border-white/40'}`}
                      aria-label={`Zdjęcie ${idx + 1}`}
                    >
                      <img src={thumb} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Action bar */}
        <div className="mt-4 flex gap-4">
          <a
            href={src || undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all font-medium shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-4 h-4" />
            <span>Otwórz w nowym oknie</span>
          </a>
        </div>
      </div>
    </UnifiedModal>
  );
};
