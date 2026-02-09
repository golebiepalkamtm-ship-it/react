/**
 * PARALLAX SECTION - PREMIUM DEPTH
 * Smooth multi-layered parallax with subtle motion.
 */

import { useRef, ReactNode } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsapConfig';
import { useGSAP } from '@/hooks/useGSAP';

interface ParallaxLayerProps {
  speed?: number;
  children: ReactNode;
  className?: string;
  direction?: 'vertical' | 'horizontal';
}

export const ParallaxLayer = ({
  speed = 0.5,
  children,
  className = '',
  direction = 'vertical'
}: ParallaxLayerProps) => {
  const layerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!layerRef.current) return;

    const parent = layerRef.current.parentElement;
    if (!parent) return;

    const moveVal = window.innerHeight * speed * 0.4; // Controlled distance

    gsap.to(layerRef.current, {
      y: direction === 'vertical' ? moveVal : 0,
      x: direction === 'horizontal' ? moveVal : 0,
      ease: 'none',
      scrollTrigger: {
        trigger: parent,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5, // Ultra-smooth butter scrub
        invalidateOnRefresh: true,
      },
    });
  }, [speed, direction]);

  return (
    <div ref={layerRef} className={`parallax-layer-content will-change-transform ${className}`}>
      {children}
    </div>
  );
};

interface ParallaxSectionProps {
  children: ReactNode;
  className?: string;
}

export const ParallaxSection = ({ children, className = '' }: ParallaxSectionProps) => {
  return (
    <div className={`relative overflow-hidden section-parallax ${className}`}>
      {children}
    </div>
  );
};
