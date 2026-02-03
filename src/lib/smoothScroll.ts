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
import { gsap, ScrollTrigger } from '@/lib/gsapConfig';

let lenis: Lenis | null = null;

/**
 * Initialize Lenis smooth scroll
 * 
 * @param lerp - Smoothness factor (0.03 = ultra płynny, 0.05 = bardzo płynny, 0.1 = standardowy)
 * @param duration - Scroll duration in seconds (2.5 = ultra płynny, 2.0 = bardzo płynny, 1.5 = standardowy)
 */
export const initSmoothScroll = (lerp: number = 0.035, duration: number = 2.5) => {
  console.log('🎨 [Lenis] Initializing smooth scroll...');
  
  // Add lenis classes to html element BEFORE Lenis init
  const html = document.documentElement;
  html.classList.add('lenis', 'lenis-smooth');
  
  // Force scroll-behavior to auto (required for Lenis)
  html.style.scrollBehavior = 'auto';
  
  console.log('🎨 [Lenis] Added classes to <html>');
  
  // Initialize Lenis with custom settings - ULTRA SMOOTH
  lenis = new Lenis({
    lerp,           // Niższy = wolniejszy, bardziej płynący (0.03-0.05)
    duration,       // Wyższy = dłuższa animacja scrolla (2.0-3.0)
    easing: (t) => 1 - Math.pow(1 - t, 4), // Płynniejszy ease-out
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 0.8,  // Wolniejszy scroll kółkiem myszy
    touchMultiplier: 1.5,  // Trochę wolniejszy dotyk
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

  // CRITICAL: Refresh ScrollTrigger after Lenis is fully initialized
  // This ensures all trigger positions are calculated correctly with Lenis active
  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
    console.log('✅ [ScrollTrigger] Refreshed after Lenis init');
  });

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
