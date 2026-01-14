import { useEffect, useRef } from 'react';

export const useMomentumScroll = (enabled: boolean = true) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const velocityRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !scrollContainerRef.current) return;

    const scrollContainer = scrollContainerRef.current;

    const handleMouseDown = (e: MouseEvent) => {
      if (isScrollingRef.current) return;
      isScrollingRef.current = true;
      startXRef.current = e.pageX - scrollContainer.offsetLeft;
      scrollLeftRef.current = scrollContainer.scrollLeft;
      scrollContainer.style.cursor = 'grabbing';
      scrollContainer.style.userSelect = 'none';
    };

    const handleMouseLeave = () => {
      if (!isScrollingRef.current) return;
      isScrollingRef.current = false;
      scrollContainer.style.cursor = 'grab';
      scrollContainer.style.userSelect = '';
    };

    const handleMouseUp = () => {
      if (!isScrollingRef.current) return;
      isScrollingRef.current = false;
      scrollContainer.style.cursor = 'grab';
      scrollContainer.style.userSelect = '';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isScrollingRef.current) return;
      e.preventDefault();
      const x = e.pageX - scrollContainer.offsetLeft;
      const walk = (x - startXRef.current) * 2;
      scrollContainer.scrollLeft = scrollLeftRef.current - walk;

      // Calculate velocity for momentum scrolling
      const now = performance.now();
      if (lastTimeRef.current !== null) {
        const deltaTime = now - lastTimeRef.current;
        const deltaX = walk;
        velocityRef.current = deltaX / deltaTime;
      }
      lastTimeRef.current = now;
    };

    const momentumScroll = () => {
      if (Math.abs(velocityRef.current) < 0.1) {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
        return;
      }

      scrollContainer.scrollLeft -= velocityRef.current * 10;
      velocityRef.current *= 0.95; // Deceleration
      animationRef.current = requestAnimationFrame(momentumScroll);
    };

    scrollContainer.addEventListener('mousedown', handleMouseDown);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);
    scrollContainer.addEventListener('mouseup', handleMouseUp);
    scrollContainer.addEventListener('mousemove', handleMouseMove);

    return () => {
      scrollContainer.removeEventListener('mousedown', handleMouseDown);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
      scrollContainer.removeEventListener('mouseup', handleMouseUp);
      scrollContainer.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enabled]);

  return {
    scrollContainerRef,
  };
};