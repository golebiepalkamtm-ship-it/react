/**
 * DEPRECATED: Global scroll animation system
 * 
 * ⚠️ DECOMMISSIONED - DO NOT USE
 * 
 * This file contained a global animation system that created conflicts with
 * component-level ScrollTriggers. Each section now manages its own animations
 * via gsap.context() for proper encapsulation and cleanup.
 * 
 * Migration path:
 * - AboutSection.tsx: Dedicated ScrollTriggers with gsap.context()
 * - PressSection.tsx: Dedicated ScrollTriggers with gsap.context()
 * - ContactSection.tsx: Dedicated ScrollTriggers with gsap.context()
 * - Carousel3D.tsx: Dedicated ScrollTriggers with useGSAP()
 * - Index.tsx HeroPremium: Dedicated timeline animations
 * 
 * Architecture: Component-level animation ownership prevents double-firing
 * and ensures proper cleanup on unmount.
 */

// Placeholder exports for backward compatibility (no-ops)
export const animateTitle = () => {};
export const animateParagraph = () => {};
export const animateCards = () => {};
export const animateImage = () => {};
export const animateBadge = () => {};
export const animateSection = () => {};
export const initScrollAnimations = () => {
  console.log('⚠️ Global scroll animations disabled - using component-level system');
};
