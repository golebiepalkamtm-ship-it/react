/**
 * useScrollAnimation - Hook for component-level scroll animations
 * 
 * Provides a clean way to create "Construction on Scroll" animations
 * with proper cleanup on unmount to prevent memory leaks.
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

/**
 * Hook for creating scroll-based animations with proper cleanup
 */
export const useScrollAnimation = (
  containerRef: React.RefObject<HTMLElement | null>,
  animations: (AnimationConfig | null | undefined)[],
  dependencies: any[] = []
) => {
  const animationsRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create GSAP context for proper cleanup
    const ctx = gsap.context(() => {
      animations.forEach((animation) => {
        if (!animation) return;
        
        // Type assertion to handle null/undefined safely
        const { targets, fromVars, toVars, scrollTrigger, stagger, delay, timeline, constructionEffect } = animation as AnimationConfig;
        
        // Resolve targets if it's a function or RefObject
        const resolvedTargets = typeof targets === 'function' ? targets() : 
                              targets && typeof targets === 'object' && 'current' in targets ? targets.current : 
                              targets;
        
        // Skip if no valid targets
        if (!resolvedTargets) return;
        
        // Apply construction effect presets if specified
        let finalFromVars = { ...(fromVars || {}) };
        let finalToVars = { ...toVars };
        
        if (constructionEffect) {
          switch (constructionEffect) {
            case 'draw':
              finalFromVars = { 
                drawSVG: "0%", 
                opacity: 0,
                ...finalFromVars 
              };
              finalToVars = { 
                drawSVG: "100%", 
                opacity: 1, 
                duration: finalToVars.duration || 1.5,
                ease: finalToVars.ease || "power2.inOut",
                ...finalToVars 
              };
              break;
            case 'build':
              finalFromVars = { 
                scale: 0.8, 
                opacity: 0, 
                y: 50,
                ...finalFromVars 
              };
              finalToVars = { 
                scale: 1, 
                opacity: 1, 
                y: 0, 
                duration: finalToVars.duration || 1.2,
                ease: finalToVars.ease || "expo.out",
                ...finalToVars 
              };
              break;
            case 'reveal':
              finalFromVars = { 
                clipPath: "inset(0% 0% 100% 0%)", 
                y: 50,
                ...finalFromVars 
              };
              finalToVars = { 
                clipPath: "inset(0% 0% 0% 0%)", 
                y: 0, 
                duration: finalToVars.duration || 1.3,
                ease: finalToVars.ease || "power3.out",
                ...finalToVars 
              };
              break;
            case 'type':
              // For text elements - simulates typing effect
              finalFromVars = { 
                width: "0%", 
                ...finalFromVars 
              };
              finalToVars = { 
                width: "100%", 
                duration: finalToVars.duration || 2,
                ease: finalToVars.ease || "steps(30)",
                ...finalToVars 
              };
              break;
            case 'fade':
              finalFromVars = { 
                opacity: 0, 
                y: 30,
                ...finalFromVars 
              };
              finalToVars = { 
                opacity: 1, 
                y: 0, 
                duration: finalToVars.duration || 1,
                ease: finalToVars.ease || "power2.out",
                ...finalToVars 
              };
              break;
          }
        }

        // Create animation
        if (timeline) {
          const tl = gsap.timeline({
            scrollTrigger: scrollTrigger ? {
              trigger: (() => {
                const trigger = scrollTrigger.trigger;
                if (typeof trigger === 'function') return trigger();
                if (typeof trigger === 'string') return trigger;
                if (typeof trigger === 'object' && trigger && 'current' in trigger) return trigger.current;
                return trigger || container;
              })(),
              start: scrollTrigger.start || "top 80%",
              end: scrollTrigger.end || "bottom 20%",
              scrub: scrollTrigger.scrub !== undefined ? scrollTrigger.scrub : false,
              markers: scrollTrigger.markers || false,
              pin: scrollTrigger.pin || false,
              pinSpacing: scrollTrigger.pinSpacing !== undefined ? scrollTrigger.pinSpacing : true,
              toggleActions: scrollTrigger.toggleActions || "play none none none",
              onEnter: scrollTrigger.onEnter,
              onLeave: scrollTrigger.onLeave,
              onEnterBack: scrollTrigger.onEnterBack,
              onLeaveBack: scrollTrigger.onLeaveBack,
            } : undefined
          });

          if (fromVars) {
            tl.fromTo(resolvedTargets, finalFromVars, {
              ...finalToVars,
              stagger: stagger,
              delay: delay || 0,
            });
          } else {
            tl.to(resolvedTargets, {
              ...finalToVars,
              stagger: stagger,
              delay: delay || 0,
            });
          }
        } else {
          if (fromVars) {
            gsap.fromTo(resolvedTargets, finalFromVars, {
              ...finalToVars,
              stagger: stagger,
              delay: delay || 0,
              scrollTrigger: scrollTrigger ? {
                trigger: (() => {
                  const trigger = scrollTrigger.trigger;
                  if (typeof trigger === 'function') return trigger();
                  if (typeof trigger === 'string') return trigger;
                  if (typeof trigger === 'object' && trigger && 'current' in trigger) return trigger.current;
                  return trigger || container;
                })(),
                start: scrollTrigger.start || "top 80%",
                end: scrollTrigger.end || "bottom 20%",
                scrub: scrollTrigger.scrub !== undefined ? scrollTrigger.scrub : false,
                markers: scrollTrigger.markers || false,
                pin: scrollTrigger.pin || false,
                pinSpacing: scrollTrigger.pinSpacing !== undefined ? scrollTrigger.pinSpacing : true,
                toggleActions: scrollTrigger.toggleActions || "play none none none",
                onEnter: scrollTrigger.onEnter,
                onLeave: scrollTrigger.onLeave,
                onEnterBack: scrollTrigger.onEnterBack,
                onLeaveBack: scrollTrigger.onLeaveBack,
              } : undefined
            });
          } else {
            gsap.to(resolvedTargets, {
              ...finalToVars,
              stagger: stagger,
              delay: delay || 0,
              scrollTrigger: scrollTrigger ? {
                trigger: (() => {
                  const trigger = scrollTrigger.trigger;
                  if (typeof trigger === 'function') return trigger();
                  if (typeof trigger === 'string') return trigger;
                  if (typeof trigger === 'object' && trigger && 'current' in trigger) return trigger.current;
                  return trigger || container;
                })(),
                start: scrollTrigger.start || "top 80%",
                end: scrollTrigger.end || "bottom 20%",
                scrub: scrollTrigger.scrub !== undefined ? scrollTrigger.scrub : false,
                markers: scrollTrigger.markers || false,
                pin: scrollTrigger.pin || false,
                pinSpacing: scrollTrigger.pinSpacing !== undefined ? scrollTrigger.pinSpacing : true,
                toggleActions: scrollTrigger.toggleActions || "play none none none",
                onEnter: scrollTrigger.onEnter,
                onLeave: scrollTrigger.onLeave,
                onEnterBack: scrollTrigger.onEnterBack,
                onLeaveBack: scrollTrigger.onLeaveBack,
              } : undefined
            });
          }
        }
      });
    }, containerRef);

    animationsRef.current = ctx;

    // Cleanup function
    return () => {
      if (animationsRef.current) {
        animationsRef.current.revert(); // This properly cleans up all GSAP animations
      }
    };
  }, [containerRef, ...dependencies]);

  return {
    refresh: () => {
      gsap.utils.toArray("ScrollTrigger").forEach((trigger: any) => {
        trigger.refresh();
      });
    }
  };
};

