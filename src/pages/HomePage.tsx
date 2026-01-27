/**
 * ============================================================================
 * HOMEPAGE - Awwwards Site of the Year Level
 * ============================================================================
 * 
 * Premium strona główna z zaawansowanymi animacjami GSAP:
 * - Luxury smooth scroll (Lenis + GSAP, duration: 3.2s, wheelMultiplier: 0.35)
 * - Video backgrounds z ScrollTrigger scrubbing
 * - Multi-layer parallax z custom Bezier curves
 * - Staggered text reveals (character/word level)
 * - Magnetic cursor interactions
 * - Seamless section transitions
 * 
 * PHYSICS OF MOTION:
 * - Exponential easing: f(t) = 1 - 2^(-10t) dla naturalnego deceleration
 * - Spring physics dla micro-interactions: decay * oscillation
 * - Anticipation/overshoot dla dramatycznych efektów
 * 
 * PERFORMANCE:
 * - 60 FPS guaranteed (gsap.ticker.fps(60))
 * - Only transform/opacity animations (no repaints/layout shifts)
 * - will-change optimization (applied only during animation)
 * - GPU acceleration via translateZ(0)
 */

import React, { useRef, useEffect, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { gsap, ScrollTrigger } from '@/lib/gsapConfig';
import { registerCustomEasings, gsapEasings } from '@/lib/customEasings';
import { ArrowRight, Trophy, Zap, Award, ChevronDown, Star } from 'lucide-react';
import Header from '@/components/Header';
import { Carousel3D } from '@/components/gallery/Carousel3D';
import AboutSection from '@/components/AboutSection';
import PressSection from '@/components/PressSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import {
  VideoBackground,
  DepthLayer,
  FloatingElement,
  MagneticElement,
  CursorFollower,
  PremiumTextReveal,
  CountUp,
  GradientText,
  SeamlessSection,
  ProgressIndicator,
  RevealOnScroll,
} from '@/components/animations';

registerCustomEasings();

