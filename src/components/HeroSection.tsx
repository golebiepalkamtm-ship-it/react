import React, { useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronDown } from 'lucide-react';

// Animation Constants
const EASING = [0.22, 1, 0.36, 1]; // "Luxury" Custom Bezier

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.3,
    },
  },
};

const textVariants = {
  hidden: { y: 40, opacity: 0, filter: 'blur(8px)' },
  visible: {
    y: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 1.4,
      ease: EASING,
    },
  },
};

const buttonVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.34, 1.56, 0.64, 1], // Spring-like elastic
    },
  },
};

function HeroSection() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLElement>(null);

  // Parallax Effect
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const yVideo = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacityVideo = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "60%"]);

  const attemptVideoPlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const p = v.play();
    if (p && typeof p.then === 'function') p.catch(() => {});
  }, []);

  useEffect(() => {
    attemptVideoPlay();
  }, [attemptVideoPlay]);

  const scrollToAuctions = () => {
    const element = document.getElementById('auctions');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      ref={containerRef}
      id="home" 
      className="relative min-h-[90vh] flex flex-col items-center justify-start overflow-hidden pt-14 pb-12 perspective-1000"
    >
      {/* Text Content (Header) - SOLID LUXURY */}
      <div className="relative z-50 container mx-auto px-4 text-center mb-4">
        <div className="mb-6 animate-in fade-in zoom-in-95 duration-700 delay-150">
          <span className="inline-block px-4 py-1.5 rounded-none border-y border-gold/40 text-gold text-sm font-semibold tracking-[0.3em] uppercase bg-background/50 backdrop-blur-sm">
            Est. 1995
          </span>
        </div>

        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-foreground font-bold leading-none tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          PAŁKA <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b15e2f] via-[#f5ae82] to-[#b15e2f]">MTM</span>
        </h1>

        <p className="text-lg md:text-2xl text-muted-foreground font-light tracking-wide max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
          Mistrzowie sprintu. Elitarna hodowla gołębi pocztowych.
        </p>
      </div>

      {/* Video Element (Pigeon) - STATIC */}
      <div className="relative z-10 flex items-center justify-center w-full max-w-6xl h-[40vh] md:h-[55vh]">
        {/* Background Spotlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-radial from-gold/20 via-transparent to-transparent blur-[80px] opacity-60" />
        
        <div className="w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
              src="/pigeon-tlo-Picsart-BackgroundRemover.mp4"
            />
        </div>
      </div>

      {/* Buttons (CTA) - MODERN GLASSMORPHISM */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-50 flex flex-col sm:flex-row items-center justify-center gap-6 mt-8 md:mt-12"
      >
        <motion.div variants={buttonVariants}>
          <Button 
            size="lg" 
            className="relative overflow-hidden bg-gradient-to-r from-gold via-[#FDB931] to-gold text-navy font-bold text-lg px-10 py-7 rounded-none skew-x-[-10deg] hover:skew-x-0 transition-transform duration-300 shadow-[0_0_30px_rgba(212,175,55,0.4)] group"
            onClick={scrollToAuctions}
          >
            <span className="relative z-10 flex items-center skew-x-[10deg] group-hover:skew-x-0 transition-transform duration-300">
              PRZEJDŹ DO AUKCJI
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Button>
        </motion.div>
        
        <motion.div variants={buttonVariants}>
          <Button 
            variant="outline" 
            size="lg"
            className="relative overflow-hidden border border-white/20 bg-white/5 text-white font-bold text-lg px-10 py-7 rounded-none skew-x-[-10deg] hover:skew-x-0 transition-all duration-300 hover:bg-white/10 hover:border-gold/50 group backdrop-blur-md"
          >
            <span className="relative z-10 skew-x-[10deg] group-hover:skew-x-0 transition-transform duration-300">
              POZNAJ HODOWLĘ
            </span>
          </Button>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 text-muted-foreground/50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-8 h-8" />
        </motion.div>
      </motion.div>
    </section>
  );
}

export default React.memo(HeroSection);