/**
 * Utility for creating text splitting animations
 */
export const useSplitText = (
  containerRef: React.RefObject<HTMLElement>,
  selector: string,
  options: {
    type?: string;
    linesClass?: string;
    charsClass?: string;
    wordsClass?: string;
  } = {}
) => {
  const splitTextRef = useRef<any>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Import SplitText dynamically to avoid SSR issues
    const importSplitText = async () => {
      try {
        // Check if SplitText is already available globally
        const SplitText = (window as any).SplitText || (gsap as any).SplitText;
        
        if (SplitText) {
          const elements = container.querySelectorAll(selector);
          if (elements.length === 0) return;

          const splits = Array.from(elements).map(element => {
            return new SplitText(element, {
              type: options.type || "chars,words,lines",
              linesClass: options.linesClass || "split-line",
              charsClass: options.charsClass || "split-char",
              wordsClass: options.wordsClass || "split-word",
            });
          });

          splitTextRef.current = splits;
        } else {
          console.warn('SplitText plugin not found. Make sure it is loaded.');
        }
      } catch (error) {
        console.error('Error initializing SplitText:', error);
      }
    };

    void importSplitText();

    return () => {
      // Cleanup split text
      if (splitTextRef.current) {
        splitTextRef.current.forEach((split: any) => {
          if (split && typeof split.revert === 'function') {
            split.revert();
          }
        });
      }
    };
  }, [containerRef, selector]);

  return splitTextRef;
};

export default useScrollAnimation;
