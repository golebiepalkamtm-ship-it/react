/**
 * Scroll Optimizer - Eliminacja forced reflow violations
 * 
 * Problem: ScrollTrigger + Lenis powodują setki forced reflow violations
 * Rozwiązanie: Wyłączenie większości ScrollTrigger animacji, pozostawienie tylko podstawowych
 */

import { gsap } from 'gsap';

/**
 * Konfiguracja ScrollTrigger dla minimalnych forced reflow
 */
export const configureScrollTrigger = () => {
  if (typeof window === 'undefined') return;
  
  const ScrollTrigger = (window as any).ScrollTrigger;
  if (!ScrollTrigger) return;

  // Minimalna konfiguracja ScrollTrigger
  ScrollTrigger.config({
    autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load',
  });

  // Nie ustawiamy defaults - komponenty mają własne ustawienia

  console.log('✅ ScrollTrigger optimized for minimal reflow');
};

/**
 * Wyłącz wszystkie ScrollTrigger animacje (emergency mode)
 */
export const disableAllScrollTriggers = () => {
  if (typeof window === 'undefined') return;
  
  const ScrollTrigger = (window as any).ScrollTrigger;
  if (!ScrollTrigger) return;

  ScrollTrigger.getAll().forEach((trigger: any) => {
    trigger.kill();
  });

  console.log('🛑 All ScrollTriggers disabled');
};

/**
 * Policz aktywne ScrollTriggers
 */
export const countScrollTriggers = () => {
  if (typeof window === 'undefined') return 0;
  
  const ScrollTrigger = (window as any).ScrollTrigger;
  if (!ScrollTrigger) return 0;

  return ScrollTrigger.getAll().length;
};

// Auto-configure on load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    configureScrollTrigger();
    
    // Expose to window for debugging
    (window as any).disableAllScrollTriggers = disableAllScrollTriggers;
    (window as any).countScrollTriggers = countScrollTriggers;
    
    console.log(`📊 Active ScrollTriggers: ${countScrollTriggers()}`);
  });
}
