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
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { gsap, ScrollTrigger } from "@/lib/gsapConfig";
import { registerCustomEasings, gsapEasings } from "@/lib/customEasings";
import { useLenis } from "@/components/animations/SmoothScrollProvider";
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
import { ScrollIndicator } from "@/components/animations/ScrollIndicator";

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
// INTERACTIVE VIDEO HERO - Improved MP4 Experience
// ============================================================================

interface Ember {
  left: string;
  x: number[];
  duration: number;
  delay: number;
}

const EMBERS: Ember[] = [
  { left: "10%", x: [0, 20, 50], duration: 4.5, delay: 0.2 },
  { left: "25%", x: [0, -15, -40], duration: 5.2, delay: 1.5 },
  { left: "40%", x: [0, 10, 30], duration: 4.8, delay: 0.8 },
  { left: "55%", x: [0, -20, -60], duration: 6.1, delay: 2.1 },
  { left: "70%", x: [0, 15, 45], duration: 5.5, delay: 1.2 },
  { left: "85%", x: [0, -10, -35], duration: 4.2, delay: 0.5 },
  { left: "15%", x: [0, 25, 55], duration: 5.8, delay: 3.1 },
  { left: "35%", x: [0, -30, -70], duration: 6.5, delay: 1.8 },
  { left: "65%", x: [0, 20, 60], duration: 5.0, delay: 0.9 },
  { left: "80%", x: [0, -15, -50], duration: 4.7, delay: 2.5 },
  { left: "95%", x: [0, 10, 40], duration: 5.3, delay: 1.1 },
  { left: "5%", x: [0, -25, -55], duration: 6.2, delay: 3.5 },
];

