/**
 * SMOOTH SCROLL PROVIDER
 * Lenis integration for buttery smooth scrolling
 * Synchronized with GSAP ScrollTrigger
 */

import { ReactNode, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/gsapConfig';

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export const SmoothScrollProvider = ({ children }: SmoothScrollProviderProps) => {
  const lenisRef = useRef<Lenis | null>(null);
  const tickerRef = useRef<((time: number) => void) | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isDev = import.meta.env.DEV;

    const lenis = new Lenis({
      // Bardziej "luxury", miękki i wolniejszy scroll dla całego serwisu
      duration: prefersReducedMotion && !isDev ? 1.0 : 2.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -9 * t)), // nieco łagodniejsza krzywa
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: !prefersReducedMotion || isDev,
      wheelMultiplier: prefersReducedMotion ? 0.35 : 0.45,
      touchMultiplier: prefersReducedMotion ? 0.8 : 1.2,
      infinite: false,
      autoRaf: false,
      syncTouch: true,
    });

    lenisRef.current = lenis;

    document.documentElement.classList.add('lenis', 'lenis-smooth');
    document.documentElement.style.scrollBehavior = 'auto';

    lenis.on('scroll', ScrollTrigger.update);

    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };
    tickerRef.current = raf;

    gsap.ticker.add(raf);

    gsap.ticker.lagSmoothing(0);

    return () => {
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
      document.documentElement.style.scrollBehavior = '';
      lenis.off('scroll', ScrollTrigger.update);
      if (tickerRef.current) {
        gsap.ticker.remove(tickerRef.current);
      }
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
};
