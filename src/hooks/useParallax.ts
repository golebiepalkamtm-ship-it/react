/**
 * Professional Parallax System - Cassie Evans / Jack Doyle Style
 * 
 * This hook creates sophisticated depth layers with premium easing curves.
 * Every animation decision is intentional and explained.
 * 
 * Core Philosophy:
 * - expo.out for dramatic reveals (long deceleration = weight)
 * - sine.inOut for organic, breathing animations
 * - Custom stagger with ease curves for non-linear timing
 * - CSS variable animation for performant glow effects
 */

import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const useParallax = () => {
  const initialized = useRef(false);
  const rafId = useRef<number | null>(null);
  const mousePos = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Smooth mouse following with lerp
  const handleMouseMove = useCallback((e: MouseEvent) => {
    mousePos.current.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    mousePos.current.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Global GSAP settings for performance
    gsap.config({
      force3D: true,
      nullTargetWarn: false,
    });

    // ==========================================
    // DEEP PARALLAX LAYERS (Background Orbs)
    // ==========================================
    // These move slowest, creating depth perception
    // scrub: 3 means it lags 3 seconds behind scroll - feels "heavy"
    gsap.utils.toArray<HTMLElement>('.parallax-slow').forEach((element, i) => {
      // Each element gets slightly different timing for organic feel
      const baseSpeed = -150;
      const variation = i * 20;

      gsap.to(element, {
        y: baseSpeed - variation,
        // Why no ease on scrub? We want 1:1 scroll mapping, 
        // the scrub value itself provides smoothing
        ease: 'none',
        scrollTrigger: {
          trigger: 'body',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 3 + i * 0.5, // Deeper elements lag more
        },
      });

      // Subtle scale breathing - sine.inOut for organic feel
      // Like breathing - natural acceleration/deceleration
      gsap.to(element, {
        scale: 1.1,
        opacity: 0.25,
        duration: 4 + i,
        ease: 'sine.inOut', // Perfect for anything that should feel "alive"
        repeat: -1,
        yoyo: true,
        delay: i * 0.7, // Phase offset prevents uniform movement
      });
    });

    // ==========================================
    // MID-LAYER PARALLAX (Faster Movement)
    // ==========================================
    // These elements move faster, appear "closer" to viewer
    gsap.utils.toArray<HTMLElement>('.parallax-fast').forEach((element, i) => {
      gsap.to(element, {
        y: -280 - i * 30,
        x: (i % 2 ? 1 : -1) * 40, // Alternate horizontal drift
        ease: 'none',
        scrollTrigger: {
          trigger: 'body',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.5, // Faster response = closer to viewer
        },
      });

      // More energetic breathing for closer elements
      gsap.to(element, {
        scale: 1.15,
        duration: 3 + i * 0.3,
        ease: 'power2.inOut', // More pronounced acceleration
        repeat: -1,
        yoyo: true,
        delay: i * 0.4,
      });
    });

    // ==========================================
    // TIMELINE CARDS - THE STAR OF THE SHOW
    // ==========================================
    gsap.utils.toArray<HTMLElement>('.timeline-parallax').forEach((card, i) => {
      const direction = i % 2 === 0 ? 1 : -1;

      // Main entrance timeline - orchestrated reveal
      const cardTl = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: 'top 90%',
          end: 'top 35%',
          scrub: 1.5, // Smooth scrubbing
        },
      });

      // Phase 1: Enter from side with rotation
      // expo.out: Starts fast, long deceleration - creates "weight"
      // This is the signature Cassie Evans feel
      cardTl.fromTo(
        card,
        {
          x: direction * 180,
          opacity: 0,
          rotateY: direction * 25,
          scale: 0.85,
          filter: 'blur(12px)',
        },
        {
          x: 0,
          opacity: 1,
          rotateY: 0,
          scale: 1,
          filter: 'blur(0px)',
          ease: 'expo.out', // The premium entrance curve
        }
      );

      // Animate CSS variable for dynamic glow
      // This is more performant than animating box-shadow directly
      gsap.to(card, {
        '--glow-intensity': 1,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: card,
          start: 'top 70%',
          end: 'top 40%',
          scrub: 1,
        },
      });

      // Exit animation - fade as it scrolls past
      gsap.to(card, {
        '--glow-intensity': 0,
        opacity: 0.3,
        scale: 0.95,
        filter: 'blur(4px)',
        ease: 'power2.in',
        scrollTrigger: {
          trigger: card,
          start: 'bottom 40%',
          end: 'bottom 10%',
          scrub: 1,
        },
      });
    });

    // ==========================================
    // FLOATING DECORATIVE ELEMENTS
    // ==========================================
    // These create ambient movement and depth
    gsap.utils.toArray<HTMLElement>('.float-parallax').forEach((element, i) => {
      // Scroll-linked movement
      gsap.to(element, {
        y: `${(i % 3 + 1) * -80}`,
        x: `${((i % 2) * 2 - 1) * 50}`,
        rotation: (i % 2) * 15 - 7.5,
        ease: 'none',
        scrollTrigger: {
          trigger: 'body',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 2 + i * 0.5,
        },
      });

      // Independent floating animation
      // Creates organic, "living" feel independent of scroll
      const floatTl = gsap.timeline({ repeat: -1 });
      
      floatTl.to(element, {
        y: `+=${25 + i * 10}`,
        x: `+=${(i % 2 ? 1 : -1) * 15}`,
        rotation: `+=${(i % 2 ? 1 : -1) * 5}`,
        duration: 3 + i * 0.5,
        ease: 'sine.inOut', // Organic breathing
      });

      floatTl.to(element, {
        y: `-=${25 + i * 10}`,
        x: `-=${(i % 2 ? 1 : -1) * 15}`,
        rotation: `-=${(i % 2 ? 1 : -1) * 5}`,
        duration: 3 + i * 0.5,
        ease: 'sine.inOut',
      });

      // Stagger start for non-uniform animation
      floatTl.progress(i * 0.15);
    });

    // ==========================================
    // TUNNEL RINGS - Depth Markers
    // ==========================================
    gsap.utils.toArray<HTMLElement>('.tunnel-ring').forEach((ring, i) => {
      // Pulse animation - each ring at different phase
      gsap.to(ring, {
        scale: 1.08,
        opacity: 0.35,
        duration: 4 + i * 0.5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: i * 0.4,
      });

      // Very slow rotation for subtle movement
      gsap.to(ring, {
        rotation: i % 2 === 0 ? 360 : -360,
        duration: 80 + i * 15,
        ease: 'none',
        repeat: -1,
      });

      // Scroll-linked z-depth simulation
      gsap.to(ring, {
        scale: 1 + i * 0.05,
        opacity: 0.15 - i * 0.02,
        ease: 'none',
        scrollTrigger: {
          trigger: 'body',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 2,
        },
      });
    });

    // ==========================================
    // MOUSE PARALLAX - Interactive Layer
    // ==========================================
    const mouseParallaxElements = gsap.utils.toArray<HTMLElement>('.mouse-parallax');

    const updateMouseParallax = () => {
      // Lerp for buttery smooth following
      // 0.06 = slow follow, 0.15 = snappy
      mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.06;
      mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.06;

      mouseParallaxElements.forEach((el, i) => {
        const depth = parseFloat(el.dataset.depth || '0.5');
        const invertX = el.dataset.invert === 'true' ? -1 : 1;

        gsap.set(el, {
          x: mousePos.current.x * 40 * depth * invertX,
          y: mousePos.current.y * 25 * depth,
          rotation: mousePos.current.x * 3 * depth,
        });
      });

      rafId.current = requestAnimationFrame(updateMouseParallax);
    };

    window.addEventListener('mousemove', handleMouseMove);
    rafId.current = requestAnimationFrame(updateMouseParallax);

    // ==========================================
    // PARTICLES - Micro-Animations
    // ==========================================
    gsap.utils.toArray<HTMLElement>('.particle').forEach((particle, i) => {
      // Random floating path for each particle
      const randomX = gsap.utils.random(-80, 80);
      const randomY = gsap.utils.random(-120, -40);
      const duration = gsap.utils.random(4, 8);

      gsap.to(particle, {
        x: `+=${randomX}`,
        y: `+=${randomY}`,
        opacity: gsap.utils.random(0.2, 0.7),
        scale: gsap.utils.random(0.6, 1.4),
        duration: duration,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: i * 0.3,
      });
    });

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [handleMouseMove]);
};

export default useParallax;
