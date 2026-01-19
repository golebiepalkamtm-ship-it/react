/**
 * ============================================================================
 * MAGNETIC CURSOR - Premium Micro-Interactions
 * ============================================================================
 * 
 * Efekt magnetycznego kursora z physics-based motion.
 * Elementy "przyciągają" kursor tworząc subtelną interakcję.
 */

import { useRef, useEffect, ReactNode, useCallback } from 'react';
import { gsap } from '@/lib/gsapConfig';

interface MagneticElementProps {
  children: ReactNode;
  className?: string;
  strength?: number;
  ease?: number;
  as?: keyof JSX.IntrinsicElements;
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

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!elementRef.current || !boundingRef.current) return;

    const { clientX, clientY } = e;
    const { left, top, width, height } = boundingRef.current;
    
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    const deltaX = (clientX - centerX) * strength;
    const deltaY = (clientY - centerY) * strength;

    gsap.to(elementRef.current, {
      x: deltaX,
      y: deltaY,
      duration: ease,
      ease: 'power3.out',
    });
  }, [strength, ease]);

  const handleMouseEnter = useCallback(() => {
    if (!elementRef.current) return;
    boundingRef.current = elementRef.current.getBoundingClientRect();
    onHover?.();
    
    gsap.to(elementRef.current, {
      scale: 1.05,
      duration: 0.3,
      ease: 'power2.out',
    });
  }, [onHover]);

  const handleMouseLeave = useCallback(() => {
    if (!elementRef.current) return;
    boundingRef.current = null;
    onLeave?.();

    gsap.to(elementRef.current, {
      x: 0,
      y: 0,
      scale: 1,
      duration: 0.5,
      ease: 'elastic.out(1, 0.3)',
    });
  }, [onLeave]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.style.willChange = 'transform';

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mousemove', handleMouseMove);

    return () => {
      element.style.willChange = '';
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseEnter, handleMouseLeave, handleMouseMove]);

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

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      gsap.to(cursorDot, {
        x: mouseX,
        y: mouseY,
        duration: 0.1,
        ease: 'power2.out',
      });
    };

    const animate = () => {
      cursorX += (mouseX - cursorX) * 0.08;
      cursorY += (mouseY - cursorY) * 0.08;
      
      gsap.set(cursor, {
        x: cursorX - size / 2,
        y: cursorY - size / 2,
      });

      requestAnimationFrame(animate);
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
    
    const animationId = requestAnimationFrame(animate);

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
      cancelAnimationFrame(animationId);
      
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
