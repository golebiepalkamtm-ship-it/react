import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Trophy } from "lucide-react";
import { useChampions } from "@/hooks/useChampions";
import { PedigreeModal } from "./PedigreeModal";
import { ChampionModal } from "./ChampionModal";
import { GoldArrowButton } from "./GoldArrowButton";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { scrubReveal } from "@/lib/scrollReveal";
import { WidgetErrorBoundary } from "@/components/WidgetErrorBoundary";
import { useDistortion } from "@/components/experience";

gsap.registerPlugin(ScrollTrigger);

export type TCarouselItem = {
  id: number;
  content: React.ReactNode;
};

export const Carousel3D = () => {
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
  const glCanvasRef = useRef<HTMLCanvasElement>(null);

  // Zdjęcie championa w WebGL: fala i przechył pod kursorem, przenikanie
  // przy zmianie slajdu. Kadr w spoczynku jest taki sam jak <img> (zoom 1);
  // zapas płaszczyzny (overscan) pokazuje przy przechyle dalszą część
  // zdjęcia, a rogi przycina sama ramka (rounded-3xl + overflow-hidden).
  useDistortion(imageContainerRef, glCanvasRef, activeChampion?.images?.[0], {
    overscan: 1.1,
    zoom: 1,
    radius: 0,
    tilt: 0.6,
    bulge: 50,
  });

  useGSAP(
    () => {
      if (!carouselRef.current || loading || items.length === 0) return;

      // Ciągłe odsłanianie sprzężone ze scrollem – bez progów i przeskoków
      scrubReveal([badgeRef.current, titleRef.current], { y: 50 });
      scrubReveal(imageContainerRef.current, {
        y: 80,
        scale: 0.96,
        end: "top 60%",
      });
      scrubReveal(detailsContainerRef.current, {
        y: 40,
        x: 40,
        end: "top 60%",
      });
    },
    { dependencies: [loading, items.length], scope: carouselRef },
  );

  // Funkcja do zatrzymania auto-play z automatycznym wznowieniem
  const pauseAutoPlay = useCallback(() => {
    setIsAutoPlaying(false);

    if (resumeTimeoutRef.current) {
      window.clearTimeout(resumeTimeoutRef.current);
    }

    resumeTimeoutRef.current = window.setTimeout(() => {
      setIsAutoPlaying(true);
    }, 3000);
  }, []);

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

  // Wczytaj z wyprzedzeniem zdjęcia wszystkich championów – bez tego każde
  // przełączenie pokazywało pustą ramkę, zanim obraz zdążył się pobrać.
  useEffect(() => {
    items.forEach((champion) => {
      const src = champion.images?.[0];
      if (!src) return;
      const img = new Image();
      img.decoding = "async";
      img.src = src;
    });
  }, [items]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    if (items.length <= 1) return;
    const timer = window.setInterval(() => navigate(1), 6000);
    return () => window.clearInterval(timer);
  }, [isAutoPlaying, navigate, items.length]);

  // Przenikanie: nowy obraz pojawia się NAD starym, który znika dopiero pod
  // nim – w kadrze nigdy nie ma pustej ramki. Kierunek daje lekki dryf.
  const slideVariants = useMemo(
    () => ({
      enter: (d: number) => ({
        x: d > 0 ? 24 : -24,
        opacity: 0,
        zIndex: 2,
      }),
      center: {
        x: 0,
        opacity: 1,
        zIndex: 2,
      },
      exit: {
        opacity: 0,
        zIndex: 1,
        transition: { duration: 0.3, delay: 0.35 },
      },
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
      <section className="relative py-24 overflow-hidden section-surface min-h-[85vh] flex items-center justify-center">
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
        <div className="relative z-20 pt-8 md:pt-12 pb-8 text-center">
          <div>
            <span
              ref={badgeRef}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-[#A68E4E] text-zinc-900 text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] shadow-lg shadow-gold/20 mb-8"
            >
              <Trophy className="w-4 h-4 text-zinc-900" />
              Pałka M.T.M
            </span>

            <h2
              ref={titleRef}
              className="font-display text-2xl md:text-3xl lg:text-4xl font-bold leading-tight uppercase tracking-[0.2em] mb-10 text-zinc-100"
            >
              <span className="text-zinc-100">Championy Hodowli</span> –{" "}
              <span className="text-[#A68E4E]">Nasza Elita</span>
            </h2>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-center px-4 md:px-8 lg:px-16 pb-16">
          <div className="relative w-full max-w-7xl">
            <GoldArrowButton
              direction="prev"
              onClick={() => navigate(-1)}
              label="Poprzedni"
              className="absolute left-2 md:left-[-40px] lg:left-[-76px] top-1/2 -translate-y-1/2 z-30"
            />
            <GoldArrowButton
              direction="next"
              onClick={() => navigate(1)}
              label="Następny"
              className="absolute right-2 md:right-[-40px] lg:right-[-76px] top-1/2 -translate-y-1/2 z-30"
            />

            <div className="relative flex flex-col lg:flex-row items-start gap-8 lg:gap-16">
              <div
                ref={imageContainerRef}
                className="gl-host relative w-full lg:w-3/5 aspect-[4/3] overflow-hidden rounded-3xl will-change-transform"
              >
                <canvas
                  ref={glCanvasRef}
                  className="gl-host-canvas"
                  aria-hidden="true"
                />
                <div className="absolute inset-0 border-2 border-[#C8AE68] rounded-3xl z-20 pointer-events-none" />
                <div className="absolute inset-4 border border-[#C8AE68] rounded-2xl z-20 pointer-events-none" />

                <svg
                  className="absolute top-2 left-2 w-12 h-12 gold-icon z-20 pointer-events-none"
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
                  className="absolute top-2 right-2 w-12 h-12 gold-icon z-20 pointer-events-none"
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
                  className="absolute bottom-2 left-2 w-12 h-12 gold-icon z-20 pointer-events-none"
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
                  className="absolute bottom-2 right-2 w-12 h-12 gold-icon z-20 pointer-events-none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M48 24 L48 48 L24 48"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>

                <AnimatePresence initial={false} custom={direction}>
                  <motion.div
                    key={activeIndex}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
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
                          className="gl-photo w-full h-full object-cover bg-zinc-900 transition-transform duration-700 group-hover/img:scale-[1.03]"
                          decoding="async"
                        />
                        <div className="absolute inset-0 bg-black/45 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="px-6 py-2.5 bg-[#A68E4E] text-zinc-950 rounded-full font-bold uppercase tracking-widest text-xs transform translate-y-3 group-hover/img:translate-y-0 transition-transform duration-300 shadow-lg">
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
                className="relative w-full lg:w-2/5 text-center lg:text-left will-change-transform"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -18 }}
                    transition={{ duration: 0.38, ease: "easeOut" }}
                    className="space-y-6"
                  >
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
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 + i * 0.06 }}
                                className="flex items-center gap-3 w-full"
                              >
                                <span className="w-2 h-2 shrink-0 rounded-full bg-[#C8AE68]" />
                                <span>{achievement}</span>
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
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  delay:
                                    0.15 +
                                    (i +
                                      Math.ceil(
                                        (activeChampion.achievements ?? [])
                                          .length / 2,
                                      )) *
                                      0.06,
                                }}
                                className="flex items-center gap-3 w-full"
                              >
                                <span className="w-2 h-2 shrink-0 rounded-full bg-[#C8AE68]" />
                                <span>{achievement}</span>
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
