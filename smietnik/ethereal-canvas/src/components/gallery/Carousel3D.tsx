import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Trophy, MapPin, Zap } from "lucide-react";
import { pigeons, type Pigeon } from "@/data/pigeons";

export const Carousel3D = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % pigeons.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + pigeons.length) % pigeons.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % pigeons.length);
  };

  const getCardStyle = (index: number) => {
    const diff = index - currentIndex;
    const normalizedDiff = ((diff + pigeons.length) % pigeons.length);
    const adjustedDiff = normalizedDiff > pigeons.length / 2 
      ? normalizedDiff - pigeons.length 
      : normalizedDiff;

    const absDistance = Math.abs(adjustedDiff);
    const direction = adjustedDiff > 0 ? 1 : -1;

    return {
      x: adjustedDiff * 280,
      z: -absDistance * 150,
      rotateY: -adjustedDiff * 25,
      scale: 1 - absDistance * 0.15,
      opacity: absDistance > 2 ? 0 : 1 - absDistance * 0.3,
      zIndex: pigeons.length - absDistance,
    };
  };

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Section header */}
      <div className="text-center mb-20 relative z-10">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-block px-4 py-1 border border-primary/30 rounded-full text-xs tracking-[0.2em] text-primary/70 uppercase mb-4"
        >
          Karuzela 3D
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-display text-4xl md:text-6xl font-bold gold-text mb-4"
        >
          Nasi Championowie
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground max-w-xl mx-auto"
        >
          Przeglądaj naszą kolekcję w interaktywnej karuzeli 3D
        </motion.p>
      </div>

      {/* 3D Carousel */}
      <div 
        className="relative h-[600px] perspective-2000"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative preserve-3d w-full max-w-6xl mx-auto">
            <AnimatePresence mode="sync">
              {pigeons.map((pigeon, index) => {
                const style = getCardStyle(index);
                const isActive = index === currentIndex;

                return (
                  <motion.div
                    key={pigeon.id}
                    className="absolute left-1/2 top-0 -translate-x-1/2 w-[320px] cursor-pointer"
                    initial={false}
                    animate={{
                      x: style.x,
                      z: style.z,
                      rotateY: style.rotateY,
                      scale: style.scale,
                      opacity: style.opacity,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 100,
                      damping: 20,
                    }}
                    style={{
                      zIndex: style.zIndex,
                      transformStyle: "preserve-3d",
                    }}
                    onClick={() => {
                      setIsAutoPlaying(false);
                      setCurrentIndex(index);
                    }}
                  >
                    <CarouselCard pigeon={pigeon} isActive={isActive} />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={handlePrev}
          className="absolute left-4 md:left-20 top-1/2 -translate-y-1/2 z-50 p-4 glass-card rounded-full border border-primary/30 text-primary hover:border-primary/60 transition-colors group"
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-4 md:right-20 top-1/2 -translate-y-1/2 z-50 p-4 glass-card rounded-full border border-primary/30 text-primary hover:border-primary/60 transition-colors group"
        >
          <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Dots indicator */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-3 z-50">
          {pigeons.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsAutoPlaying(false);
                setCurrentIndex(index);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-8 bg-primary shadow-glow"
                  : "bg-primary/30 hover:bg-primary/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const CarouselCard = ({ pigeon, isActive }: { pigeon: Pigeon; isActive: boolean }) => {
  return (
    <motion.div
      className={`relative rounded-2xl overflow-hidden gold-border transition-all duration-500 ${
        isActive ? "shadow-glow" : ""
      }`}
      whileHover={isActive ? { scale: 1.02 } : {}}
    >
      {/* Image */}
      <div className="relative h-80 overflow-hidden">
        <img
          src={pigeon.image}
          alt={pigeon.name}
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        
        {/* Glow effect on hover */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isActive ? 1 : 0 }}
          style={{
            background: "radial-gradient(circle at center, hsla(45, 80%, 55%, 0.15) 0%, transparent 70%)",
          }}
        />

        {/* Badge */}
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 glass-card rounded-full border border-primary/40">
            <Trophy className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Champion</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 glass-card">
        <h3 className="font-display text-2xl font-bold text-foreground mb-1">
          {pigeon.name}
        </h3>
        <p className="text-primary text-sm font-medium mb-3">{pigeon.title}</p>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{pigeon.breed}</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>{pigeon.records[0]}</span>
          </div>
        </div>

        {/* Achievements preview */}
        <div className="flex flex-wrap gap-2">
          {pigeon.achievements.slice(0, 2).map((achievement, i) => (
            <span
              key={i}
              className="px-2 py-1 text-[10px] rounded-full bg-primary/10 text-primary/80 border border-primary/20"
            >
              {achievement}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
