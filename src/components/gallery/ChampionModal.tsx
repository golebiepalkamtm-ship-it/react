import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Trophy, Sparkles } from "lucide-react";
import { Champion } from "@/hooks/useChampions";
import { trackMetric } from "@/services/metricsService";

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

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!champion) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center p-4 md:p-8 overflow-y-auto"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Modal Container */}
      <motion.div
        initial={{ scale: 0.98, opacity: 0, y: -40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.98, opacity: 0, y: -40 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full h-auto min-h-[500px] max-w-5xl isolate pointer-events-auto overflow-hidden bg-[#0A0A0A] rounded-[2rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] mt-2 md:mt-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Full Screen Image - Positioned Left & Shifted UP */}
        <div className="absolute inset-y-0 left-0 w-full md:w-[60%] lg:w-[65%] z-0 flex items-start justify-center bg-black/20 overflow-hidden">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full object-contain object-top pt-4 md:pt-6 px-4"
            />
          )}
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#0A0A0A] to-transparent pointer-events-none z-10" />
        </div>

        {/* Right Sidebar - Fixed Width */}
        <div className="absolute inset-y-0 right-0 w-full md:w-[40%] lg:w-[35%] bg-[#0A0A0A]/80 backdrop-blur-2xl border-l border-white/10 z-20 flex flex-col p-6 md:p-8">
          {/* Close button - Top right of the sidebar section */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:scale-110 z-50 group shadow-lg"
            aria-label="Zamknij"
          >
            <X className="w-5 h-5 text-white/70 group-hover:text-white" />
          </button>

          <div className="mt-6 flex-1 flex flex-col justify-start">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl md:text-2xl font-display font-bold text-white mb-2 leading-tight uppercase tracking-tight">
                {champion.name}
              </h2>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-gold/10 rounded-lg border border-gold/20 mb-4 font-mono">
                <span className="text-[9px] font-bold text-gold uppercase tracking-[0.2em]">
                  Numer
                </span>
                <span className="text-xs font-bold text-white/90">
                  {champion.ringNumber || "Brak numeru"}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3 font-black">
                    Osiągnięcia
                  </h3>
                  <div className="space-y-2">
                    {champion.achievements.map((achievement, i) => (
                      <div
                        key={`achievement-${i}`}
                        className="flex items-start gap-3 group"
                      >
                        <div className="w-4 h-4 rounded-full bg-gold/10 flex items-center justify-center shrink-0 mt-0.5 border border-gold/20">
                          <Trophy className="w-2 h-2 text-gold opacity-70 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-[13px] text-white/80 leading-snug font-medium">
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
                      className="w-full py-3 bg-gradient-to-r from-gold/80 to-gold hover:from-gold hover:to-gold-light text-black font-black uppercase tracking-[0.1em] rounded-xl transition-all shadow-[0_10px_30px_rgba(212,175,55,0.2)] hover:shadow-[0_15px_40px_rgba(212,175,55,0.3)] flex items-center justify-center gap-2 text-[10px] transform active:scale-[0.98]"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Karta Rodowodowa
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Footer Info */}
          <div className="pt-6 mt-auto border-t border-white/5 flex justify-between items-center text-white/20 text-[9px] font-mono uppercase tracking-[0.25em]">
            <span>
              LOT {championIndex + 1} / {totalChampions}
            </span>
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
            className="absolute right-[33%] top-1/2 -translate-y-1/2 z-30 p-4 rounded-2xl bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-white/50 hover:text-white transition-all hover:scale-105 hidden md:flex"
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
    </motion.div>
  );
};
