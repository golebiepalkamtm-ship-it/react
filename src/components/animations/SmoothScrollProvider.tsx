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

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isDev = import.meta.env.DEV;
    
    console.log('🎬 SmoothScrollProvider: Initializing...');
    console.log('  - Reduced Motion:', prefersReducedMotion);
    console.log('  - Dev Mode:', isDev);
    
    const lenis = new Lenis({
      duration: (prefersReducedMotion && !isDev) ? 0 : 2.0, // Zoptymalizowane dla 60fps
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: !prefersReducedMotion || isDev,
      wheelMultiplier: 0.6, // Płynny scroll
      touchMultiplier: 1.2,
      infinite: false,
      autoRaf: false,
      syncTouch: true, // Synchronizacja z 60fps
    });

    lenisRef.current = lenis;

    console.log('✅ Lenis initialized:', lenis);

    document.documentElement.classList.add('lenis', 'lenis-smooth');
    document.documentElement.style.scrollBehavior = 'auto';

    lenis.on('scroll', ScrollTrigger.update);
    console.log('🔗 Lenis synced with ScrollTrigger');

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
    console.log('✅ GSAP ticker configured');

    // Cleanup
    return () => {
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
      document.documentElement.style.scrollBehavior = '';
      lenis.destroy();
      gsap.ticker.remove((time) => {
        lenis.raf(time * 1000);
      });
    };
  }, []);

  return <>{children}</>;
};
