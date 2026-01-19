/**
 * ============================================================================
 * VIDEO BACKGROUND - ScrollTrigger Synced
 * ============================================================================
 * 
 * Komponent wideo z płynnym scrubowaniem przez ScrollTrigger.
 * Wideo jest synchronizowane z postępem scrolla, tworząc efekt
 * "cinematic reveal" inspirowany studiami immersive web.
 */

import { useRef, useEffect, forwardRef, useCallback } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsapConfig';

interface VideoBackgroundProps {
  src: string;
  poster?: string;
  className?: string;
  overlayClassName?: string;
  scrub?: boolean | number;
  start?: string;
  end?: string;
  fadeIn?: boolean;
  fadeOut?: boolean;
  playbackRange?: [number, number];
  onProgress?: (progress: number) => void;
}

export const VideoBackground = forwardRef<HTMLDivElement, VideoBackgroundProps>(({
  src,
  poster,
  className = '',
  overlayClassName = '',
  scrub = 1.5,
  start = 'top bottom',
  end = 'bottom top',
  fadeIn = true,
  fadeOut = true,
  playbackRange = [0, 1],
  onProgress,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const handleVideoLoad = useCallback(() => {
    if (!videoRef.current || !containerRef.current) return;

    const video = videoRef.current;
    const duration = video.duration;

    if (!duration || isNaN(duration)) return;

    video.pause();
    video.currentTime = playbackRange[0] * duration;

    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start,
        end,
        scrub: typeof scrub === 'number' ? scrub : (scrub ? 1.5 : false),
        onUpdate: (self) => {
          const progress = self.progress;
          const startTime = playbackRange[0] * duration;
          const endTime = playbackRange[1] * duration;
          const targetTime = startTime + (endTime - startTime) * progress;
          
          if (Math.abs(video.currentTime - targetTime) > 0.1) {
            video.currentTime = targetTime;
          }
          
          onProgress?.(progress);
        },
      },
    });

    if (fadeIn) {
      tl.fromTo(containerRef.current, 
        { opacity: 0 },
        { opacity: 1, duration: 0.3 },
        0
      );
    }

    if (fadeOut) {
      tl.to(containerRef.current, 
        { opacity: 0, duration: 0.3 },
        0.7
      );
    }

    timelineRef.current = tl;
  }, [scrub, start, end, fadeIn, fadeOut, playbackRange, onProgress]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.addEventListener('loadedmetadata', handleVideoLoad);
    
    if (video.readyState >= 1) {
      handleVideoLoad();
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleVideoLoad);
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [handleVideoLoad]);

  return (
    <div 
      ref={(node) => {
        (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      className={`absolute inset-0 overflow-hidden ${className}`}
      style={{ willChange: 'opacity' }}
    >
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src={src}
        poster={poster}
        muted
        playsInline
        preload="auto"
        style={{
          willChange: 'transform',
        }}
      />
      <div 
        className={`absolute inset-0 ${overlayClassName}`}
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)',
        }}
      />
    </div>
  );
});

VideoBackground.displayName = 'VideoBackground';

interface VideoRevealProps {
  src: string;
  className?: string;
  revealDirection?: 'up' | 'down' | 'left' | 'right';
  scrub?: number;
}

export const VideoReveal = ({
  src,
  className = '',
  revealDirection = 'up',
  scrub = 1,
}: VideoRevealProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!containerRef.current || !videoRef.current) return;

    const video = videoRef.current;
    const directions: Record<string, gsap.TweenVars> = {
      up: { clipPath: 'inset(100% 0% 0% 0%)' },
      down: { clipPath: 'inset(0% 0% 100% 0%)' },
      left: { clipPath: 'inset(0% 0% 0% 100%)' },
      right: { clipPath: 'inset(0% 100% 0% 0%)' },
    };

    gsap.set(video, directions[revealDirection]);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
        end: 'top 20%',
        scrub,
      },
    });

    tl.to(video, {
      clipPath: 'inset(0% 0% 0% 0%)',
      ease: 'power3.out',
      duration: 1,
    });

    const handlePlay = () => {
      video.play().catch(() => {});
    };

    const scrollTriggerInstance = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top 80%',
      onEnter: handlePlay,
      onEnterBack: handlePlay,
    });

    return () => {
      tl.kill();
      scrollTriggerInstance.kill();
    };
  }, [revealDirection, scrub]);

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        src={src}
        muted
        loop
        playsInline
        preload="auto"
      />
    </div>
  );
};
