/**
 * Custom spring physics hook dla płynnych animacji
 * Bazowany na spring dynamics z konfigurowalną sztywnością i tłumieniem
 */
import { useState, useEffect, useRef, useCallback } from 'react';

interface SpringConfig {
  stiffness?: number;  // Sztywność sprężyny (domyślnie 150)
  damping?: number;    // Tłumienie (domyślnie 20)
  mass?: number;       // Masa (domyślnie 1)
  precision?: number;  // Precyzja zatrzymania (domyślnie 0.01)
}

interface SpringValue {
  value: number;
  velocity: number;
  isAnimating: boolean;
}

export const useSpring = (
  targetValue: number,
  config: SpringConfig = {}
) => {
  const {
    stiffness = 150,
    damping = 20,
    mass = 1,
    precision = 0.01,
  } = config;

  const [spring, setSpring] = useState<SpringValue>({
    value: targetValue,
    velocity: 0,
    isAnimating: false,
  });

  const valueRef = useRef(targetValue);
  const velocityRef = useRef(0);
  const targetRef = useRef(targetValue);
  const rafRef = useRef<number>();
  const lastTimeRef = useRef(performance.now());

  const animate = useCallback(() => {
    const now = performance.now();
    const deltaTime = Math.min((now - lastTimeRef.current) / 1000, 0.064); // Cap at ~16fps minimum
    lastTimeRef.current = now;

    const displacement = valueRef.current - targetRef.current;
    const springForce = -stiffness * displacement;
    const dampingForce = -damping * velocityRef.current;
    const acceleration = (springForce + dampingForce) / mass;

    velocityRef.current += acceleration * deltaTime;
    valueRef.current += velocityRef.current * deltaTime;

    // Sprawdź czy animacja powinna się zatrzymać
    const isAtRest =
      Math.abs(velocityRef.current) < precision &&
      Math.abs(displacement) < precision;

    if (isAtRest) {
      valueRef.current = targetRef.current;
      velocityRef.current = 0;
      setSpring({
        value: targetRef.current,
        velocity: 0,
        isAnimating: false,
      });
    } else {
      setSpring({
        value: valueRef.current,
        velocity: velocityRef.current,
        isAnimating: true,
      });
      rafRef.current = requestAnimationFrame(animate);
    }
  }, [stiffness, damping, mass, precision]);

  useEffect(() => {
    targetRef.current = targetValue;
    
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [targetValue, animate]);

  // Immediate set bez animacji
  const set = useCallback((newValue: number) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    valueRef.current = newValue;
    targetRef.current = newValue;
    velocityRef.current = 0;
    setSpring({
      value: newValue,
      velocity: 0,
      isAnimating: false,
    });
  }, []);

  return { ...spring, set };
};

/**
 * useSpringValue - dla wielu wartości jednocześnie
 */
interface Vec2 {
  x: number;
  y: number;
}

export const useSpringVec2 = (
  target: Vec2,
  config: SpringConfig = {}
) => {
  const springX = useSpring(target.x, config);
  const springY = useSpring(target.y, config);

  return {
    x: springX.value,
    y: springY.value,
    velocityX: springX.velocity,
    velocityY: springY.velocity,
    isAnimating: springX.isAnimating || springY.isAnimating,
    set: (newTarget: Vec2) => {
      springX.set(newTarget.x);
      springY.set(newTarget.y);
    },
  };
};
