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
      {/* GRANATOWE TŁO - BAZOWA WARSTWA */}
      <div 
        className="absolute inset-0" 
        style={{
          background: `linear-gradient(175deg,
            hsl(230, 50%, 10%) 0%,
            hsl(225, 55%, 8%) 30%,
            hsl(220, 60%, 7%) 60%,
            hsl(225, 55%, 6%) 100%)`
        }}
      />

      {/* ZŁOTE POŚWIATY - warstwa ponad granatem (ZBALANSOWANA - WIĘCEJ ZŁOTA) */}
      <div 
        className="absolute inset-0" 
        style={{
          background: `
            radial-gradient(ellipse 140% 70% at 50% -5%, rgba(255, 215, 0, 0.25) 0%, rgba(212, 175, 55, 0.12) 25%, rgba(218, 165, 32, 0.06) 50%, transparent 70%),
            radial-gradient(ellipse 80% 60% at 5% 20%, rgba(255, 193, 37, 0.20) 0%, rgba(218, 165, 32, 0.10) 40%, rgba(184, 134, 11, 0.04) 60%, transparent 80%),
            radial-gradient(ellipse 70% 55% at 95% 15%, rgba(255, 215, 0, 0.18) 0%, rgba(212, 175, 55, 0.08) 40%, transparent 70%),
            radial-gradient(ellipse 50% 90% at 0% 50%, rgba(218, 165, 32, 0.15) 0%, rgba(184, 134, 11, 0.06) 50%, transparent 75%),
            radial-gradient(ellipse 50% 90% at 100% 55%, rgba(205, 133, 63, 0.14) 0%, rgba(139, 90, 43, 0.06) 50%, transparent 75%),
            radial-gradient(ellipse 120% 50% at 50% 105%, rgba(184, 134, 11, 0.22) 0%, rgba(139, 90, 43, 0.08) 35%, rgba(101, 67, 33, 0.04) 60%, transparent 80%),
            radial-gradient(ellipse 60% 50% at 40% 50%, rgba(100, 149, 237, 0.08) 0%, transparent 70%)`
        }}
      />

      {/* PRIMARY SPOTLIGHTS - Główne źródła światła (ZREDUKOWANE) */}
      <div 
        className="spotlight absolute top-[-5%] left-[10%] w-[50vw] h-[50vw] rounded-full blur-[140px]"
        style={{
          background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.08) 40%, transparent 70%)',
          opacity: 0.35
        }}
      />
      <div 
        className="spotlight absolute top-[30%] right-[-5%] w-[45vw] h-[45vw] rounded-full blur-[130px]"
        style={{
          background: 'radial-gradient(circle, rgba(255,215,0,0.12) 0%, rgba(212,175,55,0.06) 40%, transparent 70%)',
          opacity: 0.3
        }}
      />
      <div 
        className="spotlight absolute bottom-[10%] left-[15%] w-[55vw] h-[55vw] rounded-full blur-[150px]"
        style={{
          background: 'radial-gradient(circle, rgba(218,165,32,0.18) 0%, rgba(184,134,11,0.09) 40%, transparent 70%)',
          opacity: 0.4
        }}
      />

      {/* RADIAL GLOWS - Koncentryczne poświaty (ZREDUKOWANE) */}
      <div 
        className="radial-glow absolute top-[15%] left-[25%] w-[35vw] h-[35vw] rounded-full blur-[100px]"
        style={{
          background: 'radial-gradient(circle, rgba(255,223,128,0.10) 0%, rgba(212,175,55,0.05) 50%, transparent 80%)',
          opacity: 0.3
        }}
      />
      <div 
        className="radial-glow absolute top-[50%] right-[20%] w-[40vw] h-[40vw] rounded-full blur-[110px]"
        style={{
          background: 'radial-gradient(circle, rgba(255,193,37,0.12) 0%, rgba(218,165,32,0.06) 50%, transparent 80%)',
          opacity: 0.35
        }}
      />
      <div 
        className="radial-glow absolute bottom-[20%] left-[35%] w-[38vw] h-[38vw] rounded-full blur-[105px]"
        style={{
          background: 'radial-gradient(circle, rgba(205,133,63,0.10) 0%, rgba(184,134,11,0.05) 50%, transparent 80%)',
          opacity: 0.25
        }}
      />

      {/* ANIMATED ORBS - Pływające złote kule */}
      <div 
        className="parallax-orb absolute top-[12%] left-[18%] w-[32vw] h-[32vw] rounded-full blur-[95px]"
        style={{
          background: 'radial-gradient(circle, rgba(255,215,0,0.15) 0%, rgba(212,175,55,0.08) 60%, transparent 100%)'
        }}
      />
      <div 
        className="parallax-orb absolute top-[42%] right-[12%] w-[42vw] h-[42vw] rounded-full blur-[115px]"
        style={{
          background: 'radial-gradient(circle, rgba(218,165,32,0.12) 0%, rgba(184,134,11,0.06) 60%, transparent 100%)'
        }}
      />
      <div 
        className="parallax-orb absolute top-[72%] left-[8%] w-[36vw] h-[36vw] rounded-full blur-[105px]"
        style={{
          background: 'radial-gradient(circle, rgba(255,193,37,0.14) 0%, rgba(212,175,55,0.07) 60%, transparent 100%)'
        }}
      />

      {/* REFLECTIONS - Subtelne refleksy */}
      <div 
        className="reflection absolute top-[25%] left-[45%] w-[25vw] h-[25vw] rounded-full blur-[80px]"
        style={{
          background: 'radial-gradient(circle, rgba(255,223,128,0.12) 0%, transparent 70%)',
          opacity: 0.25
        }}
      />
      <div 
        className="reflection absolute top-[60%] right-[35%] w-[28vw] h-[28vw] rounded-full blur-[85px]"
        style={{
          background: 'radial-gradient(circle, rgba(212,175,55,0.10) 0%, transparent 70%)',
          opacity: 0.22
        }}
      />
      <div 
        className="reflection absolute bottom-[30%] left-[50%] w-[26vw] h-[26vw] rounded-full blur-[82px]"
        style={{
          background: 'radial-gradient(circle, rgba(255,215,0,0.11) 0%, transparent 70%)',
          opacity: 0.24
        }}
      />

      {/* ACCENT LIGHTS - Dodatkowe punkty świetlne */}
      <div 
        className="absolute top-[8%] right-[25%] w-[20vw] h-[20vw] rounded-full blur-[70px]"
        style={{
          background: 'radial-gradient(circle, rgba(255,215,0,0.18) 0%, transparent 65%)',
          opacity: 0.3
        }}
      />
      <div 
        className="absolute bottom-[15%] right-[15%] w-[22vw] h-[22vw] rounded-full blur-[75px]"
        style={{
          background: 'radial-gradient(circle, rgba(218,165,32,0.16) 0%, transparent 65%)',
          opacity: 0.28
        }}
      />

      {/* Subtle blue accent for depth */}
      <div 
        className="absolute top-[35%] left-[5%] w-[30vw] h-[30vw] rounded-full blur-[120px]"
        style={{
          background: 'radial-gradient(circle, rgba(100,149,237,0.08) 0%, transparent 70%)',
          opacity: 0.2
        }}
      />

      {/* Enhanced grain texture */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay" 
        style={{
          backgroundImage: `url('https://grainy-gradients.vercel.app/noise.svg')`
        }}
      />
    </div>
  );
};

export default GlobalParallaxBackground;
