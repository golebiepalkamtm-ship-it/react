/**
 * Hook do śledzenia pozycji myszy z smooth interpolacją
 * Używa requestAnimationFrame dla płynnych animacji (60 FPS)
 */
import { useState, useEffect, useRef, useCallback } from 'react';

interface MousePosition {
  x: number;
  y: number;
  normalizedX: number; // -1 do 1
  normalizedY: number; // -1 do 1
}

interface UseMousePositionOptions {
  smoothing?: number; // 0-1, wyższa = wolniejsza interpolacja
  enabled?: boolean;
}

export const useMousePosition = (options: UseMousePositionOptions = {}) => {
  const { smoothing = 0.1, enabled = true } = options;
  
  const [position, setPosition] = useState<MousePosition>({
    x: 0,
    y: 0,
    normalizedX: 0,
    normalizedY: 0,
  });

  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>();
  const animateRef = useRef<() => void>(() => {});

  const lerp = (start: number, end: number, factor: number) => 
    start + (end - start) * factor;

  const animate = useCallback(() => {
    currentRef.current.x = lerp(currentRef.current.x, targetRef.current.x, smoothing);
    currentRef.current.y = lerp(currentRef.current.y, targetRef.current.y, smoothing);

    const normalizedX = (currentRef.current.x / window.innerWidth) * 2 - 1;
    const normalizedY = (currentRef.current.y / window.innerHeight) * 2 - 1;

    setPosition({
      x: currentRef.current.x,
      y: currentRef.current.y,
      normalizedX,
      normalizedY,
    });

    rafRef.current = requestAnimationFrame(() => animateRef.current());
  }, [smoothing]);

  useEffect(() => {
    if (!enabled) return;
    animateRef.current = animate;

    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    rafRef.current = requestAnimationFrame(() => animateRef.current());

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [animate, enabled]);

  return position;
};