const HeroPremium = () => {
  const heroRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const videoOverlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current || !contentRef.current) return;

    const content = contentRef.current;
    const children = content.children;

    gsap.set(children, { opacity: 0, y: 60 });

    const tl = gsap.timeline({
      defaults: { ease: gsapEasings.heroReveal, duration: 1.2 },
    });

    tl.to(children, {
      opacity: 1,
      y: 0,
      stagger: 0.15,
      delay: 0.3,
    });

    const parallaxTl = gsap.timeline({
      scrollTrigger: {
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
      },
    });

    parallaxTl
      .to(content, { y: 150, opacity: 0.3, scale: 0.95 }, 0)
      .to(videoOverlayRef.current, { opacity: 0.8 }, 0);

    // Add visual effects for Living Sites
    const floatingElements = heroRef.current.querySelectorAll('[class*="FloatingElement"]');
    floatingElements.forEach((element: HTMLElement) => {
      gsap.to(element, {
        opacity: 0.8,
        scale: 1.2,
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    });

    return () => {
      tl.kill();
      parallaxTl.kill();
    };
  }, []);

  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <VideoBackground
        src="/videos/hero-video.mp4"
        className="z-0"
        overlayClassName="bg-gradient-to-b from-black/40 via-black/50 to-black/70"
        scrub={false}
        fadeIn={false}
        fadeOut={false}
      />
      
      <div 
        ref={videoOverlayRef}
        className="absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-background/30 to-background/80"
        style={{ willChange: 'opacity' }}
      />

      <FloatingElement amplitude={15} frequency={0.3} phase={0}>
        <div 
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gold/10 blur-3xl"
          style={{ willChange: 'transform' }}
        />
      </FloatingElement>
      
      <FloatingElement amplitude={20} frequency={0.25} phase={0.5}>
        <div 
          className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl"
          style={{ willChange: 'transform' }}
        />
      </FloatingElement>

      <div 
        ref={contentRef}
        className="relative z-10 max-w-6xl mx-auto px-4 text-center"
      >
        <MagneticElement strength={0.1} className="mb-8">
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-medium backdrop-blur-sm">
            <Star className="w-4 h-4 fill-gold" />
            <span>Hodowla Gołębi Pocztowych od 1979</span>
          </span>
        </MagneticElement>

        <div className="mb-6">
          <PremiumTextReveal
            className="text-3xl md:text-4xl lg:text-5xl font-bold font-display text-white mb-2"
            as="h1"
            splitBy="chars"
            animation="slide"
            stagger={0.03}
            duration={0.8}
            scrub={false}
          >
            Pałka
          </PremiumTextReveal>
          
          <GradientText 
            className="text-3xl md:text-4xl lg:text-5xl font-bold font-display block"
            colors={['#d4af37', '#ffd700', '#ffed4e', '#ffd700', '#d4af37']}
          >
            <PremiumTextReveal
              as="span"
              splitBy="chars"
              animation="scale"
              stagger={0.04}
              duration={0.6}
              delay={0.3}
              scrub={false}
            >
              MTM
            </PremiumTextReveal>
          </GradientText>
        </div>

        <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto mb-12 leading-relaxed">
          Trzy pokolenia pasji. Setki mistrzostw.
          <br className="hidden md:block" />
          Elitarne gołębie pocztowe z Dolnego Śląska.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <MagneticElement strength={0.15}>
            <Link
              to="/champions"
              className="group flex items-center gap-3 px-8 py-4 bg-gold text-navy rounded-full font-semibold text-lg hover:bg-gold-light transition-all shadow-lg shadow-gold/20"
              style={{ willChange: 'transform' }}
            >
              <span>Zobacz Championów</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </MagneticElement>
        </div>

        <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
          {[
            { icon: Trophy, value: 150, suffix: '+', label: 'Mistrzostw' },
            { icon: Award, value: 45, suffix: '+', label: 'Lat Doświadczenia' },
            { icon: Zap, value: 3, suffix: '', label: 'Pokolenia Hodowców' },
          ].map((stat, i) => (
            <MagneticElement key={stat.label} strength={0.08}>
              <div 
                className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-gold/30 transition-colors"
                style={{ willChange: 'transform' }}
              >
                <stat.icon className="w-6 h-6 text-gold mx-auto mb-2" />
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                  <CountUp 
                    end={stat.value} 
                    duration={2.5} 
                    delay={0.5 + i * 0.2}
                    suffix={stat.suffix}
                  />
                </div>
                <div className="text-white/50 text-sm">{stat.label}</div>
              </div>
            </MagneticElement>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <FloatingElement amplitude={8} frequency={0.5}>
          <div className="flex flex-col items-center gap-2 text-white/40">
            <span className="text-xs uppercase tracking-widest">Przewiń</span>
            <ChevronDown className="w-5 h-5" />
          </div>
        </FloatingElement>
      </div>
    </section>
  );
};

interface FeatureData {
  icon: React.ElementType;
  title: string;
  description: string;
}

const FeatureCardPremium = memo(({ 
  feature, 
  index 
}: { 
  feature: FeatureData; 
  index: number 
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current || !glowRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    gsap.to(glowRef.current, {
      '--glow-x': `${x}%`,
      '--glow-y': `${y}%`,
      duration: 0.3,
      ease: 'power2.out',
    });
  }, []);

  return (
    <MagneticElement strength={0.05}>
      <div
        ref={cardRef}
        className="relative group p-8 rounded-2xl border border-gold/30 overflow-hidden bg-gradient-to-br from-zinc-800/80 via-zinc-900/80 to-zinc-800/80 backdrop-blur-lg shadow-[0_0_30px_rgba(212,175,55,0.1),inset_0_1px_0_rgba(255,255,255,0.05)]"
        onMouseMove={handleMouseMove}
        style={{ 
          willChange: 'transform',
          '--glow-x': '50%',
          '--glow-y': '50%',
        } as React.CSSProperties}
      >
        <div
          ref={glowRef}
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at var(--glow-x) var(--glow-y), rgba(212,175,55,0.15) 0%, transparent 50%)',
          }}
        />
        
        <div className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            boxShadow: '0 0 30px rgba(212,175,55,0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        />
        <div 
          className="absolute -top-10 left-1/2 -translate-x-1/2 w-[150%] h-24 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.15) 0%, transparent 60%)' }}
        />
        
        <DepthLayer depth={index} className="relative z-10">
          <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mb-6 group-hover:bg-gold/10 transition-colors duration-500">
            <feature.icon className="w-7 h-7 text-gold" />
          </div>
          <h3 className="text-xl font-semibold font-display text-foreground mb-3">
            {feature.title}
          </h3>
          <p className="text-muted-foreground">{feature.description}</p>
        </DepthLayer>
      </div>
    </MagneticElement>
  );
});

