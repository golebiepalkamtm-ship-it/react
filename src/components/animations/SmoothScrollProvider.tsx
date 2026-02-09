/**
 * SMOOTH SCROLL PROVIDER - GSAP COMPLIANT
 * Poprawna implementacja Lenis z GSAP ScrollTrigger zgodnie z dokumentacją
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
    // Native scroll is now the default for stability and performance.
    // We keep the provider to avoid breaking the App structure.
    console.log('✨ [SmoothScroll] Native scroll enabled (Lenis removed)');

    return () => {
      // Cleanup any global scroll-related styles if they were added
    };
  }, []);

  return <>{children}</>;
};