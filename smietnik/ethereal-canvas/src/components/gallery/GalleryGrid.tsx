import { motion } from "framer-motion";
import { PigeonCard } from "./PigeonCard";
import { pigeons, type Pigeon } from "@/data/pigeons";
import { Sparkles } from "lucide-react";

interface GalleryGridProps {
  onSelectPigeon: (pigeon: Pigeon) => void;
}

export const GalleryGrid = ({ onSelectPigeon }: GalleryGridProps) => {
  return (
    <section className="relative py-24 px-4">
      {/* Background aurora effect */}
      <div className="absolute inset-0 aurora-bg opacity-30 pointer-events-none" />
      
      {/* Floating sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 30}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          >
            <Sparkles className="w-4 h-4 text-primary/40" />
          </motion.div>
        ))}
      </div>

      {/* Section header */}
      <div className="text-center mb-16 relative z-10">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-block px-4 py-1 border border-primary/30 rounded-full text-xs tracking-[0.2em] text-primary/70 uppercase mb-4 neon-border"
        >
          Pełna Kolekcja
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-display text-4xl md:text-5xl font-bold gold-text mb-4 animate-text-flicker"
        >
          Hall of Champions
        </motion.h2>
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.8 }}
          className="w-24 h-0.5 mx-auto mb-6 neon-border"
          style={{
            background: "linear-gradient(90deg, transparent, hsl(45 80% 55%), transparent)",
          }}
        />
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground max-w-xl mx-auto"
        >
          Każdy gołąb w naszej kolekcji to historia sukcesu i determinacji
        </motion.p>
      </div>

      {/* Grid with staggered entrance */}
      <motion.div 
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10"
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
        {pigeons.map((pigeon, index) => (
          <motion.div
            key={pigeon.id}
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
            <PigeonCard
              pigeon={pigeon}
              index={index}
              onSelect={onSelectPigeon}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};
