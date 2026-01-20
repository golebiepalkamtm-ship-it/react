import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, FileText, Loader2, Medal, Trophy } from "lucide-react";
import { useChampions } from "@/hooks/useChampions";
import { PedigreeModal } from "./PedigreeModal";
import { SmoothScrollReveal } from "@/components/effects/SmoothScrollReveal";
import { MagneticButton } from "@/components/effects/MagneticButton";
import { gsap, ScrollTrigger } from '@/lib/gsapConfig';

export const Carousel3D = () => {
  const animationRef = useRef<gsap.core.Timeline | null>(null);
  const wrapperRef = useRef<HTMLElement | null>(null);
  const zoomTargetRef = useRef<HTMLDivElement | null>(null);
  const resumeTimeoutRef = useRef<number | null>(null);
  const firstChangeTriggeredRef = useRef(false);
  const { champions, loading, error } = useChampions();
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isPedigreeOpen, setIsPedigreeOpen] = useState(false);
  const [pedigreeUrl, setPedigreeUrl] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const items = useMemo(() => champions, [champions]);
  const activeChampion = items[activeIndex];

  const navigate = useCallback(
    (newDirection: number) => {
      if (items.length === 0) return;
      setDirection(newDirection);
      setActiveIndex((prev) => {
        if (newDirection > 0) {
          return prev === items.length - 1 ? 0 : prev + 1;
        }
        return prev === 0 ? items.length - 1 : prev - 1;
      });
    },
    [items.length],
  );

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const target = zoomTargetRef.current;
    if (!wrapper || !target) return;
    if (animationRef.current) {
      animationRef.current.kill();
      animationRef.current = null;
    }
    firstChangeTriggeredRef.current = false;
    gsap.set(target, {
      scale: 0.15,
      opacity: 0,
      z: -1000,
      transformPerspective: 1000,
      transformStyle: 'preserve-3d',
      force3D: true,
    });
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrapper,
        start: 'top top',
        end: '+=120%',        // Skrócony pin
        pin: true,
        scrub: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        id: 'carousel-zoom-pin',
        onEnter: () => {
          setIsAutoPlaying(false);
          firstChangeTriggeredRef.current = false;
        },
        onEnterBack: () => setIsAutoPlaying(false),
      },
    });
    
    // 0-40%: Dolot karuzeli (zoom in)
    tl.to(target, {
      scale: 1,
      opacity: 1,
      z: 0,
      ease: 'none',
      duration: 1,
    });
    
    // 40-60%: PAUZA - karuzela stoi w pełnym rozmiarze (przed zmianą zdjęcia)
    tl.to(target, { duration: 0.5 });
    
    // 60-100%: Po zmianie zdjęcia - trzyma jeszcze przez chwilę
    tl.to(target, { duration: 1 });
    animationRef.current = tl;
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);
    return () => {
      if (tl.scrollTrigger) {
        tl.scrollTrigger.kill(true);
      }
      tl.kill();
    };
  }, [navigate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
      if (resumeTimeoutRef.current) {
        window.clearTimeout(resumeTimeoutRef.current);
      }
    };
  }, []);

  // Funkcja do zatrzymania auto-play z automatycznym wznowieniem
  const pauseAutoPlay = useCallback(() => {
    setIsAutoPlaying(false);
    
    // Wyczyść poprzedni timeout jeśli istnieje
    if (resumeTimeoutRef.current) {
      window.clearTimeout(resumeTimeoutRef.current);
    }
    
    // Wznów auto-play po 3 sekundach bezczynności
    resumeTimeoutRef.current = window.setTimeout(() => {
      setIsAutoPlaying(true);
    }, 3000);
  }, []);

  // Throttled version of pauseAutoPlay
  const throttledPauseRef = useRef<number>(0);
  const handleUserInteraction = useCallback(() => {
    const now = Date.now();
    if (now - throttledPauseRef.current > 500) {
      throttledPauseRef.current = now;
      pauseAutoPlay();
    }
  }, [pauseAutoPlay]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    if (items.length <= 1) return;
    const timer = window.setInterval(() => navigate(1), 6000);
    return () => window.clearInterval(timer);
  }, [isAutoPlaying, navigate, items.length]);

  const slideVariants = useMemo(
    () => ({
      enter: (d: number) => ({
        x: d > 0 ? "100%" : "-100%",
        opacity: 0,
        scale: 0.9,
      }),
      center: {
        x: 0,
        opacity: 1,
        scale: 1,
      },
      exit: (d: number) => ({
        x: d > 0 ? "-50%" : "50%",
        opacity: 0,
        scale: 0.9,
      }),
    }),
    [],
  );

  const openPedigree = useCallback((url: string) => {
    setPedigreeUrl(url);
    setIsPedigreeOpen(true);
  }, []);

  const closePedigree = useCallback(() => {
    setIsPedigreeOpen(false);
    setPedigreeUrl(null);
  }, []);

  if (loading) {
    return (
      <section className="relative py-24 overflow-hidden section-surface">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
          <span className="ml-3 text-muted-foreground">Ładowanie championów...</span>
        </div>
      </section>
    );
  }

  if (error || items.length === 0) {
    return null;
  }

  return (
    <section
      ref={wrapperRef as any}
      data-section="carousel"
      className="relative min-h-screen overflow-hidden section-surface"
      onMouseEnter={pauseAutoPlay}
      onMouseMove={handleUserInteraction}
      style={{ perspective: 1000 }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[140px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.18, 0.28, 0.18] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-gold/10 blur-[120px]"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.22, 0.16, 0.22] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="relative z-20 pt-16 md:pt-24 pb-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.3em] text-primary mb-4">
            <Trophy className="w-4 h-4" />
            Pałka M.T.M
            <Trophy className="w-4 h-4" />
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-light">
            <span className="text-gold">Galeria </span>
            <span className="text-white">Mistrzów</span>
          </h2>
        </motion.div>
      </div>

      <div className="relative z-10 flex items-center justify-center px-4 md:px-8 lg:px-16 pb-32">
        <div ref={zoomTargetRef} className="relative w-full max-w-7xl will-change-transform">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-0 md:-left-4 lg:-left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 md:w-16 md:h-16 rounded-full border border-primary/30 bg-background/50 backdrop-blur-sm flex items-center justify-center text-foreground hover:border-primary hover:bg-primary/10 transition-all duration-300 group"
            aria-label="Poprzedni"
          >
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => navigate(1)}
            className="absolute right-0 md:-right-4 lg:-right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 md:w-16 md:h-16 rounded-full border border-primary/30 bg-background/50 backdrop-blur-sm flex items-center justify-center text-foreground hover:border-primary hover:bg-primary/10 transition-all duration-300 group"
            aria-label="Następny"
          >
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="relative flex flex-col lg:flex-row items-start gap-8 lg:gap-16">
            <div className="relative w-full lg:w-3/5 aspect-[4/3] overflow-hidden rounded-3xl">
              {/* Złota poświata wokół ramki */}
              <div className="absolute inset-0 rounded-3xl z-10 pointer-events-none">
                <div className="absolute inset-0 rounded-3xl shadow-[0_0_60px_rgba(212,175,55,0.4),0_0_100px_rgba(212,175,55,0.2),inset_0_0_60px_rgba(212,175,55,0.1)]" />
              </div>
              <div className="absolute inset-0 border-2 border-gold/30 rounded-3xl z-20 pointer-events-none" />
              <div className="absolute inset-4 border border-gold/20 rounded-2xl z-20 pointer-events-none" />

              <svg className="absolute top-2 left-2 w-12 h-12 text-primary/40 z-20" viewBox="0 0 48 48">
                <path d="M0 24 L0 0 L24 0" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
              <svg className="absolute top-2 right-2 w-12 h-12 text-primary/40 z-20" viewBox="0 0 48 48">
                <path d="M48 24 L48 0 L24 0" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
              <svg className="absolute bottom-2 left-2 w-12 h-12 text-primary/40 z-20" viewBox="0 0 48 48">
                <path d="M0 24 L0 48 L24 48" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
              <svg className="absolute bottom-2 right-2 w-12 h-12 text-primary/40 z-20" viewBox="0 0 48 48">
                <path d="M48 24 L48 48 L24 48" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>

              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={activeIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                  className="absolute inset-0"
                >
                  <img
                    src={activeChampion.images[0]}
                    alt={activeChampion.name}
                    className="w-full h-full object-cover bg-gradient-to-b from-muted/20 to-background"
                    loading="lazy"
                    width="800"
                    height="600"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="relative w-full lg:w-2/5 text-center lg:text-left">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="space-y-6"
                >
                  {/* Ring number at the top */}
                  <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-2">
                    <p className="font-body text-sm uppercase tracking-widest text-primary font-medium">
                      {activeChampion.ringNumber || activeChampion.records[0]}
                    </p>
                  </div>

                  <p className="font-display text-xl md:text-2xl text-muted-foreground italic">{activeChampion.title}</p>

                  {activeChampion.pedigree && (
                    <div className="flex justify-center lg:justify-start">
                      <button
                        type="button"
                        onClick={() => openPedigree(activeChampion.pedigree!)}
                        className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-primary/30 bg-background/40 backdrop-blur-sm hover:border-primary hover:bg-primary/10 transition-all duration-300 text-foreground"
                      >
                        <FileText className="w-5 h-5" />
                        <span className="font-body text-sm uppercase tracking-widest">Rodowód</span>
                      </button>
                    </div>
                  )}

                  <div className="space-y-3 pt-4 border-t border-primary/20">
                    <p className="font-body text-xs uppercase tracking-widest text-muted-foreground">Osiągnięcia</p>
                    <div className="grid grid-cols-2 gap-4">
                      <ul className="space-y-2">
                        {activeChampion.achievements.slice(0, Math.ceil(activeChampion.achievements.length / 2)).map((achievement, i) => (
                          <li
                            key={`${activeChampion.id}-${achievement}-col1`}
                            className="flex items-center gap-3 font-body text-foreground"
                          >
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 + i * 0.1 }}
                              className="flex items-center gap-3 w-full"
                            >
                              <span className="w-2 h-2 rounded-full bg-primary" />
                              {achievement}
                            </motion.div>
                          </li>
                        ))}
                      </ul>
                      <ul className="space-y-2">
                        {activeChampion.achievements.slice(Math.ceil(activeChampion.achievements.length / 2)).map((achievement, i) => (
                          <li
                            key={`${activeChampion.id}-${achievement}-col2`}
                            className="flex items-center gap-3 font-body text-foreground"
                          >
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 + (i + Math.ceil(activeChampion.achievements.length / 2)) * 0.1 }}
                              className="flex items-center gap-3 w-full"
                            >
                              <span className="w-2 h-2 rounded-full bg-primary" />
                              {achievement}
                            </motion.div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <PedigreeModal isOpen={isPedigreeOpen} onClose={closePedigree} pedigreeUrl={pedigreeUrl} />
    </section>
  );
};

export default Carousel3D;

