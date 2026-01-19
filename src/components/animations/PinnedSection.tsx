/**
 * PINNED SCROLL SECTION
 * Locks viewport while internal animations play out
 */

import { useRef, ReactNode } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsapConfig';
import { useGSAP } from '@/hooks/useGSAP';

interface PinnedSectionProps {
  children: ReactNode;
  className?: string;
  pinSpacing?: boolean;
  start?: string;
  end?: string;
}

export const PinnedSection = ({
  children,
  className = '',
  pinSpacing = true,
  start = 'top top',
  end = '+=200%',
}: PinnedSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;

    ScrollTrigger.create({
      trigger: sectionRef.current,
      pin: true,
      pinSpacing,
      start,
      end,
      scrub: 1,
    });
  }, [pinSpacing, start, end]);

  return (
    <div ref={sectionRef} className={className}>
      {children}
    </div>
  );
};
