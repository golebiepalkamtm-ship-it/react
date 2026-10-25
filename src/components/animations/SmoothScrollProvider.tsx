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
 * Zsynchronizowany zgodnie z oficjalną specyfikacją Lenis + GSAP ScrollTrigger:
 * - Bezpośrednia integracja z gsap.ticker (lagSmoothing(0) zapobiega skokom przy szybkim scrollu)
 * - Automatyczny ResizeObserver odświeżający pozycje ScrollTrigger po dociągnięciu sekcji Lazy/Suspense
 * - Obsługa płynnego przewijania dla linków kotwicowych (#hash)
 */
export const SmoothScrollProvider = ({
  children,
}: SmoothScrollProviderProps) => {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Interpolacja liniowa (lerp) zamiast krzywej easeOutExpo:
    // easeOutExpo wyrzucał ~70% dystansu w pierwszych klatkach każdego „ząbka” kółka
    // (odczuwalne jako przeskok). Lerp daje ciężki, jednostajnie wygasający ruch.
    const lenis = new Lenis({
      lerp: prefersReducedMotion ? 1 : 0.045,
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: !prefersReducedMotion,
      wheelMultiplier: 0.6,
      touchMultiplier: 1.0,
      infinite: false,
    });

    // Synchronize ScrollTrigger on every Lenis scroll frame
    lenis.on("scroll", ScrollTrigger.update);

    // High refresh rate ticker handshake (Lenis + GSAP official pattern)
    const update = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    // Debounced ScrollTrigger refresh for lazy-loaded sections and layout shifts
    let refreshTimer: number | null = null;
    const scheduleRefresh = () => {
      if (refreshTimer !== null) {
        window.clearTimeout(refreshTimer);
      }
      refreshTimer = window.setTimeout(() => {
        ScrollTrigger.refresh();
      }, 120);
    };

    // Observe layout changes caused by React.lazy / Suspense / async images
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && wrapperRef.current) {
      resizeObserver = new ResizeObserver(() => {
        scheduleRefresh();
      });
      resizeObserver.observe(wrapperRef.current);
    }

    // Intercept in-page anchor clicks (#about, #contact, etc.) for smooth Lenis scrolling
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!anchor) return;
      const hash = anchor.getAttribute("href");
      if (!hash || hash === "#") return;
      const el = document.querySelector(hash) as HTMLElement | null;
      if (el) {
        e.preventDefault();
        lenis.scrollTo(el, {
          offset: -80,
          duration: 2.4,
          easing: (t: number) =>
            t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
        });
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        lenis.stop();
        gsap.ticker.remove(update);
      } else {
        lenis.start();
        gsap.ticker.add(update);
        scheduleRefresh();
      }
    };

    window.addEventListener("load", scheduleRefresh, { once: true });
    window.addEventListener("resize", scheduleRefresh, { passive: true });
    document.addEventListener("click", handleAnchorClick);
    document.addEventListener("visibilitychange", handleVisibility);

    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts?.ready.then(scheduleRefresh).catch(() => {});
    }

    const rafId = requestAnimationFrame(() => {
      setLenisInstance(lenis);
    });
    (window as any).lenis = lenis;

    return () => {
      cancelAnimationFrame(rafId);
      if (refreshTimer !== null) {
        window.clearTimeout(refreshTimer);
      }
      resizeObserver?.disconnect();
      gsap.ticker.remove(update);
      lenis.off("scroll", ScrollTrigger.update);
      lenis.destroy();
      window.removeEventListener("load", scheduleRefresh);
      window.removeEventListener("resize", scheduleRefresh);
      document.removeEventListener("click", handleAnchorClick);
      document.removeEventListener("visibilitychange", handleVisibility);
      delete (window as any).lenis;
    };
  }, []);

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
