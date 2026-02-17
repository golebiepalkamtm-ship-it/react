/**
 * ============================================================================
 * INDEX PAGE - Unified Premium Homepage (v2 — Optimized)
 * ============================================================================
 *
 * Integracja:
 * 1. Premium animacji (Awwwards level) z HomePage.tsx
 * 2. Logiki biznesowej (Auth, Modals, Debug) z Index.tsx
 *
 * OPTIMIZATIONS (v2):
 * - Cursor animation driven by gsap.ticker (not recursive rAF — no leaked frames)
 * - gsap.quickTo() for FeatureCard glow tracking (120 FPS mouse)
 * - SplitText gated behind document.fonts.ready
 * - All animations use GPU-composited properties (x, y, scale, rotation)
 * - Removed duplicate ScrollTrigger.refresh() calls
 * - will-change: transform on 3D feature cards
 * - Single gsap.context() per component for guaranteed cleanup
 */

import React, { useRef, useEffect, useCallback, memo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { gsap, ScrollTrigger } from "@/lib/gsapConfig";
import { registerCustomEasings } from "@/lib/customEasings";
import {
  ArrowRight,
  Trophy,
  Zap,
  Award,
  ChevronDown,
  Star,
} from "lucide-react";
import { useSpringPhysics } from "@/hooks/useCustomPhysics";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import Header from "@/components/Header";
import { Carousel3D } from "@/components/gallery/Carousel3D";
import AboutSection from "@/components/AboutSection";
import PressSection from "@/components/PressSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import { UnifiedModal } from "@/components/ui/UnifiedModal";
import { useAuth } from "@/contexts/AuthContext";
import {
  DepthLayer,
  FloatingElement,
  MagneticElement,
  CursorFollower,
  PremiumTextReveal,
  CountUp,
  GradientText,
  SeamlessSection,
  RevealOnScroll,
  ProgressIndicator,
  AdvancedParallax,
  ParallaxImage,
  useLenisContext,
} from "@/components/animations";

registerCustomEasings();

// ─── Type definitions ─────────────────────────────────────────────────────
interface AuthMessage {
  type: "success" | "error" | "warning" | "info";
  title: string;
  text: string;
  action?: () => void;
  actionText?: string;
}

const getAuthMessage = (user: any, profile: any): AuthMessage | null => {
  if (!user || !profile) return null;
  switch (profile.role) {
    case "USER_REGISTERED":
      return {
        type: "warning" as const,
        title: "Wymagana weryfikacja",
        text: "Twój adres email nie został jeszcze zweryfikowany. Sprawdź swoją skrzynkę odbiorczą, aby uzyskać pełny dostęp.",
        action: () => window.location.reload(),
        actionText: "Odśwież",
      };
    case "USER_EMAIL_VERIFIED":
      return {
        type: "info" as const,
        title: "Witaj w Pałka MTM!",
        text: `Jesteś zalogowany jako ${profile.email || user.email}. Uzupełnij profil i zweryfikuj telefon, aby licytować.`,
      };
    case "USER_FULL_VERIFIED":
    case "ADMIN":
      return {
        type: "success" as const,
        title: "Witaj w Pałka MTM!",
        text: `Cieszymy się, że jesteś z nami, ${profile.first_name || profile.name || user.email}! Życzymy udanych licytacji.`,
      };
    default:
      return null;
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// HERO PREMIUM
// ═══════════════════════════════════════════════════════════════════════════
const HeroPremium = memo(() => {
  const heroRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const videoOverlayRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const statsContainerRef = useRef<HTMLDivElement>(null);
  const titleContainerRef = useRef<HTMLDivElement>(null);

  /*
   * VIDEO ENCODING FOR SCRUBBING:
   * ffmpeg -i input.mp4 -c:v libx264 -preset slow -crf 22 -g 1 -keyint_min 1 -an output_scrub.mp4
   */

  const [isSplit, setIsSplit] = useState(false);

  // ── Font-ready SplitText with gsap.context cleanup ──────────────────
  useEffect(() => {
    const titleEl = titleContainerRef.current;
    if (!titleEl) return;

    let cancelled = false;

    const initSplit = async () => {
      // Gate: wait for fonts to prevent FOUT-caused layout shift
      try {
        await document.fonts.ready;
      } catch {
        /* not supported */
      }
      if (cancelled || !titleEl) return;

      const text = titleEl.textContent || "";
      const chars = text.split("");
      titleEl.innerHTML = chars
        .map(
          (char) =>
            `<span class="char-reveal" style="display:inline-block;will-change:transform;opacity:0">${char === " " ? "&nbsp;" : char}</span>`,
        )
        .join("");

      setIsSplit(true);
    };

    void initSplit();

    return () => {
      cancelled = true;
    };
  }, []);

  // ── Velocity-based Text Skew (Lenis Style) ──────────────────────────
  useEffect(() => {
    if (!isSplit || !titleContainerRef.current) return;

    const chars = titleContainerRef.current.querySelectorAll(".char-reveal");
    const skewSetter = gsap.quickTo(chars, "skewY", {
      duration: 0.4,
      ease: "power3",
    });
    const clamp = gsap.utils.clamp(-15, 15);

    ScrollTrigger.create({
      onUpdate: (self) => {
        const skew = clamp(self.getVelocity() / -400);
        skewSetter(skew);
      },
    });
  }, [isSplit]);

  // Use the custom hook for hero animations
  useScrollAnimation(
    heroRef,
    [
      // Badge reveal animation
      {
        targets: () => contentRef.current?.querySelector(".inline-flex"),
        fromVars: { opacity: 0, scale: 0.8, y: 30, rotateX: -90 },
        toVars: {
          opacity: 1,
          scale: 1,
          y: 0,
          rotateX: 0,
          duration: 0.8,
          ease: "back.out(1.7)",
          delay: 0.3,
        },
        timeline: true,
      },
      // Title character-by-character reveal (chars already split above)
      {
        targets: () =>
          titleContainerRef.current?.querySelectorAll(".char-reveal"),
        fromVars: { opacity: 0, y: 40, rotateX: -90 },
        toVars: {
          opacity: 1,
          y: 0,
          rotateX: 0,
          stagger: 0.04,
          duration: 1.2,
          ease: "expo.out",
          delay: 0.6,
        },
        timeline: true,
      },
      // Description reveal — using GPU-friendly y transform + opacity
      {
        targets: () => contentRef.current?.querySelector("p"),
        fromVars: { opacity: 0, y: 40 },
        toVars: {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "expo.out",
          delay: 0.8,
        },
        timeline: true,
        constructionEffect: "reveal",
      },
      // Button construction — all GPU properties
      {
        targets: () => contentRef.current?.querySelector("a"),
        fromVars: { opacity: 0, y: 30, scale: 0.9 },
        toVars: {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: "expo.out",
          delay: 1.2,
        },
        timeline: true,
      },
      // Stats stagger reveal — pure transforms
      {
        targets: () =>
          statsContainerRef.current?.querySelectorAll(".hero-stat-item"),
        fromVars: { opacity: 0, y: 60, scale: 0.9, rotateX: 45 },
        toVars: {
          opacity: 1,
          y: 0,
          scale: 1,
          rotateX: 0,
          stagger: 0.15,
          duration: 1,
          ease: "expo.out",
          delay: 1.5,
        },
        timeline: true,
        constructionEffect: "build",
      },
      // Parallax blur spots on scroll — GPU y transform
      {
        targets: () => heroRef.current?.querySelectorAll(".hero-blur"),
        toVars: {
          y: (index: number) =>
            window.innerHeight * (0.5 + index * 0.15) * -0.3,
          ease: "none",
        },
        scrollTrigger: {
          trigger: () => heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      },
      // Hero Background Zoom
      {
        targets: ".hero-background-media",
        toVars: {
          scale: 1.3,
          y: "10%",
          ease: "none",
        },
        scrollTrigger: {
          trigger: () => heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      },
    ],
    [isSplit],
  );

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      data-section="hero"
    >
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="hero-background-media absolute inset-0 will-change-transform">
          <img
            src="https://images.unsplash.com/photo-1591485423007-765bdf4139ef?q=80&w=2000"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80" />

        {/* Animated blur spots */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <div
            className="hero-blur absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gold/20 rounded-full blur-[120px]"
            data-speed="0.8"
          />
          <div
            className="hero-blur absolute top-1/3 -left-32 w-[500px] h-[500px] bg-gold/10 rounded-full blur-[100px]"
            data-speed="0.6"
          />
          <div
            className="hero-blur absolute top-1/4 -right-32 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px]"
            data-speed="0.7"
          />
        </div>
      </div>
      <div
        ref={contentRef}
        className="relative z-10 max-w-6xl mx-auto px-4 text-left"
      >
        <MagneticElement strength={0.1} className="mb-8">
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-medium backdrop-blur-sm">
            <Star className="w-4 h-4 fill-gold" />
            <span>Hodowla Gołębi Pocztowych od 1979</span>
          </span>
        </MagneticElement>

        <AdvancedParallax speed={0.8} ease="smooth">
          <h1
            ref={titleContainerRef}
            className="text-3xl md:text-4xl lg:text-5xl font-bold font-display text-white mb-6"
            style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
          >
            Pałka MTM - Geny Zwycięzców
          </h1>
        </AdvancedParallax>

        <AdvancedParallax speed={0.9} ease="smooth">
          <p className="text-xl md:text-2xl text-white/70 max-w-2xl mb-12 leading-relaxed">
            Wyniki budowane przez pokolenia. Topowe gołębie pocztowe z Dolnego
            Śląska.
          </p>
        </AdvancedParallax>

        <div className="flex flex-col sm:flex-row items-start justify-start gap-4 mb-20">
          <Link
            to="/champions"
            data-magnetic
            data-magnetic-strength="0.3"
            className="group flex items-center gap-3 px-8 py-4 bg-gold text-navy rounded-full font-semibold text-lg hover:bg-gold-light transition-all shadow-lg shadow-gold/20"
            style={{ willChange: "transform" }}
          >
            <span>Zobacz Championy</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div
          ref={statsContainerRef}
          className="grid grid-cols-3 gap-8 max-w-3xl mx-auto hero-stats"
          style={{ perspective: "1500px", transformStyle: "preserve-3d" }}
        >
          {[
            { icon: Trophy, value: 150, suffix: "+", label: "Mistrzostw" },
            { icon: Award, value: 45, suffix: "+", label: "Lat Doświadczenia" },
            { icon: Zap, value: 3, suffix: "", label: "Pokolenia Hodowców" },
          ].map((stat, i) => (
            <div key={stat.label} className="hero-stat-item">
              <MagneticElement strength={0.08}>
                <div className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-gold/30 transition-colors">
                  <stat.icon className="w-6 h-6 text-gold mx-auto mb-2" />
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                    <CountUp
                      end={stat.value}
                      duration={2.5}
                      delay={0.5 + i * 0.2}
                      suffix={stat.suffix}
                    />
                  </div>
                  <div className="text-white/70 text-sm">{stat.label}</div>
                </div>
              </MagneticElement>
            </div>
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
});

HeroPremium.displayName = "HeroPremium";

// ═══════════════════════════════════════════════════════════════════════════
// FEATURE CARD PREMIUM — 3D Tilt with quickTo glow
// ═══════════════════════════════════════════════════════════════════════════
interface FeatureData {
  icon: React.ElementType<{ className?: string }>;
  title: string;
  description: string;
}

const FeatureCardPremium = memo(
  ({ feature, index }: { feature: FeatureData; index: number }) => {
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

    // ── quickSetter for glow tracking — zero allocation per mousemove ──
    // quickSetter is the correct API for CSS custom properties (string values)
    const quickGlowX = useRef<Function | null>(null);
    const quickGlowY = useRef<Function | null>(null);

    useEffect(() => {
      if (glowRef.current) {
        quickGlowX.current = gsap.quickSetter(
          glowRef.current,
          "--glow-x",
        ) as Function;
        quickGlowY.current = gsap.quickSetter(
          glowRef.current,
          "--glow-y",
        ) as Function;
      }
      return () => {
        quickGlowX.current = null;
        quickGlowY.current = null;
      };
    }, []);

    const handleMouseMove = useCallback(
      (e: React.MouseEvent) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        mouseX.set(x);
        mouseY.set(y);

        // quickSetter updates the CSS custom property — no tween allocation
        const glowXPct = ((e.clientX - rect.left) / rect.width) * 100;
        const glowYPct = ((e.clientY - rect.top) / rect.height) * 100;
        quickGlowX.current?.(`${glowXPct}%`);
        quickGlowY.current?.(`${glowYPct}%`);
      },
      [mouseX, mouseY],
    );

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
            transformStyle: "preserve-3d",
            // GPU hint for 3D transformed cards
            willChange: "transform",
          }}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <motion.div
            className="h-full flex flex-col p-8 rounded-2xl border border-gold/30 bg-gradient-to-br from-zinc-800/80 via-zinc-900/80 to-zinc-800/80 shadow-[0_0_30px_rgba(212,175,55,0.1),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-lg relative overflow-hidden"
            style={
              {
                rotateX: isHovered ? rotateX : 0,
                rotateY: isHovered ? rotateY : 0,
                transformStyle: "preserve-3d",
                "--glow-x": "50%",
                "--glow-y": "50%",
                minHeight: "260px",
                willChange: "transform",
              } as React.CSSProperties
            }
            whileHover={{ translateY: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <div
              ref={glowRef}
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at var(--glow-x) var(--glow-y), rgba(212,175,55,0.15) 0%, transparent 50%)",
              }}
            />

            <div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                boxShadow:
                  "0 0 30px rgba(212,175,55,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
            />

            <div
              className="absolute -top-10 left-1/2 -translate-x-1/2 w-[150%] h-24 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(212,175,55,0.15) 0%, transparent 60%)",
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
  },
);

FeatureCardPremium.displayName = "FeatureCardPremium";

// ═══════════════════════════════════════════════════════════════════════════
// FEATURES SECTION PREMIUM
// ═══════════════════════════════════════════════════════════════════════════
const FeaturesSectionPremium = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

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

  // Use the custom hook for features section animations
  useScrollAnimation(
    sectionRef,
    [
      // Header animation — GPU y + opacity
      {
        targets: () => sectionRef.current?.querySelector(".features-header"),
        fromVars: { y: 100, opacity: 0 },
        toVars: { y: 0, opacity: 1, duration: 1.2, ease: "expo.out" },
        scrollTrigger: {
          trigger: () => sectionRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
          once: true,
        },
        constructionEffect: "reveal",
      },
      // Cards animation with stagger — GPU y + scale + opacity
      {
        targets: () =>
          sectionRef.current?.querySelectorAll(".feature-card-item"),
        fromVars: { y: 120, opacity: 0, scale: 0.9 },
        toVars: {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.4,
          ease: "expo.out",
          stagger: 0.2,
        },
        scrollTrigger: {
          trigger: () => sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
          once: true,
        },
        constructionEffect: "build",
      },
    ],
    [],
  );

  return (
    <SeamlessSection
      className="py-24 px-4 relative overflow-hidden"
      transitionIn="fade"
      data-section="features"
    >
      <div ref={sectionRef} className="max-w-6xl mx-auto">
        <div className="features-header mb-16">
          <span className="inline-block px-4 py-1 border border-gold/30 rounded-full text-xs tracking-[0.2em] text-gold/70 uppercase mb-4">
            Dlaczego my
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4 text-gold">
            Najwyższa Jakość Hodowli
          </h2>
          <p className="text-white/70 max-w-xl leading-relaxed">
            Od ponad 50 lat dostarczamy championów hodowcom na całym świecie.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="feature-card-item">
              <FeatureCardPremium feature={feature} index={index} />
            </div>
          ))}
        </div>
      </div>
    </SeamlessSection>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// CTA SECTION PREMIUM
// ═══════════════════════════════════════════════════════════════════════════
const CTASectionPremium = () => {
  const ctaRef = useRef<HTMLDivElement>(null);

  // Use the custom hook for CTA section animations — all GPU transforms
  useScrollAnimation(
    ctaRef,
    [
      {
        targets: () => ctaRef.current?.querySelector("h2"),
        fromVars: { y: 100, opacity: 0, scale: 0.95 },
        toVars: { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: "expo.out" },
        scrollTrigger: {
          trigger: () => ctaRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
          once: true,
        },
        timeline: true,
        constructionEffect: "reveal",
      },
      {
        targets: () => ctaRef.current?.querySelector("p"),
        fromVars: { y: 60, opacity: 0 },
        toVars: {
          y: 0,
          opacity: 1,
          duration: 1.0,
          ease: "expo.out",
        },
        timeline: true,
      },
      {
        targets: () => ctaRef.current?.querySelector("a"),
        fromVars: { y: 80, opacity: 0, scale: 0.9 },
        toVars: {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.2,
          ease: "expo.out",
        },
        timeline: true,
        constructionEffect: "build",
      },
    ],
    [],
  );

  return (
    <SeamlessSection
      className="py-24 px-4"
      transitionIn="fade"
      data-section="cta"
    >
      <div ref={ctaRef} className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold font-display text-gold mb-6">
          Gotowy na swojego Championa?
        </h2>

        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Przeglądaj naszą ekskluzywną kolekcję i znajdź idealnego gołębia dla
          swojej hodowli.
        </p>

        <Link
          to="/champions"
          data-magnetic
          data-magnetic-strength="0.4"
          className="group inline-flex items-center gap-2 px-8 py-4 bg-gold text-background rounded-full font-semibold hover:bg-gold-light transition-colors shadow-lg shadow-gold/20"
        >
          <span>Eksploruj Galerię</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </SeamlessSection>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN INDEX COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
const Index = () => {
  const { user, profile, loading } = useAuth();
  const [showAuthMessage, setShowAuthMessage] = useState(false);
  const [authMessage, setAuthMessage] = useState<AuthMessage | null>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { getLenis } = useLenisContext();

  // ── Block hash navigation auto-scroll ───────────────────────────────
  useEffect(() => {
    if (location.hash) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }

    const preventHashScroll = (e: Event) => {
      if (window.location.hash) {
        e.preventDefault();
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search,
        );
      }
    };

    window.addEventListener("hashchange", preventHashScroll);
    return () => window.removeEventListener("hashchange", preventHashScroll);
  }, [location]);

  // ── Obsługa nawigacji z headera z location.state.scrollTo ───────────
  useEffect(() => {
    const state = (location.state as any) || {};
    if (!state.scrollTo) return;

    const anchor = state.scrollTo as string;
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );

    const timer = setTimeout(() => {
      const el = document.getElementById(anchor);
      if (!el) return;

      const header = document.querySelector("header") as HTMLElement | null;
      const headerHeight = header?.offsetHeight ?? 88;

      let offset = headerHeight + 32;
      if (anchor === "about") {
        offset = headerHeight + 64;
      } else if (anchor === "contact") {
        offset = headerHeight + 16;
      }

      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      getLenis()?.scrollTo(el, {
        offset: -offset,
        duration: 0.8,
        easing: (t) => 1 - Math.pow(1 - t, 3),
      });
    }, 80);

    return () => clearTimeout(timer);
  }, [location, getLenis]);

  // ── Cursor physics — driven by gsap.ticker, NOT recursive rAF ──────
  // This prevents the leaked rAF loop that the old code had (no cancelAnimationFrame).
  const cursorSpring = useSpringPhysics({ stiffness: 0.15, damping: 0.25 });
  const followerSpring = useSpringPhysics({ stiffness: 0.08, damping: 0.3 });

  const [cursorLabel, setCursorLabel] = useState("");

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorSpring.setTarget(e.clientX, e.clientY);
      followerSpring.setTarget(e.clientX, e.clientY);

      // Detect cursor label from target or parents
      const target = e.target as HTMLElement;
      const labelEl = target.closest("[data-cursor-label]");
      if (labelEl) {
        setCursorLabel(labelEl.getAttribute("data-cursor-label") || "");
      } else {
        setCursorLabel("");
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    const tickHandler = () => {
      const cursorPos = cursorSpring.update();
      const followerPos = followerSpring.update();

      if (cursorRef.current) {
        gsap.set(cursorRef.current, {
          x: cursorPos.x,
          y: cursorPos.y,
          xPercent: -50,
          yPercent: -50,
        });
      }

      if (followerRef.current) {
        gsap.set(followerRef.current, {
          x: followerPos.x,
          y: followerPos.y,
          xPercent: -50,
          yPercent: -50,
          scale: cursorLabel ? 5 : 1,
          duration: 0.3,
          overwrite: "auto",
        });

        const labelSpan = followerRef.current.querySelector("span");
        if (labelSpan) {
          gsap.set(labelSpan, {
            opacity: cursorLabel ? 1 : 0,
            scale: cursorLabel ? 0.2 : 0, // Compensate for parent scale
          });
          if (cursorLabel) labelSpan.textContent = cursorLabel;
        }
      }
    };

    gsap.ticker.add(tickHandler);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      gsap.ticker.remove(tickHandler);
    };
  }, [cursorSpring, followerSpring, cursorLabel]);

  // ── Page lifecycle — single cleanup ─────────────────────────────────
  useEffect(() => {
    document.body.classList.add("home-page");

    // Single delayed refresh for all mount-time ScrollTriggers
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh(true);
    }, 500);

    return () => {
      clearTimeout(refreshTimer);
      document.body.classList.remove("home-page");
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  // ── Section snap (Wyłączone - powodowało problemy z przewijaniem) ──
  /*
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-section], section'));
    if (sections.length > 1) {
      const docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
      const snapPoints = sections.map((sec) => {
        const top = sec.getBoundingClientRect().top + window.scrollY;
        const progress = top / (docHeight - window.innerHeight);
        return Math.min(1, Math.max(0, progress));
      });
      const st = ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        snap: {
          snapTo: snapPoints,
          duration: { min: 0.2, max: 0.8 },
          delay: 0.05,
          ease: 'power1.inOut',
        },
      });
      return () => st.kill();
    }
  }, []);
  */

  // ── Debug hotkeys ───────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key && e.key.toLowerCase() === "d" && e.ctrlKey && e.shiftKey) {
        const scrollY = window.scrollY;
        const sections = Array.from(
          document.querySelectorAll<HTMLElement>("[data-section]"),
        );
        sections.reduce<HTMLElement | null>((acc, sec) => {
          const top = sec.getBoundingClientRect().top + window.scrollY;
          const dist = Math.abs(scrollY - top);
          if (!acc) return sec;
          const accTop = acc.getBoundingClientRect().top + window.scrollY;
          return dist < Math.abs(scrollY - accTop) ? sec : acc;
        }, null);
      }

      if (e.key && e.key.toLowerCase() === "g" && e.ctrlKey && e.shiftKey) {
        console.clear();
        import("@/debug/gsap-diagnostic").then((module) => {
          module.runGSAPDiagnostic();
        });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ── Auth message logic ──────────────────────────────────────────────
  useEffect(() => {
    if (!loading && user && profile) {
      const hasShownWelcome = sessionStorage.getItem("hasShownWelcome");
      if (!hasShownWelcome) {
        const timer = setTimeout(() => {
          setAuthMessage(getAuthMessage(user, profile));
          setShowAuthMessage(true);
          sessionStorage.setItem("hasShownWelcome", "true");
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [loading, user, profile]);

  return (
    <div className="min-h-screen relative">
      <Header />

      <ProgressIndicator />

      <div ref={cursorRef} className="custom-cursor-main" />
      <div
        ref={followerRef}
        className="cursor-follower-main flex items-center justify-center"
      >
        <span className="text-[10px] text-zinc-950 font-bold opacity-0 whitespace-nowrap"></span>
      </div>

      <div className="fixed inset-0 -z-10 pointer-events-none"></div>

      {authMessage && (
        <UnifiedModal
          isOpen={showAuthMessage}
          onClose={() => setShowAuthMessage(false)}
          type={authMessage.type}
          title={authMessage.title}
          message={authMessage.text}
          confirmButton={
            authMessage.action
              ? {
                  text: authMessage.actionText!,
                  onClick: authMessage.action,
                }
              : {
                  text: "OK",
                  onClick: () => setShowAuthMessage(false),
                }
          }
        />
      )}

      <div className="relative z-10">
        {/* Floating Background Parallax Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <DepthLayer
            depth={1}
            className="absolute top-[15%] right-[5%] w-64 h-64 bg-gold/5 rounded-full blur-3xl"
          />
          <DepthLayer
            depth={2}
            className="absolute top-[40%] left-[-10%] w-96 h-96 bg-gold/10 rounded-full blur-3xl"
          />
          <DepthLayer
            depth={3}
            className="absolute top-[70%] right-[-5%] w-80 h-80 bg-amber-500/5 rounded-full blur-3xl"
          />
          <DepthLayer
            depth={1.5}
            className="absolute top-[90%] left-[10%] w-72 h-72 bg-gold/5 rounded-full blur-3xl"
          />
        </div>

        {/* Hero Section - with seamless transition to About */}
        <HeroPremium />

        {/* About Section - O nas */}
        <div className="relative">
          <AboutSection />
        </div>

        {/* Carousel Section - Galeria Mistrzów */}
        <section
          className="relative mt-24 py-12 overflow-hidden"
          id="gallery-3d"
        >
          <div className="relative z-10">
            <Carousel3D />
          </div>
        </section>

        <AdvancedParallax speed={1.1} ease="smooth">
          <FeaturesSectionPremium />
        </AdvancedParallax>

        {/* Media i Prasa */}
        <section className="relative mt-24 overflow-hidden">
          <div className="relative z-10">
            <PressSection />
          </div>
        </section>

        <CTASectionPremium />

        <AdvancedParallax speed={1.05} ease="smooth" className="mt-24">
          <ContactSection />
        </AdvancedParallax>

        <Footer />
      </div>
    </div>
  );
};

export default Index;
