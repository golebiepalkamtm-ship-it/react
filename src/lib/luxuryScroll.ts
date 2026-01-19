/**
 * ============================================================================
 * LUXURY SCROLL SYSTEM - Awwwards-Level Implementation
 * ============================================================================
 * 
 * Physics-based smooth scrolling z GSAP + Lenis
 * Parametry zoptymalizowane pod "luxury feel":
 * - Wysoka inercja (duration: 2.5-3.5s)
 * - Niska responsywność na gwałtowne ruchy
 * - Custom easing z eksponencjalnym profilem
 */

import { gsap, ScrollTrigger } from '@/lib/gsapConfig';
import Lenis from 'lenis';

export interface LuxuryScrollConfig {
  duration?: number;
  wheelMultiplier?: number;
  touchMultiplier?: number;
  smoothTouch?: boolean;
  syncTouch?: boolean;
}

const DEFAULT_CONFIG: LuxuryScrollConfig = {
  duration: 3.2,
  wheelMultiplier: 0.35,
  touchMultiplier: 1.5,
  smoothTouch: false,
  syncTouch: true,
};

let lenisInstance: Lenis | null = null;
let rafId: number | null = null;

export const luxuryEasing = (t: number): number => {
  return Math.min(1, 1.001 - Math.pow(2, -10 * t));
};

export const customExponentialEase = (t: number, power: number = 10): number => {
  return t === 1 ? 1 : 1 - Math.pow(2, -power * t);
};

export const initLuxuryScroll = (config: LuxuryScrollConfig = {}): Lenis => {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDev = import.meta.env?.DEV ?? false;

  lenisInstance = new Lenis({
    duration: (prefersReducedMotion && !isDev) ? 0.01 : mergedConfig.duration,
    easing: luxuryEasing,
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: !prefersReducedMotion || isDev,
    wheelMultiplier: mergedConfig.wheelMultiplier,
    touchMultiplier: mergedConfig.touchMultiplier,
    infinite: false,
    autoRaf: false,
    syncTouch: mergedConfig.syncTouch,
  });

  document.documentElement.classList.add('lenis', 'lenis-smooth');
  document.documentElement.style.scrollBehavior = 'auto';

  lenisInstance.on('scroll', ScrollTrigger.update);

  const tick = (time: number) => {
    lenisInstance?.raf(time * 1000);
  };
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  setTimeout(() => {
    ScrollTrigger.refresh();
  }, 150);

  return lenisInstance;
};

export const getLenisInstance = (): Lenis | null => lenisInstance;

export const destroyLuxuryScroll = (): void => {
  if (lenisInstance) {
    document.documentElement.classList.remove('lenis', 'lenis-smooth');
    document.documentElement.style.scrollBehavior = '';
    lenisInstance.destroy();
    lenisInstance = null;
  }
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
};

export const scrollTo = (target: string | number | HTMLElement, options?: {
  offset?: number;
  duration?: number;
  immediate?: boolean;
  lock?: boolean;
  onComplete?: () => void;
}): void => {
  lenisInstance?.scrollTo(target, options);
};

export const stopScroll = (): void => {
  lenisInstance?.stop();
};

export const startScroll = (): void => {
  lenisInstance?.start();
};
