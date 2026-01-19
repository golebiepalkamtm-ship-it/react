/**
 * HORIZONTAL SCROLL SECTION
 * Scroll-jacked horizontal movement
 */

import { useRef, ReactNode } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsapConfig';
import { useGSAP } from '@/hooks/useGSAP';

interface HorizontalScrollProps {
  children: ReactNode;
  className?: string;
  speed?: number;
}

export const HorizontalScroll = ({
  children,
  className = '',
  speed = 1,
}: HorizontalScrollProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current || !scrollRef.current) return;

    const scrollWidth = scrollRef.current.scrollWidth;
    const containerWidth = containerRef.current.offsetWidth;

    gsap.to(scrollRef.current, {
      x: -(scrollWidth - containerWidth),
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        pin: true,
        scrub: speed,
        start: 'top top',
        end: () => `+=${scrollWidth}`,
      },
    });
  }, [speed]);

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <div ref={scrollRef} className="flex will-change-transform">
        {children}
      </div>
    </div>
  );
};
