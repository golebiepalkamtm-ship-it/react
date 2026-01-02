/**
 * Strona Galerii Championów
 * - Grid z kartami championów z efektami wejścia
 * - Modal ze szczegółami
 * - ParticleBackground z kolorystyką projektu
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, MapPin, Zap, Calendar, Award, Sparkles, Loader2 } from 'lucide-react';
import { ChampionCard } from '@/components/gallery/ChampionCard';
import { ParticleBackground } from '@/components/gallery/ParticleBackground';
import { PedigreeModal } from '@/components/gallery/PedigreeModal';
import { useChampions, type Champion } from '@/hooks/useChampions';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Modal ze szczegółami championa
interface ChampionModalProps {
  champion: Champion | null;
  onClose: () => void;
}

const ChampionModal = ({ champion, onClose }: ChampionModalProps) => {
  if (!champion) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex"
      onClick={onClose}
    >
      {/* Image Area - takes remaining space */}
      <div className="flex-1 relative h-full bg-black/90 flex items-center justify-center overflow-hidden">
        <img
          src={champion.image}
          alt={champion.name}
          className="max-w-full max-h-full object-contain"
        />
        
        {/* Badge */}
        <div className="absolute top-8 left-8 flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-gold/40">
          <Trophy className="w-5 h-5 text-gold" />
          <span className="text-base font-medium text-gold">Champion</span>
        </div>
      </div>

      {/* Sidebar - fixed width */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="w-full md:w-[450px] h-full bg-card border-l border-border overflow-y-auto relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2 rounded-full bg-muted/80 hover:bg-muted transition-colors"
          aria-label="Zamknij"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Content */}
        <div className="p-8 pt-16">
            <h2 className="text-3xl font-bold font-display text-foreground mb-2">{champion.name}</h2>
            <p className="text-primary text-lg mb-6">{champion.title}</p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <MapPin className="w-4 h-4" />
                  <span>Rasa</span>
                </div>
                <p className="text-foreground font-medium">{champion.breed}</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>Rok urodzenia</span>
                </div>
                <p className="text-foreground font-medium">{champion.year}</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Zap className="w-4 h-4" />
                  <span>Rekord prędkości</span>
                </div>
                <p className="text-foreground font-medium">{champion.records[0]}</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Award className="w-4 h-4" />
                  <span>Kolor</span>
                </div>
                <p className="text-foreground font-medium">{champion.color}</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-3">O championie</h3>
              <p className="text-muted-foreground leading-relaxed">{champion.description}</p>
            </div>

            {/* Achievements */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Osiągnięcia</h3>
              <div className="flex flex-wrap gap-2">
                {champion.achievements.map((achievement, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 text-sm rounded-full bg-gold/10 text-gold border border-gold/20"
                  >
                    {achievement}
                  </span>
                ))}
              </div>
            </div>

            {/* Records */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">Rekordy</h3>
              <div className="flex flex-wrap gap-2">
                {champion.records.map((record, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 text-sm rounded-full bg-primary/10 text-primary border border-primary/20"
                  >
                    {record}
                  </span>
                ))}
              </div>
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
    <div className="min-h-screen relative bg-transparent">
      {/* Particle Background - mixed gold/primary */}
      <ParticleBackground particleCount={40} variant="mixed" />

      {/* Główny nagłówek strony */}
      <Header />

      {/* Content */}
      <div className="relative z-10">

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
              className="font-display text-4xl md:text-5xl text-foreground font-bold leading-tight mb-6"
            >
              Galeria
              <span className="text-gradient-gold block">Championów</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto"
            >
              Poznaj naszych mistrzów - elitarne gołębie, które zdefiniowały nową erę lotów
              długodystansowych. Każdy z nich to żywa legenda.
            </motion.p>
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

        {/* Footer */}
        <Footer />
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedChampion && (
          <ChampionModal champion={selectedChampion} onClose={handleClose} />
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
