/**
 * React Hook for Animation Initialization
 * Handles the logic for starting premium GSAP animations.
 */

import { useEffect } from 'react';
import { initAllAnimations, killScrollTrigger, refreshScrollTrigger } from '@/lib/gsapAnimations';

interface UseSmoothScrollOptions {
  enableAnimations?: boolean;
}

export const useSmoothScroll = (options: UseSmoothScrollOptions = {}) => {
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
