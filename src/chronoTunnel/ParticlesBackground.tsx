import { motion } from "framer-motion";
import { useMemo } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  xOffset: number;
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

const ParticlesBackground = () => {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const base = i + 1;
      const xRand = seededRandom(base);
      const yRand = seededRandom(base + 100);
      const sizeRand = seededRandom(base + 200);
      const durationRand = seededRandom(base + 300);
      const delayRand = seededRandom(base + 400);
      const offsetRand = seededRandom(base + 500);

      return {
        id: i,
        x: xRand * 100,
        y: yRand * 100,
        size: sizeRand * 4 + 1,
        duration: durationRand * 20 + 10,
        delay: delayRand * 5,
        xOffset: offsetRand * 100 - 50,
      };
    });
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-5">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-amber-500/30"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            willChange: "transform, opacity",
          }}
          animate={{
            y: [0, -200, 0],
            x: [0, particle.xOffset, 0],
            opacity: [0, 0.8, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Glowing orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl"
        style={{ 
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)',
          willChange: "transform, opacity"
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full blur-3xl"
        style={{ 
          background: 'radial-gradient(circle, hsl(var(--glow-secondary) / 0.1) 0%, transparent 70%)',
          willChange: "transform, opacity"
        }}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-2/3 left-1/2 w-48 h-48 rounded-full blur-2xl"
        style={{ 
          background: 'radial-gradient(circle, hsl(45 100% 50% / 0.2) 0%, transparent 70%)',
          willChange: "transform, opacity"
        }}
        animate={{
          scale: [1, 1.5, 1],
          x: [-50, 50, -50],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
};

export default ParticlesBackground;
