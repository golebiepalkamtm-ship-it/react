/**
 * ============================================================================
 * HOMEPAGE PREMIUM - Elite Version by Senior Creative Developer
 * ============================================================================
 *
 * Zoptymalizowana wersja z wykorzystaniem hooka useGSAP,
 * synchronizacją Ticker Handshake (Lenis) oraz optymalizacją pod Mobile/Safari.
 */

import React, {
  useRef,
  useEffect,
  lazy,
  Suspense,
  memo,
  useCallback,
} from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { registerCustomEasings } from "@/lib/customEasings";
import { ArrowRight, Trophy, Zap, Users, Star } from "lucide-react";
import { MagneticButton } from "@/components/effects/MagneticButton";
import Header from "@/components/Header";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const Carousel3D = lazy(() => import("@/components/gallery/Carousel3D"));
const AboutSection = lazy(() => import("@/components/AboutSection"));
const PressSection = lazy(() => import("@/components/PressSection"));
const ContactSection = lazy(() => import("@/components/ContactSection"));
const Footer = lazy(() => import("@/components/Footer"));

// Rejestracja wtyczek bezpośrednio tutaj
gsap.registerPlugin(ScrollTrigger);
registerCustomEasings();
ScrollTrigger.config({ ignoreMobileResize: true });

// ============================================================================
// HERO PREMIUM - Czysty, Jasny i Profesjonalny
// ============================================================================

