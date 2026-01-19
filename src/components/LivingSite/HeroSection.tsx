/* ========================================
   CHAMPION PIGEON HERO SECTION
   World-class hero with subtle animations
   ======================================== */

import { useEffect, useRef } from 'react';
import { useLivingSite } from '@/hooks/useLivingSite';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  backgroundImage?: string;
  cta?: {
    text: string;
    action: () => void;
  };
}

export const HeroSection = ({ 
  title, 
  subtitle, 
  backgroundImage,
  cta 
}: HeroSectionProps) => {
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);

  const { scrollReveal, parallax } = useLivingSite({
    lerp: 0.08,
    duration: 1.5,
    enableAnimations: true,
  });

  useEffect(() => {
    if (!heroRef.current) return;

    // Animate hero elements
    const cleanupTitle = titleRef.current ? scrollReveal(titleRef.current, {
      direction: 'up',
      distance: 40,
      duration: 1.0,
      delay: 0.2,
    }) : undefined;

    const cleanupSubtitle = subtitleRef.current ? scrollReveal(subtitleRef.current, {
      direction: 'up',
      distance: 30,
      duration: 0.8,
      delay: 0.4,
    }) : undefined;

    const cleanupCta = ctaRef.current ? scrollReveal(ctaRef.current, {
      direction: 'up',
      distance: 20,
      duration: 0.6,
      delay: 0.6,
    }) : undefined;

    // Parallax background
    const bgElement = heroRef.current.querySelector('.hero-background') as HTMLElement;
    const cleanupParallax = bgElement ? parallax(bgElement, {
      speed: 0.3,
      direction: 'vertical',
    }) : undefined;

    return () => {
      cleanupTitle?.();
      cleanupSubtitle?.();
      cleanupCta?.();
      cleanupParallax?.();
    };
  }, [scrollReveal, parallax]);

  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background with parallax */}
      <div 
        className="hero-background absolute inset-0 z-0"
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/50 via-navy-900/70 to-navy-950" />
        
        {/* Subtle vignette */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-navy-950/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 py-20 max-w-4xl mx-auto">
        <h1 
          ref={titleRef}
          className="text-6xl md:text-7xl lg:text-8xl font-display font-bold text-white mb-6 leading-tight"
        >
          {title}
        </h1>
        
        <p 
          ref={subtitleRef}
          className="text-xl md:text-2xl lg:text-3xl text-gray-200 mb-12 leading-relaxed max-w-2xl mx-auto"
        >
          {subtitle}
        </p>

        {cta && (
          <button
            ref={ctaRef}
            onClick={cta.action}
            className="btn btn-primary btn-lg px-8 py-4 text-lg font-medium shadow-gold-lg hover:shadow-gold-lg hover:scale-105 transition-all duration-300"
          >
            {cta.text}
          </button>
        )}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-gold-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gold-400 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};
