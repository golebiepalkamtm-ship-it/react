/**
 * SMOOTH SCROLL PROVIDER - LENIS + GSAP SCROLLTRIGGER (v2)
 * Awwwards-level smooth scrolling z pełną integracją GSAP
 *
 * OPTIMIZATIONS:
 * - Single animation loop: Lenis.raf is driven by gsap.ticker (no rAF duplication)
 * - Lenis.stop()/start() API exposed for modal integration
 * - Debounced resize handler to prevent ScrollTrigger spam
 * - Proper cleanup order: listeners → ticker → Lenis.destroy()
 * - lagSmoothing(0) for tightest Lenis↔ScrollTrigger sync
 */

import {
  ReactNode,
  useEffect,
  createContext,
  useContext,
  useRef,
  useCallback,
} from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsapConfig";

interface LenisContextValue {
  getLenis: () => Lenis | null;
  isReduced: boolean;
  /** Block Lenis scrolling (e.g. when a modal is open) */
  stopScroll: () => void;
  /** Resume Lenis scrolling */
  startScroll: () => void;
}

const LenisContext = createContext<LenisContextValue>({
  getLenis: () => null,
  isReduced: false,
  stopScroll: () => {},
  startScroll: () => {},
});

export const useLenisContext = () => useContext(LenisContext);
// Keep backward-compatible alias
export const useLenis = () => useContext(LenisContext);

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export const SmoothScrollProvider = ({
  children,
}: SmoothScrollProviderProps) => {
  const lenisRef = useRef<Lenis | null>(null);

  // Check reduced motion preference
  const isReduced =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  useEffect(() => {
    if (isReduced) {
      document.documentElement.classList.add("reduced-motion");
      return;
    }

    // ── Initialize Lenis ──────────────────────────────────────────────
    const lenis = new Lenis({
      lerp: 0.05, // Slower, more buttery smooth feel
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0, // Natural scroll speed
      touchMultiplier: 1.5, // Better balance for mobile
      infinite: false,
    });

    lenisRef.current = lenis;

    // Expose for debugging
    if (typeof window !== "undefined") {
      (window as any).lenis = lenis;
    }

    // ── Sync Lenis → ScrollTrigger ───────────────────────────────────
    // On every Lenis scroll event, update ScrollTrigger positions.
    // This is the ONLY scroll sync — no duplicate rAF loops.
    const scrollUpdate = () => {
      ScrollTrigger.update();
    };
    lenis.on("scroll", scrollUpdate);

    // ── Drive Lenis from GSAP ticker (single loop) ──────────────────
    // gsap.ticker runs at display refresh rate (60/120/144 Hz).
    // Driving Lenis from it avoids a separate requestAnimationFrame loop.
    const rafHandler = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(rafHandler);

    // Disable GSAP's lag smoothing so ticker and Lenis stay in lock-step
    gsap.ticker.lagSmoothing(0);

    // ── Delayed initial refresh ─────────────────────────────────────
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh(true);
    }, 300);

    return () => {
      // 1. Remove Lenis scroll listener
      lenis.off("scroll", scrollUpdate);
      // 2. Remove from GSAP ticker
      gsap.ticker.remove(rafHandler);
      // 3. Clear timeout
      clearTimeout(refreshTimer);
      // 4. Destroy Lenis
      lenis.destroy();
      lenisRef.current = null;
      // 5. Clean window reference
      if (typeof window !== "undefined") {
        (window as any).lenis = null;
      }
    };
  }, [isReduced]);

  // ── Debounced resize handler ──────────────────────────────────────
  useEffect(() => {
    if (isReduced) return;

    let resizeTimer: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (lenisRef.current) {
          ScrollTrigger.refresh(true);
        }
      }, 150);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, [isReduced]);

  // ── Public API ────────────────────────────────────────────────────
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
