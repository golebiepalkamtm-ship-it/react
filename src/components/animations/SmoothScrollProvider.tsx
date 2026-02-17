/**
 * SMOOTH SCROLL PROVIDER - Prosta wersja Lenis
 * Tylko płynne przewijanie bez skomplikowanych efektów GSAP
 */

import { ReactNode, useEffect, useRef, createContext, useContext, useCallback } from "react";
import Lenis from "lenis";

interface LenisContextValue {
  getLenis: () => Lenis | null;
  isReduced: boolean;
  stopScroll: () => void;
  startScroll: () => void;
}

const LenisContext = createContext<LenisContextValue>({
  getLenis: () => null,
  isReduced: false,
  stopScroll: () => {},
  startScroll: () => {},
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
      smooth: true,
    });

    lenisRef.current = lenis;

    // Expose for debugging
    if (typeof window !== "undefined") {
      (window as unknown as { lenis: Lenis }).lenis = lenis;
    }

    // Raf loop - proste przewijanie
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
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

  return (
    <LenisContext.Provider
      value={{ getLenis, isReduced, stopScroll, startScroll }}
    >
      {children}
    </LenisContext.Provider>
  );
};
