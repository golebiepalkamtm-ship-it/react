/**
 * ============================================================================
 * HOMEPAGE PREMIUM - Cleaned Up & Polished Version
 * ============================================================================
 *
 * Przywrócenie solidnych fundamentów, które działały,
 * z subtelnym szlifem premium bez udziwnień.
 */

import React, {
  useRef,
  useEffect,
  useCallback,
  useState,
  memo,
  lazy,
  Suspense,
} from "react";
import { Link } from "react-router-dom";
import { gsap, ScrollTrigger } from "@/lib/gsapConfig";
import { registerCustomEasings, gsapEasings } from "@/lib/customEasings";
import {
  ArrowRight,
  Trophy,
  Zap,
  Award,
  ChevronDown,
  Star,
} from "lucide-react";
import { Carousel3D } from "@/components/gallery/Carousel3D";
import AboutSection from "@/components/AboutSection";
import PressSection from "@/components/PressSection";
import {
  DepthLayer,
  FloatingElement,
  MagneticElement,
  CursorFollower,
  CountUp,
  ProgressIndicator,
} from "@/components/animations";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

registerCustomEasings();

// Pre-defined static particles for consistent rendering
const STATIC_PARTICLES = [
  { id: 0, left: "12%", top: "8%", size: 3, delay: 0.5, duration: 5 },
  { id: 1, left: "25%", top: "45%", size: 2, delay: 1.2, duration: 4 },
  { id: 2, left: "42%", top: "22%", size: 4, delay: 2.1, duration: 6 },
  { id: 3, left: "58%", top: "78%", size: 3, delay: 0.8, duration: 5 },
  { id: 4, left: "71%", top: "33%", size: 2, delay: 1.5, duration: 4 },
  { id: 5, left: "85%", top: "55%", size: 5, delay: 2.8, duration: 7 },
  { id: 6, left: "5%", top: "68%", size: 3, delay: 0.2, duration: 5 },
  { id: 7, left: "33%", top: "91%", size: 2, delay: 1.9, duration: 4 },
  { id: 8, left: "62%", top: "12%", size: 4, delay: 3.2, duration: 6 },
  { id: 9, left: "78%", top: "86%", size: 3, delay: 0.7, duration: 5 },
  { id: 10, left: "18%", top: "55%", size: 2, delay: 2.4, duration: 4 },
  { id: 11, left: "52%", top: "38%", size: 5, delay: 1.1, duration: 7 },
  { id: 12, left: "88%", top: "20%", size: 3, delay: 2.9, duration: 5 },
  { id: 13, left: "35%", top: "72%", size: 2, delay: 0.4, duration: 4 },
  { id: 14, left: "95%", top: "62%", size: 4, delay: 1.8, duration: 6 },
  { id: 15, left: "8%", top: "28%", size: 3, delay: 3.5, duration: 5 },
  { id: 16, left: "48%", top: "58%", size: 2, delay: 1.3, duration: 4 },
  { id: 17, left: "72%", top: "4%", size: 5, delay: 2.6, duration: 7 },
  { id: 18, left: "22%", top: "82%", size: 3, delay: 0.9, duration: 5 },
  { id: 19, left: "68%", top: "48%", size: 2, delay: 2.2, duration: 4 },
] as const;

// ============================================================================
// HERO PREMIUM - Czysty, Jasny i Profesjonalny
// ============================================================================

