import React, { useEffect, useMemo, useRef, useCallback, useState } from 'react';
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
import { gsap, ScrollTrigger } from '@/lib/gsapConfig';

function HeroSection() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<HTMLDivElement | null>(null);
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

  const attemptVideoPlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const p = v.play();
    if (p && typeof p.then === 'function') p.catch(() => {});
  }, []);

  useEffect(() => {
    attemptVideoPlay();
    
    // Scroll Depth Effect - Video shrinks and fades as user scrolls (3D depth illusion)
    // IMPORTANT: GSAP animations ignore useReducedMotion - they're controlled manually
    if (videoContainerRef.current && heroSectionRef.current) {
      const ctx = gsap.context(() => {
        gsap.to(videoContainerRef.current, {
          scale: 0.2,          // Shrinks to 20% of original size
          opacity: 0,          // Fades away completely
          y: 100,              // Slight downward drift for depth effect
          ease: 'none',        // No easing, controlled purely by scroll position
          scrollTrigger: {
            trigger: videoContainerRef.current,  // Trigger na samym wideo
            start: 'top center',                  // Start gdy top wideo dotknie center viewportu
            end: 'bottom top',                    // End gdy bottom wideo opuści viewport
            scrub: true,                          // Smoothly sync animation with scroll
            markers: false,                       // Set to true for debugging
            invalidateOnRefresh: true,            // Recalculate on window resize
          },
        });
      }, heroSectionRef);

      // Clean up on unmount
      return () => ctx.revert();
    }
  }, [attemptVideoPlay]);

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

  return (
    <section
      ref={heroSectionRef}
      id="home"
      className="relative min-h-screen overflow-hidden"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      {/* Container wrapper dla layoutu */}
      <div className="relative min-h-screen flex flex-col items-center justify-center">
        
        {/* Nagłówek na górze */}
        <div className="relative z-50 w-full text-center mb-8 mt-20">
          <div className="container mx-auto px-4">
            <Reveal variants={fadeInUp}>
              <motion.div
                ref={titleRef}
                className="relative inline-block"
                style={prefersReducedMotion ? undefined : ({
                  rotateX,
                  rotateY,
                  transformStyle: 'preserve-3d',
                } as never)}
              >
                {/* Floating particles with physics */}
                {!prefersReducedMotion && particles.map((particle, idx) => (
                  <motion.div
                    key={`particle-${idx}`}
                    className="absolute w-3 h-3 rounded-full"
                    style={{
                      left: `calc(50% + ${particle.x}px)`,
                      top: `calc(50% + ${particle.y}px)`,
                      background: 'radial-gradient(circle, rgba(255,223,128,0.8) 0%, rgba(212,175,55,0.4) 50%, transparent 100%)',
                      boxShadow: '0 0 20px rgba(255,223,128,0.6)',
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 0.8, 0.6, 0],
                      scale: [0, particle.scale, particle.scale * 1.2, 0],
                      y: [0, -30, -60, -90],
                      x: [0, Math.sin(idx) * 20, Math.sin(idx + 1) * 30, Math.sin(idx + 2) * 20],
                    }}
                    transition={{
                      duration: particle.duration,
                      delay: particle.delay,
                      repeat: Infinity,
                      ease: 'easeOut',
                    }}
                  />
                ))}

                {/* Magnetic field effect */}
                {!prefersReducedMotion && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(212,175,55,0.15) 0%, transparent 50%)`,
                      filter: 'blur(40px)',
                    }}
                  />
                )}

                <motion.h1 
                  className="font-display text-4xl md:text-5xl lg:text-6xl text-gold font-bold leading-tight mb-2 relative"
                  style={{
                    textShadow: prefersReducedMotion ? undefined : '0 0 60px rgba(212,175,55,0.4), 0 0 30px rgba(212,175,55,0.2)',
                  }}
                >
                  <AnimatedShinyText className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-2 relative" shimmerWidth={200}>
                    Pałka MTM
                  </AnimatedShinyText>
                </motion.h1>
              </motion.div>
            </Reveal>
            <Reveal variants={fadeInUp} delay={0.1}>
              <AnimatedShinyText className="text-lg" shimmerWidth={150}>
                Mistrzowie sprintu.
              </AnimatedShinyText>
            </Reveal>
            <Reveal variants={scaleIn} delay={0.2}>
              <div className="mt-6 flex items-center justify-center gap-3">
                <MagneticButton strength={0.4}>
                  <Button asChild className="bg-gold text-navy shadow-[0_0_30px_rgba(212,175,55,0.5)] hover:shadow-[0_0_50px_rgba(212,175,55,0.8)]">
                    <Link to="/auctions">Przejdź do aukcji</Link>
                  </Button>
                </MagneticButton>
                <MagneticButton strength={0.4}>
                  <Button variant="outline" asChild className="border-gold/40 hover:border-gold hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                     <a href="#press-section">Poznaj hodowlę</a>
                  </Button>
                </MagneticButton>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Kontener wideo poniżej nagłówka */}
        <div ref={videoContainerRef} className="relative w-[90%] max-w-6xl h-[70vh] will-change-transform overflow-hidden" style={{ perspective: '1000px' }}>
          <div ref={animRef} className="relative w-full h-full">
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-contain"
              src="/pigeon-tlo-Picsart-BackgroundRemover.mp4"
            />
          </div>
        </div>
        
      </div>
    </section>
  );
}

export default React.memo(HeroSection);
