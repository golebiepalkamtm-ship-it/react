/**
 * Advanced Parallax System with GSAP ScrollTrigger
 * 
 * This hook creates sophisticated depth layers using scroll-driven animations.
 * Each layer moves at different speeds, creating the illusion of 3D space.
 * 
 * Key techniques:
 * - Scrub values control smoothness (higher = more lag = deeper feel)
 * - CSS transforms only (x, y, scale, rotation) for 60fps performance
 * - will-change hints for GPU optimization
 * - requestAnimationFrame synced updates
 */

import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Parallax layer configuration
interface ParallaxLayer {
  selector: string;
  speed: number; // Multiplier for scroll distance
  scrub: number; // Smoothing factor
  direction?: 'vertical' | 'horizontal' | 'both';
  rotation?: number; // Optional rotation factor
  scale?: { start: number; end: number }; // Optional scale change
}

const defaultLayers: ParallaxLayer[] = [
  // Background orbs - slowest, creates depth
  {
    selector: '.parallax-layer-deep',
    speed: 0.15,
    scrub: 3,
    direction: 'vertical',
    scale: { start: 1, end: 1.1 },
  },
  // Mid-ground elements
  {
    selector: '.parallax-layer-mid',
    speed: 0.35,
    scrub: 2,
    direction: 'both',
    rotation: 5,
  },
  // Foreground accents - fastest
  {
    selector: '.parallax-layer-front',
    speed: 0.6,
    scrub: 1,
    direction: 'vertical',
  },
  // Floating particles - organic movement
  {
    selector: '.parallax-float',
    speed: 0.25,
    scrub: 2.5,
    direction: 'both',
    rotation: -3,
    scale: { start: 0.9, end: 1.15 },
  },
];

export const useAdvancedParallax = (customLayers?: ParallaxLayer[]) => {
  const initialized = useRef(false);
  const rafId = useRef<number | null>(null);
  const layers = customLayers || defaultLayers;

  // Mouse parallax for interactive depth
  const mousePosition = useRef({ x: 0, y: 0 });
  const targetPosition = useRef({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Normalize mouse position to -1 to 1 range
    targetPosition.current = {
      x: (e.clientX / window.innerWidth - 0.5) * 2,
      y: (e.clientY / window.innerHeight - 0.5) * 2,
    };
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Performance hints
    gsap.set('[class*="parallax-"]', {
      willChange: 'transform',
      force3D: true,
    });

    // ==========================================
    // SCROLL-DRIVEN PARALLAX
    // ==========================================
    layers.forEach((layer) => {
      const elements = gsap.utils.toArray<HTMLElement>(layer.selector);
      
      elements.forEach((el, i) => {
        const scrollDistance = window.innerHeight * layer.speed;
        const staggerOffset = i * 0.1; // Slight variation between same-layer elements

        const animProps: gsap.TweenVars = {
          ease: 'none',
          scrollTrigger: {
            trigger: 'body',
            start: 'top top',
            end: 'bottom bottom',
            scrub: layer.scrub + staggerOffset,
          },
        };

        // Direction-based movement
        if (layer.direction === 'vertical' || layer.direction === 'both') {
          animProps.y = -scrollDistance * (1 + staggerOffset);
        }
        if (layer.direction === 'horizontal' || layer.direction === 'both') {
          animProps.x = (i % 2 ? 1 : -1) * scrollDistance * 0.3;
        }

        // Optional rotation
        if (layer.rotation) {
          animProps.rotation = layer.rotation * (i % 2 ? 1 : -1);
        }

        // Optional scale
        if (layer.scale) {
          gsap.fromTo(
            el,
            { scale: layer.scale.start },
            {
              scale: layer.scale.end,
              ease: 'none',
              scrollTrigger: {
                trigger: 'body',
                start: 'top top',
                end: 'bottom bottom',
                scrub: layer.scrub * 1.5, // Scale changes slower
              },
            }
          );
        }

        gsap.to(el, animProps);
      });
    });

    // ==========================================
    // MOUSE-DRIVEN PARALLAX (Interactive Depth)
    // ==========================================
    const mouseParallaxElements = gsap.utils.toArray<HTMLElement>('.mouse-parallax');
    
    const updateMouseParallax = () => {
      // Lerp for smooth following
      mousePosition.current.x += (targetPosition.current.x - mousePosition.current.x) * 0.08;
      mousePosition.current.y += (targetPosition.current.y - mousePosition.current.y) * 0.08;

      mouseParallaxElements.forEach((el, i) => {
        const depth = parseFloat(el.dataset.depth || '0.5');
        const moveX = mousePosition.current.x * 50 * depth;
        const moveY = mousePosition.current.y * 30 * depth;
        const rotate = mousePosition.current.x * 5 * depth;

        gsap.to(el, {
          x: moveX,
          y: moveY,
          rotation: rotate,
          duration: 0.3,
          ease: 'power2.out',
        });
      });

      rafId.current = requestAnimationFrame(updateMouseParallax);
    };

    // Start mouse tracking
    window.addEventListener('mousemove', handleMouseMove);
    rafId.current = requestAnimationFrame(updateMouseParallax);

    // ==========================================
    // VIEWPORT-AWARE OPTIMIZATIONS
    // ==========================================
    // Pause animations for off-screen elements
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const triggers = ScrollTrigger.getAll().filter(
            (st) => st.trigger === entry.target
          );
          triggers.forEach((trigger) => {
            if (entry.isIntersecting) {
              trigger.enable();
            } else {
              trigger.disable();
            }
          });
        });
      },
      { rootMargin: '100px' }
    );

    layers.forEach((layer) => {
      document.querySelectorAll(layer.selector).forEach((el) => {
        observer.observe(el);
      });
    });

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId.current) cancelAnimationFrame(rafId.current);
      observer.disconnect();
    };
  }, [layers, handleMouseMove]);

  return { mousePosition };
};

export default useAdvancedParallax;
