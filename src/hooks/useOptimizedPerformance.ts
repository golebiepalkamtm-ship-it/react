/* ========================================
   CHAMPION PIGEON PERFORMANCE OPTIMIZATION
   Viewport-aware, performance-first hooks
   ======================================== */

import { useEffect, useRef, useState, useCallback } from 'react';

interface PerformanceConfig {
  enableAnimations?: boolean;
  reducedMotion?: boolean;
  fpsTarget?: number;
  debounceMs?: number;
}

interface IntersectionOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useOptimizedPerformance = (config: PerformanceConfig = {}) => {
  const {
    enableAnimations = true,
    reducedMotion = false,
    fpsTarget = 60,
    debounceMs = 100,
  } = config;

  const [isLowEndDevice, setIsLowEndDevice] = useState(false);
  const [isHighEndDevice, setIsHighEndDevice] = useState(false);
  const [currentFPS, setCurrentFPS] = useState(fpsTarget);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const performanceRef = useRef({
    frameCount: 0,
    lastTime: 0,
    fps: fpsTarget,
  });

  // Device detection
  useEffect(() => {
    const detectDevice = () => {
      const isLowEnd = 
        navigator.hardwareConcurrency <= 2 ||
        (navigator as any).deviceMemory <= 2 ||
        viewportWidth < 768;
      const isHighEnd =
        navigator.hardwareConcurrency >= 8 &&
        (navigator as any).deviceMemory >= 8 &&
        viewportWidth >= 1024;
      setIsLowEndDevice(isLowEnd);
      setIsHighEndDevice(isHighEnd);
    };
    const updateViewport = () => {
      setViewportWidth(window.innerWidth);
      setViewportHeight(window.innerHeight);
      detectDevice();
    };
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, [viewportWidth]);

  // FPS monitoring
  useEffect(() => {
    if (!enableAnimations) return;

    let animationId: number;
    const measureFPS = () => {
      const now = performance.now();
      performanceRef.current.frameCount++;

      if (now >= performanceRef.current.lastTime + 1000) {
        const fps = Math.round(
          (performanceRef.current.frameCount * 1000) / 
          (now - performanceRef.current.lastTime)
        );
        
        performanceRef.current.fps = fps;
        performanceRef.current.frameCount = 0;
        performanceRef.current.lastTime = now;
        setCurrentFPS(fps);
      }

      animationId = requestAnimationFrame(measureFPS);
    };

    performanceRef.current.lastTime = performance.now();
    animationId = requestAnimationFrame(measureFPS);

    return () => cancelAnimationFrame(animationId);
  }, [enableAnimations]);

  // Adaptive animation settings
  const getAnimationConfig = useCallback(() => {
    const baseConfig = {
      enabled: enableAnimations && !reducedMotion,
      duration: 0.8,
      easing: 'power2.out',
    };

    if (isLowEndDevice || currentFPS < 30) {
      return {
        ...baseConfig,
        duration: 0.3,
        easing: 'power1.out',
        reduced: true,
      };
    }

    if (isHighEndDevice && currentFPS >= 55) {
      return {
        ...baseConfig,
        duration: 1.2,
        easing: 'power3.out',
        enhanced: true,
      };
    }

    return baseConfig;
  }, [enableAnimations, reducedMotion, isLowEndDevice, isHighEndDevice, currentFPS]);

  return {
    isLowEndDevice,
    isHighEndDevice,
    currentFPS,
    isPerformant: currentFPS >= 55,
    getAnimationConfig,
    viewport: {
      width: viewportWidth,
      height: viewportHeight,
      isMobile: viewportWidth < 768,
      isTablet: viewportWidth >= 768 && viewportWidth < 1024,
      isDesktop: viewportWidth >= 1024,
    },
  };
};

export const useIntersectionObserver = (
  options: IntersectionOptions = {}
) => {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true,
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting;
        setIsIntersecting(isElementIntersecting);

        if (triggerOnce && isElementIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce, hasIntersected]);

  return {
    elementRef,
    isIntersecting,
    hasIntersected,
  };
};

export const useLazyLoad = (src: string, options: IntersectionOptions = {}) => {
  const [loadedSrc, setLoadedSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { elementRef, isIntersecting } = useIntersectionObserver(options);

  useEffect(() => {
    if (!isIntersecting || loadedSrc || !src) return;

    const timer = setTimeout(() => {
      setIsLoading(true);
      setError(null);

      const img = new Image();
      
      img.onload = () => {
        setLoadedSrc(src);
        setIsLoading(false);
      };

      img.onerror = () => {
        setError('Failed to load image');
        setIsLoading(false);
      };

      img.src = src;
    }, 0);

    return () => clearTimeout(timer);
  }, [isIntersecting, loadedSrc, src]);

  return {
    elementRef,
    loadedSrc,
    isLoading,
    error,
  };
};

export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastCallRef = useRef<number>(0);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        callback(...args);
      }
    },
    [callback, delay]
  ) as T;

  return throttledCallback;
};

export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    
    const updateMatches = () => {
      setMatches(mediaQuery.matches);
    };

    updateMatches();

    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
};

export const useResponsiveValue = <T>(values: {
  mobile?: T;
  tablet?: T;
  desktop?: T;
  default: T;
}) => {
  const isTablet = useMediaQuery('(min-width: 768px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  if (isDesktop && values.desktop !== undefined) {
    return values.desktop;
  }

  if (isTablet && values.tablet !== undefined) {
    return values.tablet;
  }

  if (values.mobile !== undefined) {
    return values.mobile;
  }

  return values.default;
};

export const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection('up');
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  return scrollDirection;
};

export const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const updateMotion = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    updateMotion();

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
};

export const useOptimizedScroll = (
  callback: (scrollY: number, direction: 'up' | 'down') => void,
  options: { throttleMs?: number } = {}
) => {
  const { throttleMs = 16 } = options; // ~60fps
  const [scrollY, setScrollY] = useState(0);
  const [direction, setDirection] = useState<'up' | 'down'>('down');
  const lastScrollY = useRef(0);

  const throttledCallback = useThrottle(callback, throttleMs);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY.current) {
        setDirection('down');
      } else if (currentScrollY < lastScrollY.current) {
        setDirection('up');
      }

      lastScrollY.current = currentScrollY;
      setScrollY(currentScrollY);
      throttledCallback(currentScrollY, direction);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [throttledCallback, direction]);

  return {
    scrollY,
    direction,
  };
};