const InteractiveVideoHero = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), {
    stiffness: 120,
    damping: 25,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), {
    stiffness: 120,
    damping: 25,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div className="relative group/hero-container">
      {/* 3D Ambient Shadow */}
      <div className="absolute inset-x-10 -bottom-10 h-20 bg-black/40 blur-[100px] rounded-[50%] opacity-60 group-hover/hero-container:opacity-100 transition-opacity duration-1000" />

      <motion.div
        className="relative w-full max-w-2xl mt-0 aspect-[4/5] rounded-[3rem] overflow-hidden shadow-[0_80px_160px_rgba(0,0,0,0.7)] border border-white/10 group cursor-none"
        style={{
          transformStyle: "preserve-3d",
          rotateX,
          rotateY,
        }}
        initial={{ opacity: 0, scale: 0.95, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Dynamic Multi-layered Glow */}
        <div className="absolute -inset-40 bg-[radial-gradient(circle_at_center,rgba(166,142,78,0.2),transparent_60%)] blur-[120px] pointer-events-none group-hover:opacity-100 opacity-40 transition-opacity duration-1000 animate-pulse" />
        <div className="absolute -inset-20 bg-[conic-gradient(from_0deg,transparent,rgba(166,142,78,0.05),transparent)] blur-2xl pointer-events-none animate-[spin_10s_linear_infinite]" />

        {/* Video Content with Zoom Effect */}
        <video
          src="/szpaki.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0"
        />

        {/* Cinematic Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none z-10" />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#A68E4E]/20 via-transparent to-transparent pointer-events-none z-10" />

        {/* Scanlines Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%] pointer-events-none z-10 opacity-30" />

        {/* Floating Atmospheric Particles (Embers) */}
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          {EMBERS.map((p, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-[#A68E4E] rounded-full blur-[1px]"
              animate={{
                y: [0, -100, -200],
                x: p.x,
                opacity: [0, 0.6, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
                ease: "linear",
              }}
              style={{
                left: p.left,
                bottom: "-10px",
              }}
            />
          ))}
        </div>

        {/* Premium Glassmorphism Corner Badge */}
        <div
          className="absolute top-10 right-10 z-30 transform-gpu"
          style={{ transform: "translateZ(50px)" }}
        >
          <div className="flex flex-col items-end gap-2 p-4 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#A68E4E] animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.4em] text-[#A68E4E] font-black">
                Premium Quality
              </span>
            </div>
            <span className="text-[8px] uppercase tracking-[0.2em] text-white/60 font-medium">
              Pałka MTM Heritage since 1979
            </span>
          </div>
        </div>

        {/* Cinematic Scanner Effect */}
        <div className="absolute top-0 left-0 w-full h-[30%] bg-gradient-to-b from-[#A68E4E]/10 to-transparent -translate-y-full group-hover:animate-[scan_4s_ease-in-out_infinite] z-20 pointer-events-none" />

        {/* Interactive Luxury Light Flare */}
        <motion.div
          className="absolute w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(166,142,78,0.12),transparent_70%)] rounded-full blur-[60px] pointer-events-none z-20"
          style={{
            left: useTransform(mouseX, [-0.5, 0.5], ["-10%", "50%"]),
            top: useTransform(mouseY, [-0.5, 0.5], ["-10%", "50%"]),
          }}
        />

        {/* Frame Glowing Border */}
        <div className="absolute inset-0 rounded-[3rem] border border-[#A68E4E]/30 pointer-events-none z-30 group-hover:border-[#A68E4E]/60 transition-colors duration-700" />
      </motion.div>

      {/* Hero Stats Floating Pill (Optional Touch) */}
      <motion.div
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-40 bg-zinc-900/90 backdrop-blur-2xl border border-gold/40 px-8 py-4 rounded-full shadow-2xl flex items-center gap-6 whitespace-nowrap"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-gold" />
          <span className="text-[10px] uppercase tracking-widest text-white font-bold">
            TOP GENES
          </span>
        </div>
        <div className="w-px h-4 bg-white/10" />
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-gold" />
          <span className="text-[10px] uppercase tracking-widest text-white font-bold">
            EUROPEAN CHAMPIONS
          </span>
        </div>
      </motion.div>
    </div>
  );
};

// ============================================================================
// HERO PREMIUM - Czysty, Jasny i Profesjonalny
// ============================================================================

const HeroPremium = () => {
  const heroRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current || !contentRef.current) return;

    const ctx = gsap.context(() => {
      const content = contentRef.current!;

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

      gsap
        .timeline({
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1.5,
          },
        })
        .to(content, { y: 100, opacity: 0.8 }, 0);
    }, heroRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-transparent"
    >
      <div
        ref={contentRef}
        className="relative z-10 container mx-auto px-4 lg:px-6 text-center mt-[-5vh] flex flex-col items-center gap-8"
      >
        <div className="w-full max-w-4xl flex flex-col items-center">
          <div className="hero-reveal mb-8">
            <span className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-[#A68E4E] text-zinc-900 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] shadow-lg shadow-gold/20">
              <Star className="w-3.5 h-3.5 fill-current" />
              Hodowla Gołębi Pocztowych od 1979
            </span>
          </div>

          <h1 className="hero-reveal mb-6 text-4xl md:text-6xl lg:text-7xl font-bold font-display tracking-tight leading-tight uppercase text-center">
            <span className="text-zinc-900">Pałka</span>{" "}
            <span className="text-[#A68E4E]">MTM</span>
            <span className="block text-xl md:text-2xl font-light tracking-[0.2em] text-[#A68E4E] mt-4 uppercase text-center">
              — Geny Zwycięzców
            </span>
          </h1>

          <p className="hero-reveal text-xl md:text-2xl text-zinc-600 max-w-2xl mb-12 font-light mx-auto">
            Trzy pokolenia pasji. Setki mistrzostw.
            <br />
            Elitarne gołębie pocztowe z Dolnego Śląska.
          </p>

          <div className="hero-reveal flex justify-center">
            <Link
              to="/champions"
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-[#A68E4E] text-zinc-900 rounded-full font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-gold/20"
            >
              Zobacz Championy
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
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

          <div className="grid md:grid-cols-3 gap-8 text-left max-w-6xl mx-auto reveal-cards">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="reveal-card group relative overflow-hidden rounded-2xl border border-gold/60 bg-emerald-900/40 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl backdrop-brightness-125 transition-all duration-500 p-8 h-full hover:border-gold/80"
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
  const lenis = useLenis();

  useEffect(() => {
    window.scrollTo(0, 0);

    // Eksponujemy GSAP globalnie dla narzędzi diagnostycznych
    (window as any).gsap = gsap;
    (window as any).ScrollTrigger = ScrollTrigger;

    let rafId: number;
    let cleanup: (() => void) | null = null;
    const setupAnimations = () => {
      try {
        ScrollTrigger.refresh();

        const sections = Array.from(
          document.querySelectorAll<HTMLElement>(".home-section"),
        );

        if (sections.length === 0) {
          rafId = requestAnimationFrame(setupAnimations);
          return;
        }

        const ctx = gsap.context(() => {
          // ── SECTION REVEALS – każda sekcja ma inny efekt ──────────────────
          sections.forEach((section) => {
            const animType = section.dataset.anim || "fade-up";

            const st = {
              trigger: section,
              start: "top 88%",
              toggleActions: "play none none reverse",
            };

            if (animType === "zoom-blur") {
              // Kinematyczny zoom + blur – jakby kamera ostrzeje obraz
              gsap.fromTo(
                section,
                { opacity: 0, scale: 1.12, filter: "blur(20px)", y: 20 },
                {
                  opacity: 1,
                  scale: 1,
                  filter: "blur(0px)",
                  y: 0,
                  duration: 1.8,
                  ease: "expo.out",
                  scrollTrigger: st,
                  onComplete: () => {
                    gsap.set(section, { clearProps: "filter,scale" });
                  },
                },
              );
            } else if (animType === "slide-right") {
              // Dramatyczne wejście z prawej strony
              gsap.fromTo(
                section,
                { opacity: 0, xPercent: 6, filter: "blur(12px)" },
                {
                  opacity: 1,
                  xPercent: 0,
                  filter: "blur(0px)",
                  duration: 1.5,
                  ease: "expo.out",
                  scrollTrigger: st,
                  onComplete: () => {
                    gsap.set(section, { clearProps: "filter,xPercent" });
                  },
                },
              );
            } else if (animType === "slide-left") {
              // Dramatyczne wejście z lewej strony
              gsap.fromTo(
                section,
                { opacity: 0, xPercent: -6, filter: "blur(12px)" },
                {
                  opacity: 1,
                  xPercent: 0,
                  filter: "blur(0px)",
                  duration: 1.5,
                  ease: "expo.out",
                  scrollTrigger: st,
                  onComplete: () => {
                    gsap.set(section, { clearProps: "filter,xPercent" });
                  },
                },
              );
            } else if (animType === "curtain") {
              // Odsłanianie jak kurtyna – clip-path z dołu
              gsap.set(section, { opacity: 1 });
              gsap.fromTo(
                section,
                { clipPath: "inset(100% 0 0 0)" },
                {
                  clipPath: "inset(0% 0 0 0)",
                  duration: 1.6,
                  ease: "expo.inOut",
                  scrollTrigger: st,
                  onComplete: () => {
                    gsap.set(section, { clearProps: "clipPath" });
                  },
                },
              );
            } else {
              // Default: czysty fade-up
              gsap.fromTo(
                section,
                { opacity: 0, y: 70 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 1.4,
                  ease: "expo.out",
                  scrollTrigger: st,
                },
              );
            }
          });

          // ── INNER ELEMENT ANIMATIONS – elementy wewnątrz sekcji ──────────
          // Nagłówki h2/h3 – slide-up z clip-mask
          document
            .querySelectorAll<HTMLElement>(".home-section h2, .home-section h3")
            .forEach((el) => {
              gsap.fromTo(
                el,
                { opacity: 0, y: 50, filter: "blur(6px)" },
                {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  duration: 1.1,
                  ease: "power4.out",
                  scrollTrigger: {
                    trigger: el,
                    start: "top 90%",
                    toggleActions: "play none none reverse",
                  },
                  onComplete: () => {
                    gsap.set(el, { clearProps: "filter" });
                  },
                },
              );
            });

          // Paragrafy – delikatne fade-up ze stagger jeśli blisko siebie
          document
            .querySelectorAll<HTMLElement>(".home-section p")
            .forEach((el, i) => {
              gsap.fromTo(
                el,
                { opacity: 0, y: 30 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 1.0,
                  ease: "power3.out",
                  delay: 0.1,
                  scrollTrigger: {
                    trigger: el,
                    start: "top 93%",
                    toggleActions: "play none none reverse",
                  },
                },
              );
            });

          // Obrazy – scale + blur reveal
          document
            .querySelectorAll<HTMLElement>(
              ".home-section img, .home-section video",
            )
            .forEach((el) => {
              gsap.fromTo(
                el,
                { opacity: 0, scale: 1.08, filter: "blur(10px)" },
                {
                  opacity: 1,
                  scale: 1,
                  filter: "blur(0px)",
                  duration: 1.6,
                  ease: "expo.out",
                  scrollTrigger: {
                    trigger: el,
                    start: "top 90%",
                    toggleActions: "play none none reverse",
                  },
                  onComplete: () => {
                    gsap.set(el, { clearProps: "filter,scale" });
                  },
                },
              );
            });

          // Staggered card reveals (.reveal-card)
          document
            .querySelectorAll<HTMLElement>(".reveal-cards")
            .forEach((group) => {
              const cards = group.querySelectorAll<HTMLElement>(".reveal-card");
              if (!cards.length) return;
              gsap.fromTo(
                cards,
                { opacity: 0, y: 60, scale: 0.9, filter: "blur(8px)" },
                {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  filter: "blur(0px)",
                  duration: 1.0,
                  stagger: 0.14,
                  ease: "expo.out",
                  scrollTrigger: {
                    trigger: group,
                    start: "top 86%",
                    toggleActions: "play none none reverse",
                  },
                  onComplete: () => {
                    gsap.set(cards, { clearProps: "filter,scale" });
                  },
                },
              );
            });

          // Section dividers
          document
            .querySelectorAll<HTMLElement>(".section-divider")
            .forEach((divider) => {
              gsap.fromTo(
                divider,
                { scaleX: 0, opacity: 0 },
                {
                  scaleX: 1,
                  opacity: 1,
                  duration: 1.8,
                  ease: "expo.out",
                  scrollTrigger: {
                    trigger: divider,
                    start: "top 94%",
                    toggleActions: "play none none reverse",
                  },
                },
              );
            });

          // ── Parallax dekoracyjny ────────────────────────────────────────
          document
            .querySelectorAll<HTMLElement>(".home-parallax")
            .forEach((el) => {
              const speed = el.dataset.speed
                ? parseFloat(el.dataset.speed)
                : 0.25;
              gsap.to(el, {
                y: () => -window.innerHeight * speed,
                ease: "none",
                scrollTrigger: {
                  trigger: el.closest(".home-section") || el,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 1.5,
                  invalidateOnRefresh: true,
                },
              });
            });
        });

        cleanup = () => {
          ctx.revert();
          delete (window as any).gsap;
          delete (window as any).ScrollTrigger;
        };
      } catch (err) {
        console.error("[HomePagePremium] Animation setup error:", err);
        document.querySelectorAll<HTMLElement>(".home-section").forEach((s) => {
          s.style.opacity = "1";
          s.style.transform = "none";
        });
      }
    };

    // Czekamy na pełne wyrenderowanie DOM
    // Double rAF gwarantuje że layout jest gotowy
    rafId = requestAnimationFrame(() => {
      rafId = requestAnimationFrame(setupAnimations);
    });

    return () => {
      cancelAnimationFrame(rafId);
      cleanup?.();
    };
  }, []);

  return (
    <div className="min-h-screen bg-white" style={{ perspective: "1200px" }}>
      <Header />
      <ProgressIndicator color="rgba(212, 175, 55, 0.8)" height={2} />
      <CursorFollower size={24} color="rgba(212, 175, 75, 0.4)" />
      <ScrollIndicator />

      <main style={{ transformStyle: "preserve-3d" }}>
        {/* Hero - bez reveal, animowane wewnętrznie */}
        <HeroPremium />

        {/* Section divider */}
        <div className="section-divider h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent origin-center" />

        {/* Pozostałe sekcje - premium 3D scroll reveal */}
        <div className="home-section">
          <AboutSection />
        </div>
        <div className="section-divider h-[1px] bg-gradient-to-r from-transparent via-gold/20 to-transparent origin-center" />
        <div className="home-section">
          <Carousel3D />
        </div>
        <div className="section-divider h-[1px] bg-gradient-to-r from-transparent via-gold/20 to-transparent origin-center" />
        <div className="home-section reveal-cards">
          <CTAFeaturesSection />
        </div>
        <div className="section-divider h-[1px] bg-gradient-to-r from-transparent via-gold/20 to-transparent origin-center" />
        <div className="home-section">
          <PressSection />
        </div>
        <div className="section-divider h-[1px] bg-gradient-to-r from-transparent via-gold/20 to-transparent origin-center" />
        <div className="home-section">
          <ContactSection />
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default HomePagePremium;
