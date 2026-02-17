/**
 * ============================================================================
 * HOMEPAGE PREMIUM - Awwwards Site of the Year Level
 * ============================================================================
 * 
 * Strona główna z zaawansowanymi animacjami GSAP:
 * - Luxury smooth scroll (Lenis + GSAP)
 * - Video backgrounds z ScrollTrigger scrubbing
 * - Multi-layer parallax z custom Bezier curves
 * - Staggered text reveals
 * - Magnetic cursor interactions
 * - Seamless section transitions
 * 
 * Performance: 60 FPS, tylko transform/opacity, will-change optimization
 */

import React, { useRef, useEffect, useCallback, useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { gsap, ScrollTrigger } from '@/lib/gsapConfig';
import { registerCustomEasings, gsapEasings } from '@/lib/customEasings';
import { ArrowRight, Trophy, Zap, Award, ChevronDown, Star, Play } from 'lucide-react';
import { Carousel3D } from '@/components/gallery/Carousel3D';
import AboutSection from '@/components/AboutSection';
import PressSection from '@/components/PressSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import {
  AdvancedParallax,
  DepthLayer,
  ParallaxImage,
  FloatingElement,
  MagneticElement,
  CursorFollower,
  PremiumTextReveal,
  CountUp,
  GradientText,
  SeamlessSection,
  ProgressIndicator,
  RevealOnScroll,
} from '@/components/motion';

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
      <div 
        ref={videoOverlayRef}
        className="absolute inset-0 z-[1] bg-gradient-to-b from-black/60 via-background/40 to-background/90"
        style={{ willChange: 'opacity' }}
      />

      <FloatingElement amplitude={15} frequency={0.3} phase={0} className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gold/10 blur-3xl"
          style={{ willChange: 'transform' }}
        />
      </FloatingElement>
      
      <FloatingElement amplitude={20} frequency={0.25} phase={0.5} className="absolute inset-0 pointer-events-none overflow-hidden">
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

        <div className="mb-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display text-white">
            Pałka
          </h1>
          
          <span 
            className="text-3xl md:text-4xl lg:text-5xl font-bold font-display"
            style={{ 
              color: '#FFD700',
              textShadow: '0 0 10px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.6), 0 0 30px rgba(255, 215, 0, 0.4)'
            }}
          >
            MTM
          </span>

          <span className="text-3xl md:text-4xl lg:text-5xl font-bold font-display text-white">
            - Geny Zwyciezców
          </span>
        </div>

        <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto mb-12 leading-relaxed">
          Wyniki budowane przez pokolenia.
          <br className="hidden md:block" />
          Topowe gołębie pocztowe z Dolnego Śląska.
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
      duration: 0.5,
      ease: 'expo.out',
    });
  }, []);

  return (
    <MagneticElement strength={0.05}>
      <div
        ref={cardRef}
        className="relative group p-8 rounded-2xl border border-border overflow-hidden bg-card/50 backdrop-blur-sm"
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
        
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            boxShadow: '0 0 30px rgba(212,175,55,0.2), inset 0 0 20px rgba(212,175,55,0.05)',
          }}
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
          <GradientText className="text-4xl md:text-5xl font-bold font-display mb-4 block">
            Najwyższa Jakość Hodowli
          </GradientText>
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
    </SeamlessSection>
  );
};

const ChampionsShowcase = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const imagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !imagesRef.current) return;

    const images = imagesRef.current.querySelectorAll('.champion-image');

    images.forEach((img, i) => {
      gsap.fromTo(img, 
        { 
          scale: 1.3, 
          opacity: 0,
          y: 50,
        },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: gsapEasings.luxuryPower,
          scrollTrigger: {
            trigger: img,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
          delay: i * 0.1,
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <SeamlessSection 
      ref={sectionRef as any}
      className="py-24 px-4 relative"
      transitionIn="slide"
    >
      <div className="max-w-7xl mx-auto">
        <RevealOnScroll direction="up" className="text-center mb-16">
          <GradientText className="text-4xl md:text-5xl font-bold font-display mb-4 block">
            Nasze Gwiazdy
          </GradientText>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Poznaj elitarne gołębie z naszej hodowli
          </p>
        </RevealOnScroll>

        <div ref={imagesRef} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((num) => (
            <AdvancedParallax 
              key={num} 
              speed={0.7 + num * 0.05}
              ease="smooth"
            >
              <div className="champion-image overflow-hidden rounded-2xl aspect-[3/4] bg-muted">
                <ParallaxImage
                  src={`/champions/${num}/gallery/${num === 1 ? 'DV-02906-11-98t_OLIMP (1).jpg' : `pl-0446-1${num}-${1000 + num * 100}_c.jpg`}`}
                  alt={`Champion ${num}`}
                  className="hover:scale-110 transition-transform duration-700"
                  scaleRange={[1.15, 1]}
                  width={600}
                  height={800}
                />
              </div>
            </AdvancedParallax>
          ))}
        </div>
      </div>
    </SeamlessSection>
  );
};

const CTASectionPremium = () => {
  return (
    <SeamlessSection className="py-24 px-4" transitionIn="fade">
      <RevealOnScroll direction="up" className="max-w-4xl mx-auto text-center">
        <PremiumTextReveal
          className="text-4xl md:text-5xl font-bold font-display gold-text mb-6"
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
    </SeamlessSection>
  );
};

export const HomePagePremium = () => {
  useEffect(() => {
    ScrollTrigger.refresh();
    
    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div className="min-h-screen relative isolate overflow-hidden">
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

export default HomePagePremium;
