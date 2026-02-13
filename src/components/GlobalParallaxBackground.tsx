import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsapConfig';

/**
 * GLOBAL PARALLAX BACKGROUND - VARIANT 2: DYNAMIC LIGHTS
 * Premium background with animated reflections, radial glows, and subtle spotlights
 * Creates depth and dimension without overwhelming content
 */
const GlobalParallaxBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // WYŁĄCZONE - animacje spowalniają scroll
    // Zostawiamy tylko statyczne warstwy dla wydajności
    console.log('🎨 [Background] Static layers only - animations disabled for performance');

    return () => {
      // No cleanup needed
    };
  }, []);

  // Wyłącz na stronie wyników lotowych - ma własne tło
  if (window.location.pathname === '/wyniki-lotowe' || window.location.pathname === '/flight-results') {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: -10 }}
    >
      {/* ZŁOTE POŚWIATY - warstwa ponad jasnym tłem (SUBTELNIEJSZE NA JASNYM TLE) */}
      <div 
        className="absolute inset-0" 
        style={{
          background: `
            radial-gradient(ellipse 140% 70% at 50% -5%, rgba(255, 215, 0, 0.15) 0%, rgba(212, 175, 55, 0.08) 25%, transparent 70%),
            radial-gradient(ellipse 80% 60% at 5% 20%, rgba(255, 193, 37, 0.10) 0%, rgba(218, 165, 32, 0.05) 40%, transparent 80%),
            radial-gradient(ellipse 70% 55% at 95% 15%, rgba(255, 215, 0, 0.10) 0%, transparent 70%),
            radial-gradient(ellipse 120% 50% at 50% 105%, rgba(184, 134, 11, 0.12) 0%, rgba(139, 90, 43, 0.04) 35%, transparent 80%)`
        }}
      />

      {/* PRIMARY SPOTLIGHTS - Główne źródła światła (ZREDUKOWANE) */}
      <div 
        className="spotlight absolute top-[-5%] left-[10%] w-[50vw] h-[50vw] rounded-full blur-[140px]"
        style={{
          background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)',
          opacity: 0.2
        }}
      />
      <div 
        className="spotlight absolute bottom-[10%] left-[15%] w-[55vw] h-[55vw] rounded-full blur-[150px]"
        style={{
          background: 'radial-gradient(circle, rgba(218,165,32,0.10) 0%, transparent 70%)',
          opacity: 0.25
        }}
      />

      {/* ANIMATED ORBS - Pływające złote kule */}
      <div 
        className="parallax-orb absolute top-[12%] left-[18%] w-[32vw] h-[32vw] rounded-full blur-[95px]"
        style={{
          background: 'radial-gradient(circle, rgba(255,215,0,0.08) 0%, transparent 100%)'
        }}
      />
      <div 
        className="parallax-orb absolute top-[72%] left-[8%] w-[36vw] h-[36vw] rounded-full blur-[105px]"
        style={{
          background: 'radial-gradient(circle, rgba(255,193,37,0.06) 0%, transparent 100%)'
        }}
      />

      {/* Enhanced grain texture */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply" 
        style={{
          backgroundImage: `url('https://grainy-gradients.vercel.app/noise.svg')`
        }}
      />
    </div>
  );
};

export default GlobalParallaxBackground;
