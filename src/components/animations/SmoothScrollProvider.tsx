import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Kontekst przechowujący instancję Lenis
const LenisContext = createContext<Lenis | null>(null);

export const useLenisContext = () => useContext(LenisContext);
export const useLenis = useLenisContext;

interface SmoothScrollProviderProps {
  children: ReactNode;
}

/**
 * SmoothScrollProvider – AWWW Awards Elite Smooth Scroll v5
 *
 * Zoptymalizowany do standardu AWWW Awards:
 * - Szybszy, bardziej responsywny scroll (duration: 1.2)
 * - Efekt Skew na scrollu (V-Skew) – premium feeling
 * - Subtelny efekt skali przy szybkim przewijaniu
 * - GSAP ticker lagSmoothing(0) dla precyzji
 */
export const SmoothScrollProvider = ({
  children,
}: SmoothScrollProviderProps) => {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // AWWW Awards premium easing curve - Modified for slower feel
    const awwwEasing = (t: number): number => 1 - Math.pow(1 - t, 4);

    const lenis = new Lenis({
      duration: 3.5, // Ekstremalnie długi czas trwania = maksymalna płynność i powolność
      easing: awwwEasing,
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.5, // Wymaga dużo kręcenia kółkiem = precyzyjny, wolny ruch
      touchMultiplier: 0.8, // Bardzo wolny scroll dotykowy
      infinite: false,
    });

    // Synchronizacja ScrollTrigger z pozycją scrolla Lenis
    lenis.on("scroll", ScrollTrigger.update);

    // GSAP Ticker Handshake (60 FPS / High Refresh Rate)
    const update = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    // Normalize scroll for Safari/iOS
    ScrollTrigger.normalizeScroll(true);

    const refreshScrollTriggers = () => {
      ScrollTrigger.refresh();
    };

    const handleVisibility = () => {
      if (document.hidden) {
        lenis.stop();
      } else {
        lenis.start();
        ScrollTrigger.refresh();
      }
    };

    window.addEventListener("load", refreshScrollTriggers, { once: true });
    window.addEventListener("resize", refreshScrollTriggers);
    document.addEventListener("visibilitychange", handleVisibility);

    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts?.ready.then(refreshScrollTriggers).catch(() => {});
    }

    // Exposure for debugging
    (window as any).lenis = lenis;
    setLenisInstance(lenis);

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
      window.removeEventListener("load", refreshScrollTriggers);
      window.removeEventListener("resize", refreshScrollTriggers);
      document.removeEventListener("visibilitychange", handleVisibility);
      delete (window as any).lenis;
      setLenisInstance(null);
    };
  }, []);

  return (
    <LenisContext.Provider value={lenisInstance}>
      <div ref={wrapperRef} className="smooth-scroll-wrapper">
        {children}
      </div>
    </LenisContext.Provider>
  );
};

export default SmoothScrollProvider;
