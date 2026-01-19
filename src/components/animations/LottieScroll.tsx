/**
 * LOTTIE SCROLL ANIMATION
 * Scrubs Lottie animation progress based on scroll position
 * Perfect synchronization with GSAP ScrollTrigger
 */

import { useEffect, useRef } from 'react';
import lottie, { AnimationItem } from 'lottie-web';
import { gsap, ScrollTrigger } from '@/lib/gsapConfig';

interface LottieScrollProps {
  animationData: any;
  trigger?: string;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  className?: string;
  pin?: boolean;
  markers?: boolean;
}

export const LottieScroll = ({
  animationData,
  trigger,
  start = 'top center',
  end = 'bottom center',
  scrub = 1,
  className = '',
  pin = false,
  markers = false,
}: LottieScrollProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<AnimationItem | null>(null);

  useEffect(() => {
    if (!containerRef.current || !animationData) return;

    // Initialize Lottie
    const animation = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: false,
      autoplay: false,
      animationData,
    });

    animationRef.current = animation;

    // Create proxy object for GSAP to animate
    const lottieProxy = {
      frame: 0,
    };

    // GSAP ScrollTrigger that controls Lottie frame
    ScrollTrigger.create({
      trigger: trigger || containerRef.current,
      start,
      end,
      scrub,
      pin,
      markers,
      onUpdate: (self) => {
        const totalFrames = animation.totalFrames;
        const frame = Math.floor(self.progress * (totalFrames - 1));
        animation.goToAndStop(frame, true);
      },
    });

    return () => {
      animation.destroy();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [animationData, trigger, start, end, scrub, pin, markers]);

  return <div ref={containerRef} className={className} />;
};
