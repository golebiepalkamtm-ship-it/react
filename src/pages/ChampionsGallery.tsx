/**
 * Strona Galerii Championów - God-Tier Premium Version
 * - WebGL-inspired visual effects
 * - Awwwards-level animations
 * - Premium text reveals and hover effects
 */
import {
  useState,
  useCallback,
  useEffect,
  useRef,
  useLayoutEffect,
} from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { X, Trophy, Calendar, Award, Sparkles, Star } from "lucide-react";
import { ChampionCard } from "@/components/gallery/ChampionCard";
import { PedigreeModal } from "@/components/gallery/PedigreeModal";
import { ChampionModal } from "@/components/gallery/ChampionModal";
import { useChampions, type Champion } from "@/hooks/useChampions";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import {
  CountUp,
  StaggerContainer,
  staggerItemVariants,
} from "@/components/premium";
import { trackMetric } from "@/services/metricsService";

export const ChampionsGallery = () => {
  const [selectedChampion, setSelectedChampion] = useState<Champion | null>(
    null,
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [pedigreeUrl, setPedigreeUrl] = useState<string | null>(null);
  const [isPedigreeOpen, setIsPedigreeOpen] = useState(false);
  const { champions, loading, error } = useChampions();
  const heroRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.99]);
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -20]);

  const handleSelect = useCallback(
    (champion: Champion) => {
      const idx = champions.findIndex((c) => c.id === champion.id);
      setSelectedChampion(champion);
      setSelectedIndex(idx >= 0 ? idx : null);
    },
    [champions],
  );

  const handleClose = useCallback(() => {
    setSelectedChampion(null);
    setSelectedIndex(null);
  }, []);

  const handlePrevChampion = useCallback(() => {
    if (selectedIndex === null || champions.length === 0) return;
    const nextIdx = (selectedIndex - 1 + champions.length) % champions.length;
    setSelectedIndex(nextIdx);
    setSelectedChampion(champions[nextIdx] || null);
  }, [champions, selectedIndex]);

  const handleNextChampion = useCallback(() => {
    if (selectedIndex === null || champions.length === 0) return;
    const nextIdx = (selectedIndex + 1) % champions.length;
    setSelectedIndex(nextIdx);
    setSelectedChampion(champions[nextIdx] || null);
  }, [champions, selectedIndex]);

  useEffect(() => {
    trackMetric("GALLERY_IMAGE", "PAGE").catch(() => {});
  }, []);

  // Inicjalizacja animacji tekstu hero
  useEffect(() => {
    const timer = setTimeout(() => {
      import("@/lib/gsapAnimations").then(({ initHeroTextSplit }) => {
        initHeroTextSplit();
      });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleViewPedigree = useCallback((url: string) => {
    setPedigreeUrl(url);
    setIsPedigreeOpen(true);
  }, []);

  const handleClosePedigree = useCallback(() => {
    setIsPedigreeOpen(false);
    setPedigreeUrl(null);
  }, []);

  const hasPrevChampion = selectedIndex !== null && champions.length > 1;
  const hasNextChampion = selectedIndex !== null && champions.length > 1;

  const totalAchievements = champions.reduce(
    (acc, c) => acc + c.achievements.length,
    0,
  );

  return (
    <div className="flex flex-col min-h-screen relative bg-transparent overflow-hidden">
      <Header />

      <main className="relative z-10 flex-grow">
        <motion.section
          ref={heroRef}
          className="relative pt-20 md:pt-32 pb-24 md:pb-32 px-4 overflow-hidden min-h-[70vh] flex items-center"
        >
          <div className="container mx-auto text-center relative z-10">
            <RevealOnScroll direction="up" delay={0}>
              <motion.span
                className="inline-flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold tracking-widest uppercase mb-8"
                style={{
                  background: "#A68E4E",
                  color: "#000000",
                  border: "1px solid rgba(166,142,78,0.8)",
                  boxShadow: "0 2px 12px rgba(166,142,78,0.5)",
                }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 24px rgba(166,142,78,0.6)",
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
                  <Star className="w-4 h-4 text-black" />
                </motion.div>
                Ekskluzywna Kolekcja
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
                  <Star className="w-4 h-4 text-black" />
                </motion.div>
              </motion.span>
            </RevealOnScroll>

            <div className="mb-6">
              <h1
                data-split-text
                className="font-display text-3xl md:text-4xl lg:text-5xl font-bold"
              >
                <span className="gold-heading">Galeria</span>{" "}
                <span className="text-black">Championów</span>
              </h1>
            </div>

            <RevealOnScroll delay={0.2}>
              <p className="text-white text-lg md:text-xl max-w-2xl mx-auto mb-12">
                MTM Pałka – Ponad 20 lat dominacji w hodowli gołębi pocztowych.
                <br />
                <span className="text-gold">Zwycięstwo mamy w genach.</span>
              </p>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delay={0.3}>
              <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                {[
                  {
                    label: "Championów",
                    value: champions.length,
                    icon: Trophy,
                  },
                  { label: "Osiągnięć", value: totalAchievements, icon: Award },
                  { label: "Lat Doświadczenia", value: 23, icon: Calendar },
                ].map((stat) => (
                  <motion.div
                    key={stat.label}
                    className="text-center group"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div
                      className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-3 transition-shadow"
                      style={{
                        background: "#A68E4E",
                        boxShadow: "0 2px 12px rgba(166,142,78,0.5)",
                        border: "1px solid rgba(166,142,78,0.8)",
                      }}
                    >
                      <stat.icon className="w-7 h-7 text-black" />
                    </div>
                    <div className="font-display text-4xl md:text-5xl font-bold text-white mb-1">
                      <CountUp end={stat.value} duration={2} suffix="+" />
                    </div>
                    <div className="text-white/70 text-sm uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </RevealOnScroll>
          </div>
        </motion.section>

        <section className="py-16 px-4 relative bg-transparent">
          <div className="max-w-7xl mx-auto">
            {loading && (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-gold/20 rounded-full" />
                  <div className="absolute inset-0 w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                </div>
                <span className="mt-6 text-white/60">
                  Ładowanie championów...
                </span>
              </div>
            )}

            {error && (
              <div className="text-center py-32">
                <p className="text-red-500">{error}</p>
              </div>
            )}

            {!loading && !error && (
              <StaggerContainer
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                staggerDelay={0.1}
              >
                {champions.map((champion, index) => (
                  <ChampionCard
                    key={champion.id}
                    champion={champion}
                    index={index}
                    onSelect={handleSelect}
                    onViewPedigree={handleViewPedigree}
                    variants={staggerItemVariants}
                  />
                ))}
              </StaggerContainer>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* Modal */}
      <AnimatePresence>
        {selectedChampion && (
          <ChampionModal
            key={selectedChampion.id}
            champion={selectedChampion}
            onClose={handleClose}
            onViewPedigree={handleViewPedigree}
            onPrevChampion={handlePrevChampion}
            onNextChampion={handleNextChampion}
            hasPrevChampion={hasPrevChampion}
            hasNextChampion={hasNextChampion}
            championIndex={selectedIndex ?? 0}
            totalChampions={champions.length}
          />
        )}
      </AnimatePresence>

      <PedigreeModal
        isOpen={isPedigreeOpen}
        onClose={handleClosePedigree}
        pedigreeUrl={pedigreeUrl}
      />
    </div>
  );
};

export default ChampionsGallery;
