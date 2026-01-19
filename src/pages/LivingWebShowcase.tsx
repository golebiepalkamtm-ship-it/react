/**
 * LIVING WEB SHOWCASE PAGE
 * Kompletna demonstracja scroll-driven cinematic experience
 * Każda sekcja z pełną orkiestracją: GSAP + ScrollTrigger + Lenis + Lottie + Split Text
 */

import { useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsapConfig';
import { useGSAP } from '@/hooks/useGSAP';
import {
  SplitText,
  LottieScroll,
  ParallaxSection,
  ParallaxLayer,
  PinnedSection,
  RevealOnScroll,
  HorizontalScroll,
} from '@/components/animations';
import { Trophy, Award, Star, Zap } from 'lucide-react';

const LivingWebShowcase = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // Hero section animations
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

    tl.to('.hero-bg', { scale: 1.2, opacity: 0.3 })
      .to('.hero-glow', { scale: 1.5, rotate: 45 }, 0);
  }, []);

  // Stats counter animation
  useGSAP(() => {
    if (!statsRef.current) return;

    const counters = statsRef.current.querySelectorAll('.counter');

    counters.forEach((counter) => {
      const target = parseInt(counter.getAttribute('data-target') || '0');

      gsap.to(counter, {
        innerText: target,
        duration: 2,
        snap: { innerText: 1 },
        scrollTrigger: {
          trigger: counter,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });
    });
  }, []);

  return (
    <div className="bg-background text-white overflow-x-hidden">
      {/* ========== HERO SECTION - Parallax + Split Text ========== */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Animated Background Layers */}
        <ParallaxSection className="absolute inset-0">
          <ParallaxLayer speed={0.3} className="absolute inset-0">
            <div
              className="hero-bg w-full h-full bg-gradient-to-b from-gold/20 via-transparent to-transparent"
              style={{ willChange: 'transform' }}
            />
          </ParallaxLayer>

          <ParallaxLayer speed={0.5} className="absolute inset-0 flex items-center justify-center">
            <div
              className="hero-glow w-[600px] h-[600px] rounded-full bg-gold/30 blur-3xl"
              style={{ willChange: 'transform' }}
            />
          </ParallaxLayer>
        </ParallaxSection>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          {/* Badge */}
          <RevealOnScroll direction="scale" className="mb-8">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold/10 border border-gold/30">
              <Star className="w-5 h-5 fill-gold text-gold" />
              <span className="text-gold font-semibold">Living Web Experience</span>
            </div>
          </RevealOnScroll>

          {/* Main Title - Character by character reveal */}
          <SplitText
            className="text-6xl md:text-8xl lg:text-9xl font-bold font-display mb-6"
            animationType="slide"
            stagger={0.03}
            scrub={1}
            start="top 60%"
          >
            PAŁKA MTM
          </SplitText>

          {/* Subtitle */}
          <RevealOnScroll direction="up" delay={0.3} className="mb-12">
            <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto">
              Scroll-driven storytelling • Synchronized animations • Cinematic experience
            </p>
          </RevealOnScroll>

          {/* CTA Button */}
          <RevealOnScroll direction="scale" delay={0.5}>
            <button className="px-8 py-4 bg-gold text-background font-bold rounded-full hover:bg-gold/90 transition-all hover:scale-105">
              Rozpocznij Podróż
            </button>
          </RevealOnScroll>
        </div>

        {/* Scroll indicator */}
        <RevealOnScroll className="absolute bottom-12 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2 text-white/50">
            <span className="text-sm">Scroll</span>
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
              <div className="w-1.5 h-3 bg-white/50 rounded-full animate-bounce" />
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* ========== STATS SECTION - Pinned with Counter ========== */}
      <PinnedSection className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/50">
        <div ref={statsRef} className="max-w-6xl mx-auto px-4">
          <RevealOnScroll direction="up" className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
              Nasza Historia w Liczbach
            </h2>
            <p className="text-xl text-white/60">Trzy pokolenia doskonałości</p>
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Trophy, value: 45, label: 'Lat Doświadczenia' },
              { icon: Award, value: 320, label: 'Zdobytych Nagród' },
              { icon: Zap, value: 1500, label: 'Wyhodowanych Mistrzów' },
            ].map((stat, i) => (
              <RevealOnScroll
                key={i}
                direction="scale"
                delay={i * 0.2}
                className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
              >
                <stat.icon className="w-12 h-12 text-gold" />
                <div className="text-6xl font-bold text-gold counter" data-target={stat.value}>
                  0
                </div>
                <div className="text-lg text-white/70">{stat.label}</div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </PinnedSection>

      {/* ========== HORIZONTAL GALLERY ========== */}
      <section className="min-h-screen bg-gradient-to-b from-background/50 to-background py-20">
        <div className="max-w-6xl mx-auto px-4 mb-12">
          <SplitText
            className="text-3xl md:text-4xl font-bold font-display text-center"
            animationType="fade"
            stagger={0.02}
          >
            Galeria Mistrzów
          </SplitText>
        </div>

        <HorizontalScroll className="py-12" speed={1.5}>
          {[1, 2, 3, 4, 5, 6].map((_, i) => (
            <div
              key={`placeholder-box-${i}`}
              className="min-w-[400px] h-[500px] mx-4 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 flex items-center justify-center"
            >
              <div className="text-center">
                <Trophy className="w-20 h-20 text-gold mx-auto mb-4" />
                <h3 className="text-2xl font-bold">Mistrz #{i + 1}</h3>
                <p className="text-white/60 mt-2">Scroll horizontal →</p>
              </div>
            </div>
          ))}
        </HorizontalScroll>
      </section>

      {/* ========== PARALLAX DEPTH SECTION ========== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <ParallaxSection className="absolute inset-0">
          {/* Layer 1 - Background */}
          <ParallaxLayer speed={0.2} className="absolute inset-0">
            <div className="w-full h-full bg-gradient-to-b from-gold/10 to-transparent" />
          </ParallaxLayer>

          {/* Layer 2 - Mid */}
          <ParallaxLayer speed={0.5} className="absolute inset-0 flex items-center justify-center">
            <div className="text-[20rem] font-bold opacity-5">MTM</div>
          </ParallaxLayer>

          {/* Layer 3 - Front */}
          <ParallaxLayer speed={0.8} className="absolute inset-0 flex items-center justify-center">
            <div className="max-w-4xl text-center px-4">
              <SplitText
                className="text-3xl md:text-4xl font-bold mb-6"
                animationType="rotate"
                stagger={0.05}
              >
                Multi-Layer Parallax
              </SplitText>
              <p className="text-xl text-white/70">
                Różne warstwy poruszają się z różnymi prędkościami
              </p>
            </div>
          </ParallaxLayer>
        </ParallaxSection>
      </section>

      {/* ========== TEXT SPLITTING SHOWCASE ========== */}
      <section className="min-h-screen flex flex-col items-center justify-center gap-16 py-20 px-4">
        <div className="max-w-5xl w-full space-y-12">
          {/* Fade */}
          <div>
            <h3 className="text-xl text-white/50 mb-4">Fade Animation</h3>
            <SplitText
              className="text-4xl md:text-6xl font-bold"
              animationType="fade"
              stagger={0.03}
            >
              Character by character fade in
            </SplitText>
          </div>

          {/* Slide */}
          <div>
            <h3 className="text-xl text-white/50 mb-4">Slide Animation</h3>
            <SplitText
              className="text-4xl md:text-6xl font-bold"
              animationType="slide"
              stagger={0.02}
            >
              Sliding from bottom to top
            </SplitText>
          </div>

          {/* Scale */}
          <div>
            <h3 className="text-xl text-white/50 mb-4">Scale Animation</h3>
            <SplitText
              className="text-4xl md:text-6xl font-bold"
              animationType="scale"
              stagger={0.03}
            >
              Scaling each character
            </SplitText>
          </div>

          {/* Rotate */}
          <div>
            <h3 className="text-xl text-white/50 mb-4">Rotate Animation</h3>
            <SplitText
              className="text-4xl md:text-6xl font-bold"
              animationType="rotate"
              stagger={0.04}
            >
              3D rotation reveal
            </SplitText>
          </div>
        </div>
      </section>

      {/* ========== FINALE SECTION ========== */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-gold/10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <RevealOnScroll direction="scale">
            <Star className="w-24 h-24 text-gold mx-auto mb-8 fill-gold" />
          </RevealOnScroll>

          <SplitText
            className="text-6xl md:text-8xl font-bold font-display mb-6"
            animationType="slide"
            stagger={0.05}
          >
            Living Web
          </SplitText>

          <RevealOnScroll direction="up" delay={0.3}>
            <p className="text-2xl text-white/70 mb-12">
              Każdy scroll to klatka filmu. Każda sekcja to scena.
              <br />
              To jest przyszłość web experiences.
            </p>
          </RevealOnScroll>

          <RevealOnScroll direction="scale" delay={0.5}>
            <button className="px-12 py-5 bg-gold text-background text-lg font-bold rounded-full hover:bg-gold/90 transition-all hover:scale-105 shadow-2xl">
              Zbuduj Swoją Historię
            </button>
          </RevealOnScroll>
        </div>
      </section>
    </div>
  );
};

export default LivingWebShowcase;
