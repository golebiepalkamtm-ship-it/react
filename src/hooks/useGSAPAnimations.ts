/**
 * React Hook for GSAP Animation Initialization
 * Handles the logic for starting premium GSAP animations.
 * 
 * Note: This hook initializes GSAP animations, NOT smooth scrolling.
 * For smooth scrolling, use SmoothScrollProvider from @/components/animations/SmoothScrollProvider
 */

import { useEffect } from 'react';
import { initAllAnimations, killScrollTrigger, refreshScrollTrigger } from '@/lib/gsapAnimations';

interface UseGSAPAnimationsOptions {
  enableAnimations?: boolean;
}

export const useGSAPAnimations = (options: UseGSAPAnimationsOptions = {}) => {
  const { enableAnimations = true } = options;

  useEffect(() => {
    if (!enableAnimations) return;

    console.log('🎬 [AnimationSystem] Scheduling initialization...');

    const initAnimations = () => {
      // Check if critical elements exist before initializing
      const headings = document.querySelectorAll('h1, h2, [data-split-text]');

      if (headings.length > 0) {
        initAllAnimations();
      } else {
        // Retry if DOM is not fully ready
        setTimeout(initAnimations, 300);
      }
    };

    const timer = setTimeout(initAnimations, 200);

    return () => {
      clearTimeout(timer);
      killScrollTrigger();
    };
  }, [enableAnimations]);

  // Refresh on window resize or route change
  useEffect(() => {
    if (!enableAnimations) return;

    const handleResize = () => refreshScrollTrigger();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [enableAnimations]);
};
