/**
 * useScrollAnimation - Hook for component-level scroll animations
 * 
 * Provides a clean way to create "Construction on Scroll" animations
 * with proper cleanup on unmount to prevent memory leaks.
 * 
 * OPTIMIZATIONS (v2):
 * - gsap.context() scoping guarantees automatic revert() of ALL child tweens/timelines
 * - Deduplicated ScrollTrigger config resolution via resolveScrollTrigger()
 * - Font-ready gating for SplitText to prevent layout shifts
 * - All animations use GPU-accelerated properties (x, y, scale, rotation)
 */

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsapConfig';

type AnimationTarget = string | HTMLElement | Element | null | React.RefObject<any> | (() => any);
type ScrollTriggerConfig = {
  trigger?: AnimationTarget;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  markers?: boolean;
  pin?: boolean;
  pinSpacing?: boolean;
  toggleActions?: string;
  once?: boolean;
  onEnter?: () => void;
  onLeave?: () => void;
  onEnterBack?: () => void;
  onLeaveBack?: () => void;
};

interface AnimationConfig {
  targets: AnimationTarget | AnimationTarget[];
  fromVars?: gsap.TweenVars;
  toVars: gsap.TweenVars;
  scrollTrigger?: ScrollTriggerConfig;
  stagger?: number | object;
  delay?: number;
  timeline?: boolean;
  constructionEffect?: 'draw' | 'build' | 'reveal' | 'type' | 'fade' | string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────

/**
 * Resolve any AnimationTarget variant to a concrete DOM reference.
 */
const resolveTarget = (target: AnimationTarget | AnimationTarget[] | undefined): any => {
  if (target === undefined || target === null) return null;
  if (Array.isArray(target)) return target.map(t => resolveTarget(t));
  if (typeof target === 'function') return target();
  if (typeof target === 'object' && 'current' in target) return (target as React.RefObject<any>).current;
  return target;
};

/**
 * Build a GSAP-compatible scrollTrigger config from our typed config,
 * reusing the same resolution logic everywhere.
 */
const resolveScrollTrigger = (
  cfg: ScrollTriggerConfig,
  fallbackTrigger: HTMLElement
): ScrollTrigger.Vars => ({
  trigger: resolveTarget(cfg.trigger) || fallbackTrigger,
  start: cfg.start || 'top 80%',
  end: cfg.end || 'bottom 20%',
  scrub: cfg.scrub !== undefined ? cfg.scrub : false,
  markers: cfg.markers || false,
  pin: cfg.pin || false,
  pinSpacing: cfg.pinSpacing !== undefined ? cfg.pinSpacing : true,
  toggleActions: cfg.toggleActions || 'play none none none',
  onEnter: cfg.onEnter,
  onLeave: cfg.onLeave,
  onEnterBack: cfg.onEnterBack,
  onLeaveBack: cfg.onLeaveBack,
});

/**
 * Apply construction-effect presets — merges defaults INTO user-provided vars
 * so explicit caller values always win.
 */
const applyConstructionPreset = (
  effect: string | undefined,
  fromVars: gsap.TweenVars,
  toVars: gsap.TweenVars
): { from: gsap.TweenVars; to: gsap.TweenVars } => {
  if (!effect) return { from: fromVars, to: toVars };

  const presets: Record<string, { from: gsap.TweenVars; to: gsap.TweenVars }> = {
    draw: {
      from: { drawSVG: '0%', opacity: 0 },
      to: { drawSVG: '100%', opacity: 1, duration: 1.5, ease: 'power2.inOut' },
    },
    build: {
      from: { scale: 0.8, opacity: 0, y: 50 },
      to: { scale: 1, opacity: 1, y: 0, duration: 1.2, ease: 'expo.out' },
    },
    reveal: {
      from: { clipPath: 'inset(0% 0% 100% 0%)', y: 50 },
      to: { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 1.3, ease: 'power3.out' },
    },
    type: {
      from: { width: '0%' },
      to: { width: '100%', duration: 2, ease: 'steps(30)' },
    },
    fade: {
      from: { opacity: 0, y: 30 },
      to: { opacity: 1, y: 0, duration: 1, ease: 'power2.out' },
    },
  };

  const preset = presets[effect];
  if (!preset) return { from: fromVars, to: toVars };

  return {
    from: { ...preset.from, ...fromVars },
    to: { ...preset.to, ...toVars },
  };
};

// ─── Main Hook ────────────────────────────────────────────────────────────

/**
 * Hook for creating scroll-based animations with proper cleanup.
 * 
 * All tweens/timelines created inside the callback are automatically
 * registered with gsap.context() and reverted on unmount.
 */
export const useScrollAnimation = (
  containerRef: React.RefObject<HTMLElement | null>,
  animations: (AnimationConfig | null | undefined)[],
  dependencies: any[] = []
) => {
  const ctxRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // gsap.context() scopes ALL child tweens/timelines for automatic revert()
    const ctx = gsap.context(() => {
      animations.forEach((animation) => {
        if (!animation) return;

        const {
          targets,
          fromVars,
          toVars,
          scrollTrigger,
          stagger,
          delay,
          timeline,
          constructionEffect,
        } = animation;

        const resolvedTargets = resolveTarget(targets);
        if (!resolvedTargets) return;

        // Merge construction-effect presets with user vars
        const { from: finalFrom, to: finalTo } = applyConstructionPreset(
          constructionEffect,
          { ...(fromVars || {}) },
          { ...toVars }
        );

        // Build ScrollTrigger config (if any)
        const stConfig = scrollTrigger
          ? resolveScrollTrigger(scrollTrigger, container)
          : undefined;

        // Shared tween vars
        const sharedVars: gsap.TweenVars = {
          ...finalTo,
          stagger,
          delay: delay || 0,
        };

        if (timeline) {
          // ── Timeline path ──
          const tl = gsap.timeline({
            scrollTrigger: stConfig,
          });

          if (fromVars) {
            tl.fromTo(resolvedTargets, finalFrom, sharedVars);
          } else {
            tl.to(resolvedTargets, sharedVars);
          }
        } else {
          // ── Direct tween path ──
          const tweenVars: gsap.TweenVars = {
            ...sharedVars,
            scrollTrigger: stConfig,
          };

          if (fromVars) {
            gsap.fromTo(resolvedTargets, finalFrom, tweenVars);
          } else {
            gsap.to(resolvedTargets, tweenVars);
          }
        }
      });
    }, containerRef); // scope to container — all selectors resolve inside it

    ctxRef.current = ctx;

    // Cleanup: revert() kills all tweens + ScrollTriggers created in this context
    return () => {
      ctxRef.current?.revert();
      ctxRef.current = null;
    };
  }, [containerRef, ...dependencies]);

  return {
    refresh: () => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        ScrollTrigger.refresh();
      });
    },
  };
};

