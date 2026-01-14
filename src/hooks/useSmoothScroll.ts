/**
 * React Hook for Smooth Scroll with GSAP
 * 
 * Manages Lenis smooth scroll lifecycle in React components
 */

import { useEffect } from 'react';
import { initSmoothScroll, destroySmoothScroll } from '@/lib/smoothScroll';
import { initAllAnimations, refreshScrollTrigger, killScrollTrigger } from '@/lib/gsapAnimations';

interface UseSmoothScrollOptions {
  lerp?: number;
  duration?: number;
  enableAnimations?: boolean;
}

/**
 * Initialize smooth scroll and GSAP animations
 * 
 * @param options - Configuration options
 * @param options.lerp - Smoothness factor (0.1 = smooth, 0.5 = snappy)
 * @param options.duration - Scroll duration (1.2 = fluid, 2.0 = very smooth)
 * @param options.enableAnimations - Enable GSAP ScrollTrigger animations
 */
export const useSmoothScroll = (options: UseSmoothScrollOptions = {}) => {
  const {
    lerp = 0.1,
    duration = 1.2,
    enableAnimations = true,
  } = options;

  useEffect(() => {
    console.log('🚀 [useSmoothScroll] Initializing...');
    // Initialize smooth scroll
    const lenis = initSmoothScroll(lerp, duration);
    console.log('✅ [useSmoothScroll] Lenis initialized');

    // Initialize animations after DOM is ready
    if (enableAnimations) {
      console.log('🎬 [useSmoothScroll] Scheduling GSAP animations...');
      
      // Wait for DOM to be fully loaded and lazy components to mount
      const initAnimations = () => {
        // Check if elements exist before initializing
        const headings = document.querySelectorAll('h1, h2');
        const parallaxElements = document.querySelectorAll('[data-speed]');
        
        console.log(`🔍 [useSmoothScroll] DOM check: ${headings.length} headings, ${parallaxElements.length} parallax elements`);
        
        if (headings.length > 0 || parallaxElements.length > 0) {
          console.log('🎬 [useSmoothScroll] Initializing GSAP animations NOW');
          initAllAnimations();
          console.log('✅ [useSmoothScroll] GSAP animations initialized');
        } else {
          console.log('⏳ [useSmoothScroll] DOM not ready, retrying in 500ms...');
          setTimeout(initAnimations, 500);
        }
      };
      
      const timer = setTimeout(initAnimations, 300);

      return () => {
        clearTimeout(timer);
        killScrollTrigger();
        destroySmoothScroll();
      };
    }

    return () => {
      destroySmoothScroll();
    };
  }, [lerp, duration, enableAnimations]);

  // Refresh on window resize
  useEffect(() => {
    const handleResize = () => {
      if (enableAnimations) {
        refreshScrollTrigger();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [enableAnimations]);
};
