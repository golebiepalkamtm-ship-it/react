/**
 * Smooth Scroll Implementation with Lenis + GSAP
 * 
 * This module provides ultra-smooth inertia scrolling using Lenis
 * and syncs it with GSAP's ticker for perfect animation timing.
 * 
 * Key concepts:
 * - lerp: Linear interpolation factor (0-1). Lower = smoother but slower.
 * - duration: Time in seconds for scroll to reach target. Higher = more fluid.
 * - easing: Easing function for scroll interpolation.
 */

import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

/**
 * Initialize Lenis smooth scroll
 * 
 * @param lerp - Smoothness factor (0.05 = ultra smooth, 0.1 = very smooth, 0.5 = snappier)
 * @param duration - Scroll duration in seconds (2.0 = very smooth, 1.2 = fluid, 1.0 = responsive)
 */
export const initSmoothScroll = (lerp: number = 0.05, duration: number = 2.0) => {
  console.log('🎨 [Lenis] Initializing smooth scroll...');
  
  // Add lenis classes to html element BEFORE Lenis init
  const html = document.documentElement;
  html.classList.add('lenis', 'lenis-smooth');
  
  // Force scroll-behavior to auto (required for Lenis)
  html.style.scrollBehavior = 'auto';
  
  console.log('🎨 [Lenis] Added classes to <html>');
  
  // Initialize Lenis with custom settings
  lenis = new Lenis({
    lerp,           // Smoothness: lower = smoother (0.05-0.2 recommended)
    duration,       // Duration: higher = more fluid (1.5-2.5 recommended)
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom easing for natural feel
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
    infinite: false,
    autoRaf: false, // Wyłączamy auto RAF bo używamy GSAP ticker
  });
  
  // Dodaj klasę lenis-smooth po inicjalizacji (niektóre wersje Lenis tego nie robią)
  html.classList.add('lenis-smooth');

  // Sync Lenis with GSAP ticker for perfect timing
  // This ensures all GSAP animations are in sync with scroll
  lenis.on('scroll', () => {
    // Update ScrollTrigger on each scroll event
    ScrollTrigger.update();
  });

  // Add Lenis to GSAP ticker
  // This creates a single RAF loop for both Lenis and GSAP
  gsap.ticker.add((time) => {
    lenis?.raf(time * 1000); // Convert GSAP time to milliseconds
  });

  // Disable GSAP's default lag smoothing to prevent conflicts
  gsap.ticker.lagSmoothing(0);

  console.log('✅ [Lenis] Smooth scroll initialized successfully');
  return lenis;
};

/**
 * Scroll to a specific target
 * 
 * @param target - CSS selector, element, or number (scroll position)
 * @param options - Scroll options (offset, duration, etc.)
 */
export const scrollTo = (
  target: string | HTMLElement | number,
  options?: {
    offset?: number;
    duration?: number;
    easing?: (t: number) => number;
  }
) => {
  if (!lenis) {
    console.warn('Lenis not initialized. Call initSmoothScroll() first.');
    return;
  }

  lenis.scrollTo(target, {
    offset: options?.offset || 0,
    duration: options?.duration,
    easing: options?.easing,
  });
};

/**
 * Stop smooth scroll
 */
export const stopScroll = () => {
  lenis?.stop();
};

/**
 * Start smooth scroll
 */
export const startScroll = () => {
  lenis?.start();
};

/**
 * Destroy Lenis instance
 */
export const destroySmoothScroll = () => {
  if (lenis) {
    lenis.destroy();
    lenis = null;
  }
  // Remove lenis classes
  document.documentElement.classList.remove('lenis', 'lenis-smooth');
};

/**
 * Get current Lenis instance
 */
export const getLenis = () => lenis;