const SplitText = React.memo(
  ({ children, className }: { children: string; className?: string }) => (
    <span className={className}>
      <span className="sr-only">{children}</span>
      <span aria-hidden="true">
        {children.split("").map((char, i) => (
          <span
            key={i}
            className="char-premium inline-block will-change-transform"
            style={{ backfaceVisibility: "hidden" }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </span>
    </span>
  ),
);

const HeroPremium = () => {
  const heroRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // RESET STANÓW
      gsap.set(".hero-reveal", { autoAlpha: 0, y: 30 });
      gsap.set(".hero-scroll-indicator", { autoAlpha: 0, y: 20 });

      // ENTRANCE
      const entranceTl = gsap.timeline({ delay: 0 }); // Brak opóźnienia
      entranceTl
        .to(".hero-reveal", {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          stagger: 0.05,
          force3D: true,
        })
        .to(
          ".hero-scroll-indicator",
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            force3D: true,
          },
          0.3,
        );

      // PINNING & SCROLL ANIMATION
      const chars = gsap.utils.toArray<HTMLElement>(".char-premium");
      const badge = document.querySelector(".hero-reveal"); // "Hodowla..."
      const button = document.querySelector(".hero-reveal a"); // "Zobacz Championy"
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      // OPTIMIZATION: Pre-calculate ALL random values and positions
      // Avoids calculations during the animation loop
      const charAnimations = chars.map((char) => {
        const rect = char.getBoundingClientRect();
        const dx = rect.left + rect.width / 2 - centerX;
        const dy = rect.top + rect.height / 2 - centerY;

        return {
          x: dx * 3.5, // Target X
          y: dy * 2 + (Math.random() * 200 - 100), // Target Y
          z: Math.random() * 500, // Target Z
          rotation: Math.random() * 90 - 45,
          scale: Math.random() * 1.5 + 0.5,
        };
      });

      gsap.set(chars, { willChange: "transform, opacity, filter" });

      const mainTl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
          pin: true,
          pinSpacing: false,
          anticipatePin: 1,
          fastScrollEnd: true,
          preventOverlaps: true,
        },
      });

      mainTl
        // 1. Badge i Button znikają, litery wybuchają
        .to(".hero-scroll-indicator", { autoAlpha: 0, y: 30, duration: 0.1 }, 0)
        .to(
          ".hero-reveal:not(.font-display)", // Tylko badge i przyciski, nie opis
          { autoAlpha: 0, y: -40, duration: 0.2 },
          0,
        )
        .to(
          chars,
          {
            x: (i) => charAnimations[i]!.x,
            y: (i) => charAnimations[i]!.y,
            z: (i) => charAnimations[i]!.z,
            scale: (i) => charAnimations[i]!.scale,
            rotation: (i) => charAnimations[i]!.rotation,
            opacity: 0,
            filter: "blur(12px)",
            stagger: { amount: 0.1, from: "random" },
            ease: "power1.inOut",
            force3D: true,
          },
          0,
        );

      // SEKCJE
      const sections = gsap.utils.toArray<HTMLElement>(".home-section");
      sections.forEach((sec) => {
        gsap.fromTo(
          sec,
          { autoAlpha: 0, y: 50, willChange: "transform, opacity" },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            force3D: true,
            scrollTrigger: {
              trigger: sec,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });
    },
    { scope: heroRef },
  );

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-transparent"
      style={{ perspective: "1000px", contain: "layout paint" }}
    >
      <div
        ref={contentRef}
        className="relative z-10 container mx-auto px-6 lg:px-10 text-center flex flex-col items-center pt-24 md:pt-32"
      >
        <div className="w-full max-w-6xl flex flex-col items-center gap-10">
          <div className="hero-reveal mb-12">
            <span className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-[#A68E4E] text-zinc-900 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] shadow-lg shadow-gold/20">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Hodowla Gołębi Pocztowych od 1979</span>
            </span>
          </div>

          <h1 className="hero-particle-system mb-6 text-5xl md:text-7xl lg:text-8xl font-black font-display leading-[1.1] uppercase text-center tracking-tighter">
            <span className="text-zinc-900">
              <SplitText>Pałka</SplitText>
            </span>{" "}
            <span className="text-[#A68E4E]">
              <SplitText>MTM</SplitText>
            </span>
            <span className="hero-subtitle block text-lg md:text-2xl font-bold tracking-[0.4em] mt-6 text-[#A68E4E] uppercase text-center">
              <SplitText>— Geny Zwycięzców —</SplitText>
            </span>
          </h1>

          <div className="hero-reveal text-base md:text-lg text-white/80 max-w-2xl mb-14 mx-auto text-center leading-relaxed font-display italic tracking-wide">
            <SplitText>Trzy pokolenia pasji. Setki mistrzostw. Elitarne gołębie pocztowe z Dolnego Śląska.</SplitText>
          </div>

          <div className="hero-reveal flex flex-col items-center gap-6">
            <Link
              to="/champions"
              className="group flex items-center gap-3 px-8 py-3.5 rounded-full font-bold text-sm bg-[#A68E4E] text-zinc-950 shadow-[0_0_20px_rgba(166,142,78,0.3)] hover:shadow-[0_0_35px_rgba(166,142,78,0.5)] transition-shadow"
            >
              <span>Eksploruj Championy</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </Link>

            <div className="hero-scroll-indicator flex flex-col items-center gap-3 text-zinc-400">
              <span className="text-[10px] uppercase tracking-[0.3em] font-medium">
                Odkryj naszą historię
              </span>
              <div className="w-[1px] h-8 bg-[#A68E4E]/50 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator removed from absolute bottom as it is now under the button */}
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

const EliteFeatureCard = memo(
  ({
    feature,
    index,
    className,
  }: {
    feature: FeatureData;
    index: number;
    className?: string;
  }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const spotlightX = useMotionValue(50);
    const spotlightY = useMotionValue(50);

    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), {
      stiffness: 200,
      damping: 25,
    });
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), {
      stiffness: 200,
      damping: 25,
    });

    const handleMouseMove = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
        const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

        spotlightX.set(xPercent);
        spotlightY.set(yPercent);

        mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
        mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
      },
      [mouseX, mouseY, spotlightX, spotlightY],
    );

    const handleMouseLeave = useCallback(() => {
      mouseX.set(0);
      mouseY.set(0);
    }, [mouseX, mouseY]);

    return (
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
        className={`h-full flex flex-col p-8 rounded-2xl bg-champion-teal transition-all duration-500 relative group overflow-hidden ${className || ""}`}
        style={
          {
            transformStyle: "preserve-3d",
            rotateX,
            rotateY,
            border: "2px solid rgba(166, 142, 78, 0.7)",
            boxShadow:
              "0 0 12px rgba(166, 142, 78, 0.25), 0 0 30px rgba(166, 142, 78, 0.1), inset 0 0 0 1px rgba(166, 142, 78, 0.08), 0 24px 60px rgba(0,0,0,0.6)",
          } as any
        }
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{
            background: `radial-gradient(1000px circle at var(--mouse-x) var(--mouse-y), rgba(166, 142, 78, 0.15), transparent 40%)`,
          }}
        />

        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 relative z-10"
          style={{
            background: "#A68E4E",
            boxShadow: "0 0 20px rgba(166,142,78,0.4)",
          }}
        >
          <feature.icon className="w-7 h-7 text-black" />
        </div>
        <h3 className="text-2xl font-bold font-display text-white mb-4 relative z-10 group-hover:text-gold transition-colors duration-300">
          {feature.title}
        </h3>
        <p className="text-white/50 text-base leading-relaxed relative z-10 font-medium group-hover:text-white/80 transition-colors duration-300">
          {feature.description}
        </p>
      </motion.div>
    );
  },
);

