/**
 * GSAP CENTRALIZED CONFIGURATION
 * Single source of truth for GSAP setup
 * Import this instead of registering plugins multiple times
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Premium plugins loaded via script tags in index.html
// They're available on window object
const ScrollSmoother = (window as any).ScrollSmoother;
const SplitText = (window as any).SplitText;
const ScrambleTextPlugin = (window as any).ScrambleTextPlugin;

// Register plugins once
gsap.registerPlugin(ScrollTrigger);

// Register premium plugins if available
if (ScrollSmoother) gsap.registerPlugin(ScrollSmoother);
if (SplitText) gsap.registerPlugin(SplitText);
if (ScrambleTextPlugin) gsap.registerPlugin(ScrambleTextPlugin);

// Expose GSAP to window for debugging
if (typeof window !== 'undefined') {
  (window as any).gsap = gsap;
  (window as any).ScrollTrigger = ScrollTrigger;
  (window as any).ScrollSmoother = ScrollSmoother;
  (window as any).SplitText = SplitText;
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

// OPTIMIZED: ScrollTrigger configuration for smooth animations with ScrollSmoother
ScrollTrigger.config({
  ignoreMobileResize: true,
  autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
  limitCallbacks: true,
  syncInterval: 150, // Balanced for smooth animations
});

ScrollTrigger.defaults({
  toggleActions: "play none none none",
  markers: false,
});

// Export pre-configured GSAP and plugins
export { gsap, ScrollTrigger };
export { ScrollSmoother, SplitText, ScrambleTextPlugin };

// Export helper for common easing functions
export const easings = {
  easeOutExpo: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  easeInOutQuart: (t: number) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
  easeOutQuart: (t: number) => 1 - (--t) * t * t * t,
};
