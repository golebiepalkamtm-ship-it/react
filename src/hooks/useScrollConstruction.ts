/**
 * useScrollConstruction Hook
 * 
 * Awwwards-level "construction on scroll" effects
 * Elements don't just "enter" - they BUILD as you scroll
 * 
 * Features:
 * - SVG path drawing (stroke-dashoffset)
 * - Text character-by-character reveal
 * - Clip-path progressive reveal
 * - Scale + opacity synchronized to scroll position
 */

import { useEffect, useRef, RefObject } from 'react';
import { gsap } from '@/lib/gsapConfig';

interface ConstructionConfig {
  trigger: RefObject<HTMLElement | null>;
  scrub?: boolean | number;
  start?: string;
  end?: string;
  markers?: boolean;
}

/**
 * SVG Line Drawing Effect
 * Draws SVG paths as user scrolls
 */
export const useSVGDrawing = (
  svgRef: RefObject<SVGSVGElement | null>,
  config: ConstructionConfig
) => {
  useEffect(() => {
    const svg = svgRef.current;
    const trigger = config.trigger.current;
    if (!svg || !trigger) return;

    const paths = svg.querySelectorAll('path, line, polyline, polygon');
    
    const ctx = gsap.context(() => {
      paths.forEach((path) => {
        const length = (path as SVGGeometryElement).getTotalLength?.() || 0;
        
        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });

        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: trigger,
            start: config.start || 'top 80%',
            end: config.end || 'top 20%',
            scrub: config.scrub !== undefined ? config.scrub : 1,
            markers: config.markers,
          },
        });
      });
    }, svg);

    return () => ctx.revert();
  }, [svgRef, config]);
};

/**
 * Text Character Reveal
 * Reveals text character by character synchronized with scroll
 */
export const useTextConstruction = (
  textRef: RefObject<HTMLElement | null>,
  config: ConstructionConfig
) => {
  useEffect(() => {
    const element = textRef.current;
    const trigger = config.trigger.current;
    if (!element || !trigger) return;

    const text = element.textContent || '';
    const chars = text.split('');
    
    // Wrap each character in span
    element.innerHTML = chars
      .map((char) => `<span class="char" style="display: inline-block;">${char === ' ' ? '&nbsp;' : char}</span>`)
      .join('');

    const charElements = element.querySelectorAll('.char');

    const ctx = gsap.context(() => {
      gsap.set(charElements, {
        opacity: 0,
        y: 20,
        rotateX: -90,
      });

      gsap.to(charElements, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        stagger: 0.02,
        duration: 0.5,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: trigger,
          start: config.start || 'top 75%',
          end: config.end || 'top 25%',
          scrub: config.scrub !== undefined ? config.scrub : 0.5,
          markers: config.markers,
        },
      });
    }, element);

    return () => {
      ctx.revert();
      element.textContent = text; // Restore original text
    };
  }, [textRef, config]);
};

/**
 * Clip-Path Progressive Reveal
 * Elements reveal via animated clip-path (like a mask being removed)
 */
export const useClipPathReveal = (
  elementRef: RefObject<HTMLElement | null>,
  config: ConstructionConfig & { direction?: 'vertical' | 'horizontal' | 'radial' }
) => {
  useEffect(() => {
    const element = elementRef.current;
    const trigger = config.trigger.current;
    if (!element || !trigger) return;

    const direction = config.direction || 'vertical';
    
    let fromClip: string;
    let toClip: string;

    switch (direction) {
      case 'horizontal':
        fromClip = 'inset(0% 100% 0% 0%)';
        toClip = 'inset(0% 0% 0% 0%)';
        break;
      case 'radial':
        fromClip = 'circle(0% at 50% 50%)';
        toClip = 'circle(100% at 50% 50%)';
        break;
      case 'vertical':
      default:
        fromClip = 'inset(100% 0% 0% 0%)';
        toClip = 'inset(0% 0% 0% 0%)';
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        element,
        { clipPath: fromClip, opacity: 0 },
        {
          clipPath: toClip,
          opacity: 1,
          duration: 1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: trigger,
            start: config.start || 'top 80%',
            end: config.end || 'top 30%',
            scrub: config.scrub !== undefined ? config.scrub : 1,
            markers: config.markers,
          },
        }
      );
    }, element);

    return () => ctx.revert();
  }, [elementRef, config]);
};

/**
 * Image Scale Construction
 * Images build from scale + clip-path for dramatic reveal
 */
export const useImageConstruction = (
  imageRef: RefObject<HTMLImageElement | null>,
  config: ConstructionConfig
) => {
  useEffect(() => {
    const image = imageRef.current;
    const trigger = config.trigger.current;
    if (!image || !trigger) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        image,
        {
          scale: 1.3,
          clipPath: 'inset(20% 20% 20% 20%)',
          opacity: 0,
        },
        {
          scale: 1,
          clipPath: 'inset(0% 0% 0% 0%)',
          opacity: 1,
          duration: 1.5,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: trigger,
            start: config.start || 'top 80%',
            end: config.end || 'top 20%',
            scrub: config.scrub !== undefined ? config.scrub : 1.5,
            markers: config.markers,
          },
        }
      );
    }, image);

    return () => ctx.revert();
  }, [imageRef, config]);
};

/**
 * Counter Construction
 * Numbers build up synchronized with scroll
 */
export const useCounterConstruction = (
  counterRef: RefObject<HTMLElement | null>,
  config: ConstructionConfig & { start: number; end: number; suffix?: string }
) => {
  useEffect(() => {
    const element = counterRef.current;
    const trigger = config.trigger.current;
    if (!element || !trigger) return;

    const counter = { value: config.start };

    const ctx = gsap.context(() => {
      gsap.to(counter, {
        value: config.end,
        duration: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: trigger,
          start: config.start || 'top 75%',
          end: config.end || 'top 25%',
          scrub: config.scrub !== undefined ? config.scrub : 1,
          markers: config.markers,
          onUpdate: () => {
            element.textContent = Math.round(counter.value) + (config.suffix || '');
          },
        },
      });
    }, element);

    return () => ctx.revert();
  }, [counterRef, config]);
};

/**
 * Stagger Construction
 * Multiple elements build in sequence as scroll progresses
 */
export const useStaggerConstruction = (
  containerRef: RefObject<HTMLElement | null>,
  config: ConstructionConfig & { selector: string; stagger?: number }
) => {
  useEffect(() => {
    const container = containerRef.current;
    const trigger = config.trigger.current;
    if (!container || !trigger) return;

    const elements = container.querySelectorAll(config.selector);
    if (elements.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        elements,
        {
          opacity: 0,
          y: 60,
          scale: 0.9,
          rotateX: 45,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotateX: 0,
          stagger: config.stagger || 0.1,
          duration: 1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: trigger,
            start: config.start || 'top 80%',
            end: config.end || 'top 20%',
            scrub: config.scrub !== undefined ? config.scrub : 1,
            markers: config.markers,
          },
        }
      );
    }, container);

    return () => ctx.revert();
  }, [containerRef, config]);
};
