/**
 * Strona główna z interaktywną Karuzelą 3D
 * - Hero Section z kolorystyką projektu
 * - Karuzela 3D z momentum scrolling
 * - ParticleBackground w złotych/primary kolorach
 */
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Trophy, Zap, Award, ChevronDown } from 'lucide-react';
import { Carousel3D } from '@/components/gallery/Carousel3D';
import { ParticleBackground } from '@/components/gallery/ParticleBackground';

// Hero Section z efektami animacji - kolorystyka projektu
const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background - using project's navy gradient */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Animated grid - subtle */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--border)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)`,
          backgroundSize: '100px 100px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-gold/30 text-gold text-sm">
            <Trophy className="w-4 h-4" />
            <span>Ekskluzywna Hodowla Gołębi</span>
          </span>
        </motion.div>

        {/* Main heading - gold gradient */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold font-display mb-6"
        >
          <span className="gold-text">
            Champion
          </span>
          <br />
          <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Pigeon Auctions
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12"
        >
          Odkryj elitarne gołębie pocztowe od najlepszych hodowców na świecie.
          Każdy ptak to żywa legenda.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link
            to="/champions"
            className="group flex items-center gap-2 px-8 py-4 bg-gold text-background rounded-full font-semibold hover:bg-gold-light transition-colors"
          >
            <span>Galeria Championów</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#carousel"
            className="flex items-center gap-2 px-8 py-4 bg-card/50 text-foreground rounded-full font-semibold border border-border hover:border-primary hover:text-primary transition-colors"
          >
            <span>Zobacz Karuzelę 3D</span>
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-gold" />
              <span className="text-3xl font-bold text-foreground">150+</span>
            </div>
            <p className="text-muted-foreground text-sm">Championów</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-primary" />
              <span className="text-3xl font-bold text-foreground">1300+</span>
            </div>
            <p className="text-muted-foreground text-sm">km/h Rekord</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Award className="w-5 h-5 text-gold" />
              <span className="text-3xl font-bold text-foreground">50+</span>
            </div>
            <p className="text-muted-foreground text-sm">Lat Doświadczenia</p>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="flex flex-col items-center gap-2 text-muted-foreground"
          >
            <span className="text-xs uppercase tracking-widest">Przewiń</span>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative orbs removed */}
    </section>
  );
};

// Features Section - project colors
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
    <section className="py-24 px-4 bg-card/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 border border-primary/30 rounded-full text-xs tracking-[0.2em] text-primary/70 uppercase mb-4">
            Dlaczego my
          </span>
          <h2 className="text-4xl md:text-5xl font-bold font-display gold-text mb-4">
            Najwyższa Jakość Hodowli
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Od ponad 50 lat dostarczamy championów hodowcom na całym świecie.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-8 rounded-2xl bg-card/50 border border-border hover:border-primary/30 transition-colors group"
            >
              <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                <feature.icon className="w-7 h-7 text-gold" />
              </div>
              <h3 className="text-xl font-semibold font-display text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// CTA Section
const CTASection = () => {
  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold font-display gold-text mb-6">
            Gotowy na swojego Championa?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Przeglądaj naszą ekskluzywną kolekcję i znajdź idealnego gołębia
            dla swojej hodowli.
          </p>
          <Link
            to="/champions"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-background rounded-full font-semibold hover:bg-gold-light transition-colors group"
          >
            <span>Eksploruj Galerię</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export const HomePage = (props) => {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Particle Background - gold variant */}
      <ParticleBackground particleCount={30} variant="gold" />

      {/* Content */}
      <div className="relative z-10">
        {/* Hero */}
        <HeroSection />

        {/* Carousel */}
        <div id="carousel">
          <Carousel3D />
        </div>

        {/* Features */}
        <FeaturesSection />

        {/* CTA */}
        <CTASection />

        {/* Footer */}
        <footer className="py-12 px-4 border-t border-border">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm">
              © 2024 Champion Pigeon Auctions. Wszystkie prawa zastrzeżone.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/champions" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Galeria
              </Link>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Kontakt
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                O nas
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