const HeroPremium = () => {
  const heroRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current || !contentRef.current) return;

    const content = contentRef.current;

    // Elements stagger entrance
    gsap.fromTo(
      content.querySelectorAll(".hero-reveal"),
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1.4,
        stagger: 0.15,
        ease: "expo.out",
        delay: 0.3,
      },
    );

    const parallaxTl = gsap.timeline({
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 1.5,
      },
    });

    parallaxTl.to(content, { y: 100, opacity: 0.8 }, 0);

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-start overflow-hidden bg-transparent"
    >
      {/* Żadnego tła, żadnych poświat - czysta biel */}

      <div
        ref={contentRef}
        className="relative z-10 container mx-auto px-4 lg:px-6 text-left mt-[-5vh] flex flex-col lg:flex-row items-start gap-12"
      >
        <div className="flex-1 min-w-0">
          <div className="hero-reveal mb-8">
            <span className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-[#A68E4E] text-zinc-900 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] shadow-lg shadow-gold/20">
              <Star className="w-3.5 h-3.5 fill-current" />
              Hodowla Gołębi Pocztowych od 1979
            </span>
          </div>

          <h1 className="hero-reveal mb-6 text-4xl md:text-6xl lg:text-7xl font-bold font-display tracking-tight leading-tight uppercase text-left">
            <span className="text-zinc-900">Pałka</span>{" "}
            <span className="text-[#A68E4E]">MTM</span>
            <span className="block text-xl md:text-2xl font-light tracking-[0.2em] text-[#A68E4E] mt-4 uppercase text-left">
              — Geny Zwycięzców
            </span>
          </h1>

          <p className="hero-reveal text-xl md:text-2xl text-zinc-600 max-w-2xl mb-12 font-light">
            Trzy pokolenia pasji. Setki mistrzostw.
            <br />
            Elitarne gołębie pocztowe z Dolnego Śląska.
          </p>

          <div className="hero-reveal mb-20">
            <Link
              to="/champions"
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-[#A68E4E] text-zinc-900 rounded-full font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-gold/20"
            >
              Zobacz Championy
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="hero-reveal grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl w-full">
            {[
              { icon: Trophy, value: 150, suffix: "+", label: "Mistrzostw" },
              {
                icon: Award,
                value: 45,
                suffix: "+",
                label: "Lat Doświadczenia",
              },
              { icon: Zap, value: 3, suffix: "", label: "Pokolenia Hodowców" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="group text-left p-8 rounded-2xl border border-gold/40 bg-emerald-950/30 backdrop-blur-xl backdrop-brightness-125 transition-all duration-500 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden"
              >
                {/* Decorative Overlays to match other cards */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(66,192,206,0.15),transparent_70%)] pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

                <div className="relative z-10">
                  <stat.icon className="w-7 h-7 text-[#A68E4E] drop-shadow-[0_0_12px_rgba(166,142,78,0.45)] mb-4 group-hover:scale-110 transition-transform" />
                  <div className="text-4xl font-bold gold-heading mb-2 tracking-tight">
                    <CountUp
                      end={stat.value}
                      duration={2.5}
                      delay={0.5 + i * 0.2}
                      suffix={stat.suffix}
                    />
                  </div>
                  <div className="text-white/70 text-sm uppercase tracking-widest font-medium">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex flex-1 justify-end">
          <div className="relative w-full max-w-none mt-0 aspect-square rounded-3xl overflow-hidden shadow-[0_52px_140px_rgba(0,0,0,0.55)] border border-gold/30">
            <video
              src="/szpaki.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
        <div className="flex flex-col items-center gap-3 text-zinc-400">
          <span className="text-[10px] uppercase tracking-[0.3em] font-medium">
            Odkryj naszą historię
          </span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-gold/50 to-transparent" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent z-20" />
    </section>
  );
};

// ============================================================================
// FEATURES SECTION - Clean & Balanced
// ============================================================================

interface FeatureData {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const CTAFeaturesSection = () => {
  const features: FeatureData[] = [
    {
      icon: Trophy,
      title: "Elitarne Rodowody",
      description:
        "Każdy gołąb pochodzi z linii wielokrotnych mistrzów i championów.",
    },
    {
      icon: Zap,
      title: "Prędkość & Wytrzymałość",
      description:
        "Rekordy prędkości i dystansu potwierdzone w najważniejszych zawodach.",
    },
    {
      icon: Award,
      title: "Gwarancja Jakości",
      description:
        "Pełna dokumentacja, badania DNA i historia lotów każdego ptaka.",
    },
  ];

  return (
    <section className="min-h-screen flex flex-col items-center justify-center py-24 px-4 bg-transparent relative overflow-hidden">
      <div className="max-w-6xl mx-auto w-full">
        <div className="text-center mb-16">
          <span className="inline-block px-6 py-2 rounded-full bg-[#A68E4E] text-zinc-900 text-[10px] font-bold uppercase tracking-[0.2em] mb-6 shadow-lg shadow-gold/20">
            Dlaczego my
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-8 uppercase tracking-tighter font-display">
            <span className="text-zinc-900">Zostań Właścicielem</span> <br />
            <span className="text-[#A68E4E]">Wybitnego Championa</span>
          </h2>
          <p className="text-lg md:text-xl text-white mb-10 max-w-4xl mx-auto font-light leading-relaxed">
            Dołącz do elitarnego grona hodowców. Nasze aukcje to jedyna okazja,
            aby zdobyć gołębie z bezpośrednich linii mistrzowskich. Od ponad 50
            lat dostarczamy championów hodowcom na całym świecie, gwarantując
            najwyższą jakość i historyczne wyniki.
          </p>
          <Link
            to="/auctions"
            className="inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-[#A68E4E] text-zinc-900 rounded-full font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-gold/20 mb-20"
          >
            Licytuj na Aukcjach
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <div className="grid md:grid-cols-3 gap-8 text-left max-w-6xl mx-auto">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border border-gold/60 bg-emerald-900/40 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl backdrop-brightness-125 transition-all duration-500 p-8 h-full hover:border-gold/80"
              >
                {/* Decorative Overlays to match other cards */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(66,192,206,0.15),transparent_70%)] pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-gold/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-gold/30 transition-all duration-500 shadow-xl shadow-gold/20">
                    <feature.icon className="w-7 h-7 text-[#D4AF37] drop-shadow-[0_0_15px_rgba(212,175,55,0.8)]" />
                  </div>
                  <h4 className="text-xl font-bold gold-heading mb-3 uppercase tracking-tight">
                    {feature.title}
                  </h4>
                  <p className="text-white leading-relaxed font-light text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent z-20" />
    </section>
  );
};

// ============================================================================
// MAIN PAGE - PROSTY I SOLIDNY FLOW
// ============================================================================

export const HomePagePremium = () => {
  useEffect(() => {
    ScrollTrigger.refresh();
    window.scrollTo(0, 0);

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div className="min-min-h-screen bg-white">
      <Header />
      <ProgressIndicator color="rgba(212, 175, 55, 0.8)" height={2} />
      <CursorFollower size={24} color="rgba(212, 175, 55, 0.4)" />

      {/* ŻADNEGO CIEMNEGO TŁA - USUNIĘTE NA ZAWSZE */}

      <main>
        <HeroPremium />
        <AboutSection />
        <Carousel3D />
        <CTAFeaturesSection />
        <PressSection />
        <ContactSection />
        <Footer />
      </main>
    </div>
  );
};

export default HomePagePremium;
