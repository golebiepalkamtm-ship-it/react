/**
 * Strona Galerii Championów - God-Tier Premium Version
 * - WebGL-inspired visual effects
 * - Awwwards-level animations
 * - Premium text reveals and hover effects
 */
import { useState, useCallback, useEffect, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { X, Trophy, Calendar, Award, Sparkles, Star } from 'lucide-react';
import { ChampionCard } from '@/components/gallery/ChampionCard';
import { PedigreeModal } from '@/components/gallery/PedigreeModal';
import { useChampions, type Champion } from '@/hooks/useChampions';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ScrollReveal, CountUp, StaggerContainer, staggerItemVariants } from '@/components/premium';
import { trackMetric } from '@/services/metricsService';

// Modal ze szczegółami championa
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

const ChampionModal = ({
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
  const hasMultiplePhotos = !!(champion && champion.images.length > 1);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const currentImageSrc = champion?.images?.[currentPhotoIndex] ?? '';

  useEffect(() => {
    if (champion) {
      trackMetric('GALLERY_IMAGE', `${champion.id}`).catch(() => {});
    }
  }, [champion]);

  useEffect(() => {
    if (champion && champion.images?.length) {
      trackMetric('GALLERY_IMAGE', `${champion.id}:${champion.images[currentPhotoIndex] || currentPhotoIndex}`).catch(() => {});
    }
  }, [champion, currentPhotoIndex]);

  useEffect(() => {
    if (!champion) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (hasPrevChampion) onPrevChampion();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (hasNextChampion) onNextChampion();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (onClose) onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [champion, onClose, hasPrevChampion, hasNextChampion, onPrevChampion, onNextChampion]);

  if (!champion) return null;
  console.log('ChampionModal render:', champion.name, 'images:', champion.images, 'length:', champion.images.length);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-4 px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/90 backdrop-blur-md" />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full h-full max-w-none max-h-none overflow-hidden bg-card border-0 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {champion?.images?.[currentPhotoIndex] && (
          <img
            src={currentImageSrc}
            alt={`Zdjęcie ${champion?.name}`}
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover -z-10 pointer-events-none"
          />
        )}
        {/* Close button - improved positioning and styling */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-20 p-3 rounded-full bg-card/90 hover:bg-card border border-border shadow-lg transition-all duration-200 hover:scale-105"
          aria-label="Zamknij"
        >
          <X className="w-6 h-6 text-foreground" />
        </button>

        <div className="grid grid-cols-10 h-full">
          {/* Image - rozszerzona szerokość (80%) aby „czarna strona" sięgała do nawigacji */}  
          <div className="col-span-10 lg:col-span-8 relative h-full min-h-[400px] lg:min-h-full bg-muted/20 flex items-start justify-center pt-16">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            {imageError ? (
              <div className="text-center text-muted-foreground">
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-gold/20 flex items-center justify-center">
                  <div className="text-center">
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-primary/40" />
                    <p className="text-lg font-medium">Zdjęcie niedostępne</p>
                    <p className="text-sm mt-2 opacity-75">{champion.name}</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {console.log('Loading image:', champion.images[currentPhotoIndex], 'for champion:', champion.name)}
                {champion.images?.[currentPhotoIndex] ? (
                  <div className="w-full h-full flex items-start justify-center">
                    <img
                      key={champion.images[currentPhotoIndex]}
                      src={currentImageSrc}
                      alt={champion.name}
                      className={`w-full h-screen object-contain object-top ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                      style={{width: '100%', height: '100vh', objectPosition: 'top center'}}
                      onError={() => {
                        console.error('Failed to load image:', champion.images[currentPhotoIndex]);
                        setImageError(true);
                        setImageLoading(false);
                      }}
                      onLoad={() => {
                        console.log('Successfully loaded image:', champion.images[currentPhotoIndex]);
                        setImageLoading(false);
                        setImageError(false);
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950">
                    <Trophy className="w-24 h-24 text-gold/30" />
                  </div>
                )}
              </>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-card/50 via-transparent to-transparent lg:bg-gradient-to-r pointer-events-none" />

            {/* Photo navigation arrows */}
            {hasMultiplePhotos && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPhotoIndex((prev) => (prev - 1 + champion.images.length) % champion.images.length);
                    setImageLoading(true);
                    setImageError(false);
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/50 hover:bg-black/70 border border-white/20 transition-all"
                  aria-label="Poprzednie zdjęcie"
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPhotoIndex((prev) => (prev + 1) % champion.images.length);
                    setImageLoading(true);
                    setImageError(false);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/50 hover:bg-black/70 border border-white/20 transition-all"
                  aria-label="Następne zdjęcie"
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </>
            )}

            {/* Photo indicator */}
            {hasMultiplePhotos && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-3">
                <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
                  {champion.images.map((_, index) => (
                    <button
                      key={`photo-${index}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentPhotoIndex(index);
                        setImageLoading(true);
                        setImageError(false);
                      }}
                      className={`w-4 h-4 rounded-full transition-all duration-200 mx-1 ${
                        index === currentPhotoIndex
                          ? 'bg-gold scale-125 shadow-lg'
                          : 'bg-white/70 hover:bg-white/90 hover:scale-110'
                      }`}
                      aria-label={`Przejdź do zdjęcia ${index + 1}`}
                    />
                  ))}
                </div>
                <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white/80">
                  {currentPhotoIndex + 1} / {champion.images.length}
                </div>
              </div>
            )}

            {/* Badge */}
            <div className="absolute top-16 left-6 flex items-center gap-2 px-3 py-1.5 bg-card/90 backdrop-blur-sm rounded-full border border-gold/40 shadow-lg">
              <Trophy className="w-4 h-4 text-gold" />
              <span className="text-sm font-medium text-gold">Champion</span>
            </div>
          </div>

          {/* Content - 2/10 columns (20%) */}
          <div className="col-span-10 lg:col-span-2 pt-16 px-6 lg:px-8 overflow-y-auto h-full">

            {/* Pigeon Number */}
            <div className="mb-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-gold/10 rounded-lg border border-gold/20">
                <span className="text-sm font-medium text-gold">Numer gołębia:</span>
                <span className="text-sm font-bold text-foreground">{champion.ringNumber || 'Brak numeru'}</span>
              </div>
            </div>

            {/* Achievements */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Osiągnięcia</h3>
              <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
                {champion.achievements.map((achievement, i) => (
                  <div
                    key={`achievement-${i}`}
                    className="px-3 py-2 text-sm rounded-lg bg-gold/10 text-gold border border-gold/20"
                  >
                    {achievement}
                  </div>
                ))}
              </div>
            </div>

            {/* Pedigree Button */}
            {champion.pedigree && (
              <div className="mt-6">
                <button
                  onClick={() => onViewPedigree(champion.pedigree!)}
                  className="w-full px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Zobacz rodowód
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const ChampionsGallery = () => {
  const [selectedChampion, setSelectedChampion] = useState<Champion | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [pedigreeUrl, setPedigreeUrl] = useState<string | null>(null);
  const [isPedigreeOpen, setIsPedigreeOpen] = useState(false);
  const { champions, loading, error } = useChampions();
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -50]);

  const handleSelect = useCallback(
    (champion: Champion) => {
      const idx = champions.findIndex((c) => c.id === champion.id);
      setSelectedChampion(champion);
      setSelectedIndex(idx >= 0 ? idx : null);
    },
    [champions]
  );

  const handleClose = useCallback(() => {
    setSelectedChampion(null);
    setSelectedIndex(null);
  }, []);

  const handlePrevChampion = useCallback(() => {
    if (selectedIndex === null || champions.length === 0) return;
    const nextIdx = (selectedIndex - 1 + champions.length) % champions.length;
    setSelectedIndex(nextIdx);
    setSelectedChampion(champions[nextIdx]);
  }, [champions, selectedIndex]);

  const handleNextChampion = useCallback(() => {
    if (selectedIndex === null || champions.length === 0) return;
    const nextIdx = (selectedIndex + 1) % champions.length;
    setSelectedIndex(nextIdx);
    setSelectedChampion(champions[nextIdx]);
  }, [champions, selectedIndex]);

  useEffect(() => {
    trackMetric('GALLERY_IMAGE', 'PAGE').catch(() => {});
  }, []);

  // Inicjalizacja animacji tekstu hero
  useEffect(() => {
    const timer = setTimeout(() => {
      import('@/lib/gsapAnimations').then(({ initHeroTextSplit }) => {
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

  const totalAchievements = champions.reduce((acc, c) => acc + c.achievements.length, 0);

  return (
    <div className="flex flex-col min-h-screen relative bg-transparent overflow-hidden">

      <Header />

      <main className="relative z-10 flex-grow">

        <motion.section 
          ref={heroRef}
          className="relative pt-20 md:pt-32 pb-24 md:pb-32 px-4 overflow-hidden min-h-[70vh] flex items-center"
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        >
          <div className="container mx-auto text-center relative z-10">
            <ScrollReveal delay={0}>
              <motion.span
                className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-gold/20 to-gold-dark/20 border border-gold/30 text-gold text-sm font-medium tracking-widest uppercase mb-8"
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(212,175,55,0.3)" }}
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.15, 1],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{ 
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Star className="w-4 h-4" />
                </motion.div>
                Ekskluzywna Kolekcja
                <motion.div
                  animate={{ 
                    scale: [1, 1.15, 1],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{ 
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1.25
                  }}
                >
                  <Star className="w-4 h-4" />
                </motion.div>
              </motion.span>
            </ScrollReveal>

            <div className="mb-6">
              <h1 
                data-split-text
                className="font-display text-3xl md:text-4xl lg:text-6xl font-bold text-gold"
              >
                Galeria Championów
              </h1>
            </div>

            <ScrollReveal delay={0.2}>
              <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-12">
                MTM Pałka – Ponad 20 lat dominacji w hodowli gołębi pocztowych.
                <br />
                <span className="text-gold/80">Zwycięstwo mamy w genach.</span>
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                {[
                  { label: "Championów", value: champions.length, icon: Trophy },
                  { label: "Osiągnięć", value: totalAchievements, icon: Award },
                  { label: "Lat Doświadczenia", value: 23, icon: Calendar },
                ].map((stat) => (
                  <motion.div 
                    key={stat.label}
                    className="text-center group"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-gold/20 to-gold-dark/10 border border-gold/30 mb-3 group-hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-shadow">
                      <stat.icon className="w-7 h-7 text-gold" />
                    </div>
                    <div className="font-display text-4xl md:text-5xl font-bold text-white mb-1">
                      <CountUp end={stat.value} duration={2} suffix="+" />
                    </div>
                    <div className="text-white/50 text-sm uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </motion.section>

        <section className="py-16 px-4 relative">
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />
          
          <div className="max-w-7xl mx-auto">
            {loading && (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-gold/20 rounded-full" />
                  <div className="absolute inset-0 w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                </div>
                <span className="mt-6 text-white/60">Ładowanie championów...</span>
              </div>
            )}

            {error && (
              <div className="text-center py-32">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {!loading && !error && (
              <StaggerContainer 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                staggerDelay={0.1}
              >
                {champions.map((champion, index) => (
                  <motion.div
                    key={champion.id}
                    variants={staggerItemVariants}
                    whileHover={{ 
                      y: -10,
                      transition: { duration: 0.3 }
                    }}
                  >
                    <ChampionCard
                      champion={champion}
                      index={index}
                      onSelect={handleSelect}
                      onViewPedigree={handleViewPedigree}
                    />
                  </motion.div>
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
