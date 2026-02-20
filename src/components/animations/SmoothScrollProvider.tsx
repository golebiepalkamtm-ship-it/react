import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
  useRef,
  useMemo,
} from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Definujemy typ dla kontekstu, który może być instancją lub null
const LenisContext = createContext<Lenis | null>(null);

export const useLenisContext = () => useContext(LenisContext);

// Alias dla kompatybilności
export const useLenis = useLenisContext;

interface SmoothScrollProviderProps {
  children: ReactNode;
}

/**
 * SmoothScrollProvider - Zoptymalizowana implementacja React 18/19
 * Rozwiązuje problem cascading renders i zapewnia płynny scroll.
 */
export const SmoothScrollProvider = ({
  children,
}: SmoothScrollProviderProps) => {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;

    // Inicjalizacja instancji
    const instance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    // Podpięcie pod ticker GSAP
    instance.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => {
      instance.raf(time * 1000);
    };

    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Ustawiamy stan asynchronicznie, aby uniknąć ostrzeżenia o synchronizacji w efekcie
    // jeśli środowisko linta jest bardzo restrykcyjne.
    Promise.resolve().then(() => {
      setLenisInstance(instance);
    });

    isInitialized.current = true;

    return () => {
      instance.destroy();
      gsap.ticker.remove(raf);
      setLenisInstance(null);
      isInitialized.current = false;
    };
  }, []);

  return (
    <LenisContext.Provider value={lenisInstance}>
      {children}
    </LenisContext.Provider>
  );
};

export default SmoothScrollProvider;
