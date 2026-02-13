/**
 * ParticlesBackground — Luxury Aurora Edition
 * 
 * Multi-layered particle system with:
 * - Floating gold dust particles (Massive amount)
 * - Aurora borealis gradient orbs
 * - Dense star field
 */

import { motion } from "framer-motion";
import { useState } from "react";

const ParticlesBackground = () => {
  // Use state with initializer to ensure purity during render
  // and maintain stable values across re-renders.
  
  // DUST PARTICLES - Massive amount, larger size
  const [particles] = useState(() => 
    Array.from({ length: 600 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2, // Larger particles
      duration: Math.random() * 15 + 8,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.4 + 0.2,
      randomX: Math.random() * 120 - 60,
    }))
  );

  // STARS - Dense field, larger stars
  const [stars] = useState(() => 
    Array.from({ length: 800 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1, // Larger stars
      twinkle: Math.random() * 4 + 1,
      delay: Math.random() * 5,
    }))
  );

  // MIST / NEBULA - Extra layer for richness
  const [nebulas] = useState(() => 
    Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 40 + 20,
      duration: Math.random() * 20 + 20,
    }))
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-5">
      {/* Star field - HIGH DENSITY */}
      {stars.map((star) => (
        <motion.div
          key={`star-${star.id}`}
          className="absolute rounded-full bg-white/60"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            boxShadow: star.size > 1 ? `0 0 ${star.size * 2}px rgba(255,255,255,0.4)` : 'none',
          }}
          animate={{
            opacity: [0.1, 0.7, 0.1],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: star.twinkle,
            delay: star.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Gold dust particles - MASSIVE AMOUNT */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, #fbbf24 0%, rgba(251, 191, 36, 0.2) 70%, transparent 100%)`,
            boxShadow: `0 0 ${p.size * 1.5}px rgba(251, 191, 36, 0.3)`,
          }}
          animate={{
            y: [0, -400, 0], // More vertical movement
            x: [0, p.randomX, 0],
            opacity: [0, p.opacity, 0],
            scale: [0, 1.2, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Aurora orbs — large ethereal gradients */}
      <motion.div
        className="absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(var(--aurora-1) / 0.08) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.3, 0.6, 0.3],
          x: [0, 50, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(var(--aurora-3) / 0.05) 0%, transparent 70%)',
          filter: 'blur(100px)',
        }}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
          x: [0, -40, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
};

export default ParticlesBackground;