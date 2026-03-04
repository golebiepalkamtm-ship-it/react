/**
 * ============================================================================
 * HOMEPAGE PREMIUM - Elite Version by Senior Creative Developer
 * ============================================================================
 *
 * Zoptymalizowana wersja z wykorzystaniem hooka useGSAP,
 * synchronizacją Ticker Handshake (Lenis) oraz optymalizacją pod Mobile/Safari.
 */

import React, { useRef, useEffect, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { registerCustomEasings } from "@/lib/customEasings";
import { ArrowRight, Trophy, Zap, Users, Star } from "lucide-react";
import { MagneticElement } from "@/components/animations";
import Header from "@/components/Header";

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
      {/* Particle System - USUNIĘTE */}
      <div
        ref={contentRef}
        className="relative z-10 container mx-auto px-6 lg:px-10 text-center flex flex-col items-center pt-24 md:pt-32"
      >
        <div className="w-full max-w-6xl flex flex-col items-center gap-10">
          <div className="hero-reveal mb-8">
            <span className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-[#A68E4E] text-zinc-900 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] shadow-lg shadow-gold/20">
              <Star className="w-3.5 h-3.5 fill-current" />
              Hodowla Gołębi Pocztowych od 1979
            </span>
          </div>

          <h1 className="hero-particle-system mb-4 text-4xl md:text-6xl lg:text-7xl font-bold font-display leading-snug uppercase text-center">
            <span
              className="hero-part-left inline-block text-zinc-900"
              style={{
                textShadow:
                  "0 2px 6px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.2)",
              }}
            >
              <SplitText>Pałka</SplitText>
            </span>{" "}
            <span
              className="hero-part-right inline-block text-[#A68E4E]"
              style={{
                textShadow:
                  "0 2px 6px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.2)",
              }}
            >
              <SplitText>MTM</SplitText>
            </span>
            <span
              className="hero-subtitle gold-heading block text-xl md:text-2xl font-bold tracking-[0.2em] mt-4 uppercase text-center whitespace-nowrap"
              style={{
                textShadow:
                  "0 2px 6px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.2)",
              }}
            >
              <SplitText>— Geny Zwycięzców</SplitText>
            </span>
          </h1>

          <div className="hero-reveal text-lg md:text-2xl text-zinc-950 max-w-4xl mb-10 mx-auto text-center leading-relaxed font-display font-bold">
            <SplitText>Trzy pokolenia pasji. Setki mistrzostw.</SplitText>
            <br />
            <SplitText>Elitarne gołębie pocztowe z Dolnego Śląska.</SplitText>
          </div>

          <div className="hero-reveal flex justify-center">
            <MagneticElement strength={0.4} ease={0.15}>
              <Link
                to="/champions"
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-3.5 text-[#A68E4E] font-bold text-sm md:text-base uppercase tracking-[0.2em] hover:text-white transition-colors cursor-pointer"
              >
                Zobacz Championy
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </MagneticElement>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 hero-reveal hero-scroll-indicator">
        <div className="flex flex-col items-center gap-3 text-zinc-400">
          <span className="text-[10px] uppercase tracking-[0.3em] font-medium">
            Odkryj naszą historię
          </span>
          <div className="w-[1px] h-12 bg-gold/50 rounded-full" />
        </div>
      </div>
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
  const sectionRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
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
      const cards = cardsRef.current.filter(Boolean);

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
        )
        // 4. Cards sequential appearance
        .fromTo(
          cards,
          { autoAlpha: 0, y: 60, scale: 0.95 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 1.0,
            stagger: 0.15,
            ease: "expo.out",
          },
          "-=0.4",
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
            Przejdź do Champion Pigeon Auctions
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              ref={(el) => {
                cardsRef.current[index] = el;
              }}
              className="reveal-card group relative overflow-hidden rounded-2xl bg-champion-teal transition-all duration-500 p-8 h-full"
              style={{
                border: "2px solid rgba(166,142,78,0.7)",
                boxShadow:
                  "0 0 12px rgba(166,142,78,0.25), 0 0 30px rgba(166,142,78,0.1), inset 0 0 0 1px rgba(166,142,78,0.08), 0 24px 60px rgba(0,0,0,0.6)",
              }}
            >
              <div className="relative z-10">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-500"
                  style={{
                    background: "#A68E4E",
                    boxShadow: "0 2px 12px rgba(166,142,78,0.5)",
                    border: "1px solid rgba(166,142,78,0.8)",
                  }}
                >
                  <feature.icon className="w-7 h-7 text-black" />
                </div>
                <h3 className="text-xl font-bold gold-heading mb-3 uppercase text-[#A68E4E]">
                  {feature.title}
                </h3>
                <p className="text-white/80 leading-relaxed font-light text-sm">
                  {feature.description}
                </p>
              </div>
            </div>
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
