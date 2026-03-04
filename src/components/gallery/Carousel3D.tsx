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
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { MagneticButton } from "@/components/effects/MagneticButton";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { WidgetErrorBoundary } from "@/components/WidgetErrorBoundary";

gsap.registerPlugin(ScrollTrigger);

export type TCarouselItem = {
  id: number;
  content: React.ReactNode;
};

export const Carousel3D = () => {
  const animationRef = useRef<gsap.core.Timeline | null>(null);
  const resumeTimeoutRef = useRef<number | null>(null);
  const { champions, loading, error, refetch } = useChampions();
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
          start: "top 90%", // Start earlier
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
        // Title handled globally via data-split="chars"
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
          <Loader2 className="w-8 h-8 gold-icon animate-spin" />
          <span className="ml-3 text-muted-foreground">
            Ładowanie championów...
          </span>
        </div>
      </section>
    );
  }

  if (error || items.length === 0) {
    return (
      <section className="relative py-24 overflow-hidden section-surface">
        <div className="max-w-3xl mx-auto text-center space-y-6 px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground/5 text-foreground/70 text-sm">
            <Trophy className="w-4 h-4 text-[#A68E4E]" />
            Galeria championów
          </div>
          <h2 className="font-display text-3xl font-bold text-foreground">
            Galeria chwilowo niedostępna
          </h2>
          <p className="text-muted-foreground">
            Nie udało się załadować danych championów. Sprawdź połączenie lub
            spróbuj ponownie.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={refetch}
              className="px-5 py-2 rounded-lg bg-[#A68E4E] text-black font-semibold hover:brightness-110 transition"
            >
              Spróbuj ponownie
            </button>
            <a
              href="/"
              className="px-5 py-2 rounded-lg border border-foreground/20 text-foreground hover:bg-foreground/5 transition"
            >
              Strona główna
            </a>
          </div>
        </div>
      </section>
    );
  }

  if (!activeChampion) {
    return null;
  }

  return (
    <WidgetErrorBoundary widgetName="Carousel3D">
      <section
        ref={carouselRef}
        id="carousel"
        className="relative py-24 md:py-32 flex flex-col justify-center overflow-hidden section-surface"
        onMouseEnter={pauseAutoPlay}
        onMouseMove={handleUserInteraction}
      >
        {/* Wewnętrzne tła usunięte - prześwituje tło globalne */}

        <div className="relative z-20 pt-16 md:pt-24 pb-8 text-center">
          <div>
            <span
              ref={badgeRef}
              className="inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.3em] text-zinc-900 mb-4"
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
                <Trophy className="w-4 h-4 text-[#A68E4E]" />
              </motion.div>
              Pałka M.T.M
            </span>

            <h2
              ref={titleRef}
              data-split="chars"
              className="font-display text-2xl md:text-3xl lg:text-4xl font-bold leading-tight uppercase tracking-[0.2em] mb-10"
              style={{
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
              }}
            >
              <span className="text-zinc-900">Championy Hodowli</span> –{" "}
              <span className="text-[#A68E4E]">Nasza Elita</span>
            </h2>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-center px-4 md:px-8 lg:px-16 pb-16">
          <div className="relative w-full max-w-7xl">
            <button
              onClick={() => navigate(-1)}
              className="absolute left-[-20px] md:left-[-60px] lg:left-[-100px] top-1/2 -translate-y-1/2 z-30 w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#A68E4E] flex items-center justify-center text-zinc-900 hover:scale-110 active:scale-90 transition-all duration-300 shadow-xl shadow-gold/20 group"
              aria-label="Poprzedni"
            >
              <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 group-hover:-translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate(1)}
              className="absolute right-[-20px] md:right-[-60px] lg:right-[-100px] top-1/2 -translate-y-1/2 z-30 w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#A68E4E] flex items-center justify-center text-zinc-900 hover:scale-110 active:scale-90 transition-all duration-300 shadow-xl shadow-gold/20 group"
              aria-label="Następny"
            >
              <ChevronRight className="w-6 h-6 md:w-8 md:h-8 group-hover:translate-x-1 transition-transform" />
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
                  <div className="absolute inset-0 rounded-3xl shadow-[0_0_80px_rgba(212,175,55,0.6),0_0_140px_rgba(212,175,55,0.25),inset_0_0_60px_rgba(212,175,55,0.15)]" />
                </div>
                <div className="absolute inset-0 border-2 border-[#C8AE68] rounded-3xl z-20 pointer-events-none" />
                <div className="absolute inset-4 border border-[#C8AE68] rounded-2xl z-20 pointer-events-none" />

                <svg
                  className="absolute top-2 left-2 w-12 h-12 gold-icon z-20"
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
                  className="absolute top-2 right-2 w-12 h-12 gold-icon z-20"
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
                  className="absolute bottom-2 left-2 w-12 h-12 gold-icon z-20"
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
                  className="absolute bottom-2 right-2 w-12 h-12 gold-icon z-20"
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
                    {activeChampion ? (
                      <div
                        className="absolute inset-0 cursor-pointer group/img"
                        onClick={openChampionModal}
                      >
                        <img
                          src={activeChampion?.images?.[0] ?? ""}
                          alt={activeChampion?.name ?? "Champion"}
                          className="w-full h-full object-cover bg-gradient-to-b from-muted/20 to-background transition-transform duration-700"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 flex items-center justify-center">
                          <div className="px-6 py-2 bg-gold text-black rounded-full font-bold uppercase tracking-widest text-xs transform translate-y-4 transition-transform duration-300">
                            Zobacz Galerię & Detale
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted/10 text-muted-foreground">
                        Brak danych championów
                      </div>
                    )}
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
                      <p className="font-body text-sm uppercase tracking-widest text-[#C8AE68] font-medium">
                        {activeChampion.ringNumber ||
                          activeChampion.records?.[0] ||
                          "Champion"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <ul className="space-y-2">
                        {(activeChampion.achievements ?? [])
                          .slice(
                            0,
                            Math.ceil(
                              (activeChampion.achievements ?? []).length / 2,
                            ),
                          )
                          .map((achievement, i) => (
                            <li
                              key={`${activeChampion.id}-${achievement}-col1`}
                              className="flex items-center gap-3 font-body text-[#C8AE68]"
                            >
                              <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + i * 0.1 }}
                                className="flex items-center gap-3 w-full"
                              >
                                <span className="w-2 h-2 rounded-full bg-[#C8AE68]" />
                                {achievement}
                              </motion.div>
                            </li>
                          ))}
                      </ul>
                      <ul className="space-y-2">
                        {(activeChampion.achievements ?? [])
                          .slice(
                            Math.ceil(
                              (activeChampion.achievements ?? []).length / 2,
                            ),
                          )
                          .map((achievement, i) => (
                            <li
                              key={`${activeChampion.id}-${achievement}-col2`}
                              className="flex items-center gap-3 font-body text-[#C8AE68]"
                            >
                              <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  delay:
                                    0.4 +
                                    (i +
                                      Math.ceil(
                                        (activeChampion.achievements ?? [])
                                          .length / 2,
                                      )) *
                                      0.1,
                                }}
                                className="flex items-center gap-3 w-full"
                              >
                                <span className="w-2 h-2 rounded-full bg-[#C8AE68]" />
                                {achievement}
                              </motion.div>
                            </li>
                          ))}
                      </ul>
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

        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent z-20" />
      </section>
    </WidgetErrorBoundary>
  );
};

export default Carousel3D;
