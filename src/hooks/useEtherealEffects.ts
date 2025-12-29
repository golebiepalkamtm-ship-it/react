/**
 * useEtherealEffects - Reużywalny hook dla efektów wizualnych ethereal-canvas
 * Zawiera: smooth scroll, cursor tracking, easing functions, shader helpers
 */
import { useRef, useState, useEffect, useCallback } from 'react';

// Easing functions z ethereal-canvas
export const easingFunctions = {
  easeOutExpo: (t: number): number => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  easeOutQuart: (t: number): number => 1 - Math.pow(1 - t, 4),
  easeInOutQuad: (t: number): number => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  spring: (t: number, damping = 0.8): number => {
    const omega = 2 * Math.PI;
    return 1 - Math.exp(-damping * t) * Math.cos(omega * t);
  },
};

// Hook do śledzenia pozycji kursora
export const useCursorTracking = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [normalized, setNormalized] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setNormalized({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return { position, normalized };
};

// Hook do smooth scroll z lerp
export const useSmoothScroll = (options = { lerp: 0.1, threshold: 0.5 }) => {
  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const velocityRef = useRef(0);
  const animationRef = useRef<number>();

  const update = useCallback(() => {
    const diff = targetRef.current - currentRef.current;
    
    if (Math.abs(diff) > options.threshold) {
      velocityRef.current = diff * options.lerp;
      currentRef.current += velocityRef.current;
    } else {
      currentRef.current = targetRef.current;
      velocityRef.current = 0;
    }

    animationRef.current = requestAnimationFrame(update);
  }, [options.lerp, options.threshold]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(update);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [update]);

  const setTarget = useCallback((value: number) => {
    targetRef.current = value;
  }, []);

  return {
    current: currentRef,
    velocity: velocityRef,
    setTarget,
  };
};

// Hook do momentum scrolling (dla karuzeli)
interface MomentumScrollOptions {
  friction?: number;
  sensitivity?: number;
  maxVelocity?: number;
}

export const useMomentumScroll = (options: MomentumScrollOptions = {}) => {
  const { friction = 0.95, sensitivity = 0.5, maxVelocity = 50 } = options;
  
  const [position, setPosition] = useState(0);
  const velocityRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastXRef = useRef(0);
  const animationRef = useRef<number>();

  useEffect(() => {
    const animate = () => {
      if (!isDraggingRef.current && Math.abs(velocityRef.current) > 0.1) {
        velocityRef.current *= friction;
        setPosition((prev) => prev + velocityRef.current);
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [friction]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDraggingRef.current = true;
    lastXRef.current = e.clientX;
    velocityRef.current = 0;
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    
    const deltaX = (e.clientX - lastXRef.current) * sensitivity;
    velocityRef.current = Math.max(-maxVelocity, Math.min(maxVelocity, deltaX));
    lastXRef.current = e.clientX;
    setPosition((prev) => prev + deltaX);
  }, [sensitivity, maxVelocity]);

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const addImpulse = useCallback((impulse: number) => {
    velocityRef.current += impulse * sensitivity;
  }, [sensitivity]);

  return {
    position,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerLeave: handlePointerUp,
    },
    addImpulse,
  };
};

// Hook dla intersection observer z animacjami wejścia
export const useInViewAnimation = (threshold = 0.2) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isInView };
};

// Noise function dla shaderów (Simplex noise approximation)
export const generateNoise = (x: number, y: number, time: number): number => {
  const n = Math.sin(x * 12.9898 + y * 78.233 + time) * 43758.5453;
  return n - Math.floor(n);
};

// Paleta kolorów projektu (HSL)
export const projectColors = {
  primary: { h: 186, s: 88, l: 44 },      // Turkus/cyjan
  gold: { h: 45, s: 55, l: 52 },          // Złoty
  goldLight: { h: 45, s: 65, l: 62 },     // Jasny złoty
  goldDark: { h: 45, s: 45, l: 36 },      // Ciemny złoty
  background: { h: 222, s: 47, l: 6 },    // Ciemny navy
  card: { h: 222, s: 47, l: 9 },          // Karta
  border: { h: 222, s: 47, l: 18 },       // Obramowanie
  muted: { h: 215, s: 20, l: 65 },        // Wyciszony tekst
} as const;

// Helper do konwersji HSL na string
export const hsl = (color: { h: number; s: number; l: number }, alpha = 1): string => {
  return `hsla(${color.h}, ${color.s}%, ${color.l}%, ${alpha})`;
};

export default {
  easingFunctions,
  useCursorTracking,
  useSmoothScroll,
  useMomentumScroll,
  useInViewAnimation,
  generateNoise,
  projectColors,
  hsl,
};
