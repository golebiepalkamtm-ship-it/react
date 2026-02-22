/**
 * ============================================================================
 * HOMEPAGE PREMIUM - Elite Version by Senior Creative Developer
 * ============================================================================
 *
 * Zoptymalizowana wersja z wykorzystaniem hooka useGSAP,
 * synchronizacją Ticker Handshake (Lenis) oraz optymalizacją pod Mobile/Safari.
 */

import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { registerCustomEasings } from "@/lib/customEasings";
import { ArrowRight, Trophy, Zap, Users, Star } from "lucide-react";
import { Carousel3D } from "@/components/gallery/Carousel3D";
import AboutSection from "@/components/AboutSection";
import PressSection from "@/components/PressSection";
import { MagneticElement } from "@/components/animations";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

// Rejestracja wtyczek bezpośrednio tutaj
gsap.registerPlugin(ScrollTrigger);
registerCustomEasings();

// ============================================================================
// HERO PREMIUM - Czysty, Jasny i Profesjonalny
// ============================================================================

const SplitText = ({
  children,
  className,
}: {
  children: string;
  className?: string;
}) => (
  <span className={className}>
    {children.split("").map((char, i) => (
      <span key={i} className="char-premium inline-block will-change-transform">
        {char === " " ? "\u00A0" : char}
      </span>
    ))}
  </span>
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
        })
        .to(
          ".hero-scroll-indicator",
          { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" },
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

      const mainTl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top", // Animacja trwa dokładnie tyle, ile wjazd następnej sekcji
          scrub: true, // Płynne powiązanie ze scrollem
          pin: true,
          pinSpacing: false, // KLUCZOWE: Następna sekcja wjeżdża NA Hero (overlay)
          anticipatePin: 1,
          fastScrollEnd: true,
          preventOverlaps: true,
        },
      });

      mainTl
        .to(
          ".hero-scroll-indicator",
          { autoAlpha: 0, y: 50, duration: 0.05 },
          0,
        )
        // 1. Badge i Button znikają szybko
        .to([badge, button], { autoAlpha: 0, y: -50, duration: 0.2 }, 0)
        // 2. Napisy wybuchają
        .to(
          chars,
          {
            x: (i) => charAnimations[i]!.x,
            y: (i) => charAnimations[i]!.y,
            z: (i) => charAnimations[i]!.z,
            scale: (i) => charAnimations[i]!.scale,
            rotation: (i) => charAnimations[i]!.rotation,
            opacity: 0, // Zanikanie w trakcie rozchodzenia
            filter: "blur(12px)",
            stagger: { amount: 0.1, from: "random" },
            ease: "power2.inOut", // Liniowy, płynny rozpad zsynchronizowany z wjazdem sekcji
            willChange: "transform, opacity, filter",
          },
          0,
        );

      // SEKCJE
      const sections = document.querySelectorAll(".home-section");
      sections.forEach((sec, i) => {
        gsap.fromTo(
          sec,
          { autoAlpha: 0, y: 50 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sec,
              start: "top 85%",
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
    >
      {/* Particle System - USUNIĘTE */}
      <div
        ref={contentRef}
        className="relative z-10 container mx-auto px-4 lg:px-6 text-center flex flex-col items-center gap-6 pt-24 md:pt-32"
      >
        <div className="w-full max-w-4xl flex flex-col items-center">
          <div className="hero-reveal mb-8">
            <span className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-[#A68E4E] text-zinc-900 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] shadow-lg shadow-gold/20">
              <Star className="w-3.5 h-3.5 fill-current" />
              Hodowla Gołębi Pocztowych od 1979
            </span>
          </div>

          <h1 className="hero-particle-system mb-6 text-4xl md:text-6xl lg:text-7xl font-bold font-display tracking-tight leading-tight uppercase text-center">
            <span className="hero-part-left inline-block text-zinc-900">
              <SplitText>Pałka</SplitText>
            </span>{" "}
            <span className="hero-part-right inline-block text-[#A68E4E]">
              <SplitText>MTM</SplitText>
            </span>
            <span className="hero-subtitle gold-heading block text-xl md:text-2xl font-light tracking-[0.2em] mt-4 uppercase text-center whitespace-nowrap">
              <SplitText>— Geny Zwycięzców</SplitText>
            </span>
          </h1>

          <div className="hero-reveal text-xl md:text-2xl heading-black max-w-2xl mb-12 font-bold mx-auto uppercase tracking-widest text-center">
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
      // 1. Initial States
      gsap.set(badgeRef.current, { opacity: 0, y: 40, scale: 0.92 });
      gsap.set(titleRef.current, { opacity: 0, y: 60 });
      gsap.set(descRef.current, { opacity: 0, y: 40 });

      // Cards Initial States
      const cards = cardsRef.current;
      // Zwiększony dystans i rotacja dla bardziej spektakularnego wejścia
      if (cards[0])
        gsap.set(cards[0], { opacity: 0, x: -300, rotateY: -30, scale: 0.8 }); // Left - mocniej z lewej
      if (cards[1]) gsap.set(cards[1], { opacity: 0, y: 200, scale: 0.6 }); // Middle - startuje niżej i mniejsza
      if (cards[2])
        gsap.set(cards[2], { opacity: 0, x: 300, rotateY: 30, scale: 0.8 }); // Right - mocniej z prawej

      // 2. Master Timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 65%", // Start earlier
          toggleActions: "play none none reverse",
        },
      });

      // 3. Header Animation
      tl.to(badgeRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: "back.out(1.5)",
      })
        .to(
          titleRef.current,
          { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
          "-=0.6",
        )
        .to(
          descRef.current,
          { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
          "-=0.7",
        );

      // 4. Cards Animation
      // Left & Right fly in together first - BARDZIEJ WIDOCZNE
      if (cards[0] && cards[2]) {
        tl.to(
          [cards[0], cards[2]],
          {
            opacity: 1,
            x: 0,
            rotateY: 0,
            scale: 1,
            duration: 1.8,
            ease: "power4.out", // Bardziej dynamiczne wyhamowanie
          },
          "-=0.5",
        );
      }

      // Middle card enters last - MAJESTATYCZNIE
      if (cards[1]) {
        tl.to(
          cards[1],
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.8,
            ease: "elastic.out(1, 0.75)", // Lekkie "odbicie" dla efektu
          },
          "-=1.4",
        );
      }
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="min-h-screen flex flex-col items-center justify-center py-24 px-4 bg-transparent relative overflow-hidden"
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
            className="text-2xl md:text-3xl lg:text-4xl font-bold mb-8 uppercase tracking-tighter font-display"
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
            Licytuj na Aukcjach
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
              className="reveal-card group relative overflow-hidden rounded-2xl border border-white/10 bg-champion-teal transition-all duration-500 p-8 h-full shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
            >
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-gold/20 transition-all duration-500 shadow-xl shadow-gold/20">
                  <feature.icon className="w-7 h-7 text-[#D4AF37] drop-shadow-[0_0_15px_rgba(212,175,55,0.8)]" />
                </div>
                <h4 className="text-xl font-bold gold-heading mb-3 uppercase tracking-tight text-[#A68E4E]">
                  {feature.title}
                </h4>
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
        <div id="hero-section-pin" className="relative w-full min-h-screen">
          <HeroPremium />
        </div>

        <div className="section-divider h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent" />

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
      </main>
    </div>
  );
};

export default HomePagePremium;
