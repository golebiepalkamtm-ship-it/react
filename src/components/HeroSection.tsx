import { useEffect, useRef, memo, useCallback } from 'react';
import { motion } from 'framer-motion';

const HeroSection = memo(() => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const attemptVideoPlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    // Try to play programmatically (some browsers require a user gesture otherwise)
    const p = v.play();
    if (p && typeof p.then === 'function') {
      p.catch(() => {
        // ignore play rejection (autoplay blocked) — video still available with controls if needed
      });
    }
  }, []);

  useEffect(() => {
    attemptVideoPlay();
  }, [attemptVideoPlay]);

  // WebGPU is initialized globally in main.tsx
  return (
    <section id="home" className="relative h-[72vh] md:h-[74vh] lg:h-[76vh] flex items-end justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <motion.video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute left-1/2 bottom-0 h-[44vh] md:h-[46vh] w-auto -translate-x-1/2 object-cover opacity-100 z-10"
          initial={{ opacity: 0, y: 20, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <source src="/pigeon-tlo-Picsart-BackgroundRemover.mp4" type="video/mp4" />
        </motion.video>
        {/* Vignette overlay */}
        <div className="absolute inset-0 bg-vignette z-15 pointer-events-none"></div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent via-black/20 to-black/20 z-20 pointer-events-none" />

      {/* Hero text */}
      <div className="absolute left-1/2 -translate-x-1/2 z-20 text-center top-12 md:top-16 w-full">
        {/* Entrance effects moved to global canvas; year lettering removed per request */}

        <motion.h2
          className="hero-title relative text-3xl md:text-5xl lg:text-6xl"
          initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: 0.05, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          PAŁKA MTM
        </motion.h2>
        <motion.p
          className="hero-subtitle mt-2 text-lg md:text-2xl tracking-wide"
          initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: 0.22, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          MISTRZOWIE SPRINTU
        </motion.p>
      </div>
    </section>
  );
});

export default HeroSection;