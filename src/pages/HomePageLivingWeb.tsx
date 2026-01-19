/**
 * PRZYKLAD: HomePage z Living Web Animations
 * Gotowy do użycia template z pełną orkiestracją
 */

import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap, ScrollTrigger } from '@/lib/gsapConfig';
import { useGSAP } from '@/hooks/useGSAP';
import {
  SplitText,
  ParallaxSection,
  ParallaxLayer,
  RevealOnScroll,
  PinnedSection,
  HorizontalScroll,
} from '@/components/animations';
import { Trophy, Award, Star, Zap, ArrowRight } from 'lucide-react';
import Footer from '@/components/Footer';

const HomePageLivingWeb = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // Hero background animation
  useGSAP(() => {
    if (!heroRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
    });

    tl.to('.hero-bg-layer', { scale: 1.3, opacity: 0.2 })
      .to('.hero-glow', { scale: 1.8, rotate: 90, opacity: 0.5 }, 0);
  }, []);

  // Stats counter
  useGSAP(() => {
    if (!statsRef.current) return;

    const counters = statsRef.current.querySelectorAll('.counter');
    counters.forEach((counter) => {
      const target = parseInt(counter.getAttribute('data-target') || '0');
      gsap.to(counter, {
        innerText: target,
        duration: 2.5,
        snap: { innerText: 1 },
        ease: 'power2.out',
        scrollTrigger: {
          trigger: counter,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
      });
    });
  }, []);

  return (
    <div className="bg-background text-white">
      {/* ========== HERO SECTION ========== */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Parallax Background */}
        <ParallaxSection className="absolute inset-0">
          <ParallaxLayer speed={0.2}>
            <div
              className="hero-bg-layer w-full h-full bg-gradient-to-b from-gold/30 via-gold/10 to-transparent"
              style={{ willChange: 'transform' }}
            />
          </ParallaxLayer>

          <ParallaxLayer speed={0.4}>
            <div
              className="hero-glow absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-gold/40 blur-[120px]"
              style={{ willChange: 'transform' }}
            />
          </ParallaxLayer>
        </ParallaxSection>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          {/* Badge */}
          <RevealOnScroll direction="scale" className="mb-8">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold/10 border border-gold/30 backdrop-blur-sm">
              <Star className="w-5 h-5 fill-gold text-gold animate-pulse" />
              <span className="text-gold font-semibold">Hodowla Gołębi Pocztowych od 1979</span>
            </div>
          </RevealOnScroll>

          {/* Main Title - Split Text Animation */}
          <div className="mb-6">
            <SplitText
              className="block text-6xl md:text-8xl lg:text-9xl font-bold font-display text-white mb-4"
              animationType="slide"
              stagger={0.04}
              scrub={0.8}
              start="top 70%"
            >
              Pałka
            </SplitText>

            <SplitText
              className="block text-6xl md:text-8xl lg:text-9xl font-bold font-display"
              animationType="slide"
              stagger={0.04}
              scrub={0.8}
              start="top 65%"
            >
              <span className="gold-text">MTM</span>
            </SplitText>
          </div>

          {/* Subtitle */}
          <RevealOnScroll direction="up" delay={0.3} className="mb-12">
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Trzy pokolenia pasji. Setki mistrzostw.
              <br />
              Elitarne gołębie pocztowe z Dolnego Śląska.
            </p>
          </RevealOnScroll>

          {/* CTA */}
          <RevealOnScroll direction="scale" delay={0.5} className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/auctions"
              className="group px-8 py-4 bg-gold text-background font-bold rounded-full hover:bg-gold/90 transition-all hover:scale-105 shadow-xl flex items-center gap-2"
            >
              Aktualne Aukcje
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/champions"
              className="px-8 py-4 bg-white/10 text-white font-bold rounded-full hover:bg-white/20 transition-all backdrop-blur-sm border border-white/20"
            >
              Galeria Mistrzów
            </Link>
          </RevealOnScroll>
        </div>

        {/* Scroll Indicator */}
        <RevealOnScroll className="absolute bottom-12 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2 text-white/40">
            <span className="text-sm uppercase tracking-wider">Scroll</span>
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
              <div className="w-1.5 h-3 bg-white/50 rounded-full animate-bounce" />
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* ========== STATS SECTION (Pinned) ========== */}
      <PinnedSection className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-background/95 to-background/80">
        <div ref={statsRef} className="max-w-6xl mx-auto px-4 py-20">
          <RevealOnScroll direction="up" className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-6 gold-text">
              Historia Sukcesu
            </h2>
            <p className="text-xl md:text-2xl text-white/60">
              Liczby, które mówią same za siebie
            </p>
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Trophy, value: 45, label: 'Lat Tradycji', suffix: '+' },
              { icon: Award, value: 320, label: 'Zdobytych Nagród', suffix: '+' },
              { icon: Zap, value: 1500, label: 'Wyhodowanych Mistrzów', suffix: '+' },
            ].map((stat, i) => (
              <RevealOnScroll
                key={`stat-${i}`}
                direction="scale"
                delay={i * 0.15}
                className="group relative p-10 rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-md hover:border-gold/30 transition-all duration-500"
              >
                {/* Icon */}
                <div className="mb-6">
                  <stat.icon className="w-16 h-16 text-gold group-hover:scale-110 transition-transform duration-300" />
                </div>

                {/* Number */}
                <div className="flex items-baseline gap-2 mb-3">
                  <div
                    className="text-6xl md:text-7xl font-bold text-gold counter"
                    data-target={stat.value}
                  >
                    0
                  </div>
                  <span className="text-4xl text-gold/70">{stat.suffix}</span>
                </div>

                {/* Label */}
                <div className="text-lg md:text-xl text-white/70 font-medium">
                  {stat.label}
                </div>

                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-3xl bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </PinnedSection>

      {/* ========== HORIZONTAL GALLERY ========== */}
      <section className="py-32 bg-gradient-to-b from-background/80 to-background">
        <div className="max-w-7xl mx-auto px-4 mb-16">
          <RevealOnScroll direction="up" className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-6">
              <SplitText animationType="fade" stagger={0.03}>
                Galeria Mistrzów
              </SplitText>
            </h2>
            <p className="text-xl text-white/60">
              Scroll horizontal aby zobaczyć naszych zwycięzców →
            </p>
          </RevealOnScroll>
        </div>

        <HorizontalScroll className="py-8" speed={1.2}>
          {[
            { name: 'Champion 2023', races: 12, img: '/champions/1.jpg' },
            { name: 'Golden Wings', races: 18, img: '/champions/2.jpg' },
            { name: 'Speed Master', races: 15, img: '/champions/3.jpg' },
            { name: 'Victory Star', races: 20, img: '/champions/4.jpg' },
            { name: 'Sky Racer', races: 14, img: '/champions/5.jpg' },
            { name: 'Thunder Bolt', races: 16, img: '/champions/6.jpg' },
          ].map((champion, i) => (
            <div
              key={`champion-${i}`}
              className="min-w-[350px] md:min-w-[450px] h-[550px] mx-4 rounded-3xl overflow-hidden bg-gradient-to-br from-gold/20 via-gold/5 to-transparent border border-gold/20 hover:border-gold/40 transition-all duration-500 group"
            >
              <div className="w-full h-[70%] bg-gradient-to-b from-gold/30 to-gold/10 flex items-center justify-center">
                <Trophy className="w-32 h-32 text-gold/50 group-hover:scale-110 group-hover:text-gold transition-all duration-500" />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-2 text-white">{champion.name}</h3>
                <p className="text-gold/70">
                  <span className="text-3xl font-bold text-gold">{champion.races}</span> Wygranych Lotów
                </p>
              </div>
            </div>
          ))}
        </HorizontalScroll>
      </section>

      {/* ========== CALL TO ACTION ========== */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-gold/10 relative overflow-hidden">
        {/* Background Pattern */}
        <ParallaxSection className="absolute inset-0">
          <ParallaxLayer speed={0.3}>
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full border border-gold" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full border border-gold" />
            </div>
          </ParallaxLayer>
        </ParallaxSection>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <RevealOnScroll direction="scale">
            <Star className="w-24 h-24 text-gold mx-auto mb-8 fill-gold animate-pulse" />
          </RevealOnScroll>

          <SplitText
            className="text-3xl md:text-4xl font-bold font-display mb-8"
            animationType="slide"
            stagger={0.05}
          >
            Dołącz do Elity
          </SplitText>

          <RevealOnScroll direction="up" delay={0.3}>
            <p className="text-xl md:text-2xl text-white/70 mb-12 max-w-2xl mx-auto">
              Odkryj kolekcję najlepszych gołębi pocztowych.
              <br />
              Każdy ptak to gwarancja sukcesu.
            </p>
          </RevealOnScroll>

          <RevealOnScroll direction="scale" delay={0.5}>
            <Link
              to="/auctions"
              className="inline-flex items-center gap-3 px-12 py-5 bg-gold text-background text-lg font-bold rounded-full hover:bg-gold/90 transition-all hover:scale-105 shadow-2xl"
            >
              Przeglądaj Aukcje
              <ArrowRight className="w-6 h-6" />
            </Link>
          </RevealOnScroll>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePageLivingWeb;
