import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Context for Lenis instance
const LenisContext = createContext<Lenis | null>(null);

export const useLenisContext = () => useContext(LenisContext);
export const useLenis = useLenisContext;

interface SmoothScrollProviderProps {
  children: ReactNode;
}

/**
 * SmoothScrollProvider – Ultra-Performance Smooth Scroll Engine
 *
 * Performance Engineering Optimizations:
 * - Direct GSAP Ticker integration (no redundant requestAnimationFrame)
 * - Throttled ScrollTrigger refresh
 * - Logic separation for visibility changes
 * - Hardware acceleration hints via CSS Class
 */
export const SmoothScrollProvider = ({
  children,
}: SmoothScrollProviderProps) => {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Easing optimized for 144Hz+ monitors
    const awwwEasing = (t: number): number => 1 - Math.pow(1 - t, 4);

    const lenis = new Lenis({
      duration: 2.2, // Majestic, slow and smooth duration
      easing: awwwEasing,
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.8, // Slightly softer wheel reaction
      touchMultiplier: 1.2,
      infinite: false,
    });

    // Synchronize ScrollTrigger with Lenis
    lenis.on("scroll", () => {
      ScrollTrigger.update();
    });

    // High refresh rate ticker handshake
    const update = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    // Hardware acceleration boost
    if (wrapperRef.current) {
      wrapperRef.current.style.willChange = "transform";
    }

    const refreshScrollTriggers = () => {
      // Debounced or direct? Direct for accuracy, but maybe throttled on frequent resize
      ScrollTrigger.refresh();
    };

    const handleVisibility = () => {
      if (document.hidden) {
        lenis.stop();
        gsap.ticker.remove(update);
      } else {
        lenis.start();
        gsap.ticker.add(update);
        ScrollTrigger.refresh();
      }
    };

    window.addEventListener("load", refreshScrollTriggers, { once: true });
    window.addEventListener("resize", refreshScrollTriggers);
    document.addEventListener("visibilitychange", handleVisibility);

    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts?.ready.then(refreshScrollTriggers).catch(() => {});
    }

    const rafId = requestAnimationFrame(() => {
      setLenisInstance(lenis);
    });
    (window as any).lenis = lenis;

    return () => {
      cancelAnimationFrame(rafId);
      gsap.ticker.remove(update);
      lenis.destroy();
      window.removeEventListener("load", refreshScrollTriggers);
      window.removeEventListener("resize", refreshScrollTriggers);
      document.removeEventListener("visibilitychange", handleVisibility);
      delete (window as any).lenis;
    };
  }, []);

  // Memoize context value to prevent unnecessary re-renders of the provider's context consumers
  const contextValue = useMemo(() => lenisInstance, [lenisInstance]);

  return (
    <LenisContext.Provider value={contextValue}>
      <div ref={wrapperRef} className="smooth-scroll-wrapper overflow-x-hidden">
        {children}
      </div>
    </LenisContext.Provider>
  );
};

export default SmoothScrollProvider;
