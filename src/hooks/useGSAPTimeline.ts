/**
 * Advanced GSAP Timeline System
 * Inspired by Cassie Evans & Jack Doyle's animation philosophy
 * 
 * Core Principles:
 * 1. Timeline First: All animations orchestrated via gsap.timeline()
 * 2. Professional Easing: No default power1.out - we use expo, elastic, custom curves
 * 3. The Power of Stagger: Advanced stagger objects for organic movement
 * 4. Performance: Only animate transform properties, use will-change, force3D
 * 5. CSS Variables: Leverage GSAP's ability to animate CSS custom properties
 */

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Custom ease configurations for that premium "weight" feel
// expo.inOut: Perfect for dramatic entrances - starts slow, accelerates, then decelerates
// elastic: Adds organic bounciness - great for elements that need to feel "alive"
// back: Slight overshoot creates anticipation and follow-through

export const useGSAPTimeline = () => {
  const initialized = useRef(false);
  const masterTimeline = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Set default GSAP configuration for performance
    gsap.config({
      force3D: true, // Forces 3D transforms for GPU acceleration
      nullTargetWarn: false,
    });

    // Master timeline for orchestrating all animations
    masterTimeline.current = gsap.timeline({
      defaults: {
        ease: 'expo.out', // Professional default - much smoother than power1
        duration: 1.2,
      },
    });

    // ==========================================
    // HERO SECTION - The Grand Entrance
    // ==========================================
    // Using expo.inOut for dramatic reveal - the "weight" creates gravitas
    const heroTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
      },
    });

    // Title animation with stagger from center
    // Why center? Creates symmetric, balanced reveal - very pleasing to the eye
    heroTl.fromTo(
      '.hero-title',
      {
        opacity: 0,
        y: 100,
        rotateX: 15,
        filter: 'blur(10px)',
      },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        filter: 'blur(0px)',
        duration: 1.4,
        ease: 'expo.out', // Long tail deceleration - feels weighty and intentional
      }
    );

    // Subtitle with slight delay - creates hierarchy
    heroTl.fromTo(
      '.hero-subtitle',
      {
        opacity: 0,
        y: 30,
        scale: 0.95,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: 'power3.out',
      },
      '-=0.6' // Overlap for seamless flow
    );

    // Stats cards with advanced center stagger
    // from: "center" creates a ripple effect outward - very premium feel
    heroTl.fromTo(
      '.stat-card',
      {
        opacity: 0,
        y: 50,
        scale: 0.8,
        rotateY: -15,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        rotateY: 0,
        duration: 0.8,
        ease: 'back.out(1.7)', // Slight overshoot - adds life and bounce
        stagger: {
          each: 0.15,
          from: 'center', // Ripple from center outward
          ease: 'power2.inOut', // Stagger timing curve - creates acceleration
        },
      },
      '-=0.4'
    );

    // Scroll indicator with floating animation
    heroTl.fromTo(
      '.scroll-indicator',
      {
        opacity: 0,
        y: -20,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
      },
      '-=0.2'
    );

    // ==========================================
    // TIMELINE CARDS - Scroll-Driven Reveals
    // ==========================================
    gsap.utils.toArray<HTMLElement>('.timeline-parallax').forEach((card, i) => {
      const direction = i % 2 === 0 ? 1 : -1;
      
      // Individual card timeline for precise control
      const cardTl = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          end: 'top 30%',
          scrub: 1.5, // Smooth scrubbing with slight lag - feels organic
        },
      });

      // Main card entrance with 3D rotation
      // Why rotateY? Creates depth perception as if cards are flying in from the side
      cardTl.fromTo(
        card,
        {
          x: direction * 150,
          opacity: 0,
          rotateY: direction * 20,
          scale: 0.85,
          filter: 'blur(8px)',
        },
        {
          x: 0,
          opacity: 1,
          rotateY: 0,
          scale: 1,
          filter: 'blur(0px)',
          ease: 'expo.out', // Long deceleration for smooth landing
        }
      );

      // Year ghost text parallax - moves slower for depth
      const yearGhost = card.querySelector('.year-ghost');
      if (yearGhost) {
        gsap.fromTo(
          yearGhost,
          {
            x: direction * 80,
            opacity: 0,
            scale: 0.9,
          },
          {
            x: 0,
            opacity: 0.3,
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'top 90%',
              end: 'top 20%',
              scrub: 2.5, // Even slower scrub for depth layering
            },
          }
        );
      }

      // Achievement items with cascading stagger
      const achievements = card.querySelectorAll('.achievement-item');
      if (achievements.length) {
        gsap.fromTo(
          achievements,
          {
            opacity: 0,
            x: -30,
            scale: 0.9,
          },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.6,
            ease: 'power3.out',
            stagger: {
              each: 0.08, // Fast cascade - creates energy
              ease: 'power1.in', // Accelerating stagger - builds momentum
            },
            scrollTrigger: {
              trigger: card,
              start: 'top 60%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Card glow pulse on scroll - CSS variable animation
      // Animating CSS custom properties for performance
      gsap.fromTo(
        card,
        {
          '--glow-intensity': 0,
        },
        {
          '--glow-intensity': 1,
          ease: 'power2.inOut',
          scrollTrigger: {
            trigger: card,
            start: 'top 60%',
            end: 'top 30%',
            scrub: 1,
          },
        }
      );
    });

    // ==========================================
    // TUNNEL RINGS - Infinite Depth Animation
    // ==========================================
    const tunnelRings = gsap.utils.toArray<HTMLElement>('.tunnel-ring');
    
    tunnelRings.forEach((ring, i) => {
      // Each ring pulses at different phase - creates depth
      gsap.to(ring, {
        scale: 1.05,
        opacity: 0.4,
        duration: 3 + i * 0.5, // Staggered duration - outer rings slower
        ease: 'sine.inOut', // Sine for organic, breathing feel
        repeat: -1,
        yoyo: true,
        delay: i * 0.3, // Phase offset
      });

      // Subtle rotation for living feel
      gsap.to(ring, {
        rotation: i % 2 === 0 ? 360 : -360,
        duration: 60 + i * 10, // Very slow rotation
        ease: 'none',
        repeat: -1,
      });
    });

    // ==========================================
    // PARALLAX ORBS - Floating Background Elements
    // ==========================================
    gsap.utils.toArray<HTMLElement>('.parallax-orb').forEach((orb, i) => {
      // Floating animation with unique timing per orb
      gsap.to(orb, {
        y: `+=${30 + i * 10}`,
        x: `+=${(i % 2 ? 1 : -1) * 20}`,
        duration: 4 + i * 0.5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });

      // Scale breathing
      gsap.to(orb, {
        scale: 1.1 + i * 0.05,
        duration: 5 + i,
        ease: 'power1.inOut',
        repeat: -1,
        yoyo: true,
        delay: i * 0.5,
      });

      // Scroll-linked parallax with depth based on index
      const speed = 0.3 + (i * 0.15);
      gsap.to(orb, {
        y: () => window.innerHeight * speed,
        ease: 'none',
        scrollTrigger: {
          trigger: 'body',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1 + i * 0.5, // Deeper elements lag more
        },
      });
    });

    // ==========================================
    // PARTICLES - Micro-interactions
    // ==========================================
    gsap.utils.toArray<HTMLElement>('.particle').forEach((particle, i) => {
      // Random floating path
      const tl = gsap.timeline({ repeat: -1 });
      
      tl.to(particle, {
        x: `+=${gsap.utils.random(-100, 100)}`,
        y: `+=${gsap.utils.random(-150, -50)}`,
        opacity: gsap.utils.random(0.3, 0.8),
        scale: gsap.utils.random(0.5, 1.5),
        duration: gsap.utils.random(3, 6),
        ease: 'sine.inOut',
      });

      tl.to(particle, {
        x: `+=${gsap.utils.random(-100, 100)}`,
        y: `+=${gsap.utils.random(-50, 50)}`,
        opacity: gsap.utils.random(0.2, 0.6),
        scale: gsap.utils.random(0.8, 1.2),
        duration: gsap.utils.random(3, 6),
        ease: 'sine.inOut',
      });

      // Stagger start for organic feel
      tl.progress(i * 0.1);
    });

    // ==========================================
    // PROGRESS BAR - Scroll-Synced with Glow
    // ==========================================
    gsap.to('.progress-fill', {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
      },
    });

    // Glow pulse on progress
    gsap.to('.progress-glow-element', {
      '--glow-opacity': 1,
      duration: 0.3,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3,
        onUpdate: (self) => {
          // Pulse glow when scrolling, dim when stopped
          const velocity = Math.abs(self.getVelocity());
          const glowIntensity = Math.min(velocity / 1000, 1);
          gsap.to('.progress-glow-element', {
            '--glow-opacity': glowIntensity,
            duration: 0.1,
          });
        },
      },
    });

    // ==========================================
    // FOOTER - Final Flourish
    // ==========================================
    const footerTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.footer-section',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    });

    footerTl.fromTo(
      '.footer-text',
      {
        opacity: 0,
        y: 40,
        scale: 0.95,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1,
        ease: 'expo.out',
      }
    );

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      masterTimeline.current?.kill();
    };
  }, []);

  return { masterTimeline };
};

export default useGSAPTimeline;
