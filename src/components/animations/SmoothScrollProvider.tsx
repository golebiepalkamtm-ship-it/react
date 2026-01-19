/**
 * ============================================================================
 * SMOOTH SCROLL PROVIDER - Luxury Edition
 * ============================================================================
 * 
 * Lenis integration z parametrami "luxury feel":
 * - Wysoka inercja (duration: 3.2s)
 * - Niska responsywność na gwałtowne ruchy (wheelMultiplier: 0.35)
 * - Custom exponential easing
 * 
 * Synchronized with GSAP ScrollTrigger for premium animations.
 */

import { ReactNode, useEffect, useRef, createContext, useContext, useCallback, useMemo } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/gsapConfig';

interface SmoothScrollContextValue {
  getLenis: () => Lenis | null;
  scrollTo: (target: string | number | HTMLElement, options?: {
    offset?: number;
    duration?: number;
    immediate?: boolean;
  }) => void;
  stop: () => void;
  start: () => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  getLenis: () => null,
  scrollTo: () => {},
  stop: () => {},
  start: () => {},
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

interface SmoothScrollProviderProps {
  children: ReactNode;
  luxury?: boolean;
}

const luxuryEasing = (t: number): number => {
  return Math.min(1, 1.001 - Math.pow(2, -10 * t));
};

export const SmoothScrollProvider = ({ 
  children, 
  luxury = true 
}: SmoothScrollProviderProps) => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isDev = import.meta.env.DEV;
    
    const config = luxury ? {
      duration: (prefersReducedMotion && !isDev) ? 0.01 : 3.2,
      easing: luxuryEasing,
      wheelMultiplier: 0.35,
      touchMultiplier: 1.5,
    } : {
      duration: (prefersReducedMotion && !isDev) ? 0 : 2.0,
      easing: luxuryEasing,
      wheelMultiplier: 0.5,
      touchMultiplier: 1.2,
    };
    
    const lenis = new Lenis({
      ...config,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: !prefersReducedMotion || isDev,
      infinite: false,
      autoRaf: false,
      syncTouch: true,
    });

    lenisRef.current = lenis;

    document.documentElement.classList.add('lenis', 'lenis-smooth');
    document.documentElement.style.scrollBehavior = 'auto';

    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
      document.documentElement.style.scrollBehavior = '';
      lenis.destroy();
      lenisRef.current = null;
      gsap.ticker.remove(tick);
    };
  }, [luxury]);

  const getLenis = useCallback(() => lenisRef.current, []);
  const scrollTo = useCallback((target: string | number | HTMLElement, options?: {
    offset?: number;
    duration?: number;
    immediate?: boolean;
  }) => lenisRef.current?.scrollTo(target, options), []);
  const stop = useCallback(() => lenisRef.current?.stop(), []);
  const start = useCallback(() => lenisRef.current?.start(), []);

  const contextValue = useMemo<SmoothScrollContextValue>(() => ({
    getLenis,
    scrollTo,
    stop,
    start,
  }), [getLenis, scrollTo, stop, start]);

  return (
    <SmoothScrollContext.Provider value={contextValue}>
      {children}
    </SmoothScrollContext.Provider>
  );
};
