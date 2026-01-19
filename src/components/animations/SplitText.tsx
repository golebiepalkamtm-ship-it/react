/**
 * SPLIT TEXT ANIMATION
 * Character-by-character reveal synchronized with scroll
 * Uses GSAP ScrollTrigger for precise control
 */

import { useEffect, useRef, ReactNode } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsapConfig';

interface SplitTextProps {
  children: ReactNode;
  trigger?: string;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  stagger?: number;
  className?: string;
  animationType?: 'fade' | 'slide' | 'scale' | 'rotate';
}

export const SplitText = ({
  children,
  trigger,
  start = 'top 80%',
  end = 'bottom 20%',
  scrub = false,  // Changed from 1 to false - no scrub by default
  stagger = 0.02,
  className = '',
  animationType = 'fade',
}: SplitTextProps) => {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!textRef.current) return;

    const text = textRef.current.textContent || '';
    const chars = text.split('');

    // Clear and rebuild with spans
    textRef.current.innerHTML = '';
    chars.forEach((char) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.display = 'inline-block';
      textRef.current?.appendChild(span);
    });

    const spans = textRef.current.querySelectorAll('span');

    // Initial state based on animation type
    const initialState: gsap.TweenVars = {
      opacity: 0,
    };

    const animatedState: gsap.TweenVars = {
      opacity: 1,
    };

    switch (animationType) {
      case 'slide':
        initialState.y = 50;
        animatedState.y = 0;
        break;
      case 'scale':
        initialState.scale = 0;
        animatedState.scale = 1;
        break;
      case 'rotate':
        initialState.rotationX = 90;
        animatedState.rotationX = 0;
        break;
    }

    // Set initial state immediately to prevent flash
    gsap.set(spans, initialState);

    // Create ScrollTrigger animation
    // Jeśli scrub === false, używamy toggleActions
    // Jeśli scrub jest ustawiony, animacja jest zsynchronizowana ze scrollem
    const tl = gsap.timeline({
      scrollTrigger: scrub === false 
        ? {
            trigger: trigger || textRef.current,
            start,
            toggleActions: 'play none none reverse',
            markers: false,
          }
        : {
            trigger: trigger || textRef.current,
            start,
            end,
            scrub,
            markers: false,
          },
    });

    tl.to(spans, {
      ...animatedState,
      stagger,
      ease: 'power2.out',
      duration: 0.5,
    });

    return () => {
      tl.kill();
    };
  }, [trigger, start, end, scrub, stagger, animationType]);

  return (
    <div ref={textRef} className={className}>
      {children}
    </div>
  );
};
