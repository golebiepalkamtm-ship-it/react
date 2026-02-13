/**
 * ============================================================================
 * MAGNETIC CURSOR - Premium Micro-Interactions (v2 — quickTo)
 * ============================================================================
 * 
 * Efekt magnetycznego kursora z physics-based motion.
 * Elementy "przyciągają" kursor tworząc subtelną interakcję.
 *
 * OPTIMIZATIONS:
 * - gsap.quickTo() replaces gsap.to() per mousemove — eliminates tween
 *   allocation overhead for 120 FPS mouse tracking.
 * - will-change: transform applied during hover only (saves compositing
 *   memory when idle).
 * - Cleanup properly removes will-change to release GPU layers.
 */

import React, { useRef, useEffect, ReactNode, useCallback } from 'react';
import { gsap } from '@/lib/gsapConfig';

interface MagneticElementProps {
  children: ReactNode;
  className?: string;
  strength?: number;
  ease?: number;
  as?: keyof React.JSX.IntrinsicElements;
  onHover?: () => void;
  onLeave?: () => void;
}

export const MagneticElement = ({
  children,
  className = '',
  strength = 0.3,
  ease = 0.1,
  as: Component = 'div',
  onHover,
  onLeave,
}: MagneticElementProps) => {
  const elementRef = useRef<HTMLElement>(null);
  const boundingRef = useRef<DOMRect | null>(null);
  // quickTo setters — created once, reused every frame
  const quickXRef = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const quickYRef = useRef<ReturnType<typeof gsap.quickTo> | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Create quickTo setters — these bypass tween allocation entirely
    // easing at expo.out with 0.3s duration for buttery 120 FPS tracking
    quickXRef.current = gsap.quickTo(element, 'x', {
      duration: 0.4,
      ease: 'expo.out',
    });
    quickYRef.current = gsap.quickTo(element, 'y', {
      duration: 0.4,
      ease: 'expo.out',
    });

    const handleMouseMove = (e: MouseEvent) => {
      if (!boundingRef.current || !quickXRef.current || !quickYRef.current) return;

      const { left, top, width, height } = boundingRef.current;
      const centerX = left + width / 2;
      const centerY = top + height / 2;

      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;

      // quickTo() updates the existing tween target — zero allocation
      quickXRef.current(deltaX);
      quickYRef.current(deltaY);
    };

    const handleMouseEnter = () => {
      boundingRef.current = element.getBoundingClientRect();
      // Apply will-change only during active interaction (saves GPU memory)
      element.style.willChange = 'transform';
      onHover?.();

      gsap.to(element, {
        scale: 1.05,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      boundingRef.current = null;
      onLeave?.();

      gsap.to(element, {
        x: 0,
        y: 0,
        scale: 1,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)',
        onComplete: () => {
          // Release GPU compositing layer when idle
          if (element) element.style.willChange = '';
        },
      });
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mousemove', handleMouseMove);

    return () => {
      element.style.willChange = '';
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mousemove', handleMouseMove);
      // Null out quickTo refs
      quickXRef.current = null;
      quickYRef.current = null;
    };
  }, [strength, ease, onHover, onLeave]);

  const ElementComponent = Component as any;
  
  return (
    <ElementComponent 
      ref={elementRef} 
      className={className}
      style={{ display: 'inline-block', transform: 'translateZ(0)' }}
    >
      {children}
    </ElementComponent>
  );
};

interface CursorFollowerProps {
  size?: number;
  color?: string;
  mixBlendMode?: string;
}

export const CursorFollower = ({
  size = 20,
  color = 'rgba(212, 175, 55, 0.5)',
  mixBlendMode = 'difference',
}: CursorFollowerProps) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const cursorDot = cursorDotRef.current;
    if (!cursor || !cursorDot) return;

    // quickTo for the outer ring — much more efficient than gsap.set per frame
    const quickCursorX = gsap.quickTo(cursor, 'x', { duration: 0.6, ease: 'expo.out' });
    const quickCursorY = gsap.quickTo(cursor, 'y', { duration: 0.6, ease: 'expo.out' });

    // quickTo for the inner dot
    const quickDotX = gsap.quickTo(cursorDot, 'x', { duration: 0.1, ease: 'power2.out' });
    const quickDotY = gsap.quickTo(cursorDot, 'y', { duration: 0.1, ease: 'power2.out' });

    const handleMouseMove = (e: MouseEvent) => {
      quickDotX(e.clientX);
      quickDotY(e.clientY);
      quickCursorX(e.clientX - size / 2);
      quickCursorY(e.clientY - size / 2);
    };

    const handleMouseEnter = () => {
      gsap.to([cursor, cursorDot], {
        opacity: 1,
        duration: 0.3,
      });
    };

    const handleMouseLeave = () => {
      gsap.to([cursor, cursorDot], {
        opacity: 0,
        duration: 0.3,
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    const hoverElements = document.querySelectorAll('a, button, [data-magnetic]');
    
    const handleHoverEnter = () => {
      gsap.to(cursor, {
        scale: 2,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleHoverLeave = () => {
      gsap.to(cursor, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    hoverElements.forEach((el) => {
      el.addEventListener('mouseenter', handleHoverEnter);
      el.addEventListener('mouseleave', handleHoverLeave);
    });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      
      hoverElements.forEach((el) => {
        el.removeEventListener('mouseenter', handleHoverEnter);
        el.removeEventListener('mouseleave', handleHoverLeave);
      });
    };
  }, [size]);

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full"
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          mixBlendMode: mixBlendMode as any,
          opacity: 0,
          willChange: 'transform',
        }}
      />
      <div
        ref={cursorDotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 4,
          height: 4,
          backgroundColor: 'rgba(212, 175, 55, 1)',
          opacity: 0,
          willChange: 'transform',
        }}
      />
    </>
  );
};

interface HoverScaleProps {
  children: ReactNode;
  className?: string;
  scale?: number;
  duration?: number;
}

export const HoverScale = ({
  children,
  className = '',
  scale = 1.05,
  duration = 0.3,
}: HoverScaleProps) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleEnter = () => {
      gsap.to(element, {
        scale,
        duration,
        ease: 'power2.out',
      });
    };

    const handleLeave = () => {
      gsap.to(element, {
        scale: 1,
        duration,
        ease: 'power2.out',
      });
    };

    element.addEventListener('mouseenter', handleEnter);
    element.addEventListener('mouseleave', handleLeave);

    return () => {
      element.removeEventListener('mouseenter', handleEnter);
      element.removeEventListener('mouseleave', handleLeave);
    };
  }, [scale, duration]);

  return (
    <div ref={elementRef} className={className} style={{ willChange: 'transform' }}>
      {children}
    </div>
  );
};
