/**
 * PARALLAX SECTION
 * Multi-layered depth with different scroll velocities
 */

import { useRef, ReactNode } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsapConfig';
import { useGSAP } from '@/hooks/useGSAP';

interface ParallaxLayerProps {
  speed?: number;
  children: ReactNode;
  className?: string;
}

export const ParallaxLayer = ({ speed = 0.5, children, className = '' }: ParallaxLayerProps) => {
  const layerRef = useRef<HTMLDivElement>(null);
  
  console.log('🌊 ParallaxLayer RENDER:', { speed, className });

  useGSAP(() => {
    if (!layerRef.current) return;

    console.log('🌊 ParallaxLayer: Creating animation', { speed });

    gsap.to(layerRef.current, {
      y: () => window.innerHeight * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: layerRef.current.parentElement,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
    });
  }, [speed]);

  return (
    <div ref={layerRef} className={className}>
      {children}
    </div>
  );
};

interface ParallaxSectionProps {
  children: ReactNode;
  className?: string;
}

export const ParallaxSection = ({ children, className = '' }: ParallaxSectionProps) => {
  console.log('🎬 ParallaxSection RENDER');
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
    </div>
  );
};
