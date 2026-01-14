import React, { useRef, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Trophy, Zap, Award, ChevronDown, Star } from 'lucide-react';
import { Carousel3D } from '@/components/gallery/Carousel3D';
import AboutSection from '@/components/AboutSection';
import PressSection from '@/components/PressSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';

// Hero Section - czysta, elegancka animacja Framer Motion
const HeroSection = () => {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const y = useTransform(scrollY, [0, 400], [0, 100]);
  const scale = useTransform(scrollY, [0, 400], [1, 0.95]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/80" />
      
      {/* Animated Glow */}
      <motion.div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Content */}
      <motion.div 
        className="relative z-10 max-w-6xl mx-auto px-4 text-center"
        style={{ opacity, y, scale }}
      >
        {/* Badge */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-medium">
            <Star className="w-4 h-4 fill-gold" />
            <span>Hodowla Gołębi Pocztowych od 1979</span>
          </span>
        </motion.div>

        {/* Main heading */}
        <motion.h1 
          className="text-5xl md:text-7xl lg:text-8xl font-bold font-display mb-6"
          data-split-text
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <span className="block text-white mb-2">Pałka</span>
          <span className="block gold-text">MTM</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto mb-12 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          Trzy pokolenia pasji. Setki mistrzostw.
          <br className="hidden md:block" />
          Elitarne gołębie pocztowe z Dolnego Śląska.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <Link
            to="/champions"
            className="group flex items-center gap-3 px-8 py-4 bg-gold text-navy rounded-full font-semibold text-lg hover:bg-gold-light transition-all hover:scale-105 shadow-lg shadow-gold/20"
          >
            <span>Zobacz Championów</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/achievements"
            className="flex items-center gap-3 px-8 py-4 text-white rounded-full font-semibold text-lg border-2 border-white/20 hover:border-gold/50 hover:text-gold transition-all"
          >
            <Trophy className="w-5 h-5" />
            <span>Nasze Osiągnięcia</span>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div 
          className="grid grid-cols-3 gap-8 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          {[
            { icon: Trophy, value: '150+', label: 'Mistrzostw' },
            { icon: Award, value: '45+', label: 'Lat Doświadczenia' },
            { icon: Zap, value: '3', label: 'Pokolenia Hodowców' },
          ].map((stat, i) => (
            <motion.div 
              key={stat.label}
              className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
              whileHover={{ scale: 1.05, borderColor: 'rgba(212,175,55,0.3)' }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <stat.icon className="w-6 h-6 text-gold mx-auto mb-2" />
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-white/50 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <motion.div 
          className="flex flex-col items-center gap-2 text-white/40"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-xs uppercase tracking-widest">Przewiń</span>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </section>
  );
};

// Feature Card Component - ZOPTYMALIZOWANY
const FeatureCard = React.memo(({ feature, index }: { feature: { icon: any; title: string; description: string }; index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), {
    stiffness: 150,
    damping: 20,
  });
  
  const lightX = useTransform(mouseX, [-0.5, 0.5], [0, 100]);
  const lightY = useTransform(mouseY, [-0.5, 0.5], [0, 100]);
  
  const lightBackground = useTransform(
    [lightX, lightY],
    ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.15) 0%, transparent 50%)`
  );
  
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  }, [mouseX, mouseY]);
  
  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);
  
  return (
    <motion.div
      ref={cardRef}
      className="relative group"
      style={{ perspective: '1000px' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative p-8 rounded-2xl border border-border overflow-hidden"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ scale: { duration: 0.2 } }}
      >
        {/* Dynamic light reflection - ZOPTYMALIZOWANE */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: lightBackground,
            opacity: isHovered ? 1 : 0,
            willChange: 'opacity',
          }}
        />
        
        {/* Glow border on hover - JASNY jak w ChampionCard */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none z-20"
          initial={{ opacity: 0 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            boxShadow: isHovered
              ? '0 0 30px rgba(150, 150, 200, 0.3), inset 0 0 20px rgba(150, 150, 200, 0.1)'
              : 'none',
          }}
          transition={{ duration: 0.3 }}
          style={{ willChange: 'opacity, box-shadow' }}
        />
        
        {/* Scanline effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 0.15 : 0 }}
          style={{ willChange: 'opacity' }}
        >
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(255, 255, 255, 0.03) 2px,
                rgba(255, 255, 255, 0.03) 4px
              )`
            }}
          />
        </motion.div>
        
        <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
          <feature.icon className="w-7 h-7 text-gold" />
        </div>
        <h3 className="text-xl font-semibold font-display text-foreground mb-3">
          {feature.title}
        </h3>
        <p className="text-muted-foreground">{feature.description}</p>
      </motion.div>
    </motion.div>
  );
});

FeatureCard.displayName = 'FeatureCard';

// Features Section - z GSAP batch reveal
const FeaturesSection = () => {
  const features = [
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
    <section className="py-24 px-4 relative overflow-hidden" data-fade-in>
      <div className="max-w-6xl mx-auto">
        {/* Nagłówek z GSAP word reveal */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 border border-primary/30 rounded-full text-xs tracking-[0.2em] text-primary/70 uppercase mb-4">
            Dlaczego my
          </span>
          <h2 className="text-4xl md:text-5xl font-bold font-display gold-text mb-4" data-word-reveal data-split-text>
            Najwyższa Jakość Hodowli
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Od ponad 50 lat dostarczamy championów hodowcom na całym świecie.
          </p>
        </div>

        {/* Karty z GSAP batch stagger reveal (0.2s) */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} data-reveal-item>
              <FeatureCard feature={feature} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// CTA Section z GSAP fade-in
const CTASection = () => {
  return (
    <section className="py-24 px-4" data-fade-in>
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold font-display gold-text mb-6" data-word-reveal data-split-text>
          Gotowy na swojego Championa?
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Przeglądaj naszą ekskluzywną kolekcję i znajdź idealnego gołębia
          dla swojej hodowli.
        </p>
        <Link
          to="/champions"
          className="group inline-flex items-center gap-2 px-8 py-4 bg-gold text-background rounded-full font-semibold hover:bg-gold-light transition-colors"
        >
          <span>Eksploruj Galerię</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
};

export const HomePage = () => {
  return (
    <div className="min-h-screen relative isolate overflow-hidden">
      {/* Parallax background elements */}
      <div className="fixed inset-0 bg-hero-gradient grid-overlay -z-10 pointer-events-none" />
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gold/5 rounded-full blur-2xl" data-speed="0.3" />
        <div className="absolute top-1/3 right-20 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl" data-speed="0.5" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" data-speed="0.2" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero */}
        <HeroSection />

        {/* About Section - moved above Carousel3D */}
        <AboutSection />

        <div id="champions" data-reveal>
          <Carousel3D />
        </div>

        {/* Features */}
        <FeaturesSection />

        {/* Press / W mediach */}
        <PressSection />

        {/* CTA */}
        <CTASection />

        {/* Contact */}
        <ContactSection />

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;