EliteFeatureCard.displayName = "EliteFeatureCard";

const CTAFeaturesSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
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
      icon: Users,
      title: "Wsparcie Ekspertów",
      description:
        "Doradztwo w doborze par rozpłodowych i prowadzeniu gołębnika.",
    },
  ];

  useGSAP(
    () => {
      // 2. Master Timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%", // Start early enough to be seen but not too late
          toggleActions: "play none none reverse",
          fastScrollEnd: true,
        },
      });

      // 3. Elements animation with fromTo ensures they are hidden initially
      tl.fromTo(
        badgeRef.current,
        { autoAlpha: 0, y: 40, scale: 0.95 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "back.out(1.5)",
        },
      )
        .fromTo(
          [titleRef.current, descRef.current],
          { autoAlpha: 0, y: 40, scale: 0.95 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
          },
          "-=0.3",
        );
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="flex flex-col items-center justify-center py-24 md:py-32 px-4 bg-transparent relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto w-full">
        <div className="text-center mb-16">
          <span
            ref={badgeRef}
            className="inline-block px-6 py-2 rounded-full bg-[#A68E4E] text-zinc-900 text-[10px] font-bold uppercase tracking-[0.2em] mb-6 shadow-lg shadow-gold/20"
          >
            Dlaczego my
          </span>
          <h2
            ref={titleRef}
            className="text-2xl md:text-3xl lg:text-4xl font-bold mb-8 uppercase font-display"
          >
            <span className="text-zinc-900">Zostań Właścicielem</span> <br />
            <span className="text-[#A68E4E]">Wybitnego Championa</span>
          </h2>
          <p
            ref={descRef}
            className="text-lg md:text-xl text-white mb-10 max-w-4xl mx-auto font-light leading-relaxed"
          >
            Dołącz do elitarnego grona hodowców. Nasze aukcje to jedyna okazja,
            aby zdobyć gołębie o tak wybitnym potencjale genetycznym.
          </p>
          <Link
            to="/auctions"
            className="inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-[#A68E4E] text-zinc-900 rounded-full font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-gold/20 mb-20"
          >
            Przejdź do Champions Pigeon Auction
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <EliteFeatureCard
              key={feature.title}
              feature={feature}
              index={index}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent z-20" />
    </section>
  );
};

// ============================================================================
// MAIN PAGE - ELITE PERFORMANCE FLOW
// ============================================================================

export const HomePagePremium = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Clean up any potential global ScrollTriggers on unmount
  useEffect(() => {
    window.scrollTo(0, 0);
    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-transparent">
      <Header />

      <main>
        {/* Intro Section - Hero Wrapper */}
        <div
          id="hero-section-pin"
          className="relative w-full min-h-screen overflow-hidden z-0"
        >
          <HeroPremium />
        </div>

        <div className="section-divider h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent" />

        <Suspense
          fallback={
            <div className="h-screen w-full flex items-center justify-center bg-transparent" />
          }
        >
          <div className="home-section smooth-content">
            <AboutSection />
          </div>

          <div className="section-divider h-[1px] bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

          <div className="home-section smooth-content">
            <Carousel3D />
          </div>

          <div className="section-divider h-[1px] bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

          <div className="home-section reveal-cards smooth-content">
            <CTAFeaturesSection />
          </div>

          <div className="section-divider h-[1px] bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

          <div className="home-section smooth-content">
            <PressSection />
          </div>

          <div className="section-divider h-[1px] bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

          <div className="home-section smooth-content">
            <ContactSection />
          </div>

          <Footer />
        </Suspense>
      </main>
    </div>
  );
};

export default HomePagePremium;
