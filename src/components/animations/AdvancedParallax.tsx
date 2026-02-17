/**
 * ============================================================================
 * ADVANCED PARALLAX SYSTEM - Multi-Layer Depth (Fixed for Lenis)
 * ============================================================================
 * 
 * System parallax z niestandardowymi krzywymi Beziera
 * i wielowarstwowym efektem głębi.
 * 
 * FIX: Dodano gsap.context() dla prawidłowego cleanup
 * i synchronizacji ze ScrollTrigger/Lenis
 */

import { useRef, useEffect, ReactNode, CSSProperties } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsapConfig';
import { exponentialOut } from '@/lib/customEasings';

interface AdvancedParallaxProps {
  children: ReactNode;
  className?: string;
  speed?: number;
  direction?: 'vertical' | 'horizontal';
  scrub?: number;
  ease?: 'linear' | 'exponential' | 'smooth' | 'dramatic';
  scale?: { start: number; end: number };
  rotation?: { start: number; end: number };
  opacity?: { start: number; end: number };
  start?: string;
  end?: string;
}

const easingFunctions: Record<string, (t: number) => number> = {
  linear: (t) => t,
  exponential: (t) => exponentialOut(t, 10),
  smooth: (t) => t * t * (3 - 2 * t),
  dramatic: (t) => 1 - Math.pow(1 - t, 4),
};

export const AdvancedParallax = ({
  children,
  className = '',
  speed = 0.5,
  direction = 'vertical',
  scrub = 1,
  ease = 'smooth',
  scale,
  rotation,
  opacity,
  start = 'top bottom',
  end = 'bottom top',
}: AdvancedParallaxProps) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;
    
    element.style.willChange = 'transform, opacity';

    const movement = (1 - speed) * 100;
    const fromVars: gsap.TweenVars = {};
    const toVars: gsap.TweenVars = {};

    if (direction === 'vertical') {
      fromVars.yPercent = -movement / 2;
      toVars.yPercent = movement / 2;
    } else {
      fromVars.xPercent = -movement / 2;
      toVars.xPercent = movement / 2;
    }

    if (scale) {
      fromVars.scale = scale.start;
      toVars.scale = scale.end;
    }

    if (rotation) {
      fromVars.rotation = rotation.start;
      toVars.rotation = rotation.end;
    }

    if (opacity) {
      fromVars.opacity = opacity.start;
      toVars.opacity = opacity.end;
    }

    const customEase = (progress: number) => easingFunctions[ease](progress);
    
    // Używamy gsap.context() dla prawidłowego cleanup
    const ctx = gsap.context(() => {
      const animation = gsap.fromTo(element, fromVars, {
        ...toVars,
        ease: 'none',
        scrollTrigger: {
          trigger: element,
          start,
          end,
          scrub,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const easedProgress = customEase(self.progress);
            self.animation?.progress(easedProgress);
          },
        },
      });
    }, element);

    return () => {
      element.style.willChange = '';
      ctx.revert();
    };
  }, [speed, direction, scrub, ease, scale, rotation, opacity, start, end]);

  return (
    <div 
      ref={elementRef} 
      className={className}
      style={{ transform: 'translateZ(0)' }}
    >
      {children}
    </div>
  );
};

interface DepthLayerProps {
  children: ReactNode;
  depth: number;
  className?: string;
  style?: CSSProperties;
}

export const DepthLayer = ({
  children,
  depth,
  className = '',
  style,
}: DepthLayerProps) => {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!layerRef.current) return;

    const element = layerRef.current;
    const speed = 1 - depth * 0.15;
    
    element.style.willChange = 'transform';

    // Używamy gsap.context() dla prawidłowego cleanup
    const ctx = gsap.context(() => {
      const animation = gsap.to(element, {
        y: () => {
          const scrollDistance = window.innerHeight + element.offsetTop;
          return -(scrollDistance * (speed - 1) * 0.3);
        },
        ease: 'none',
        scrollTrigger: {
          trigger: element,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.5 + depth * 0.2,
          invalidateOnRefresh: true,
        },
      });
    }, element);

    return () => {
      element.style.willChange = '';
      ctx.revert();
    };
  }, [depth]);

  return (
    <div 
      ref={layerRef} 
      className={className}
      style={{
        ...style,
        zIndex: 10 - depth,
        transform: 'translateZ(0)',
      }}
    >
      {children}
    </div>
  );
};

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  speed?: number;
  scaleRange?: [number, number];
  width?: number | string;
  height?: number | string;
}

export const ParallaxImage = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  speed = 0.3,
  scaleRange = [1.2, 1],
  width,
  height,
}: ParallaxImageProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!containerRef.current || !imageRef.current) return;

    const image = imageRef.current;
    
    image.style.willChange = 'transform';

    gsap.set(image, {
      scale: scaleRange[0],
      y: '-10%',
    });

    // Używamy gsap.context() dla prawidłowego cleanup
    const ctx = gsap.context(() => {
      const animation = gsap.to(image, {
        scale: scaleRange[1],
        y: '10%',
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
          invalidateOnRefresh: true,
        },
      });
    }, containerRef);

    return () => {
      image.style.willChange = '';
      ctx.revert();
    };
  }, [speed, scaleRange]);

  return (
    <div 
      ref={containerRef} 
      className={`overflow-hidden ${containerClassName}`}
    >
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className={`w-full h-full object-cover ${className}`}
        style={{ transform: 'translateZ(0)' }}
        width={width}
        height={height}
      />
    </div>
  );
};

interface FloatingElementProps {
  children: ReactNode;
  className?: string;
  amplitude?: number;
  frequency?: number;
  phase?: number;
}

export const FloatingElement = ({
  children,
  className = '',
  amplitude = 20,
  frequency = 0.5,
  phase = 0,
}: FloatingElementProps) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;
    
    element.style.willChange = 'transform';

    // Używamy gsap.context() dla prawidłowego cleanup
    const ctx = gsap.context(() => {
      const animation = gsap.to(element, {
        y: `+=${amplitude}`,
        duration: 1 / frequency,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: phase,
      });
    }, element);

    return () => {
      element.style.willChange = '';
      ctx.revert();
    };
  }, [amplitude, frequency, phase]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
};
