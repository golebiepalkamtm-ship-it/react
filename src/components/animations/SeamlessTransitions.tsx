/**
 * ============================================================================
 * SEAMLESS SECTION TRANSITIONS - Visual Continuity
 * ============================================================================
 * 
 * Płynne przejścia między sekcjami z efektami:
 * - Morph transitions
 * - Color blending
 * - Pinned reveals
 * - Horizontal scroll sections
 */

import { useRef, useEffect, ReactNode, CSSProperties } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsapConfig';

interface SeamlessSectionProps {
  children: ReactNode;
  className?: string;
  backgroundColor?: string;
  transitionIn?: 'fade' | 'slide' | 'scale' | 'reveal' | 'none';
  transitionOut?: 'fade' | 'slide' | 'scale' | 'reveal' | 'none';
  pin?: boolean;
  pinSpacing?: boolean;
  scrub?: number;
  start?: string;
  end?: string;
}

export const SeamlessSection = ({
  children,
  className = '',
  backgroundColor,
  transitionIn = 'fade',
  transitionOut = 'none',
  pin = false,
  pinSpacing = true,
  scrub = 1,
  start = 'top bottom',
  end = 'bottom top',
}: SeamlessSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // DISABLED: All SeamlessSection animations disabled for performance
    // Sections are visible by default - no opacity manipulation
    // This prevents sections from being invisible due to opacity: 0
  }, [transitionIn, transitionOut, pin, pinSpacing, scrub, start, end]);

  const style: CSSProperties = backgroundColor 
    ? { backgroundColor } 
    : {};

  return (
    <section ref={sectionRef} className={`relative ${className}`} style={style}>
      <div ref={contentRef} className="relative">
        {children}
      </div>
    </section>
  );
};

interface PinnedRevealProps {
  children: ReactNode;
  revealContent: ReactNode;
  className?: string;
  revealClassName?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  scrub?: number;
}

export const PinnedReveal = ({
  children,
  revealContent,
  className = '',
  revealClassName = '',
  direction = 'up',
  scrub = 1,
}: PinnedRevealProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !pinnedRef.current || !revealRef.current) return;

    const container = containerRef.current;
    const pinned = pinnedRef.current;
    const reveal = revealRef.current;

    const clipPaths: Record<string, { start: string; end: string }> = {
      up: { start: 'inset(100% 0% 0% 0%)', end: 'inset(0% 0% 0% 0%)' },
      down: { start: 'inset(0% 0% 100% 0%)', end: 'inset(0% 0% 0% 0%)' },
      left: { start: 'inset(0% 0% 0% 100%)', end: 'inset(0% 0% 0% 0%)' },
      right: { start: 'inset(0% 100% 0% 0%)', end: 'inset(0% 0% 0% 0%)' },
    };

    gsap.set(reveal, { clipPath: clipPaths[direction].start });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: '+=100%',
        pin: pinned,
        scrub,
      },
    });

    tl.to(reveal, {
      clipPath: clipPaths[direction].end,
      ease: 'none',
      duration: 1,
    });

    return () => {
      tl.kill();
    };
  }, [direction, scrub]);

  return (
    <div ref={containerRef} className={`relative min-h-[200vh] ${className}`}>
      <div ref={pinnedRef} className="relative h-screen overflow-hidden">
        <div className="absolute inset-0">
          {children}
        </div>
        <div 
          ref={revealRef} 
          className={`absolute inset-0 ${revealClassName}`}
          style={{ willChange: 'clip-path' }}
        >
          {revealContent}
        </div>
      </div>
    </div>
  );
};

interface HorizontalScrollSectionProps {
  children: ReactNode;
  className?: string;
  panelClassName?: string;
  scrub?: number;
}

export const HorizontalScrollSection = ({
  children,
  className = '',
  panelClassName = '',
  scrub = 1,
}: HorizontalScrollSectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const panelContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !panelContainerRef.current) return;

    const container = containerRef.current;
    const panelContainer = panelContainerRef.current;
    const panels = panelContainer.children;

    if (panels.length === 0) return;

    const totalWidth = panelContainer.scrollWidth - window.innerWidth;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: () => `+=${totalWidth}`,
        pin: true,
        scrub,
        anticipatePin: 1,
      },
    });

    tl.to(panelContainer, {
      x: -totalWidth,
      ease: 'none',
    });

    return () => {
      tl.kill();
    };
  }, [scrub]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <div 
        ref={panelContainerRef} 
        className={`flex h-screen ${panelClassName}`}
        style={{ willChange: 'transform' }}
      >
        {children}
      </div>
    </div>
  );
};

interface HorizontalPanelProps {
  children: ReactNode;
  className?: string;
  width?: string;
}

export const HorizontalPanel = ({
  children,
  className = '',
  width = '100vw',
}: HorizontalPanelProps) => {
  return (
    <div 
      className={`flex-shrink-0 h-full ${className}`}
      style={{ width }}
    >
      {children}
    </div>
  );
};

interface ColorTransitionSectionProps {
  children: ReactNode;
  className?: string;
  fromColor?: string;
  toColor?: string;
  scrub?: number;
}

export const ColorTransitionSection = ({
  children,
  className = '',
  fromColor = 'transparent',
  toColor = 'rgba(0,0,0,0.9)',
  scrub = 1,
}: ColorTransitionSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const section = sectionRef.current;

    gsap.fromTo(section, 
      { backgroundColor: fromColor },
      {
        backgroundColor: toColor,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub,
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(t => {
        if (t.vars.trigger === section) t.kill();
      });
    };
  }, [fromColor, toColor, scrub]);

  return (
    <section ref={sectionRef} className={`relative ${className}`}>
      {children}
    </section>
  );
};

interface ProgressIndicatorProps {
  className?: string;
  color?: string;
  height?: number;
}

export const ProgressIndicator = ({
  className = '',
  color = 'rgba(212, 175, 55, 1)',
  height = 3,
}: ProgressIndicatorProps) => {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!progressRef.current) return;

    const progress = progressRef.current;

    gsap.to(progress, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3,
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => {
        if (t.vars.trigger === document.body) t.kill();
      });
    };
  }, []);

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-[9999] ${className}`}
      style={{ height }}
    >
      <div
        ref={progressRef}
        className="h-full origin-left"
        style={{
          backgroundColor: color,
          transform: 'scaleX(0)',
          willChange: 'transform',
        }}
      />
    </div>
  );
};
