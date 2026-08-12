import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import {
  X,
  Trophy,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react";
import { Champion } from "@/hooks/useChampions";
import { trackMetric } from "@/services/metricsService";
import { FullscreenImageModal } from "@/components/ui/FullscreenImageModal";

interface ChampionModalProps {
  champion: Champion | null;
  onClose: () => void;
  onViewPedigree: (url: string) => void;
  onPrevChampion: () => void;
  onNextChampion: () => void;
  hasPrevChampion: boolean;
  hasNextChampion: boolean;
  championIndex: number;
  totalChampions: number;
}

export const ChampionModal = ({
  champion,
  onClose,
  onViewPedigree,
  onPrevChampion,
  onNextChampion,
  hasPrevChampion,
  hasNextChampion,
  championIndex,
  totalChampions,
}: ChampionModalProps) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [displaySrc, setDisplaySrc] = useState("");
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const hasMultiplePhotos = !!(champion && champion.images.length > 1);

  useEffect(() => {
    if (champion) {
      trackMetric("GALLERY_IMAGE", `${champion.id}`).catch(() => {});
    }
  }, [champion]);

  useEffect(() => {
    if (champion && champion.images?.length) {
      trackMetric(
        "GALLERY_IMAGE",
        `${champion.id}:${champion.images[currentPhotoIndex] || currentPhotoIndex}`,
      ).catch(() => {});
    }
  }, [champion, currentPhotoIndex]);

  // Reset indeks i preładowanie pierwszego zdjęcia przy zmianie championa
  useEffect(() => {
    if (!champion) return;
    const firstSrc = champion.images?.[0] ?? "";
    const frame = requestAnimationFrame(() => {
      setCurrentPhotoIndex(0);
      setImageError(false);
      setImageLoading(true);
      if (!firstSrc) {
        setImageError(true);
        setImageLoading(false);
        setDisplaySrc("");
        return;
      }
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        setDisplaySrc(firstSrc);
        setImageLoading(false);
      };
      img.onerror = () => {
        setImageError(true);
        setImageLoading(false);
        setDisplaySrc("");
      };
      img.src = firstSrc;
    });
    return () => cancelAnimationFrame(frame);
  }, [champion]);

  // Preload i podmiana źródła przy zmianie indeksu zdjęcia (bez mrugania)
  useEffect(() => {
    if (!champion) return;
    const nextSrc = champion.images?.[currentPhotoIndex] ?? "";
    const frame = requestAnimationFrame(() => {
      if (!nextSrc) {
        setImageError(true);
        setImageLoading(false);
        return;
      }
      setImageError(false);
      setImageLoading(true);
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        setDisplaySrc(nextSrc);
        setImageLoading(false);
      };
      img.onerror = () => {
        setImageError(true);
        setImageLoading(false);
      };
      img.src = nextSrc;
    });
    return () => cancelAnimationFrame(frame);
  }, [champion, currentPhotoIndex]);

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!champion || champion.images.length <= 1) return;
    setCurrentPhotoIndex((prev) => (prev + 1) % champion.images.length);
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!champion || champion.images.length <= 1) return;
    setCurrentPhotoIndex(
      (prev) => (prev - 1 + champion.images.length) % champion.images.length,
    );
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFullscreenOpen || !champion) return;

      if (e.key === "ArrowRight") {
        if (hasMultiplePhotos && champion.images) {
          setCurrentPhotoIndex((prev) => (prev + 1) % champion.images.length);
        } else if (hasNextChampion) {
          onNextChampion();
        }
      } else if (e.key === "ArrowLeft") {
        if (hasMultiplePhotos && champion.images) {
          setCurrentPhotoIndex(
            (prev) =>
              (prev - 1 + champion.images.length) % champion.images.length,
          );
        } else if (hasPrevChampion) {
          onPrevChampion();
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    champion,
    hasMultiplePhotos,
    hasNextChampion,
    hasPrevChampion,
    onNextChampion,
    onPrevChampion,
    onClose,
    isFullscreenOpen,
  ]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!champion) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto overflow-x-hidden bg-black/95 backdrop-blur-3xl p-0 md:p-4"
      onClick={onClose}
    >
      {/* Global Close Button - Always at top right of viewport */}
      <button
        onClick={onClose}
        className="fixed top-6 right-6 p-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all hover:scale-110 z-[10000] group shadow-2xl"
        aria-label="Zamknij"
      >
        <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Modal Container */}
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
        className="relative w-full max-w-7xl h-auto min-h-screen md:min-h-[85vh] isolate pointer-events-auto overflow-hidden flex flex-col md:flex-row shadow-[0_0_100px_rgba(0,0,0,0.8)] md:rounded-[2.5rem] mt-0 md:mt-10 mb-10 border border-gold"
        style={{
          background:
            "radial-gradient(circle at top, rgba(66, 192, 206, 0.15), transparent 50%), linear-gradient(185deg, rgba(2, 10, 19, 0.98) 0%, rgba(6, 35, 46, 0.95) 45%, rgba(9, 61, 77, 0.92) 100%)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Full Screen Image - Flexible Area */}
        <div className="relative flex-1 md:basis-[65%] flex items-center justify-center bg-black/40 overflow-hidden py-12 px-6">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          {imageError ? (
            <div className="text-center text-muted-foreground z-10 pt-20">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-primary/40" />
              <p className="text-lg font-medium">Zdjęcie niedostępne</p>
            </div>
          ) : (
            <motion.img
              key={displaySrc}
              src={displaySrc}
              alt={champion.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
              className="max-h-[70vh] md:max-h-[80vh] w-auto h-auto object-contain cursor-zoom-in rounded-xl shadow-2xl select-none"
              onClick={() => setIsFullscreenOpen(true)}
            />
          )}

          <button
            onClick={() => setIsFullscreenOpen(true)}
            className="absolute top-4 left-4 p-2 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-white/70 hover:text-white transition-all z-30 group"
            title="Pełny ekran"
          >
            <Maximize2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>

          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#0A0A0A] to-transparent pointer-events-none z-10" />

          {/* Photo Navigation - Inner */}
          {hasMultiplePhotos && (
            <>
              <button
                onClick={prevPhoto}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-white transition-all z-30"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextPhoto}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-white transition-all z-30 mr-[40%] md:mr-0"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Thumbnails at the bottom of the image area */}
          {hasMultiplePhotos && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
              {champion.images.map((img, idx) => (
                <button
                  key={`thumb-${idx}`}
                  onClick={() => setCurrentPhotoIndex(idx)}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                    currentPhotoIndex === idx
                      ? "border-gold scale-110"
                      : "border-white/20 hover:border-white/50"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar - Adjusted to be part of flex flow */}
        <div className="relative w-full md:w-[320px] lg:w-[380px] bg-white/[0.02] backdrop-blur-3xl border-l border-white/10 z-20 flex flex-col p-6 md:p-8 shrink-0">
          <div className="mt-8 md:mt-12 flex-1 flex flex-col justify-start">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/5 rounded-xl border border-gold/20 mb-8 w-full justify-center md:justify-start">
                <span className="text-2xl md:text-3xl font-display font-black gold-heading tracking-tight">
                  {champion.ringNumber || "Brak numeru"}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="space-y-3">
                    {champion.achievements.map((achievement, i) => (
                      <div
                        key={`achievement-${i}`}
                        className="flex items-start gap-3 group"
                      >
                        <div className="w-4 h-4 rounded-full bg-gold/10 flex items-center justify-center shrink-0 mt-0.5 border border-gold/20">
                          <Trophy className="w-2 h-2 text-gold opacity-70 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-[13px] gold-heading leading-snug font-medium">
                          {achievement}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {champion.pedigree && (
                  <div className="pt-4">
                    <button
                      onClick={() => onViewPedigree(champion.pedigree!)}
                      className="w-full py-3 gold-button rounded-xl flex items-center justify-center gap-2 text-[10px] transform active:scale-[0.98]"
                    >
                      <Sparkles className="w-3.5 h-3.5 gold-icon" />
                      <span className="font-black uppercase tracking-[0.1em]">Karta Rodowodowa</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Footer Info - Cleaned up */}
          <div className="pt-6 mt-auto border-t border-white/5 flex justify-end items-center text-white/20 text-[9px] font-mono uppercase tracking-[0.25em]">
            {hasMultiplePhotos && (
              <span>
                IMG {currentPhotoIndex + 1}/{champion.images.length}
              </span>
            )}
          </div>
        </div>

        {/* Navigation Arrows */}
        {hasPrevChampion && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrevChampion();
            }}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-4 rounded-2xl bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-white/50 hover:text-white transition-all hover:scale-105 hidden md:flex"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        )}
        {hasNextChampion && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNextChampion();
            }}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-30 p-4 rounded-2xl bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-white/50 hover:text-white transition-all hover:scale-105 hidden lg:flex"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        )}

        {/* Mobile Nav Overlay */}
        <div className="absolute inset-0 z-20 flex md:hidden pointer-events-none">
          <div
            className="w-1/2 h-full pointer-events-auto"
            onClick={(e) => {
              e.stopPropagation();
              if (hasPrevChampion) onPrevChampion();
            }}
          />
          <div
            className="w-1/2 h-full pointer-events-auto"
            onClick={(e) => {
              e.stopPropagation();
              if (hasNextChampion) onNextChampion();
            }}
          />
        </div>
      </motion.div>

      {/* Fullscreen Lightbox */}
      {isFullscreenOpen && champion && (
        <FullscreenImageModal
          isOpen={isFullscreenOpen}
          onClose={() => setIsFullscreenOpen(false)}
          images={champion.images}
          currentIndex={currentPhotoIndex}
          title={champion.name}
        />
      )}
    </motion.div>,
    document.body,
  );
};
