/**
 * ============================================================================
 * INDEX PAGE - Unified Premium Homepage
 * ============================================================================
 * 
 * Integracja:
 * 1. Premium animacji (Awwwards level) z HomePage.tsx
 * 2. Logiki biznesowej (Auth, Modals, Debug) z Index.tsx
 * 
 * Features:
 * - Luxury smooth scroll (Lenis + GSAP)
 * - Video backgrounds
 * - Multi-layer parallax
 * - Magnetic interactions
 * - Auth flow handling
 */

import React, { useRef, useEffect, useCallback, memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { gsap, ScrollTrigger } from '@/lib/gsapConfig';
import { registerCustomEasings, gsapEasings } from '@/lib/customEasings';
import { ArrowRight, Trophy, Zap, Award, ChevronDown, Star } from 'lucide-react';
import Header from '@/components/Header';
import { Carousel3D } from '@/components/gallery/Carousel3D';
import AboutSection from '@/components/AboutSection';
import PressSection from '@/components/PressSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import { UnifiedModal } from "@/components/ui/UnifiedModal";
import { useAuth } from "@/contexts/AuthContext";
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

    return () => {
      tl.kill();
      parallaxTl.kill();
    };
  }, []);

  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      data-section="hero"
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

        <div className="mb-6 flex flex-wrap items-center justify-center gap-2 md:gap-4">
          <PremiumTextReveal
            className="text-3xl md:text-4xl lg:text-5xl font-bold font-display text-white"
            as="h1"
            splitBy="chars"
            animation="slide"
            stagger={0.03}
            duration={0.8}
            scrub={false}
          >
            Pałka
          </PremiumTextReveal>
          
          <span 
            className="text-3xl md:text-4xl lg:text-5xl font-bold font-display text-gold"
          >
            MTM
          </span>

          <span className="text-3xl md:text-4xl lg:text-5xl font-bold font-display text-white">
            - Geny Zwycięzców
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
              <span>Zobacz Championy</span>
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
  const [isHovered, setIsHovered] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), {
    stiffness: 150,
    damping: 20,
  });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current || !glowRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);

    const glowX = ((e.clientX - rect.left) / rect.width) * 100;
    const glowY = ((e.clientY - rect.top) / rect.height) * 100;

    gsap.to(glowRef.current, {
      '--glow-x': `${glowX}%`,
      '--glow-y': `${glowY}%`,
      duration: 0.3,
      ease: 'power2.out',
    });
  }, [mouseX, mouseY]);

  const handleMouseEnter = () => setIsHovered(true);
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <MagneticElement strength={0.05}>
      <motion.div
        ref={cardRef}
        className="group h-full"
        style={{ 
          perspective: 1000,
          transformStyle: 'preserve-3d',
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          className="h-full flex flex-col p-8 rounded-2xl border border-gold/30 bg-gradient-to-b from-black/70 via-slate-900/60 to-black/60 shadow-[0_25px_80px_rgba(212,175,55,0.15)] backdrop-blur-xl relative"
          style={{
            rotateX: isHovered ? rotateX : 0,
            rotateY: isHovered ? rotateY : 0,
            transformStyle: 'preserve-3d',
            '--glow-x': '50%',
            '--glow-y': '50%',
            minHeight: '260px',
          } as React.CSSProperties}
          whileHover={{ translateY: -8, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
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
            <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-3 group-hover:bg-gold/20 transition-colors duration-500">
              <feature.icon className="w-6 h-6 text-gold" />
            </div>
            <h3 className="text-lg font-semibold font-display text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-white/70 text-sm leading-relaxed">
              {feature.description}
            </p>
          </DepthLayer>
        </motion.div>
      </motion.div>
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
      data-section="features"
    >
      <div className="max-w-6xl mx-auto">
        <RevealOnScroll direction="up" className="mb-16">
          <span className="inline-block px-4 py-1 border border-gold/30 rounded-full text-xs tracking-[0.2em] text-gold/70 uppercase mb-4">
            Dlaczego my
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4 text-gold">
            Najwyższa Jakość Hodowli
          </h2>
          <p className="text-white/70 max-w-xl leading-relaxed">
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

const CTASectionPremium = () => {
  return (
    <SeamlessSection className="py-24 px-4" transitionIn="fade" data-section="cta">
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
    </SeamlessSection>
  );
};

const Index = () => {
  const { user, profile, loading } = useAuth();
  const [showAuthMessage, setShowAuthMessage] = useState(false);

  useEffect(() => {
    document.body.classList.add('home-page');
    ScrollTrigger.refresh();
    
    return () => {
      document.body.classList.remove('home-page');
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  // Debug hotkeys logic preserved from original Index.tsx
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key && e.key.toLowerCase() === 'd' && e.ctrlKey && e.shiftKey) {
        const scrollY = window.scrollY;
        const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-section]'));
        const nearest = sections.reduce<HTMLElement | null>((acc, sec) => {
          const top = sec.getBoundingClientRect().top + window.scrollY;
          const dist = Math.abs(scrollY - top);
          if (!acc) return sec;
          const accTop = acc.getBoundingClientRect().top + window.scrollY;
          return dist < Math.abs(scrollY - accTop) ? sec : acc;
        }, null);
        console.log(`[DEBUG] scrollY=${Math.round(scrollY)} nearest=${nearest?.dataset?.section ?? 'unknown'}`);
      }
      
      if (e.key && e.key.toLowerCase() === 'g' && e.ctrlKey && e.shiftKey) {
        console.clear();
        import('@/debug/gsap-diagnostic').then(module => {
          module.runGSAPDiagnostic();
        });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Auth message logic preserved from original Index.tsx
  useEffect(() => {
    if (!loading && user && profile) {
      const hasShownWelcome = sessionStorage.getItem('hasShownWelcome');
      if (!hasShownWelcome) {
        const timer = setTimeout(() => {
          setShowAuthMessage(true);
          sessionStorage.setItem('hasShownWelcome', 'true');
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [loading, user, profile]);

  const getAuthMessage = () => {
    if (!user || !profile) return null;
    switch (profile.role) {
      case 'USER_REGISTERED':
        return {
          type: 'warning' as const,
          title: 'Wymagana weryfikacja',
          text: 'Twój adres email nie został jeszcze zweryfikowany. Sprawdź swoją skrzynkę odbiorczą, aby uzyskać pełny dostęp.',
          action: () => window.location.reload(),
          actionText: 'Odśwież'
        };
      case 'USER_EMAIL_VERIFIED':
        return {
          type: 'info' as const,
          title: 'Witaj w Pałka MTM!',
          text: `Jesteś zalogowany jako ${profile.email || user.email}. Uzupełnij profil i zweryfikuj telefon, aby licytować.`,
        };
      case 'USER_FULL_VERIFIED':
      case 'ADMIN':
        return {
          type: 'success' as const,
          title: 'Witaj w Pałka MTM!',
          text: `Cieszymy się, że jesteś z nami, ${profile.first_name || profile.name || user.email}! Życzymy udanych licytacji.`,
        };
      default:
        return null;
    }
  };

  const authMessage = getAuthMessage();

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

      {authMessage && (
        <UnifiedModal
          isOpen={showAuthMessage}
          onClose={() => setShowAuthMessage(false)}
          type={authMessage.type}
          title={authMessage.title}
          message={authMessage.text}
          confirmButton={authMessage.action ? {
            text: authMessage.actionText,
            onClick: authMessage.action
          } : {
            text: 'OK',
            onClick: () => setShowAuthMessage(false)
          }}
        />
      )}

      <div className="relative z-10">
        <HeroPremium />
        
        <AboutSection />
        
        <div id="champions" data-reveal data-section="champions">
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

export default Index;