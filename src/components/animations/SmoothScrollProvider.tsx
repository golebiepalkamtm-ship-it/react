/**
 * SMOOTH SCROLL PROVIDER - LENIS + GSAP SCROLLTRIGGER
 * Awwwards-level smooth scrolling z pełną integracją GSAP
 * 
 * Features:
 * - Lenis smooth scroll z physics-based easing
 * - GSAP ScrollTrigger sync
 * - prefer-reduced-motion support
 * - Scroll velocity tracking dla efektów
 */

import { ReactNode, useEffect, createContext, useContext, useRef } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/gsapConfig';

interface LenisContextValue {
  getLenis: () => Lenis | null;
  isReduced: boolean;
}

const LenisContext = createContext<LenisContextValue>({ getLenis: () => null, isReduced: false });

export const useLenis = () => useContext(LenisContext);

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export const SmoothScrollProvider = ({ children }: SmoothScrollProviderProps) => {
  const lenisRef = useRef<Lenis | null>(null);
  
  // Check reduced motion preference
  const isReduced = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  useEffect(() => {
    if (isReduced) {
      document.documentElement.classList.add('reduced-motion');
      return;
    }

    // Initialize Lenis smooth scroll - wolniejszy i płynniejszy scroll
    const lenis = new Lenis({
      duration: 2.4,                // Zwiększono z 1.2 na 2.4 - wolniejszy scroll
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),  // Exponential easing
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.8,         // Zmniejszono z 1 na 0.8 - wolniejszy scroll kołem myszy
      touchMultiplier: 1.5,         // Zmniejszono z 2 na 1.5 - wolniejszy scroll dotykiem
      infinite: false,
    });

    lenisRef.current = lenis;

    // Expose to window for debugging
    if (typeof window !== 'undefined') {
      (window as any).lenis = lenis;
    }

    // Sync Lenis with GSAP ScrollTrigger - używamy named function dla łatwiejszego usunięcia
    const scrollUpdate = () => {
      ScrollTrigger.update();
    };
    lenis.on('scroll', scrollUpdate);

    // Integrate Lenis with GSAP ticker - używamy named function dla łatwiejszego usunięcia
    const rafHandler = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(rafHandler);

    // Wyłączamy lag smoothing dla lepszej synchronizacji
    gsap.ticker.lagSmoothing(0);

    // Refresh po pełnej inicjalizacji - używamy krótszego timeoutu
    const refreshTimer = setTimeout(() => {
      // Głębokie odświeżenie wszystkich ScrollTriggerów
      ScrollTrigger.refresh(true);
    }, 300);

    console.log(' Lenis smooth scroll enabled');

    return () => {
      // Usuwamy event listenery
      lenis.off('scroll', scrollUpdate);
      
      // Usuwamy ticker
      gsap.ticker.remove(rafHandler);
      
      // Czyścimy timeout
      clearTimeout(refreshTimer);
      
      // Niszczymy instancję Lenis
      lenis.destroy();
      
      // Czyścimy referencję w window
      if (typeof window !== 'undefined') {
        (window as any).lenis = null;
      }
    };
  }, [isReduced]);

  // Getter function to access lenis - avoids ref access during render
  const getLenis = () => lenisRef.current;

  // Dodajemy funkcję pomocniczą do odświeżania ScrollTriggerów
  useEffect(() => {
    // Dodajemy event listener na resize dla lepszej responsywności
    const handleResize = () => {
      if (!isReduced && lenisRef.current) {
        // Dajemy czas na zakończenie resizu przed odświeżeniem
        setTimeout(() => {
          ScrollTrigger.refresh(true);
        }, 100);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isReduced]);

  return (
    <LenisContext.Provider value={{ getLenis, isReduced }}>
      {children}
    </LenisContext.Provider>
  );
};