import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Trophy, Medal } from "lucide-react";
import olimp from "@/assets/DV-02906-11-98.jpg";
import pigeon2 from "@/assets/DV-0987-11-396.jpg";
import pigeon3 from "@/assets/DV-07136-10-202.jpg";
import pigeon4 from "@/assets/PL-11-160651.jpg";
import pigeon5 from "@/assets/PL-0446-12-328.jpg";
import goldenPair from "@/assets/golden-pair.jpg";
interface Champion {
  id: number;
  image: string;
  name: string;
  ringNumber: string;
  title: string;
  achievements: string[];
  year?: string;
  special?: boolean;
}
const champions: Champion[] = [{
  id: 1,
  image: olimp,
  name: "Olimpijczyk",
  ringNumber: "DV-02906-11-98",
  title: "3 AS Polski Kategoria A",
  achievements: ["Olimpiada Budapeszt 2015", "Reprezentant Polski", "Mistrz Sprintu"],
  year: "2015",
  special: true
}, {
  id: 2,
  image: goldenPair,
  name: "Złota Para",
  ringNumber: "♂ DV-02906-00-1360  ♀ DV-0987-05-1184",
  title: "Legendarni Rodzice",
  achievements: ["Najlepsza Para Hodowlana", "Fundament Hodowli", "Linia Mistrzów"],
  special: true
}, {
  id: 3,
  image: pigeon4,
  name: "As Lotów",
  ringNumber: "PL-11-160651",
  title: "Kat.A. 22,23 Coeff.",
  achievements: ["1 kon - 4114 gołębi", "5 kon - 4525 gołębi", "8 kon - 4403 gołębi"],
  year: "2013"
}, {
  id: 4,
  image: pigeon5,
  name: "Sprinter",
  ringNumber: "PL-0446-12-328",
  title: "Kat.A. 19,29 Coeff.",
  achievements: ["1 kon - 2710 gołębi", "2 kon - 4525 gołębi", "4 kon - 4114 gołębi"],
  year: "2014"
}, {
  id: 5,
  image: pigeon2,
  name: "Champion",
  ringNumber: "DV-0987-11-396",
  title: "Mistrz Sprintu",
  achievements: ["Wielokrotny Zwycięzca", "Linia Niemiecka"]
}, {
  id: 6,
  image: pigeon3,
  name: "Błyskawica",
  ringNumber: "DV-07136-10-202",
  title: "Mistrz Sprintu",
  achievements: ["Szybkość i Precyzja", "Linia Niemiecka"]
}];
const ChampionShowcase = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const activeChampion = champions[activeIndex];
  const navigate = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setActiveIndex(prev => {
      if (newDirection > 0) {
        return prev === champions.length - 1 ? 0 : prev + 1;
      }
      return prev === 0 ? champions.length - 1 : prev - 1;
    });
  }, []);
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => navigate(1), 6000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, navigate]);
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 0.9
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      x: direction > 0 ? "-50%" : "50%",
      opacity: 0,
      scale: 0.9
    })
  };
  return <section className="relative min-h-screen bg-background overflow-hidden" onMouseEnter={() => setIsAutoPlaying(false)} onMouseLeave={() => setIsAutoPlaying(true)}>
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <motion.div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.5, 0.3]
      }} transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }} />
        <motion.div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-gold/5 blur-[100px]" animate={{
        scale: [1.2, 1, 1.2],
        opacity: [0.5, 0.3, 0.5]
      }} transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }} />
      </div>

      {/* Top decoration line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      {/* Section header */}
      <div className="relative z-20 pt-16 md:pt-24 pb-8 text-center">
        <motion.div initial={{
        opacity: 0,
        y: -20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.8
      }}>
          <span className="inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.3em] text-primary mb-4">
            <Trophy className="w-4 h-4" />
            Pałka M.T.M
            <Trophy className="w-4 h-4" />
          </span>
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-light">
            <span className="text-foreground">Galeria </span>
            <span className="text-gradient-gold">Mistrzów</span>
          </h2>
        </motion.div>
      </div>

      {/* Main showcase area */}
      <div className="relative z-10 flex items-center justify-center px-4 md:px-8 lg:px-16 pb-32">
        <div className="relative w-full max-w-7xl">
          
          {/* Navigation arrows */}
          <button onClick={() => navigate(-1)} className="absolute left-0 md:-left-4 lg:-left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 md:w-16 md:h-16 rounded-full border border-primary/30 bg-background/50 backdrop-blur-sm flex items-center justify-center text-foreground hover:border-primary hover:bg-primary/10 transition-all duration-300 group">
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
          <button onClick={() => navigate(1)} className="absolute right-0 md:-right-4 lg:-right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 md:w-16 md:h-16 rounded-full border border-primary/30 bg-background/50 backdrop-blur-sm flex items-center justify-center text-foreground hover:border-primary hover:bg-primary/10 transition-all duration-300 group">
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Champion display */}
          <div className="relative flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            
            {/* Image showcase */}
            <div className="relative w-full lg:w-3/5 aspect-[4/3] overflow-hidden rounded-3xl">
              {/* Frame decoration */}
              <div className="absolute inset-0 border-2 border-primary/20 rounded-3xl z-20 pointer-events-none" />
              <div className="absolute inset-4 border border-primary/10 rounded-2xl z-20 pointer-events-none" />
              
              {/* Corner ornaments */}
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
                <motion.div key={activeIndex} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{
                duration: 0.6,
                ease: [0.32, 0.72, 0, 1]
              }} className="absolute inset-0">
                  <img src={activeChampion.image} alt={activeChampion.name} className="w-full h-full object-contain bg-gradient-to-b from-muted/20 to-background" />
                  
                  {/* Shine effect on special champions */}
                  {activeChampion.special && <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent" animate={{
                  x: ["-100%", "100%"]
                }} transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 2
                }} />}
                </motion.div>
              </AnimatePresence>

              {/* Special badge */}
              {activeChampion.special && <motion.div initial={{
              scale: 0,
              rotate: -180
            }} animate={{
              scale: 1,
              rotate: 0
            }} className="absolute top-6 right-6 z-30">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary blur-lg opacity-50" />
                    <div className="relative bg-primary text-primary-foreground px-4 py-2 rounded-full font-body text-xs uppercase tracking-widest flex items-center gap-2">
                      <Medal className="w-4 h-4" />
                      Wyróżniony
                    </div>
                  </div>
                </motion.div>}
            </div>

            {/* Info panel */}
            <div className="relative w-full lg:w-2/5 text-center lg:text-left">
              <AnimatePresence mode="wait">
                <motion.div key={activeIndex} initial={{
                opacity: 0,
                y: 30
              }} animate={{
                opacity: 1,
                y: 0
              }} exit={{
                opacity: 0,
                y: -30
              }} transition={{
                duration: 0.5,
                delay: 0.2
              }} className="space-y-6">
                  {/* Year badge */}
                  {activeChampion.year && <span className="inline-block font-display text-6xl md:text-8xl font-light text-primary/20">
                      {activeChampion.year}
                    </span>}

                  {/* Name */}
                  <div>
                    <h3 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-2">
                      {activeChampion.name}
                    </h3>
                    <p className="font-body text-sm uppercase tracking-widest text-primary">
                      {activeChampion.ringNumber}
                    </p>
                  </div>

                  {/* Title */}
                  <p className="font-display text-xl md:text-2xl text-muted-foreground italic">
                    {activeChampion.title}
                  </p>

                  {/* Achievements */}
                  <div className="space-y-3 pt-4 border-t border-primary/20">
                    <p className="font-body text-xs uppercase tracking-widest text-muted-foreground">
                      Osiągnięcia
                    </p>
                    <ul className="space-y-2">
                      {activeChampion.achievements.map((achievement, i) => <motion.li key={achievement} initial={{
                      opacity: 0,
                      x: -20
                    }} animate={{
                      opacity: 1,
                      x: 0
                    }} transition={{
                      delay: 0.4 + i * 0.1
                    }} className="flex items-center gap-3 font-body text-foreground">
                          <span className="w-2 h-2 rounded-full bg-primary" />
                          {achievement}
                        </motion.li>)}
                    </ul>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Thumbnail navigation */}
          
        </div>
      </div>

      {/* Contact bar */}
      
    </section>;
};
export default ChampionShowcase;