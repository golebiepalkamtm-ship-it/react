/**
 * ============================================================================
 * HOMEPAGE - IMPROVED VERSION
 * ============================================================================
 * 
 * FIXES APPLIED:
 * - Reduced blur effects intensity (performance)
 * - Optimized FloatingElement usage (fewer elements)
 * - Better animation cleanup
 * - Reduced parallax intensity on hero
 * - Added proper will-change management
 * - Optimized stat animations
 * - Better mobile performance
 */

import React, { useRef, useEffect, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { gsap, ScrollTrigger } from '@/lib/gsapConfig';
import { registerCustomEasings, gsapEasings } from '@/lib/customEasings';
import { ArrowRight, Trophy, Zap, Award, ChevronDown, Star, type LucideIcon } from 'lucide-react';
import Header from '@/components/Header';
import { Carousel3D } from '@/components/gallery/Carousel3D';
import AboutSection from '@/components/AboutSection';
import PressSection from '@/components/PressSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import { HomepageWebGL } from '@/components/webgl/HomepageWebGL';
import { ReactiveAudio } from '@/components/audio/ReactiveAudio';
import {
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

  useEffect(() => {
    if (!heroRef.current || !contentRef.current) return;

    const content = contentRef.current;
    const children = Array.from(content.children);

    // Proste fade-in bez GSAP
    children.forEach((child, index) => {
      const element = child as HTMLElement;
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, index * 100);
    });

    return () => {
      children.forEach((child) => {
        const element = child as HTMLElement;
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      });
    };
  }, []);

  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-visible bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-900"
    >
      {/* Uproszczone efekty świetlne */}
      <div className="absolute inset-0 z-[0] pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-gold/10 rounded-full blur-[80px]" />
        <div className="absolute top-1/3 left-0 w-[300px] h-[300px] bg-gold/8 rounded-full blur-[80px]" />
        <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-gold/8 rounded-full blur-[80px]" />
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40 z-[1]" />

      <div 
        ref={contentRef}
        className="relative z-10 max-w-6xl mx-auto px-4 text-center"
      >
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-medium backdrop-blur-sm">
            <Star className="w-4 h-4 fill-gold" />
            <span>Hodowla Gołębi Pocztowych od 1979</span>
          </span>
        </div>

        <div className="mb-6">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display text-white mb-2">
            Pałka
          </h1>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display block text-gold">
            MTM
          </h2>
        </div>

        <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto mb-12 leading-relaxed">
          Trzy pokolenia pasji. Setki mistrzostw.
          <br className="hidden md:block" />
          Elitarne gołębie pocztowe z Dolnego Śląska.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link
            to="/champions"
            className="group flex items-center gap-3 px-8 py-4 bg-gold text-navy rounded-full font-semibold text-lg hover:bg-gold-light transition-all shadow-lg shadow-gold/20"
          >
            <span>Zobacz Championy</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
          {[
            { icon: Trophy, value: 150, suffix: '+', label: 'Mistrzostw' },
            { icon: Award, value: 45, suffix: '+', label: 'Lat Doświadczenia' },
            { icon: Zap, value: 3, suffix: '', label: 'Pokolenia Hodowców' },
          ].map((stat, i) => (
            <div key={stat.label} className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-gold/30 transition-colors">
              <stat.icon className="w-6 h-6 text-gold mx-auto mb-2" />
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                <CountUp 
                  end={stat.value} 
                  duration={2.2} 
                  delay={0.4 + i * 0.15}
                  suffix={stat.suffix}
                />
              </div>
              <div className="text-white/50 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="flex flex-col items-center gap-2 text-white/40 scroll-indicator">
          <span className="text-xs uppercase tracking-widest">Przewiń</span>
          <ChevronDown className="w-5 h-5" />
        </div>
      </div>
    </section>
  );
};

interface FeatureData {
  icon: LucideIcon;
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
  return (
    <div className="relative group p-8 rounded-2xl border border-gold/30 overflow-hidden bg-gradient-to-br from-zinc-800/80 via-zinc-900/80 to-zinc-800/80 backdrop-blur-lg shadow-[0_0_20px_rgba(212,175,55,0.08)]">
      <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mb-6 group-hover:bg-gold/10 transition-colors duration-400">
        <feature.icon className="w-7 h-7 text-gold" />
      </div>
      <h3 className="text-xl font-semibold font-display text-foreground mb-3">
        {feature.title}
      </h3>
      <p className="text-muted-foreground">{feature.description}</p>
    </div>
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
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 border border-gold/30 rounded-full text-xs tracking-[0.2em] text-gold/70 uppercase mb-4">
            Dlaczego my
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4 text-gold">
            Najwyższa Jakość Hodowli
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Od ponad 50 lat dostarczamy championów hodowcom na całym świecie.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index}>
              <FeatureCardPremium feature={feature} index={index} />
            </div>
          ))}
        </div>
      </div>

      {/* Simplified background effect */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-gold/5 to-transparent blur-[120px] opacity-30" />
      </div>
    </SeamlessSection>
  );
};

const CTASectionPremium = () => {
  return (
    <SeamlessSection className="py-24 px-4 relative" transitionIn="fade">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold font-display gold-text mb-6">
          Gotowy na swojego Championa?
        </h2>

        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Przeglądaj naszą ekskluzywną kolekcję i znajdź idealnego gołębia
          dla swojej hodowli.
        </p>

        <Link
          to="/champions"
          className="group inline-flex items-center gap-2 px-8 py-4 bg-gold text-background rounded-full font-semibold hover:bg-gold-light transition-colors shadow-lg shadow-gold/20"
        >
          <span>Eksploruj Galerię</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Simplified background effect */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-gold/8 to-transparent blur-[120px] opacity-40" />
      </div>
    </SeamlessSection>
  );
};

export const HomePage = () => {
  const scrollTriggerRef = useRef<ScrollTrigger[]>([]);

  useEffect(() => {
    document.body.classList.add('home-page');
    
    // Prosty scroll handler dla velocity
    const handleScroll = () => {
      const velocity = parseFloat(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--scroll-velocity') || '0'
      );
      if (velocity > 0.1) {
        document.body.classList.add('is-scrolling');
      } else {
        document.body.classList.remove('is-scrolling');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Refresh ScrollTrigger
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(refreshTimer);
      document.body.classList.remove('home-page');
      
      // Kill all ScrollTriggers
      const triggers = ScrollTrigger.getAll();
      triggers.forEach(t => t.kill());
      scrollTriggerRef.current = [];
      
      document.body.classList.remove('is-scrolling');
    };
  }, []);

  return (
    <div className="min-h-screen relative isolate overflow-hidden">
      <Header />
      <ProgressIndicator color="rgba(212, 175, 55, 0.8)" height={2} />
      
      <HomepageWebGL />
      <ReactiveAudio />
      <CursorFollower size={24} color="rgba(212, 175, 55, 0.4)" />

      {/* Background layers */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <DepthLayer depth={1}>
          <div className="absolute top-20 left-10 w-32 h-32 bg-gold/5 rounded-full blur-[60px]" />
        </DepthLayer>
        <DepthLayer depth={2}>
          <div className="absolute top-1/3 right-20 w-40 h-40 bg-blue-500/5 rounded-full blur-[80px]" />
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