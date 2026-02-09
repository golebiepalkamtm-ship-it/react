/**
 * REVEAL ON SCROLL - PREMIUM EDITION
 * High-performance, ultra-smooth scroll reveals with Soft Rise & Blur.
 */

import { useRef, ReactNode } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsapConfig';
import { useGSAP } from '@/hooks/useGSAP';

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  variant?: 'soft' | 'rise' | 'blur' | 'scale' | 'slide';
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
  threshold?: number; // 0 to 1
  once?: boolean;
}

export const RevealOnScroll = ({
  children,
  className = '',
  variant = 'soft', // Default to Soft Rise & Blur
  direction = 'up',
  distance = 40,
  duration = 1.6, // Longer duration for luxury feel
  delay = 0,
  stagger = 0.1,
  threshold = 0.15,
  once = true,
}: RevealOnScrollProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;

    const targets = containerRef.current.children.length > 0
      ? Array.from(containerRef.current.children)
      : [containerRef.current];

    // Initial State Based on Variant
    const vars: gsap.TweenVars = {
      opacity: 0,
      ease: "expo.out",
      overwrite: "auto",
    };

    if (variant === 'soft' || variant === 'rise') {
      vars.y = direction === 'up' ? distance : -distance;
    }

    if (variant === 'soft' || variant === 'blur') {
      vars.filter = 'blur(12px)';
    }

    if (variant === 'scale') {
      vars.scale = 0.94;
    }

    if (variant === 'slide') {
      vars.x = direction === 'right' ? -distance : distance;
    }

    // Set initial state
    gsap.set(targets, vars);

    // Animation via ScrollTrigger
    ScrollTrigger.batch(targets, {
      onEnter: (batch) => {
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration,
          delay,
          stagger: {
            amount: stagger * batch.length,
            from: "start"
          },
          overwrite: true
        });
      },
      onLeaveBack: (batch) => {
        if (!once) {
          gsap.to(batch, {
            ...vars,
            duration: 0.8,
            stagger: 0.05
          });
        }
      },
      start: `top bottom-=${threshold * 100}%`,
      once,
    });
  }, [variant, direction, distance, duration, delay, stagger, threshold, once]);

  return (
    <div ref={containerRef} className={`reveal-container ${className}`}>
      {children}
    </div>
  );
};
