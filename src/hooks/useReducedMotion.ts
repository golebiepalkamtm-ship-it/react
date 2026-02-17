/**
 * useReducedMotion Hook
 * Detects user's prefer-reduced-motion preference
 * Returns true if user prefers reduced motion
 */

import { useState, useEffect } from 'react';

export const useReducedMotion = (): boolean => {
  // FIX: Inicjalizacja stanu na false dla SSR - uniknięcie błędu 'window is not defined'
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // FIX: Sprawdzenie czy jesteśmy w środowu przeglądarki przed użyciem window
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // FIX: Użycie lazy initialization - setState wewnątrz setTimeout aby uniknąć synchronicznego setState
    const timer = setTimeout(() => {
      setPrefersReducedMotion(mediaQuery.matches);
    }, 0);

    mediaQuery.addEventListener('change', handleChange);
    
    // FIX: Zapewnienie cleanup przy unmountcie komponentu
    return () => {
      clearTimeout(timer);
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []); // FIX: Pusta tablica zależności - efekt uruchamia się tylko raz

  return prefersReducedMotion;
};

export default useReducedMotion;
