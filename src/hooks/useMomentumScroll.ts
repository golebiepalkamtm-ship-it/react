/**
 * Hook dla fizyki momentum scrolling (inertia)
 * Implementuje płynne przewijanie z bezwładnością
 */
import { useState, useEffect, useRef, useCallback } from 'react';

interface MomentumState {
  velocity: number;
  position: number;
  isDragging: boolean;
}

interface UseMomentumScrollOptions {
  friction?: number;       // Tarcie - wyższe = szybsze zatrzymanie
  sensitivity?: number;    // Czułość na ruch myszy/touch
  bounds?: { min: number; max: number };
}

export const useMomentumScroll = (options: UseMomentumScrollOptions = {}) => {
  const { friction = 0.92, sensitivity = 1, bounds } = options;

  const [state, setState] = useState<MomentumState>({
    velocity: 0,
    position: 0,
    isDragging: false,
  });

  const velocityRef = useRef(0);
  const positionRef = useRef(0);
  const lastPosRef = useRef(0);
  const isDraggingRef = useRef(false);
  const rafRef = useRef<number>();

  // Funkcja clamp dla ograniczenia pozycji
  const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

  // Główna pętla animacji
  const animate = useCallback(() => {
    if (!isDraggingRef.current) {
      // Aplikuj bezwładność gdy nie jest przeciągane
      velocityRef.current *= friction;

      // Zatrzymaj gdy prędkość jest bardzo mała
      if (Math.abs(velocityRef.current) < 0.01) {
        velocityRef.current = 0;
      }

      positionRef.current += velocityRef.current;
    }

    // Zastosuj granice jeśli zdefiniowane
    if (bounds) {
      positionRef.current = clamp(positionRef.current, bounds.min, bounds.max);
    }

    setState({
      velocity: velocityRef.current,
      position: positionRef.current,
      isDragging: isDraggingRef.current,
    });

    rafRef.current = requestAnimationFrame(animate);
  }, [friction, bounds]);

  // Event handlers
  const handleStart = useCallback((clientX: number) => {
    isDraggingRef.current = true;
    lastPosRef.current = clientX;
    velocityRef.current = 0;
  }, []);

  const handleMove = useCallback((clientX: number) => {
    if (!isDraggingRef.current) return;

    const delta = (clientX - lastPosRef.current) * sensitivity;
    velocityRef.current = delta;
    positionRef.current += delta;
    lastPosRef.current = clientX;
  }, [sensitivity]);

  const handleEnd = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  // Dodaj impuls programowo
  const addImpulse = useCallback((impulse: number) => {
    velocityRef.current += impulse;
  }, []);

  // Ustaw pozycję programowo
  const setPosition = useCallback((newPosition: number) => {
    positionRef.current = newPosition;
    velocityRef.current = 0;
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  return {
    ...state,
    handlers: {
      onMouseDown: (e: React.MouseEvent) => handleStart(e.clientX),
      onMouseMove: (e: React.MouseEvent) => handleMove(e.clientX),
      onMouseUp: handleEnd,
      onMouseLeave: handleEnd,
      onTouchStart: (e: React.TouchEvent) => handleStart(e.touches[0].clientX),
      onTouchMove: (e: React.TouchEvent) => handleMove(e.touches[0].clientX),
      onTouchEnd: handleEnd,
    },
    addImpulse,
    setPosition,
  };
};