/**
 * Utility for creating text splitting animations.
 * Waits for document.fonts.ready to prevent layout shifts from FOUT.
 */
export const useSplitText = (
  containerRef: React.RefObject<HTMLElement>,
  selector: string,
  options: {
    type?: string;
    linesClass?: string;
    charsClass?: string;
    wordsClass?: string;
    autoSplit?: boolean;
  } = {}
) => {
  const splitTextRef = useRef<any[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;

    const init = async () => {
      // ── Gate: wait for fonts to load to prevent layout shifts ──
      try {
        await document.fonts.ready;
      } catch {
        // fonts.ready not supported — proceed anyway
      }

      if (cancelled) return;

      const SplitText =
        (window as any).SplitText || (gsap as any).SplitText;

      if (!SplitText) {
        console.warn('SplitText plugin not found. Make sure it is loaded.');
        return;
      }

      const elements = container.querySelectorAll(selector);
      if (elements.length === 0) return;

      const splits = Array.from(elements).map((element) =>
        new SplitText(element, {
          type: options.type || 'chars,words,lines',
          linesClass: options.linesClass || 'split-line',
          charsClass: options.charsClass || 'split-char',
          wordsClass: options.wordsClass || 'split-word',
          ...(options.autoSplit !== false ? { autoSplit: true } : {}),
        })
      );

      splitTextRef.current = splits;
    };

    void init();

    return () => {
      cancelled = true;
      // Revert all split instances to restore original DOM
      splitTextRef.current.forEach((split) => {
        if (split && typeof split.revert === 'function') {
          split.revert();
        }
      });
      splitTextRef.current = [];
    };
  }, [containerRef, selector]);

  return splitTextRef;
};

export default useScrollAnimation;
