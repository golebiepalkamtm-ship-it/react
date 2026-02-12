/**
 * HomePage - Clean Implementation
 * Lenis (smooth scroll) + GSAP ScrollTrigger + Framer Motion
 * Properly integrated without conflicts
 */

import React, { useRef, useEffect, memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Trophy, Zap, Award, ChevronDown, Star, type LucideIcon } from 'lucide-react';
import Header from '@/components/Header';
import { Carousel3D } from '@/components/gallery/Carousel3D';
import AboutSection from '@/components/AboutSection';
import PressSection from '@/components/PressSection';
import PressScrollEffect from '@/components/PressScrollEffect';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import { PressService } from '@/services/pressService';
import type { PressArticle } from '@/services/pressService';

gsap.registerPlugin(ScrollTrigger);

// ============================================================================
// HERO SECTION
// ============================================================================

const HeroSection = () => {
  const heroRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // GSAP: Parallax blur spots on scroll
  useEffect(() => {
    if (!heroRef.current) return;

    const ctx = gsap.context(() => {
      // Parallax for blur spots
      gsap.to('.hero-blur', {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
        },
      });

      // Fade out scroll indicator
      gsap.to('.scroll-indicator', {
        opacity: 0,
        y: -20,
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: '30% top',
          scrub: true,
        },
      });

      // Content parallax (subtle)
      gsap.to(contentRef.current, {
        yPercent: 15,
        opacity: 0.3,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
        },
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const stats = [
    { icon: Trophy, value: '150+', label: 'Mistrzostw' },
    { icon: Award, value: '45+', label: 'Lat Doświadczenia' },
    { icon: Zap, value: '3', label: 'Pokolenia Hodowców' },
  ];

  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-900"
    >
      {/* Animated blur spots - GSAP parallax */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div className="hero-blur absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gold/20 rounded-full blur-[120px]" />
        <div className="hero-blur absolute top-1/3 -left-32 w-[500px] h-[500px] bg-gold/10 rounded-full blur-[100px]" />
        <div className="hero-blur absolute top-1/4 -right-32 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 z-[1]" />

      {/* Content - Framer Motion stagger */}
      <motion.div 
        ref={contentRef}
        className="relative z-10 max-w-6xl mx-auto px-4 text-center"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.3 }
          }
        }}
      >
        {/* Badge */}
        <motion.div 
          className="mb-8"
          variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
        >
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-sm font-medium">
            <Star className="w-4 h-4 fill-gold" />
            Hodowla Gołębi Pocztowych od 1979
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1 
          className="text-6xl md:text-8xl font-bold font-display text-white mb-4"
          variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }}
        >
          Pałka <span className="text-gold">MTM</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto mb-12"
          variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
        >
          Trzy pokolenia pasji. Setki mistrzostw.
          <br />
          Elitarne gołębie pocztowe z Dolnego Śląska.
        </motion.p>

        {/* CTA Button */}
        <motion.div 
          className="mb-16"
          variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
        >
          <Link
            to="/champions"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gold text-zinc-900 rounded-full font-semibold text-lg hover:bg-gold/90 transition-colors shadow-lg shadow-gold/25"
          >
            Zobacz Championy
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto"
          variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
        >
          {stats.map((stat) => (
            <div 
              key={stat.label}
              className="text-center p-6 rounded-2xl bg-white/5 border border-white/10"
            >
              <stat.icon className="w-6 h-6 text-gold mx-auto mb-2" />
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-white/50 text-sm">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <div className="scroll-indicator absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <motion.div 
          className="flex flex-col items-center gap-2 text-white/40"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-xs uppercase tracking-widest">Przewiń</span>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </div>
    </section>
  );
};

// ============================================================================
// FEATURES SECTION
// ============================================================================

interface FeatureData {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureCard = memo(({ feature, index }: { feature: FeatureData; index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // GSAP: Reveal on scroll
  useEffect(() => {
    if (!cardRef.current) return;

    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: index * 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );
  }, [index]);

  return (
    <div 
      ref={cardRef}
      className="group p-8 rounded-2xl border border-gold/20 bg-zinc-900/50 hover:border-gold/40 hover:bg-zinc-800/50 transition-all duration-300"
    >
      <div className="w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors">
        <feature.icon className="w-7 h-7 text-gold" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
      <p className="text-white/60">{feature.description}</p>
    </div>
  );
});

FeatureCard.displayName = 'FeatureCard';

const FeaturesSection = () => {
  const titleRef = useRef<HTMLDivElement>(null);

  // GSAP: Title reveal
  useEffect(() => {
    if (!titleRef.current) return;

    gsap.fromTo(titleRef.current,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: titleRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    );
  }, []);

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
    <section className="py-24 px-4 bg-zinc-900">
      <div className="max-w-6xl mx-auto">
        <div ref={titleRef} className="text-center mb-16">
          <span className="inline-block px-4 py-1 border border-gold/30 rounded-full text-xs tracking-widest text-gold/70 uppercase mb-4">
            Dlaczego my
          </span>
          <h2 className="text-4xl font-bold text-gold mb-4">Najwyższa Jakość Hodowli</h2>
          <p className="text-white/60 max-w-xl mx-auto">
            Od ponad 50 lat dostarczamy championów hodowcom na całym świecie.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// CTA SECTION
// ============================================================================

const CTASection = () => {
  const sectionRef = useRef<HTMLElement>(null);

  // GSAP: Reveal
  useEffect(() => {
    if (!sectionRef.current) return;

    gsap.fromTo(sectionRef.current.querySelector('.cta-content'),
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      }
    );
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-4 bg-zinc-800">
      <div className="cta-content max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-gold mb-6">
          Gotowy na swojego Championa?
        </h2>
        <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto">
          Przeglądaj naszą ekskluzywną kolekcję i znajdź idealnego gołębia dla swojej hodowli.
        </p>
        <Link
          to="/champions"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-zinc-900 rounded-full font-semibold hover:bg-gold/90 transition-colors"
        >
          Eksploruj Galerię
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </section>
  );
};

// ============================================================================
// MAIN HOMEPAGE
// ============================================================================

export const HomePage = () => {
  const [pressArticles, setPressArticles] = useState<PressArticle[]>([]);

  // Load press articles
  useEffect(() => {
    const loadArticles = async () => {
      try {
        const articles = await PressService.loadArticles();
        setPressArticles(articles);
      } catch (error) {
        console.error('Failed to load press articles:', error);
      }
    };
    loadArticles();
  }, []);

  // Cleanup ScrollTriggers on unmount
  useEffect(() => {
    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div className="min-h-screen bg-zinc-900">
      <Header />
      
      <main>
        <HeroSection />
        
        <section id="champions">
          <Carousel3D />
        </section>
        
        <FeaturesSection />
        <AboutSection />
        <PressSection />
        <CTASection />
        <ContactSection />
        <Footer />
      </main>
    </div>
  );
};

export default HomePage;