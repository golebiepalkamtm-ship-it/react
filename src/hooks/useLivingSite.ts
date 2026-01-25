/* ========================================
   CHAMPION PIGEON LIVING SITE HOOK
   Subtle, scroll-driven animations
   ======================================== */

import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsapConfig';
import Lenis from '@studio-freight/lenis';

interface LivingSiteConfig {
  lerp?: number;
  duration?: number;
  enableAnimations?: boolean;
  scrollTriggerRefresh?: boolean;
}

interface ScrollRevealOptions {
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
}

interface ParallaxOptions {
  speed?: number;
  direction?: 'vertical' | 'horizontal';
  ease?: string;
}

export const useLivingSite = (config: LivingSiteConfig = {}) => {
  const {
    lerp = 0.08,
    duration = 1.5,
    enableAnimations = true,
    scrollTriggerRefresh = true,
  } = config;

  const [isReady, setIsReady] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const animationsRef = useRef<Map<string, gsap.core.Tween | gsap.core.Timeline>>(new Map());
  const lenisRef = useRef<Lenis | null>(null);

  // Initialize Lenis smooth scrolling
  useEffect(() => {
    if (!enableAnimations) return;
    
    lenisRef.current = new Lenis({
      lerp,
      duration,
      wheelMultiplier: 0.8,
      touchMultiplier: 2,
    });

    const raf = (time: number) => {
      lenisRef.current?.raf(time);
      ScrollTrigger.update();
    };

    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenisRef.current?.destroy();
    };
  }, [lerp, duration, enableAnimations]);

  // Get lenis instance
  const getLenis = () => lenisRef.current;

  // Scroll reveal animation with scrub for Living Sites
  const scrollReveal = (
    elements: string | HTMLElement | NodeListOf<HTMLElement>,
    options: ScrollRevealOptions = {}
  ) => {
    if (!enableAnimations) return;

    const {
      direction = 'up',
      distance = 50,
      duration: animDuration = 0.8,
      delay = 0,
      stagger = 0,
    } = options;

    const getTransform = () => {
      switch (direction) {
        case 'down':
          return `translateY(-${distance}px)`;
        case 'left':
          return `translateX(${distance}px)`;
        case 'right':
          return `translateX(-${distance}px)`;
        default:
          return `translateY(${distance}px)`;
      }
    };

    const tween = gsap.fromTo(
      elements,
      {
        opacity: 0,
        y: direction === 'up' ? distance : direction === 'down' ? -distance : 0,
        x: direction === 'left' ? distance : direction === 'right' ? -distance : 0,
      },
      {
        opacity: 1,
        y: 0,
        x: 0,
        duration: animDuration,
        delay,
        stagger,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: elements,
          start: 'top 85%',
          end: 'bottom 15%',
          scrub: true,
          once: false,
        },
      }
    );

    const id = Math.random().toString(36).substr(2, 9);
    animationsRef.current.set(id, tween);

    return () => {
      animationsRef.current.delete(id);
      tween.kill();
    };
  };

  // Parallax effect
  const parallax = (
    element: HTMLElement,
    options: ParallaxOptions = {}
  ) => {
    if (!enableAnimations) return;

    const {
      speed = 0.5,
      direction = 'vertical',
      ease = 'none',
    } = options;

    const isVertical = direction === 'vertical';

    const tween = gsap.to(element, {
      [isVertical ? 'y' : 'x']: speed * 100,
      ease,
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });

    const id = Math.random().toString(36).substr(2, 9);
    animationsRef.current.set(id, tween);

    return () => {
      animationsRef.current.delete(id);
      tween.kill();
    };
  };

  // Sticky reveal animation with advanced inner animations
  const stickyReveal = (
    container: HTMLElement,
    content: HTMLElement,
    pinDuration?: number
  ) => {
    if (!enableAnimations) return;

    const tween = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        pin: true,
        start: 'top top',
        end: pinDuration ? `+=${pinDuration}` : 'bottom top',
        scrub: true,
        anticipatePin: 1,
      },
    });

    // Add inner animations for Living Sites effect
    const innerElements = content.querySelectorAll('[data-sticky-animate]');
    if (innerElements.length > 0) {
      tween.fromTo(innerElements,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1.5,
          stagger: 0.2,
          ease: 'power2.out'
        }
      );
    }

    const id = Math.random().toString(36).substr(2, 9);
    animationsRef.current.set(id, tween);

    return () => {
      animationsRef.current.delete(id);
      tween.kill();
    };
  };

  // Scale reveal animation with scrub for Living Sites
  const scaleReveal = (
    elements: string | HTMLElement | NodeListOf<HTMLElement>,
    options: { duration?: number; delay?: number; stagger?: number } = {}
  ) => {
    if (!enableAnimations) return;

    const {
      duration: animDuration = 0.6,
      delay = 0,
      stagger = 0,
    } = options;

    const tween = gsap.fromTo(
      elements,
      {
        opacity: 0,
        scale: 0.8,
      },
      {
        opacity: 1,
        scale: 1,
        duration: animDuration,
        delay,
        stagger,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: elements,
          start: 'top 85%',
          end: 'bottom 15%',
          scrub: true,
          once: false,
        },
      }
    );

    const id = Math.random().toString(36).substr(2, 9);
    animationsRef.current.set(id, tween);

    return () => {
      animationsRef.current.delete(id);
      tween.kill();
    };
  };

  // Text reveal animation with scrub for Living Sites
  const textReveal = (
    element: HTMLElement,
    options: { duration?: number; delay?: number } = {}
  ) => {
    if (!enableAnimations) return;

    const {
      duration: animDuration = 0.8,
      delay = 0,
    } = options;

    // Split text into words
    const text = element.textContent || '';
    const words = text.split(' ');

    element.innerHTML = words
      .map(word => `<span class="word" style="display: inline-block; opacity: 0; transform: translateY(20px);">${word}</span>`)
      .join(' ');

    const wordSpans = element.querySelectorAll('.word');

    const tween = gsap.to(wordSpans, {
      opacity: 1,
      y: 0,
      duration: animDuration,
      delay,
      stagger: 0.05,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        end: 'bottom 15%',
        scrub: true,
        once: false,
      },
    });

    const id = Math.random().toString(36).substr(2, 9);
    animationsRef.current.set(id, tween);

    return () => {
      animationsRef.current.delete(id);
      tween.kill();
      // Restore original text
      element.textContent = text;
    };
  };

  // Refresh all ScrollTrigger instances
  const refresh = () => {
    if (scrollTriggerRefresh) {
      ScrollTrigger.refresh();
    }
  };

  // Visual effects for Living Sites (bokeh, depth of field, glow)
  const visualEffects = (
    element: HTMLElement,
    options: {
      bokeh?: boolean;
      depthOfField?: boolean;
      glow?: boolean;
      intensity?: number;
      scrollTrigger?: boolean;
      start?: string;
      end?: string;
    } = {}
  ) => {
    if (!enableAnimations) return;

    const {
      bokeh = false,
      depthOfField = false,
      glow = false,
      intensity = 1,
      scrollTrigger = true,
      start = 'top bottom',
      end = 'bottom top',
    } = options;

    // Apply visual effects based on options
    if (bokeh) {
      element.style.setProperty('--bokeh-intensity', `${intensity}`);
      element.classList.add('bokeh-effect');
    }

    if (depthOfField) {
      element.style.setProperty('--dof-intensity', `${intensity}`);
      element.classList.add('depth-of-field-effect');
    }

    if (glow) {
      element.style.setProperty('--glow-intensity', `${intensity}`);
      element.classList.add('glow-effect');
    }

    // Add scroll-driven visual effects
    const tween = gsap.to(element, {
      '--visual-effect-progress': 1,
      ease: 'none',
      scrollTrigger: scrollTrigger ? {
        trigger: element,
        start,
        end,
        scrub: true,
        once: false,
      } : undefined,
    });

    const id = Math.random().toString(36).substr(2, 9);
    animationsRef.current.set(id, tween);

    return () => {
      animationsRef.current.delete(id);
      tween.kill();
      // Clean up classes
      element.classList.remove('bokeh-effect', 'depth-of-field-effect', 'glow-effect');
    };
  };

  // Viewport awareness optimization
  const viewportAwareness = (
    element: HTMLElement,
    options: {
      threshold?: number;
      onEnter?: () => void;
      onLeave?: () => void;
      pauseAnimations?: boolean;
    } = {}
  ) => {
    if (!enableAnimations) return;

    const {
      threshold = 0.1,
      onEnter,
      onLeave,
      pauseAnimations = true,
    } = options;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onEnter?.();
          if (pauseAnimations) {
            element.style.animationPlayState = 'running';
          }
        } else {
          onLeave?.();
          if (pauseAnimations) {
            element.style.animationPlayState = 'paused';
          }
        }
      },
      {
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  };

  // Kill all animations
  const killAll = () => {
    animationsRef.current.forEach(tween => tween.kill());
    animationsRef.current.clear();
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  };

  // Initialize
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 0);

    return () => {
      clearTimeout(timer);
      killAll();
    };
  }, []);

  return {
    isReady,
    containerRef,
    scrollReveal,
    parallax,
    stickyReveal,
    scaleReveal,
    textReveal,
    visualEffects,
    refresh,
    killAll,
  };
};

// Utility hook for viewport-based animations
export const useViewportAnimation = () => {
  const [viewport, setViewport] = useState({
    width: 0,
    height: 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  });

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setViewport({
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
      });
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);

    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  return viewport;
};

// Performance monitoring hook
export const usePerformanceMonitor = () => {
  const [fps, setFps] = useState(60);
  const frameCount = useRef(0);
  const lastTime = useRef(0);

  useEffect(() => {
    lastTime.current = performance.now();
  }, []);

  useEffect(() => {
    let animationId: number;

    const measureFPS = () => {
      frameCount.current++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime.current + 1000) {
        setFps(Math.round((frameCount.current * 1000) / (currentTime - lastTime.current)));
        frameCount.current = 0;
        lastTime.current = currentTime;
      }

      animationId = requestAnimationFrame(measureFPS);
    };

    animationId = requestAnimationFrame(measureFPS);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return {
    fps,
    isHighPerformance: fps >= 55,
    isMediumPerformance: fps >= 30 && fps < 55,
    isLowPerformance: fps < 30,
  };
};