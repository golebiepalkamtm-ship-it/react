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
  force3D: true, // Zawsze używaj 3D dla płynności na GPU
  nullTargetWarn: false,
});

// Premium defaults - expo.out to klucz do ultra-płynnych przejść
gsap.defaults({
  ease: "expo.out",
  duration: 1.2
});

ScrollTrigger.config({
  ignoreMobileResize: true,
  autoRefreshEvents: "visibilitychange,DOMContentLoaded,load,resize" // Stabilność
});

ScrollTrigger.defaults({
  toggleActions: "play none none reverse",
  markers: false
});

// Export pre-configured GSAP
export { gsap, ScrollTrigger };

// Export helper for common easing functions
export const easings = {
  easeOutExpo: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  easeInOutQuart: (t: number) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
  easeOutQuart: (t: number) => 1 - (--t) * t * t * t,
};
