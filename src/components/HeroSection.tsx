import React, { useEffect, useMemo, useRef, useCallback, useState, useLayoutEffect } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useMotionTemplate,
  useAnimationFrame,
} from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Reveal, fadeInUp, scaleIn, buttonMicro } from '@/components/motion';
import { MagneticButton } from '@/components/effects/MagneticButton';
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text';
import { SplitText, ParallaxSection, ParallaxLayer } from '@/components/animations';
import { gsap } from '@/lib/gsapConfig';
import { initAllAnimations } from '@/lib/gsapAnimations';

function HeroSection() {
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const mxSpring = useSpring(mx, { stiffness: 300, damping: 30, mass: 0.5 });
  const mySpring = useSpring(my, { stiffness: 300, damping: 30, mass: 0.5 });

  const rotateX = useTransform(mySpring, [-0.5, 0.5], [12, -12]);
  const rotateY = useTransform(mxSpring, [-0.5, 0.5], [-12, 12]);
  const translateX = useTransform(mxSpring, [-0.5, 0.5], ['-20px', '20px']);
  const translateY = useTransform(mySpring, [-0.5, 0.5], ['-15px', '15px']);

  const shimmerTime = useMotionValue(0);
  useAnimationFrame((t) => {
    if (!prefersReducedMotion) {
      shimmerTime.set(t / 1500);
    }
  });

  const shimmerX = useTransform(shimmerTime, (v) => `${(Math.sin(v) * 50 + 50)}%`);
  const shimmerGradient = useMotionTemplate`linear-gradient(120deg, 
    rgba(212,175,55,0.2) 0%, 
    rgba(255,223,128,1) ${shimmerX}, 
    rgba(212,175,55,0.2) 100%)`;

  const titleChars = useMemo(() => Array.from('Pałka'), []);
  const mtmChars = useMemo(() => Array.from('MTM'), []);

  const particles = useMemo(() => [
    { x: -80, y: -60, delay: 0, duration: 4, scale: 0.8 },
    { x: 90, y: -50, delay: 0.5, duration: 5, scale: 1 },
    { x: -70, y: 60, delay: 1, duration: 4.5, scale: 0.7 },
    { x: 100, y: 50, delay: 1.5, duration: 5.5, scale: 0.9 },
    { x: -100, y: 0, delay: 2, duration: 6, scale: 0.6 },
    { x: 110, y: 10, delay: 2.5, duration: 4.8, scale: 0.85 },
  ], []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (prefersReducedMotion || !titleRef.current) return;
      const rect = titleRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const distance = Math.sqrt(distX * distX + distY * distY);
      const maxDistance = 500;

      setMousePos({ x: e.clientX, y: e.clientY });

      if (distance < maxDistance) {
        const strength = 1 - distance / maxDistance;
        const nx = (distX / maxDistance) * strength;
        const ny = (distY / maxDistance) * strength;
        mx.set(Math.max(-0.5, Math.min(0.5, nx)));
        my.set(Math.max(-0.5, Math.min(0.5, ny)));
      } else {
        mx.set(0);
        my.set(0);
      }
    },
    [mx, my, prefersReducedMotion]
  );

  const onPointerLeave = useCallback(() => {
    mx.set(0);
    my.set(0);
  }, [mx, my]);

  useLayoutEffect(() => {
    initAllAnimations();

    // Custom Hero Timeline for extra premium feel
    const tl = gsap.timeline({ delay: 0.5 });

    tl.to('[data-reveal-line]', { width: '100px', duration: 1.5, ease: 'expo.inOut' })
      .fromTo('[data-reveal-text]',
        { opacity: 0, y: 30, filter: 'blur(10px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 2, ease: 'expo.out' },
        "-=1"
      )
      .fromTo('[data-reveal-buttons]',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1.5, ease: 'expo.out' },
        "-=1.5"
      );
  }, []);

  return (
    <section
      ref={heroSectionRef}
      id="home"
      className="relative min-h-[95vh] flex items-center justify-center overflow-hidden"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      {/* Global dark overlay to unify background */}
      <div className="absolute inset-0 bg-black/60 -z-10 pointer-events-none" />

      {/* Text content */}
      <div className="relative z-60 w-full py-20">
        <div className="container mx-auto px-4 text-center">
          <div
            ref={titleRef}
            className="relative inline-block mb-10"
            style={prefersReducedMotion ? undefined : ({
              rotateX,
              rotateY,
              transformStyle: 'preserve-3d',
            } as any)}
          >
            {/* Masked Title Reveal - Lusion Style */}
            <h1
              className="font-display text-5xl md:text-8xl lg:text-9xl text-white font-bold tracking-tight"
              data-split-text
            >
              Pałka MTM
            </h1>

            <div className="h-px w-0 bg-gold mx-auto mt-4 opacity-50" data-reveal-line />
          </div>

          <div className="max-w-2xl mx-auto">
            <p
              className="text-lg md:text-2xl text-white/80 font-light mb-10 tracking-wide"
              data-reveal-text
            >
              Mistrzowie sprintu. Genetyka zwycięstwa.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6" data-reveal-buttons>
              <MagneticButton strength={0.2}>
                <Button asChild size="lg" className="bg-gold text-navy px-10 h-14 text-lg font-semibold shadow-[0_0_40px_rgba(212,175,55,0.3)] hover:shadow-[0_0_60px_rgba(212,175,55,0.6)] rounded-full transition-all duration-500">
                  <Link to="/auctions">Przejdź do aukcji</Link>
                </Button>
              </MagneticButton>
              <MagneticButton strength={0.2}>
                <Button variant="outline" asChild size="lg" className="border-white/20 hover:border-gold hover:bg-gold/10 text-white px-10 h-14 text-lg font-light rounded-full backdrop-blur-sm transition-all duration-500">
                  <a href="#about">Poznaj hodowlę</a>
                </Button>
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default React.memo(HeroSection);
