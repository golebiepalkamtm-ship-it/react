/**
 * ============================================================================
 * CUSTOM EASINGS - Premium Motion Design
 * ============================================================================
 * 
 * Zbiór niestandardowych krzywych Beziera i funkcji easingowych
 * inspirowanych pracami Timothy'ego Ricksa i Chrisa Gannona.
 * 
 * PHYSICS-BASED MOTION:
 * - Exponential decay dla naturalnego ruchu
 * - Spring physics dla micro-interactions
 * - Anticipation/overshoot dla dramatycznego efektu
 */

import { gsap } from '@/lib/gsapConfig';

export const customBezierCurves = {
  // Ultra-smooth agency-level curves
  agencyPremium: 'cubic-bezier(0.19, 1, 0.22, 1)',      // Awwwards favorite
  luxuryOut: 'cubic-bezier(0.16, 1, 0.3, 1)',           // Original
  luxuryInOut: 'cubic-bezier(0.87, 0, 0.13, 1)',        // Original
  dramaticOut: 'cubic-bezier(0.22, 1, 0.36, 1)',        // Original
  elasticOut: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',    // Original
  smoothReveal: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Original
  heroText: 'cubic-bezier(0.075, 0.82, 0.165, 1)',      // Original
  softBounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',      // Original
  cinematicReveal: 'cubic-bezier(0.7, 0, 0.84, 0)',     // Original
  
  // Nowe premium curves
  ultraSmooth: 'cubic-bezier(0.215, 0.61, 0.355, 1)',   // Super płynne
  appleMagic: 'cubic-bezier(0.4, 0.0, 0.2, 1)',         // iOS-style
  materialDesign: 'cubic-bezier(0.4, 0.0, 0.6, 1)',     // Google Material
  swiftOut: 'cubic-bezier(0.55, 0, 0.1, 1)',            // Szybki start, długi easing
  elegantSlide: 'cubic-bezier(0.33, 1, 0.68, 1)',       // Bardzo elegancki
};

export const gsapEasings = {
  // Premium GSAP easings - wybrzmiewające, luksusowe
  luxuryPower: 'power4.out',      // Najdłuższe wybrzmiewanie
  heroReveal: 'expo.out',         // Eksponencjalne, bardzo dramatyczne
  smoothSlide: 'power3.out',      // Smooth ale mocne
  springy: 'back.out(1.7)',       // Sprężyste z overshoot
  elastic: 'elastic.out(1, 0.3)', // Elastyczne
  bounce: 'bounce.out',           // Bounce
  slowMo: 'slow(0.7, 0.7, false)',// Slow motion
  anticipate: 'power2.inOut',     // Anticipation
  
  // Nowe ultra-premium
  ultraExpo: 'expo.out',          // Główny easing dla agencji
  circ: 'circ.out',               // Circular, bardzo gładki
  sine: 'sine.inOut',             // Sinusoidal, naturalny
  customBack: 'back.out(2)',      // Silniejszy overshoot
};

export const exponentialOut = (t: number, power: number = 10): number => {
  return t === 1 ? 1 : 1 - Math.pow(2, -power * t);
};

export const exponentialIn = (t: number, power: number = 10): number => {
  return t === 0 ? 0 : Math.pow(2, power * (t - 1));
};

export const exponentialInOut = (t: number, power: number = 10): number => {
  if (t === 0) return 0;
  if (t === 1) return 1;
  if (t < 0.5) {
    return Math.pow(2, power * (2 * t - 1)) / 2;
  }
  return 1 - Math.pow(2, -power * (2 * t - 1)) / 2;
};

export const springPhysics = (t: number, tension: number = 0.5, friction: number = 0.3): number => {
  const decay = Math.exp(-friction * 10 * t);
  const oscillation = Math.cos(tension * 40 * t);
  return 1 - decay * oscillation;
};

export const anticipateOvershoot = (t: number, overshoot: number = 1.5): number => {
  const c1 = 1.70158;
  const c2 = c1 * overshoot;
  return t < 0.5
    ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
    : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
};

export const smoothstep = (edge0: number, edge1: number, x: number): number => {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

export const cinematicEase = (t: number): number => {
  const c4 = (2 * Math.PI) / 3;
  return t === 0
    ? 0
    : t === 1
    ? 1
    : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
};

export const registerCustomEasings = (): void => {
  if (typeof gsap.parseEase !== 'function') return;
  
  const customEasings: Record<string, (t: number) => number> = {
    luxuryExpo: (t) => exponentialOut(t, 12),
    cinematicReveal: cinematicEase,
    springMotion: (t) => springPhysics(t, 0.4, 0.25),
    anticipate: (t) => anticipateOvershoot(t, 1.2),
    ultraSmooth: (t) => smoothstep(0, 1, t),
  };

  Object.entries(customEasings).forEach(([name, fn]) => {
    try {
      gsap.registerEase?.(name, fn);
    } catch {
      // Fallback for environments without registerEase
    }
  });
};

export const createStaggerConfig = (options: {
  amount?: number;
  from?: 'start' | 'end' | 'center' | 'edges' | 'random' | number;
  ease?: string;
  grid?: [number, number] | 'auto';
}): gsap.StaggerVars => {
  return {
    amount: options.amount ?? 0.8,
    from: options.from ?? 'start',
    ease: options.ease ?? 'power2.inOut',
    grid: options.grid,
  };
};

export const motionPresets = {
  heroReveal: {
    duration: 1.8,
    ease: gsapEasings.ultraExpo,
    stagger: createStaggerConfig({ 
      amount: 1.0, 
      from: 'start',
      ease: 'power2.inOut'
    }),
  },
  cardFloat: {
    duration: 1.4,
    ease: gsapEasings.luxuryPower,
    y: -15,
  },
  textSplit: {
    duration: 1.2,
    ease: gsapEasings.ultraExpo,
    stagger: createStaggerConfig({ 
      amount: 0.6, 
      from: 'start',
      ease: 'sine.inOut'
    }),
  },
  imageParallax: {
    duration: 1.2,
    ease: 'none',
    scrub: 1.8, // Zwiększone dla ultra-smooth efektu
  },
  sectionFade: {
    duration: 1.6,
    ease: gsapEasings.ultraExpo,
    y: 100,
    opacity: 0,
  },
  clipReveal: {
    duration: 2.2,
    ease: gsapEasings.ultraExpo,
    scrub: 1.5,
  },
  magneticHover: {
    duration: 0.7,
    ease: gsapEasings.circ,
  },
};
