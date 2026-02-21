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
 * SmoothScrollProvider – Elite Premium Smooth Scroll v3
 *
 * Prawidłowa integracja Lenis v1.x + GSAP ScrollTrigger:
 * - Własna pętla rAF z performance.now() (czas w ms jak Lenis oczekuje)
 * - Kontekst dostarczany przez useState (nie useRef) - React-safe
 * - GSAP ticker lagSmoothing(0) eliminuje gaps przy szybkim scrollu
 */
export const SmoothScrollProvider = ({
  children,
}: SmoothScrollProviderProps) => {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const rafIdRef = useRef<number>(0);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.6,
      infinite: false,
    });

    // Synchronizacja ScrollTrigger z pozycją scrolla Lenis
    lenis.on("scroll", ScrollTrigger.update);

    // Eliminacja lag smoothing – krytyczne dla precyzji ScrollTrigger
    gsap.ticker.lagSmoothing(0);

    // Prosta pętla rAF – bez żadnych transform side-effects
    const animate = (time: number) => {
      lenis.raf(time);
      rafIdRef.current = requestAnimationFrame(animate);
    };

    // Pauza/wznowienie pętli rAF, gdy karta jest ukryta/widoczna (mikro-optymalizacja)
    let paused = false;
    const handleVisibility = () => {
      if (document.hidden) {
        paused = true;
        cancelAnimationFrame(rafIdRef.current);
      } else if (paused) {
        paused = false;
        rafIdRef.current = requestAnimationFrame(animate);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    rafIdRef.current = requestAnimationFrame(animate);

    Promise.resolve().then(() => {
      (window as any).lenis = lenis;
      setLenisInstance(lenis);
    });

    const refreshScrollTriggers = () => ScrollTrigger.refresh();
    window.addEventListener("load", refreshScrollTriggers, { once: true });

    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts?.ready
        .then(() => {
          refreshScrollTriggers();
        })
        .catch(() => {
          /* ignore font readiness errors */
        });
    }

    return () => {
      cancelAnimationFrame(rafIdRef.current);
      lenis.destroy();
      window.removeEventListener("load", refreshScrollTriggers);
      document.removeEventListener("visibilitychange", handleVisibility);
      delete (window as any).lenis;
      setLenisInstance(null);
    };
  }, []);

  return (
    <LenisContext.Provider value={lenisInstance}>
      <div className="smooth-scroll-wrapper">{children}</div>
    </LenisContext.Provider>
  );
};

export default SmoothScrollProvider;
