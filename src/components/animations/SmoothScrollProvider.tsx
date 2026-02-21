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
    // Inicjalizacja Lenis z premium, dopieszczonymi parametrami
    const lenis = new Lenis({
      // 2.2s = bardzo powolny, filmowy scroll
      duration: 2.2,
      // Eksponencjalna krzywa zwalniania - premium feel
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      // Niski mnożnik = wolniejsza reakcja na kółko
      wheelMultiplier: 0.6,
      // Płynny scroll na mobile
      touchMultiplier: 1.4,
    });

    // Synchronizacja ScrollTrigger z pozycją scrolla Lenis
    lenis.on("scroll", ScrollTrigger.update);

    // Eliminacja lag smoothing - krytyczne dla precyzji ScrollTrigger
    gsap.ticker.lagSmoothing(0);

    // Własna pętla rAF - Lenis.raf() oczekuje DOMHighResTimeStamp (ms).
    // rAF callback dostaje czas w ms od performance.timeOrigin — dokładnie
    // to czego Lenis potrzebuje.
    const animate = (time: number) => {
      lenis.raf(time);
      rafIdRef.current = requestAnimationFrame(animate);
    };

    rafIdRef.current = requestAnimationFrame(animate);

    // Udostępniamy instancję przez kontekst asynchronicznie,
    // by uniknąć synchronicznego setState w efekcie
    Promise.resolve().then(() => setLenisInstance(lenis));

    return () => {
      cancelAnimationFrame(rafIdRef.current);
      lenis.destroy();
      setLenisInstance(null);
    };
  }, []);

  return (
    <LenisContext.Provider value={lenisInstance}>
      {children}
    </LenisContext.Provider>
  );
};

export default SmoothScrollProvider;
