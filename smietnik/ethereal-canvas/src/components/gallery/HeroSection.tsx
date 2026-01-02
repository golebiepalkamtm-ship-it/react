import { motion } from "framer-motion";
import { Trophy, Star, Award, Sparkles } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Aurora background effect */}
      <div className="absolute inset-0 aurora-bg opacity-50" />
      
      {/* Scanline effect */}
      <div className="absolute inset-0 scanline pointer-events-none opacity-30" />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Morphing blob */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2 animate-morph"
          style={{
            background: "radial-gradient(circle, hsl(45 80% 55% / 0.08) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        {/* Rotating golden ring */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
          <div 
            className="w-full h-full rounded-full border border-primary/20"
            style={{
              background: "conic-gradient(from 0deg, transparent, hsla(45, 80%, 55%, 0.1), transparent)",
            }}
          />
        </motion.div>

        {/* Counter-rotating ring with neon effect */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2"
          animate={{ rotate: -360 }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
        >
          <div 
            className="w-full h-full rounded-full border border-primary/10 neon-border"
            style={{
              background: "conic-gradient(from 180deg, transparent, hsla(45, 80%, 55%, 0.05), transparent)",
            }}
          />
        </motion.div>

        {/* Electric pulsing orbs */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full bg-primary/60 animate-electric"
            style={{
              top: `${30 + i * 20}%`,
              left: `${20 + i * 25}%`,
              animationDelay: `${i * 0.5}s`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-4">
        {/* Floating icons with electric effect */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 flex gap-8">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0 }}
            className="animate-electric"
          >
            <Trophy className="w-8 h-8 text-primary/60" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [0, 180, 360] }}
            transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
          >
            <Sparkles className="w-6 h-6 text-primary/50" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
            className="animate-electric"
          >
            <Star className="w-6 h-6 text-primary/40" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            className="animate-electric"
          >
            <Award className="w-8 h-8 text-primary/60" />
          </motion.div>
        </div>

        {/* Overline with glitch on hover */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6"
        >
          <span className="inline-block px-6 py-2 border border-primary/30 rounded-full text-sm font-sans tracking-[0.3em] text-primary/80 uppercase neon-border hover:animate-glitch transition-all">
            Ekskluzywna Kolekcja
          </span>
        </motion.div>

        {/* Main title with text flicker */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="font-display text-6xl md:text-8xl lg:text-9xl font-bold mb-6 tracking-tight"
        >
          <span className="gold-text text-shadow-gold animate-text-flicker">Champions</span>
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="font-display text-3xl md:text-5xl lg:text-6xl font-medium mb-8 text-foreground/80"
        >
          Galeria Gołębi Pocztowych
        </motion.h2>

        {/* Decorative line with glow */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 0.6 }}
          className="w-32 h-px mx-auto mb-8 neon-border"
          style={{
            background: "linear-gradient(90deg, transparent, hsl(45 80% 55%), transparent)",
          }}
        />

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 font-sans font-light"
        >
          Odkryj niezwykłe historie naszych championów — elitarnych gołębi pocztowych,
          których osiągnięcia zapisały się na kartach historii hodowli.
        </motion.p>

        {/* Scroll indicator with enhanced animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-muted-foreground"
          >
            <span className="text-xs tracking-[0.2em] uppercase animate-electric">Przewiń</span>
            <div className="w-px h-12 bg-gradient-to-b from-primary/50 to-transparent neon-border" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
