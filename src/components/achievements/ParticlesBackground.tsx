/**
 * ParticlesBackground — Luxury Aurora Edition (Performance Optimized)
 *
 * Multi-layered particle system optimized for smoothness:
 * - Simple floating circles (no expensive shadows/blur)
 * - Reduced count for high FPS
 * - Stable state management
 */

import { motion } from "framer-motion";
import { useState, memo } from "react";

const ParticlesBackground = memo(() => {
  // DUST PARTICLES - Reduced to 40 for maximum performance
  const [particles] = useState(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.3 + 0.1,
      randomX: Math.random() * 60 - 30,
    })),
  );

  // STARS - Reduced to 60
  const [stars] = useState(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      twinkle: Math.random() * 5 + 2,
      delay: Math.random() * 5,
    })),
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-5">
      {/* Star field - Simple circles, no shadows */}
      {stars.map((star) => (
        <motion.div
          key={`star-${star.id}`}
          className="absolute rounded-full bg-white/40"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{
            opacity: [0.1, 0.5, 0.1],
          }}
          transition={{
            duration: star.twinkle,
            delay: star.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Gold dust particles - Simple circles, no shadow/blur gradients */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-gold/20"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: "#A68E4E",
          }}
          animate={{
            y: [0, -300, 0],
            x: [0, p.randomX, 0],
            opacity: [0, p.opacity, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Aurora orbs — static simple gradients (no animation) for performance if needed */}
      <div
        className="absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle, rgba(166, 142, 78, 0.1) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] rounded-full opacity-10"
        style={{
          background:
            "radial-gradient(circle, rgba(166, 142, 78, 0.05) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
    </div>
  );
});

export default ParticlesBackground;
