import { useLayoutEffect, RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger if not already registered
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface AnimationConfig {
  targets: any; // Pozwalamy na elastyczność w celach animacji
  fromVars?: gsap.TweenVars;
  toVars: gsap.TweenVars;
  delay?: number; // Dodajemy opcjonalny top-level delay dla wygody
  scrollTrigger?: Omit<ScrollTrigger.Vars, "trigger"> & {
    trigger?: string | Element | null | (() => Element | null | undefined);
  };
}

/**
 * useScrollAnimation - Advanced GSAP Scrollytelling Hook
 * Optimized for GPU acceleration and smooth orchestration.
 */
export const useScrollAnimation = (
  containerRef: RefObject<HTMLElement | null>,
  animations: AnimationConfig[],
  deps: any[] = [],
) => {
  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      animations.forEach((anim) => {
        const target =
          typeof anim.targets === "function" ? anim.targets() : anim.targets;
        if (!target) return;

        // Rozwiązujemy trigger - jeśli jest funkcją, wywołujemy ją,
        // w przeciwnym razie używamy podanego triggera lub kontenera
        let resolvedTrigger: any = containerRef.current;
        if (anim.scrollTrigger?.trigger) {
          resolvedTrigger =
            typeof anim.scrollTrigger.trigger === "function"
              ? anim.scrollTrigger.trigger()
              : anim.scrollTrigger.trigger;
        }

        const config = {
          ...anim.toVars,
          delay: anim.delay !== undefined ? anim.delay : anim.toVars.delay,
          scrollTrigger: anim.scrollTrigger
            ? {
                ...anim.scrollTrigger,
                trigger: resolvedTrigger,
                // Domyślny start jeśli nie podano
                start: anim.scrollTrigger.start || "top 80%",
              }
            : undefined,
        };

        if (anim.fromVars) {
          gsap.fromTo(target, anim.fromVars, config);
        } else {
          gsap.to(target, config);
        }
      });
    }, containerRef);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, ...deps]);
};

/**
 * Standard Entrance Animation Presets
 */
export const entranceAnimation = (stagger = 0.15): AnimationConfig[] => [
  {
    targets: ".reveal-element",
    fromVars: {
      y: 50,
      opacity: 0,
    },
    toVars: {
      y: 0,
      opacity: 1,
      duration: 1.2,
      ease: "power3.out",
      stagger: stagger,
    },
    scrollTrigger: {
      start: "top 85%",
      toggleActions: "play none none reverse",
    },
  },
];
