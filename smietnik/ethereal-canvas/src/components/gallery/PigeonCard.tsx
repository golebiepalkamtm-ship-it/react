import { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Trophy, MapPin, Calendar, Zap } from "lucide-react";
import type { Pigeon } from "@/data/pigeons";

interface PigeonCardProps {
  pigeon: Pigeon;
  index: number;
  onSelect: (pigeon: Pigeon) => void;
}

export const PigeonCard = ({ pigeon, index, onSelect }: PigeonCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse position for 3D tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring animation
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), {
    stiffness: 150,
    damping: 20,
  });

  // Light position
  const lightX = useTransform(mouseX, [-0.5, 0.5], [0, 100]);
  const lightY = useTransform(mouseY, [-0.5, 0.5], [0, 100]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      className="relative perspective-1000 cursor-pointer group"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelect(pigeon)}
    >
      <motion.div
        className="relative rounded-2xl overflow-hidden gold-border group-hover:neon-border transition-shadow duration-500"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ scale: { duration: 0.2 } }}
      >
        {/* Dynamic light reflection */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: useTransform(
              [lightX, lightY],
              ([x, y]) =>
                `radial-gradient(circle at ${x}% ${y}%, hsla(45, 90%, 70%, 0.3) 0%, transparent 50%)`
            ),
            opacity: isHovered ? 1 : 0,
          }}
        />

        {/* Electric border effect on hover */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none z-20"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: isHovered ? 1 : 0,
            boxShadow: isHovered 
              ? "0 0 20px hsl(45 80% 55% / 0.4), inset 0 0 20px hsl(45 80% 55% / 0.1)"
              : "none"
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Image container */}
        <div className="relative h-72 overflow-hidden">
          <motion.img
            src={pigeon.image}
            alt={pigeon.name}
            className="w-full h-full object-cover"
            style={{
              scale: isHovered ? 1.1 : 1,
              transition: "scale 0.6s ease-out",
            }}
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          
          {/* Shimmer effect on hover */}
          <motion.div
            className="absolute inset-0 pointer-events-none shimmer"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
          />

          {/* Scanline effect on hover */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 0.3 : 0 }}
          >
            <div className="absolute inset-0 scanline" />
          </motion.div>

          {/* Champion badge with glow */}
          <motion.div
            className="absolute top-4 left-4"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.3 }}
          >
            <div className="flex items-center gap-2 px-3 py-1.5 glass-card rounded-full border border-primary/40 group-hover:neon-border transition-shadow duration-300">
              <Trophy className="w-4 h-4 text-primary animate-electric" />
              <span className="text-xs font-semibold text-primary">Champion</span>
            </div>
          </motion.div>

          {/* Year badge */}
          <div className="absolute top-4 right-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 glass-card rounded-full border border-border/30 group-hover:border-primary/30 transition-colors">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{pigeon.year}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative p-6 glass-card" style={{ transform: "translateZ(20px)" }}>
          {/* Title with hover effect */}
          <motion.h3
            className="font-display text-2xl font-bold text-foreground mb-1 group-hover:gold-text transition-all duration-300"
            style={{ transform: "translateZ(30px)" }}
          >
            {pigeon.name}
          </motion.h3>
          
          <p className="text-primary font-medium text-sm mb-4 group-hover:animate-electric">{pigeon.title}</p>

          {/* Stats row */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary/60" />
              <span>{pigeon.breed}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-primary/60 group-hover:animate-electric" />
              <span>{pigeon.records[0]}</span>
            </div>
          </div>

          {/* Achievement tags with stagger animation */}
          <div className="flex flex-wrap gap-2">
            {pigeon.achievements.slice(0, 2).map((achievement, i) => (
              <motion.span
                key={i}
                className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary/80 border border-primary/20 group-hover:border-primary/40 group-hover:bg-primary/20 transition-all duration-300"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 + 0.4 + i * 0.1 }}
              >
                {achievement}
              </motion.span>
            ))}
          </div>

          {/* Hover indicator with arrow animation */}
          <motion.div
            className="absolute bottom-6 right-6 flex items-center gap-2 text-primary text-sm font-medium"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -10 }}
          >
            <span className="animate-electric">Zobacz więcej</span>
            <motion.span
              animate={{ x: isHovered ? [0, 5, 0] : 0 }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              →
            </motion.span>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};
