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
import { Reveal, fadeInUp, scaleIn, buttonMicro } from '@/components/motion';
import { MagneticButton } from '@/components/effects/MagneticButton';

function HeroSection() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
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
      id="home"
      className="relative min-h-screen overflow-hidden"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <div className="absolute top-80 left-1/2 -translate-x-1/2 z-40 max-w-4xl h-[65vh] mb-2">
        {/* Video w środku - bez oświetlenia */}
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className="relative z-0 w-full h-full object-contain"
            src="/pigeon-tlo-Picsart-BackgroundRemover.mp4"
          />
        </div>
      </div>

      {/* Text content */}
      <div className="relative z-60 w-full p-0 mt-20">
        <div className="container mx-auto px-4 text-center">
          <Reveal variants={fadeInUp}>
            <motion.div
              ref={titleRef}
              className="relative inline-block"
              style={prefersReducedMotion ? undefined : ({
                rotateX,
                rotateY,
                x: translateX,
                y: translateY,
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
                className="font-display text-4xl md:text-6xl lg:text-7xl text-foreground font-bold leading-tight mb-2 relative"
                style={{
                  textShadow: prefersReducedMotion ? undefined : '0 0 60px rgba(212,175,55,0.4), 0 0 30px rgba(212,175,55,0.2)',
                }}
              >
                {/* Pałka with 3D kinetic reveal */}
                <span className="inline-flex" aria-label="Pałka">
                  {titleChars.map((ch, i) => (
                    <motion.span
                      key={`t-${i}`}
                      className="inline-block relative"
                      initial={prefersReducedMotion ? false : { 
                        y: 100, 
                        opacity: 0, 
                        rotateX: 120,
                        scale: 0.2,
                        filter: 'blur(10px)',
                      }}
                      animate={prefersReducedMotion ? undefined : { 
                        y: 0, 
                        opacity: 1, 
                        rotateX: 0,
                        scale: 1,
                        filter: 'blur(0px)',
                      }}
                      whileHover={prefersReducedMotion ? undefined : {
                        y: -10,
                        scale: 1.15,
                        rotateZ: [0, -5, 5, 0],
                        textShadow: '0 0 30px rgba(212,175,55,0.8)',
                        transition: { 
                          duration: 0.3,
                          rotateZ: { duration: 0.5, repeat: 2 },
                        },
                      }}
                      transition={prefersReducedMotion ? undefined : { 
                        duration: 1.4, 
                        delay: i * 0.12,
                        type: 'spring',
                        stiffness: 100,
                        damping: 12,
                      }}
                      style={{
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      {/* Character glow */}
                      {!prefersReducedMotion && (
                        <motion.span
                          className="absolute inset-0"
                          style={{
                            color: 'rgba(255,223,128,0.5)',
                            filter: 'blur(8px)',
                          }}
                          animate={{
                            opacity: [0.3, 0.6, 0.3],
                          }}
                          transition={{
                            duration: 2,
                            delay: i * 0.1,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        >
                          {ch}
                        </motion.span>
                      )}
                      <span className="relative z-10">{ch}</span>
                    </motion.span>
                  ))}
                </span>
                {' '}
                {/* MTM with advanced shimmer & glow */}
                <motion.span
                  className="relative inline-block"
                  initial={prefersReducedMotion ? false : { 
                    opacity: 0, 
                    scale: 0.3,
                    rotateY: 180,
                    filter: 'blur(30px)',
                  }}
                  animate={prefersReducedMotion ? undefined : { 
                    opacity: 1, 
                    scale: 1,
                    rotateY: 0,
                    filter: 'blur(0px)',
                  }}
                  transition={prefersReducedMotion ? undefined : { 
                    duration: 1.8, 
                    delay: 0.7,
                    type: 'spring',
                    stiffness: 80,
                  }}
                >
                  {/* Multi-layer glow */}
                  <motion.span
                    className="absolute -inset-12 rounded-full"
                    style={{
                      background: 'radial-gradient(closest-side, rgba(255,223,128,0.6), rgba(212,175,55,0.3) 40%, transparent 70%)',
                      filter: 'blur(30px)',
                    }}
                    animate={prefersReducedMotion ? undefined : {
                      scale: [1, 1.4, 1.2, 1],
                      opacity: [0.4, 0.8, 0.6, 0.4],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    aria-hidden="true"
                  />
                  <motion.span
                    className="absolute -inset-8 rounded-full"
                    style={{
                      background: 'radial-gradient(closest-side, rgba(212,175,55,0.5), transparent 60%)',
                      filter: 'blur(20px)',
                    }}
                    animate={prefersReducedMotion ? undefined : {
                      scale: [1.2, 1, 1.3, 1.2],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    aria-hidden="true"
                  />
                  
                  {/* Animated shimmer overlay */}
                  <motion.span
                    className="absolute inset-0 rounded-lg overflow-hidden"
                    style={{
                      background: prefersReducedMotion ? undefined : shimmerGradient,
                      mixBlendMode: 'normal',
                    }}
                    aria-hidden="true"
                  />
                  
                  {/* MTM text with gradient */}
                  <span
                    className="relative inline-flex z-10"
                    aria-label="MTM"
                  >
                    {mtmChars.map((ch, i) => (
                      <motion.span
                        key={`m-${i}`}
                        className="inline-block"
                        initial={prefersReducedMotion ? false : { 
                          y: 80, 
                          opacity: 0,
                          rotateY: 180,
                          scale: 0.3,
                        }}
                        animate={prefersReducedMotion ? undefined : { 
                          y: 0, 
                          opacity: 1,
                          rotateY: 0,
                          scale: 1,
                        }}
                        whileHover={prefersReducedMotion ? undefined : {
                          scale: 1.3,
                          rotateZ: [0, -10, 10, -10, 10, 0],
                          y: [-5, -15, -5],
                          transition: { 
                            duration: 0.6,
                            rotateZ: {
                              repeat: 2,
                              duration: 0.4,
                            },
                          },
                        }}
                        transition={prefersReducedMotion ? undefined : { 
                          duration: 1.2, 
                          delay: 0.9 + i * 0.15,
                          type: 'spring',
                          stiffness: 100,
                          damping: 10,
                        }}
                        style={{
                          transformStyle: 'preserve-3d',
                        }}
                      >
                        {/* Character shimmer */}
                        {!prefersReducedMotion && (
                          <motion.span
                            className="absolute inset-0"
                            style={{
                              background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)',
                              backgroundSize: '200% 100%',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text',
                            }}
                            animate={{
                              backgroundPositionX: ['0%', '200%'],
                            }}
                            transition={{
                              duration: 2,
                              delay: i * 0.3,
                              repeat: Infinity,
                              ease: 'linear',
                            }}
                          >
                            {ch}
                          </motion.span>
                        )}
                        <span className="relative z-10" style={{
                          background: 'linear-gradient(135deg, #d4af37 0%, #ffd700 30%, #ffed4e 50%, #ffd700 70%, #d4af37 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          color: 'transparent',
                        }}>{ch}</span>
                      </motion.span>
                    ))}
                  </span>
                </motion.span>
              </motion.h1>
            </motion.div>
          </Reveal>
          <Reveal variants={fadeInUp} delay={0.1}>
            <p className="text-lg text-muted-foreground">Mistrzowie sprintu.</p>
          </Reveal>
          <Reveal variants={scaleIn} delay={0.2}>
            <div className="mt-6 flex items-center justify-center gap-3">
              <MagneticButton strength={0.4}>
                <Button className="bg-gold text-navy shadow-[0_0_30px_rgba(212,175,55,0.5)] hover:shadow-[0_0_50px_rgba(212,175,55,0.8)]">
                  Przejdź do aukcji
                </Button>
              </MagneticButton>
              <MagneticButton strength={0.4}>
                <Button variant="outline" className="border-gold/40 hover:border-gold hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                  Poznaj hodowlę
                </Button>
              </MagneticButton>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default React.memo(HeroSection);
