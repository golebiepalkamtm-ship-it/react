/**
 * Strona Galerii Championów
 * - Grid z kartami championów z efektami wejścia
 * - Modal ze szczegółami
 * - ParticleBackground z kolorystyką projektu
 */
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, MapPin, Zap, Calendar, Award, Sparkles, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { ChampionCard } from '@/components/gallery/ChampionCard';
import { PedigreeModal } from '@/components/gallery/PedigreeModal';
import { useChampions, type Champion } from '@/hooks/useChampions';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Modal ze szczegółami championa
interface ChampionModalProps {
  champion: Champion | null;
  onClose: () => void;
  onViewPedigree: (url: string) => void;
}

const ChampionModal = ({ champion, onClose, onViewPedigree }: ChampionModalProps) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const nextPhoto = useCallback(() => {
    if (!champion || champion.images.length <= 1) return;
    console.log('Next photo clicked, current index:', currentPhotoIndex, 'total images:', champion.images.length);
    console.log('Current image:', champion.images[currentPhotoIndex]);
    console.log('Next image will be:', champion.images[(currentPhotoIndex + 1) % champion.images.length]);
    setCurrentPhotoIndex((prev) => (prev + 1) % champion.images.length);
    setImageLoading(true);
    setImageError(false);
  }, [currentPhotoIndex, champion]);

  const prevPhoto = useCallback(() => {
    if (!champion || champion.images.length <= 1) return;
    console.log('Prev photo clicked, current index:', currentPhotoIndex, 'total images:', champion.images.length);
    console.log('Current image:', champion.images[currentPhotoIndex]);
    console.log('Prev image will be:', champion.images[(currentPhotoIndex - 1 + champion.images.length) % champion.images.length]);
    setCurrentPhotoIndex((prev) => (prev - 1 + champion.images.length) % champion.images.length);
    setImageLoading(true);
    setImageError(false);
  }, [currentPhotoIndex, champion]);

  useEffect(() => {
    if (!champion) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (champion.images.length <= 1) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevPhoto();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextPhoto();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (onClose) onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [champion, prevPhoto, nextPhoto, onClose]);

  if (!champion) return null;
  console.log('ChampionModal render:', champion.name, 'images:', champion.images, 'length:', champion.images.length);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
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
        {/* Close button - improved positioning and styling */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-20 p-3 rounded-full bg-card/90 hover:bg-card border border-border shadow-lg transition-all duration-200 hover:scale-105"
          aria-label="Zamknij"
        >
          <X className="w-6 h-6 text-foreground" />
        </button>

        <div className="grid grid-cols-10 h-full">
          {/* Image - 7/10 columns (70%) */}  
          <div className="col-span-10 lg:col-span-7 relative h-full min-h-[400px] lg:min-h-full bg-muted/20 flex items-center justify-center">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
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
                <img
                  src={champion.images[currentPhotoIndex]}
                  alt={champion.name}
                  className={`w-full h-full object-contain ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                  onError={(e) => {
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
              </>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-card/50 via-transparent to-transparent lg:bg-gradient-to-r" />

            {/* Navigation arrows - show only when multiple images */}
            {champion.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Previous photo clicked');
                    prevPhoto();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-4 rounded-full bg-black/70 hover:bg-black/90 border-2 border-white/30 shadow-xl transition-all duration-200 hover:scale-110 backdrop-blur-sm"
                  aria-label="Poprzednie zdjęcie"
                >
                  <ChevronLeft className="w-6 h-6 text-white drop-shadow-lg" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Next photo clicked');
                    nextPhoto();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-4 rounded-full bg-black/70 hover:bg-black/90 border-2 border-white/30 shadow-xl transition-all duration-200 hover:scale-110 backdrop-blur-sm"
                  aria-label="Następne zdjęcie"
                >
                  <ChevronRight className="w-6 h-6 text-white drop-shadow-lg" />
                </button>
              </>
            )}

            {/* Photo indicator - show only when multiple images */}
            {champion.images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-3">
                <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
                  {champion.images.map((_, index) => (
                    <button
                      key={index}
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
            <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 bg-card/90 backdrop-blur-sm rounded-full border border-gold/40 shadow-lg">
              <Trophy className="w-4 h-4 text-gold" />
              <span className="text-sm font-medium text-gold">Champion</span>
            </div>
          </div>

          {/* Content - 3/10 columns (30%) */}
          <div className="col-span-10 lg:col-span-3 p-6 lg:p-8 overflow-y-auto h-full">

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
                    key={i}
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
  const [pedigreeUrl, setPedigreeUrl] = useState<string | null>(null);
  const [isPedigreeOpen, setIsPedigreeOpen] = useState(false);
  const { champions, loading, error } = useChampions();

  const handleSelect = useCallback((champion: Champion) => {
    setSelectedChampion(champion);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedChampion(null);
  }, []);

  const handleViewPedigree = useCallback((url: string) => {
    setPedigreeUrl(url);
    setIsPedigreeOpen(true);
  }, []);

  const handleClosePedigree = useCallback(() => {
    setIsPedigreeOpen(false);
    setPedigreeUrl(null);
  }, []);

  return (
    <div className="flex flex-col min-h-screen relative bg-transparent">

      {/* Główny nagłówek strony */}
      <Header />

      {/* Content */}
      <main className="relative z-10 flex-grow">

        {/* Hero Section - nagłówek dopasowany do reszty strony */}
        <section className="pt-4 pb-8 px-4 relative overflow-hidden">
          <div className="container mx-auto text-center">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-1.5 rounded-full bg-gold/10 text-gold text-sm font-medium tracking-wide mb-6"
            >
              Ekskluzywna Kolekcja
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-5xl text-foreground font-bold leading-tight mb-4"
            >
              Galeria
              <span className="text-gradient-gold block">Championy</span>
            </motion.h2>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="font-display text-2xl md:text-3xl text-primary font-medium leading-tight mb-6"
            >
              MTM Pałka – Zwycięstwo mamy w genach
            </motion.h3>
          </div>
        </section>

        {/* Gallery Grid with staggered entrance */}
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Loading state */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-gold animate-spin" />
                <span className="ml-3 text-muted-foreground">Ładowanie championów...</span>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="text-center py-20">
                <p className="text-red-500">{error}</p>
              </div>
            )}

            {/* Grid */}
            {!loading && !error && (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.15,
                  },
                },
              }}
            >
              {champions.map((champion, index) => (
                <motion.div
                  key={champion.id}
                  variants={{
                    hidden: { opacity: 0, y: 50, scale: 0.9 },
                    visible: { 
                      opacity: 1, 
                      y: 0, 
                      scale: 1,
                      transition: {
                        type: "spring",
                        stiffness: 100,
                        damping: 15,
                      }
                    },
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
            </motion.div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Modal */}
      <AnimatePresence>
        {selectedChampion && (
          <ChampionModal champion={selectedChampion} onClose={handleClose} onViewPedigree={handleViewPedigree} />
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
