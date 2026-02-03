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
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const isDev = import.meta.env.DEV;

    const duration = prefersReducedMotion && !isDev ? 0.9 : isMobile ? 2.8 : 2.4;
    const wheelMultiplier = prefersReducedMotion ? 0.35 : isMobile ? 0.32 : 0.45;
    const touchMultiplier = prefersReducedMotion ? 0.85 : isMobile ? 1.0 : 1.2;

    const lenis = new Lenis({
      duration,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -9 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier,
      touchMultiplier,
      infinite: false,
      autoRaf: false,
      syncTouch: true,
    });

    lenisRef.current = lenis;

    document.documentElement.classList.add('lenis', 'lenis-smooth');
    document.documentElement.style.scrollBehavior = 'auto';

    const handleScroll = () => ScrollTrigger.update();
    lenis.on('scroll', handleScroll);

    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        if (value !== undefined) {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
      },
      pinType: document.body.style.transform ? 'transform' : 'fixed',
    });

    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };
    tickerRef.current = raf;
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
      document.documentElement.style.scrollBehavior = '';
      lenis.off('scroll', handleScroll);
      ScrollTrigger.scrollerProxy(document.body, null as any);
      if (tickerRef.current) {
        gsap.ticker.remove(tickerRef.current);
      }
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
};
