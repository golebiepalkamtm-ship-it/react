import React from "react";

// Pre-defined static particles for consistent rendering
const STATIC_PARTICLES = [
  { id: 0, left: "12%", top: "8%", size: 3, delay: 0.5, duration: 5 },
  { id: 1, left: "25%", top: "45%", size: 2, delay: 1.2, duration: 4 },
  { id: 2, left: "42%", top: "22%", size: 4, delay: 2.1, duration: 6 },
  { id: 3, left: "58%", top: "78%", size: 3, delay: 0.8, duration: 5 },
  { id: 4, left: "71%", top: "33%", size: 2, delay: 1.5, duration: 4 },
  { id: 5, left: "85%", top: "55%", size: 5, delay: 2.8, duration: 7 },
  { id: 6, left: "5%", top: "68%", size: 3, delay: 0.2, duration: 5 },
  { id: 7, left: "33%", top: "91%", size: 2, delay: 1.9, duration: 4 },
  { id: 8, left: "62%", top: "12%", size: 4, delay: 3.2, duration: 6 },
  { id: 9, left: "78%", top: "86%", size: 3, delay: 0.7, duration: 5 },
  { id: 10, left: "18%", top: "55%", size: 2, delay: 2.4, duration: 4 },
  { id: 11, left: "52%", top: "38%", size: 5, delay: 1.1, duration: 7 },
  { id: 12, left: "88%", top: "20%", size: 3, delay: 2.9, duration: 5 },
  { id: 13, left: "35%", top: "72%", size: 2, delay: 0.4, duration: 4 },
  { id: 14, left: "95%", top: "62%", size: 4, delay: 1.8, duration: 6 },
  { id: 15, left: "8%", top: "28%", size: 3, delay: 3.5, duration: 5 },
  { id: 16, left: "48%", top: "58%", size: 2, delay: 1.3, duration: 4 },
  { id: 17, left: "72%", top: "4%", size: 5, delay: 2.6, duration: 7 },
  { id: 18, left: "22%", top: "82%", size: 3, delay: 0.9, duration: 5 },
  { id: 19, left: "68%", top: "48%", size: 2, delay: 2.2, duration: 4 },
] as const;

// Hero Background Component - extracted from Index.tsx for global use
export const HeroBackground = ({ className = "" }: { className?: string }) => {
  return (
    <div
      className={`fixed inset-0 -z-50 pointer-events-none w-screen h-screen overflow-hidden ${className}`}
    >
      {/* Base gradient - deep dark */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950" />

      {/* Aurora effect - top */}
      <div className="hero-blur absolute top-0 left-1/4 w-[600px] h-[400px] bg-gradient-to-r from-amber-500/20 via-yellow-400/15 to-orange-500/20 rounded-full blur-[100px]" />

      {/* Aurora effect - middle left */}
      <div className="hero-blur absolute top-1/3 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-yellow-600/15 via-amber-500/10 to-transparent rounded-full blur-[120px]" />

      {/* Aurora effect - right side */}
      <div className="hero-blur absolute top-1/4 right-0 w-[700px] h-[600px] bg-gradient-to-l from-yellow-500/10 via-amber-400/8 to-transparent rounded-full blur-[140px]" />

      {/* Bottom aurora - gold/amber */}
      <div className="hero-blur absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-gradient-to-t from-amber-600/15 via-yellow-500/10 to-transparent rounded-full blur-[100px]" />

      {/* Center glow */}
      <div className="hero-blur absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-radial from-amber-500/8 via-transparent to-transparent rounded-full blur-[80px]" />

      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(212, 175, 55, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212, 175, 55, 0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Floating Particles */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {STATIC_PARTICLES.map((particle) => (
          <div
            key={particle.id}
            className="floating-particle absolute rounded-full"
            style={{
              left: particle.left,
              top: particle.top,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: `radial-gradient(circle, rgba(212, 175, 55, 0.8) 0%, rgba(212, 175, 55, 0.2) 70%, transparent 100%)`,
              boxShadow:
                "0 0 6px rgba(212, 175, 55, 0.5), 0 0 12px rgba(212, 175, 55, 0.3)",
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Vignette effect */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-zinc-950/80" />
    </div>
  );
};

export default HeroBackground;
