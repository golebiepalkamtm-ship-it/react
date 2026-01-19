/**
 * GSAP CENTRALIZED CONFIGURATION
 * Single source of truth for GSAP setup
 * Import this instead of registering plugins multiple times
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register plugins once
gsap.registerPlugin(ScrollTrigger);

// Expose GSAP to window for debugging
if (typeof window !== 'undefined') {
  (window as any).gsap = gsap;
  (window as any).ScrollTrigger = ScrollTrigger;
}

// Global GSAP configuration
gsap.config({
  force3D: true,
  nullTargetWarn: false,
  autoSleep: 60,
  units: { left: "%", top: "%", rotation: "rad" }
});

// Force 60 FPS ticker
gsap.ticker.fps(60);
gsap.ticker.lagSmoothing(500, 33); // Limit lag compensation to maintain smooth 60fps

// Override reduced motion check (for development - respects user preference in production)
if (import.meta.env.DEV) {
  // Force enable animations in dev mode
  gsap.defaults({ ease: "power2.out" });
  ScrollTrigger.config({ ignoreMobileResize: true });
}

// Export pre-configured GSAP
export { gsap, ScrollTrigger };

// Export helper for common easing functions
export const easings = {
  easeOutExpo: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  easeInOutQuart: (t: number) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
  easeOutQuart: (t: number) => 1 - (--t) * t * t * t,
};