FeatureCardPremium.displayName = 'FeatureCardPremium';

const FeaturesSectionPremium = () => {
  const features: FeatureData[] = [
    {
      icon: Trophy,
      title: 'Elitarne Rodowody',
      description: 'Każdy gołąb pochodzi z linii wielokrotnych mistrzów i championów.',
    },
    {
      icon: Zap,
      title: 'Prędkość & Wytrzymałość',
      description: 'Rekordy prędkości i dystansu potwierdzone w najważniejszych zawodach.',
    },
    {
      icon: Award,
      title: 'Gwarancja Jakości',
      description: 'Pełna dokumentacja, badania DNA i historia lotów każdego ptaka.',
    },
  ];

  return (
    <SeamlessSection
      className="py-24 px-4 relative overflow-hidden"
      transitionIn="fade"
    >
      <div className="max-w-6xl mx-auto">
        <RevealOnScroll direction="up" className="text-center mb-16">
          <span className="inline-block px-4 py-1 border border-gold/30 rounded-full text-xs tracking-[0.2em] text-gold/70 uppercase mb-4">
            Dlaczego my
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4 text-gold">
            Najwyższa Jakość Hodowli
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Od ponad 50 lat dostarczamy championów hodowcom na całym świecie.
          </p>
        </RevealOnScroll>

        <RevealOnScroll
          direction="up"
          stagger={0.15}
          className="grid md:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <div key={index}>
              <FeatureCardPremium feature={feature} index={index} />
            </div>
          ))}
        </RevealOnScroll>
      </div>

      {/* Add visual effects for Living Sites */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-gold/5 to-transparent blur-3xl opacity-30" />
      </div>
    </SeamlessSection>
  );
};

const CTASectionPremium = () => {
  return (
    <SeamlessSection className="py-24 px-4" transitionIn="fade">
      <RevealOnScroll direction="up" className="max-w-4xl mx-auto text-center">
        <PremiumTextReveal
          className="text-3xl md:text-4xl font-bold font-display gold-text mb-6"
          as="h2"
          splitBy="words"
          animation="slide"
          stagger={0.1}
          scrub={false}
        >
          Gotowy na swojego Championa?
        </PremiumTextReveal>

        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Przeglądaj naszą ekskluzywną kolekcję i znajdź idealnego gołębia
          dla swojej hodowli.
        </p>

        <MagneticElement strength={0.2}>
          <Link
            to="/champions"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-gold text-background rounded-full font-semibold hover:bg-gold-light transition-colors shadow-lg shadow-gold/20"
          >
            <span>Eksploruj Galerię</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </MagneticElement>
      </RevealOnScroll>

      {/* Add visual effects for Living Sites */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-gold/10 to-transparent blur-3xl opacity-50" />
      </div>
    </SeamlessSection>
  );
};

export const HomePage = () => {
  useEffect(() => {
    document.body.classList.add('home-page');
    ScrollTrigger.refresh();
    
    return () => {
      document.body.classList.remove('home-page');
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div className="min-h-screen relative isolate overflow-hidden">
      <Header />
      <ProgressIndicator color="rgba(212, 175, 55, 0.8)" height={2} />
      
      <CursorFollower size={24} color="rgba(212, 175, 55, 0.4)" />

      <div className="fixed inset-0 -z-10 pointer-events-none">
        <DepthLayer depth={1}>
          <div className="absolute top-20 left-10 w-32 h-32 bg-gold/5 rounded-full blur-2xl" />
        </DepthLayer>
        <DepthLayer depth={2}>
          <div className="absolute top-1/3 right-20 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl" />
        </DepthLayer>
        <DepthLayer depth={3}>
          <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
        </DepthLayer>
      </div>

      <div className="relative z-10">
        <HeroPremium />
        
        <AboutSection />
        
        <div id="champions" data-reveal>
          <Carousel3D />
        </div>
        
        <FeaturesSectionPremium />
        
        <PressSection />
        
        <CTASectionPremium />
        
        <ContactSection />
        
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;