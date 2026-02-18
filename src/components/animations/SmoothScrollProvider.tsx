/**
 * SMOOTH SCROLL PROVIDER - Prosta wersja Lenis
 * Tylko płynne przewijanie bez skomplikowanych efektów GSAP
 */

import {
  ReactNode,
  useEffect,
  useRef,
  createContext,
  useContext,
  useCallback,
} from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface LenisOptions {
  lerp?: number;
  wheelMultiplier?: number;
  touchMultiplier?: number;
}

interface LenisContextValue {
  getLenis: () => Lenis | null;
  isReduced: boolean;
  stopScroll: () => void;
  startScroll: () => void;
  updateOptions: (opts: LenisOptions) => void;
  resetOptions: () => void;
}

const DEFAULT_OPTIONS: LenisOptions = {
  lerp: 0.1,
  wheelMultiplier: 1,
  touchMultiplier: 2,
};

const LenisContext = createContext<LenisContextValue>({
  getLenis: () => null,
  isReduced: false,
  stopScroll: () => {},
  startScroll: () => {},
  updateOptions: () => {},
  resetOptions: () => {},
});

export const useLenisContext = () => useContext(LenisContext);
export const useLenis = () => useContext(LenisContext);

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export const SmoothScrollProvider = ({
  children,
}: SmoothScrollProviderProps) => {
  const lenisRef = useRef<Lenis | null>(null);

  const isReduced =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  useEffect(() => {
    if (isReduced) {
      document.documentElement.classList.add("reduced-motion");
      return;
    }

    // Prosta inicjalizacja Lenis
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    // Expose for debugging
    if (typeof window !== "undefined") {
      (window as unknown as { lenis: Lenis }).lenis = lenis;
    }

    // 🔥 KLUCZOWE DLA PŁYNNOŚCI: Synchronizacja Lenis z GSAP Ticker
    // Zamiast osobnej pętli rAF, używamy tickera GSAP.
    // Dzięki temu scroll i animacje są obliczane w tej samej klatce.
    lenis.on("scroll", ScrollTrigger.update);

    const ticker = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(ticker);

    // Zapobiega skokom przy lagach
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(ticker);
      lenis.destroy();
      lenisRef.current = null;
      if (typeof window !== "undefined") {
        (window as unknown as { lenis: null }).lenis = null;
      }
    };
  }, [isReduced]);

  const getLenis = useCallback(() => lenisRef.current, []);

  const stopScroll = useCallback(() => {
    lenisRef.current?.stop();
  }, []);

  const startScroll = useCallback(() => {
    lenisRef.current?.start();
  }, []);

  // Dynamically update Lenis options (e.g. for buttery-smooth pages)
  const updateOptions = useCallback((opts: LenisOptions) => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (opts.lerp !== undefined) (lenis as any).options.lerp = opts.lerp;
    if (opts.wheelMultiplier !== undefined)
      (lenis as any).options.wheelMultiplier = opts.wheelMultiplier;
    if (opts.touchMultiplier !== undefined)
      (lenis as any).options.touchMultiplier = opts.touchMultiplier;
  }, []);

  const resetOptions = useCallback(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    (lenis as any).options.lerp = DEFAULT_OPTIONS.lerp;
    (lenis as any).options.wheelMultiplier = DEFAULT_OPTIONS.wheelMultiplier;
    (lenis as any).options.touchMultiplier = DEFAULT_OPTIONS.touchMultiplier;
  }, []);

  return (
    <LenisContext.Provider
      value={{
        getLenis,
        isReduced,
        stopScroll,
        startScroll,
        updateOptions,
        resetOptions,
      }}
    >
      {children}
    </LenisContext.Provider>
  );
};
