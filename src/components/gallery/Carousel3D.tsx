import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  Medal,
  Trophy,
} from "lucide-react";
import { useChampions } from "@/hooks/useChampions";
import { PedigreeModal } from "./PedigreeModal";
import { ChampionModal } from "./ChampionModal";
import { SmoothScrollReveal } from "@/components/effects/SmoothScrollReveal";
import { MagneticButton } from "@/components/effects/MagneticButton";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export type TCarouselItem = {
  id: number;
  content: React.ReactNode;
};

export const Carousel3D = () => {
  const animationRef = useRef<gsap.core.Timeline | null>(null);
  const resumeTimeoutRef = useRef<number | null>(null);
  const { champions, loading, error } = useChampions();
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [direction, setDirection] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const [isPedigreeOpen, setIsPedigreeOpen] = useState<boolean>(false);
  const [pedigreeUrl, setPedigreeUrl] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);

  const isClient = typeof window !== "undefined";

  const items = useMemo(() => champions, [champions]);
  const activeChampion = items[activeIndex];

  const carouselRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const detailsContainerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!carouselRef.current) return;

      // Force initial states
      gsap.set(badgeRef.current, { opacity: 0, y: 40, scale: 0.9 });
      gsap.set(titleRef.current, { opacity: 0, y: 60 });
      gsap.set(imageContainerRef.current, {
        opacity: 0,
        scale: 0.9,
        rotateY: -15,
      });
      gsap.set(detailsContainerRef.current, { opacity: 0, x: 50, rotateY: 15 });

      const mainTl = gsap.timeline({
        scrollTrigger: {
          trigger: carouselRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
          once: true,
        },
      });

      mainTl
        .fromTo(
          badgeRef.current,
          { opacity: 0, y: 40, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(1.5)" },
          0,
        )
        .fromTo(
          titleRef.current,
          { opacity: 0, y: 60, clipPath: "inset(0% 0% 100% 0%)" },
          {
            opacity: 1,
            y: 0,
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.1,
            ease: "expo.out",
          },
          0.2,
        )
        .fromTo(
          imageContainerRef.current,
          { opacity: 0, scale: 0.9, rotateY: -15 },
          { opacity: 1, scale: 1, rotateY: 0, duration: 1.3, ease: "expo.out" },
          0.4,
        )
        .fromTo(
          detailsContainerRef.current,
          { opacity: 0, x: 50, rotateY: 15 },
          { opacity: 1, x: 0, rotateY: 0, duration: 1.2, ease: "expo.out" },
          0.6,
        );
    },
    { scope: carouselRef },
  );

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

  const openChampionModal = useCallback(() => {
    setIsAutoPlaying(false);
    setIsImageModalOpen(true);
  }, []);

  const closeChampionModal = useCallback(() => {
    setIsImageModalOpen(false);
    setIsAutoPlaying(true);
  }, []);

  if (!isClient) {
    return null;
  }

  if (loading) {
    return (
      <section className="relative py-24 overflow-hidden section-surface">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
          <span className="ml-3 text-muted-foreground">
            Ładowanie championów...
          </span>
        </div>
      </section>
    );
  }

  if (error || items.length === 0) {
    return null;
  }

  return (
    <section
      ref={carouselRef}
      id="carousel"
      className="relative min-h-screen overflow-hidden section-surface"
      onMouseEnter={pauseAutoPlay}
      onMouseMove={handleUserInteraction}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[140px] opacity-[0.2]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-gold/10 blur-[120px] opacity-[0.2]" />
      </div>

      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="relative z-20 pt-16 md:pt-24 pb-8 text-center">
        <div>
          <span
            ref={badgeRef}
            className="inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.3em] text-primary mb-4"
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Trophy className="w-4 h-4" />
            </motion.div>
            Pałka M.T.M
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.25,
              }}
            >
              <Trophy className="w-4 h-4" />
            </motion.div>
          </span>
          <h2
            ref={titleRef}
            className="font-display text-4xl md:text-6xl lg:text-7xl font-light"
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
            }}
          >
            <span className="text-foreground">Galeria </span>
            <span className="text-gold">Mistrzów</span>
          </h2>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center px-4 md:px-8 lg:px-16 pb-32">
        <div className="relative w-full max-w-7xl">
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
            <div
              ref={imageContainerRef}
              className="relative w-full lg:w-3/5 aspect-[4/3] overflow-hidden rounded-3xl"
              style={{
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
              }}
            >
              {/* Złota poświata wokół ramki */}
              <div className="absolute inset-0 rounded-3xl z-10 pointer-events-none">
                <div className="absolute inset-0 rounded-3xl shadow-[0_0_60px_rgba(212,175,55,0.4),0_0_100px_rgba(212,175,55,0.2),inset_0_0_60px_rgba(212,175,55,0.1)]" />
              </div>
              <div className="absolute inset-0 border-2 border-gold/30 rounded-3xl z-20 pointer-events-none" />
              <div className="absolute inset-4 border border-gold/20 rounded-2xl z-20 pointer-events-none" />

              <svg
                className="absolute top-2 left-2 w-12 h-12 text-primary/40 z-20"
                viewBox="0 0 48 48"
              >
                <path
                  d="M0 24 L0 0 L24 0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              <svg
                className="absolute top-2 right-2 w-12 h-12 text-primary/40 z-20"
                viewBox="0 0 48 48"
              >
                <path
                  d="M48 24 L48 0 L24 0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              <svg
                className="absolute bottom-2 left-2 w-12 h-12 text-primary/40 z-20"
                viewBox="0 0 48 48"
              >
                <path
                  d="M0 24 L0 48 L24 48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              <svg
                className="absolute bottom-2 right-2 w-12 h-12 text-primary/40 z-20"
                viewBox="0 0 48 48"
              >
                <path
                  d="M48 24 L48 48 L24 48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
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
                  <div
                    className="absolute inset-0 cursor-pointer group/img"
                    onClick={openChampionModal}
                  >
                    <img
                      src={activeChampion.images[0]}
                      alt={activeChampion.name}
                      className="w-full h-full object-cover bg-gradient-to-b from-muted/20 to-background transition-transform duration-700 group-hover/img:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="px-6 py-2 bg-gold text-black rounded-full font-bold uppercase tracking-widest text-xs transform translate-y-4 group-hover/img:translate-y-0 transition-transform duration-300">
                        Zobacz Galerię & Detale
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div
              ref={detailsContainerRef}
              className="relative w-full lg:w-2/5 text-center lg:text-left"
              style={{
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
              }}
            >
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

                  <p className="font-display text-xl md:text-2xl text-muted-foreground italic">
                    {activeChampion.title}
                  </p>

                  {activeChampion.pedigree && (
                    <div className="flex justify-center lg:justify-start">
                      <button
                        type="button"
                        onClick={() => openPedigree(activeChampion.pedigree!)}
                        className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-primary/30 bg-background/40 backdrop-blur-sm hover:border-primary hover:bg-primary/10 transition-all duration-300 text-foreground"
                      >
                        <FileText className="w-5 h-5" />
                        <span className="font-body text-sm uppercase tracking-widest">
                          Rodowód
                        </span>
                      </button>
                    </div>
                  )}

                  <div className="space-y-3 pt-4 border-t border-primary/20">
                    <p className="font-body text-xs uppercase tracking-widest text-muted-foreground">
                      Osiągnięcia
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <ul className="space-y-2">
                        {activeChampion.achievements
                          .slice(
                            0,
                            Math.ceil(activeChampion.achievements.length / 2),
                          )
                          .map((achievement, i) => (
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
                        {activeChampion.achievements
                          .slice(
                            Math.ceil(activeChampion.achievements.length / 2),
                          )
                          .map((achievement, i) => (
                            <li
                              key={`${activeChampion.id}-${achievement}-col2`}
                              className="flex items-center gap-3 font-body text-foreground"
                            >
                              <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  delay:
                                    0.4 +
                                    (i +
                                      Math.ceil(
                                        activeChampion.achievements.length / 2,
                                      )) *
                                      0.1,
                                }}
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

      <PedigreeModal
        isOpen={isPedigreeOpen}
        onClose={closePedigree}
        pedigreeUrl={pedigreeUrl}
      />

      <AnimatePresence>
        {isImageModalOpen && activeChampion && (
          <ChampionModal
            key={activeChampion.id}
            champion={activeChampion as any}
            onClose={closeChampionModal}
            onViewPedigree={openPedigree}
            onPrevChampion={() => navigate(-1)}
            onNextChampion={() => navigate(1)}
            hasPrevChampion={items.length > 1}
            hasNextChampion={items.length > 1}
            championIndex={activeIndex}
            totalChampions={items.length}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default Carousel3D;
