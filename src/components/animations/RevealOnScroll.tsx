/**
 * REVEAL ON SCROLL
 * Generic component for scroll-triggered reveals
 */

import { useRef, ReactNode, CSSProperties } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsapConfig';
import { useGSAP } from '@/hooks/useGSAP';

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade';
  distance?: number;
  duration?: number;
  delay?: number;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  markers?: boolean;
  stagger?: number;
}

export const RevealOnScroll = ({
  children,
  className = '',
  direction = 'up',
  distance = 60,       // Zmniejszone z 100 na 60
  duration = 1,
  delay = 0,
  start = 'top 80%',
  end = 'bottom 20%',
  scrub = false,
  markers = false,
  stagger = 0,
}: RevealOnScrollProps) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!elementRef.current) return;

    const elements = stagger > 0 
      ? Array.from(elementRef.current.children)
      : [elementRef.current];

    const initialState: gsap.TweenVars = { opacity: 0 };
    const animatedState: gsap.TweenVars = { opacity: 1 };

    switch (direction) {
      case 'up':
        initialState.y = distance;
        animatedState.y = 0;
        break;
      case 'down':
        initialState.y = -distance;
        animatedState.y = 0;
        break;
      case 'left':
        initialState.x = distance;
        animatedState.x = 0;
        break;
      case 'right':
        initialState.x = -distance;
        animatedState.x = 0;
        break;
      case 'scale':
        initialState.scale = 0;
        animatedState.scale = 1;
        break;
    }

    // Set initial state immediately to prevent flash
    gsap.set(elements, initialState);

    // Jeśli scrub === false, używamy zwykłej animacji z toggleActions
    // Jeśli scrub jest ustawiony, animacja jest zsynchronizowana ze scrollem
    const animation = scrub === false 
      ? gsap.to(elements, {
          ...animatedState,
          duration,
          delay,
          stagger: stagger,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: elementRef.current,
            start,
            toggleActions: 'play none none reset',  // play on enter, reset on leave back
            markers,
            invalidateOnRefresh: true,
            once: true,  // Play animation only once
          },
        })
      : gsap.to(elements, {
          ...animatedState,
          duration,
          delay,
          stagger: stagger,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: elementRef.current,
            start,
            end,
            scrub,
            markers,
            invalidateOnRefresh: true,
          },
        });
    
    return () => {
      if (animation.scrollTrigger) {
        animation.scrollTrigger.kill();
      }
      animation.kill();
    };
  }, [direction, distance, duration, delay, start, end, scrub, markers, stagger]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
};
