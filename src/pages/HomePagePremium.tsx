/**
 * ============================================================================
 * HOMEPAGE PREMIUM - Elite Version by Senior Creative Developer
 * ============================================================================
 *
 * Zoptymalizowana wersja z wykorzystaniem hooka useGSAP,
 * synchronizacją Ticker Handshake (Lenis) oraz płynną choreografią ScrollTrigger.
 */

import React, {
  useRef,
  useEffect,
  memo,
  useCallback,
} from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { registerCustomEasings } from "@/lib/customEasings";
import { scrubReveal } from "@/lib/scrollReveal";
import { ArrowRight, Trophy, Zap, Users } from "lucide-react";
import Header from "@/components/Header";
import { FooterReveal, KineticText } from "@/components/experience";
import { whenPreloaderDone } from "@/lib/preloaderSignal";

// Importy statyczne: cała strona (a więc pełna wysokość dokumentu) jest dostępna
// od pierwszej klatki. React.lazy + Suspense doładowywały sekcje w trakcie
// przewijania, co zmieniało wysokość strony i powodowało przeskoki.
import Carousel3D from "@/components/gallery/Carousel3D";
import AboutSection from "@/components/AboutSection";
import PressSection from "@/components/PressSection";
import ContactSection from "@/components/ContactSection";

gsap.registerPlugin(ScrollTrigger);
registerCustomEasings();
ScrollTrigger.config({ ignoreMobileResize: true });

// ============================================================================
// HERO PREMIUM - Czysty, Jasny i Profesjonalny z płynną paralaksą
// ============================================================================

const HeroPremium = () => {
  const heroRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleWrapRef = useRef<HTMLHeadingElement>(null);
  const descWrapRef = useRef<HTMLParagraphElement>(null);
  const pitchWrapRef = useRef<HTMLParagraphElement>(null);
  const ctaWrapRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLAnchorElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pigeonFloatRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);

  // Wideo-intro startuje zawsze – to treść (portret ptaka), a nie efekt ruchu.
  // Windows z wyłączonymi „efektami animacji” zgłasza prefers-reduced-motion,
  // więc pauzowanie w tym trybie wyglądało jak brak wideo.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => {
      // Autoplay zablokowany – pierwsza klatka zostaje jako obraz.
    });
  }, []);

  useGSAP(
    () => {
      if (!heroRef.current) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const titleChars = gsap.utils.toArray<HTMLElement>(
        titleWrapRef.current?.querySelectorAll(".kinetic-unit") || [],
      );
      const descWords = gsap.utils.toArray<HTMLElement>(
        descWrapRef.current?.querySelectorAll(".kinetic-unit") || [],
      );

      // 1. ENTRANCE TIMELINE - Dostojne, kaskadowe wejście bez konfliktów z ScrollTriggerem.
      // Stoi w pauzie pod kurtyną preloadera i rusza, gdy kurtyna idzie w górę.
      const entranceTl = gsap.timeline({
        paused: true,
        defaults: { ease: "expo.out", force3D: true },
      });

      // Gołąb wyłania się z mgły: kurtyna odsłania go od łap w górę,
      // a obraz rozjaśnia się z ciemności, jak ptak wychodzący z gołębnika.
      entranceTl
        .fromTo(
          videoWrapRef.current,
          { autoAlpha: 0, y: 48, clipPath: "inset(100% 0% 0% 0%)" },
          {
            autoAlpha: 1,
            y: 0,
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.8,
            ease: "expo.inOut",
            clearProps: "clipPath",
          },
          0,
        )
        .fromTo(
          videoRef.current,
          // Przezroczystość razem z rozjaśnieniem – samo przyciemnienie
          // wyciągało na wierzch szum kompresji w czarnym tle (ciemny kwadrat).
          // Jasność idzie przez zmienną CSS: GSAP nie interpoluje `filter`
          // z url(), więc ptak stał ciemny i na końcu skokowo się rozjaśniał.
          { opacity: 0, "--pigeon-brightness": 0.35 },
          {
            opacity: 1,
            "--pigeon-brightness": 1,
            duration: 2.2,
            ease: "power2.out",
          },
          0.3,
        )
        .fromTo(
          shadowRef.current,
          { autoAlpha: 0, scaleX: 0.4 },
          { autoAlpha: 1, scaleX: 1, duration: 1.4, ease: "power3.out" },
          1.1,
        )
        // Litery wyjeżdżają spod swoich masek z lekkim obrotem, jak
        // składane czcionki – bez przesuwania całego nagłówka.
        .fromTo(
          titleChars,
          reduced
            ? { autoAlpha: 0 }
            : { yPercent: 115, rotate: 8, transformOrigin: "0% 100%" },
          reduced
            ? { autoAlpha: 1, duration: 0.6 }
            : { yPercent: 0, rotate: 0, duration: 1.3, stagger: 0.045 },
          0.15,
        )
        .fromTo(
          descWords,
          reduced ? { autoAlpha: 0 } : { yPercent: 110 },
          reduced
            ? { autoAlpha: 1, duration: 0.6 }
            : { yPercent: 0, duration: 1.1, stagger: 0.03 },
          0.55,
        )
        .fromTo(
          pitchWrapRef.current,
          { autoAlpha: 0, y: reduced ? 0 : 24 },
          { autoAlpha: 1, y: 0, duration: 0.9 },
          0.85,
        )
        .fromTo(
          ctaWrapRef.current,
          { autoAlpha: 0, y: reduced ? 0 : 24 },
          { autoAlpha: 1, y: 0, duration: 0.9 },
          0.95,
        )
        .fromTo(
          scrollIndicatorRef.current,
          { autoAlpha: 0, y: reduced ? 0 : 16 },
          { autoAlpha: 1, y: 0, duration: 0.8 },
          1.1,
        );

      const cleanups: Array<() => void> = [
        whenPreloaderDone(() => entranceTl.play()),
      ];

      // 2. SCROLL TIMELINE – Hero powoli odpływa w głąb, proporcjonalnie do scrolla.
      // Zaczyna znikać dopiero po przewinięciu ~1/4 ekranu, więc nie „ucieka” od razu.
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      scrollTl
        .to(
          contentRef.current,
          {
            yPercent: -12,
            scale: 0.97,
            ease: "none",
            force3D: true,
            duration: 1,
          },
          0,
        )
        .to(
          contentRef.current,
          {
            opacity: 0,
            ease: "none",
            duration: 0.75,
          },
          0.25,
        )
        // Start lotu: gołąb wzbija się w górę i w stronę tytułu, malejąc
        // w oddali – wideo jest bramą do opowieści, a nie tłem, które po
        // prostu znika.
        .to(
          videoWrapRef.current,
          {
            yPercent: -38,
            xPercent: -14,
            rotation: -8,
            scale: 0.72,
            ease: "power1.in",
            force3D: true,
            duration: 1,
          },
          0,
        )
        .to(
          videoWrapRef.current,
          { opacity: 0, ease: "none", duration: 0.45 },
          0.55,
        );

      // 2b. PĘD – tytuł pochyla się proporcjonalnie do prędkości scrolla
      // i wraca do pionu, gdy przewijanie wyhamuje.
      if (!reduced) {
        const skewTo = gsap.quickTo(titleWrapRef.current, "skewY", {
          duration: 0.6,
          ease: "power3.out",
        });
        const skewTick = () => {
          const velocity = scrollTl.scrollTrigger?.getVelocity() ?? 0;
          skewTo(gsap.utils.clamp(-1, 1, velocity / 2500) * -5);
        };
        gsap.ticker.add(skewTick);
        // useGSAP sprząta tweeny, ale nie funkcje dodane do tickera.
        cleanups.push(() => gsap.ticker.remove(skewTick));
      }

      // 3. SPOCZYNEK – ptak delikatnie unosi się i opada, cień odpowiada:
      // gdy ptak wyżej, cień mniejszy i jaśniejszy.
      const breath = gsap.timeline({
        repeat: -1,
        yoyo: true,
        delay: 2.6, // po zakończeniu wejścia cienia – bez walki o scale
        defaults: { duration: 2.6, ease: "sine.inOut" },
      });
      breath
        .to(pigeonFloatRef.current, { y: -12 }, 0)
        .to(shadowRef.current, { scale: 0.82, opacity: 0.55 }, 0);

      // 4. KURSOR – lekki przechył 3D w stronę wskaźnika (tylko mysz/touchpad).
      if (window.matchMedia("(pointer: fine)").matches) {
        const tiltY = gsap.quickTo(pigeonFloatRef.current, "rotationY", {
          duration: 0.9,
          ease: "power3.out",
        });
        const tiltX = gsap.quickTo(pigeonFloatRef.current, "rotationX", {
          duration: 0.9,
          ease: "power3.out",
        });
        const shiftX = gsap.quickTo(pigeonFloatRef.current, "x", {
          duration: 1.1,
          ease: "power3.out",
        });

        const onMove = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          tiltY(nx * 14);
          tiltX(-ny * 6);
          shiftX(nx * 18);
        };
        const onLeave = () => {
          tiltY(0);
          tiltX(0);
          shiftX(0);
        };

        const hero = heroRef.current;
        hero.addEventListener("pointermove", onMove);
        hero.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          hero.removeEventListener("pointermove", onMove);
          hero.removeEventListener("pointerleave", onLeave);
        });
      }

      return () => cleanups.forEach((cleanup) => cleanup());
    },
    { scope: heroRef },
  );

  return (
    <section
      ref={heroRef}
      className="relative min-h-[100svh] flex items-center overflow-hidden bg-transparent"
      style={{ perspective: "1200px" }}
    >
      <div className="relative z-10 container mx-auto px-6 lg:px-10 pt-24 md:pt-28 pb-16 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] items-center gap-6 lg:gap-12">
        {/* Wideo-intro: gołąb z hodowli na czarnym tle. Filtr SVG zamienia
            jasność piksela na przezroczystość, więc czarne tło znika, a ptak
            stoi wprost na mgle VolumetricBackground (renderowanej w osobnym
            drzewie DOM, więc mix-blend-mode nie ma z czym się mieszać). */}
        <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
          {/* Maska z jasności → zamknięcie dziur (dilate+erode) → zebranie
              1px krawędzi z ciemną obwódką kompresji → lekkie wygładzenie.
              Kolory ptaka zostają oryginalne, zmienia się tylko kanał alfa. */}
          <filter
            id="hero-black-key"
            x="0"
            y="0"
            width="100%"
            height="100%"
            colorInterpolationFilters="sRGB"
          >
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  9 9 9 0 -0.3"
              result="matte"
            />
            <feMorphology in="matte" operator="dilate" radius="5" result="grown" />
            <feMorphology in="grown" operator="erode" radius="6" result="closed" />
            <feGaussianBlur in="closed" stdDeviation="0.8" result="soft" />
            <feComposite in="SourceGraphic" in2="soft" operator="in" />
          </filter>
        </svg>
        {/* Trzy warstwy ruchu, żeby się nie gryzły:
            videoWrap – wejście i odlot przy scrollu,
            pigeonFloat – unoszenie w spoczynku i przechył za kursorem,
            video – rozjaśnienie z ciemności (filter). */}
        <div
          ref={videoWrapRef}
          className="relative order-first lg:order-last w-full max-w-[min(78vw,420px)] lg:max-w-[720px] mx-auto aspect-square will-change-transform"
          style={{ perspective: "900px" }}
        >
          {/* Cień pod łapami – uziemia ptaka i „oddycha” razem z jego ruchem */}
          <div
            ref={shadowRef}
            aria-hidden="true"
            className="absolute bottom-[1%] left-[8%] w-[32%] h-[5%] rounded-[50%] bg-black/70 blur-xl pointer-events-none"
          />
          <div
            ref={pigeonFloatRef}
            className="relative w-full h-full will-change-transform"
            style={{ transformStyle: "preserve-3d" }}
          >
            <video
              ref={videoRef}
              // Lustrzane odbicie: ptak patrzy w stronę tytułu, a nie poza ekran.
              className="w-full h-full object-contain -scale-x-100"
              style={{ filter: "url(#hero-black-key) brightness(var(--pigeon-brightness, 1))" }}
              src="/1229.mp4"
              muted
              loop
              playsInline
              preload="auto"
              aria-label="Gołąb pocztowy z hodowli Pałka MTM"
            />
          </div>
        </div>

        <div
          ref={contentRef}
          className="flex flex-col items-start text-left will-change-transform"
        >
          <h1
            ref={titleWrapRef}
            className="hero-particle-system text-6xl md:text-8xl xl:text-9xl font-black font-display leading-[0.95] uppercase tracking-tighter text-zinc-100"
            style={{ transformStyle: "preserve-3d" }}
          >
            <KineticText>Pałka MTM</KineticText>
          </h1>

          <p
            ref={descWrapRef}
            className="mt-8 text-xl md:text-2xl text-zinc-100 leading-snug font-display italic max-w-xl"
          >
            <KineticText splitBy="word">
              Trzy pokolenia pasji od 1979 roku. Setki mistrzostw. Elitarne gołębie pocztowe z Dolnego Śląska.
            </KineticText>
          </p>

          <p
            ref={pitchWrapRef}
            className="mt-6 text-base md:text-lg text-zinc-300 max-w-xl leading-relaxed"
          >
            Pierwsza w Polsce otwarta platforma aukcyjna. Wystawiaj swoje
            Championy samodzielnie i przejmij pełną kontrolę nad aukcją.
          </p>

          <div
            ref={ctaWrapRef}
            className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6"
          >
            <Link
              to="/champions"
              data-magnetic
              className="group flex items-center gap-3 px-8 py-3.5 rounded-full font-bold text-sm bg-transparent border-2 border-[#A68E4E] text-[#A68E4E] hover:bg-[#A68E4E] hover:text-zinc-950 transition-colors duration-300"
            >
              <span>Eksploruj Championy</span>
            </Link>

            <Link
              to="/auctions?create=true"
              data-tutorial="hero-sell-btn"
              data-magnetic
              className="group flex items-center gap-3 px-8 py-3.5 rounded-full font-bold text-sm bg-[#A68E4E] text-zinc-950 hover:brightness-110 transition-[filter] duration-300"
            >
              <span>Zacznij Sprzedawać</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
            </Link>
          </div>

          <a
            ref={scrollIndicatorRef}
            href="#about"
            className="mt-12 flex items-center gap-3 text-zinc-300 hover:text-[#A68E4E] transition-colors cursor-pointer group"
          >
            <span className="text-sm font-medium">Odkryj naszą historię</span>
            <ArrowRight className="w-4 h-4 rotate-90 group-hover:translate-y-1 transition-transform duration-300" />
          </a>
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

const EliteFeatureCard = memo(
  ({
    feature,
    className,
  }: {
    feature: FeatureData;
    index: number;
    className?: string;
  }) => {
    // Spokojna karta: bez przechyłu 3D za kursorem i bez złotych poświat –
    // na hover zmienia się tylko ton tła i kolor tytułu.
    return (
      <div
        className={`h-full flex flex-col p-8 rounded-2xl bg-champion-teal transition-colors duration-300 relative group overflow-hidden hover:bg-[#0f2a33] ${className || ""}`}
        style={{ border: "2px solid rgba(166, 142, 78, 0.55)" }}
      >
        <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 relative z-10 bg-[#A68E4E]">
          <feature.icon className="w-7 h-7 text-black" />
        </div>
        <h3 className="text-2xl font-bold font-display text-white mb-4 relative z-10 group-hover:text-gold transition-colors duration-300">
          {feature.title}
        </h3>
        <p className="text-white/60 text-base leading-relaxed relative z-10 font-medium group-hover:text-white/85 transition-colors duration-300">
          {feature.description}
        </p>
      </div>
    );
  },
);

EliteFeatureCard.displayName = "EliteFeatureCard";

const CTAFeaturesSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const ctaBtnRef = useRef<HTMLAnchorElement>(null);
  const cardsWrapRef = useRef<(HTMLDivElement | null)[]>([]);

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
      title: "Otwarta Platforma",
      description:
        "Pierwsza w Polsce giełda, gdzie możesz samodzielnie wystawiać swoje gołębie i zarządzać aukcjami.",
    },
  ];

  useGSAP(
    () => {
      const cards = cardsWrapRef.current.filter(
        (c): c is HTMLDivElement => c !== null,
      );

      // Ciągłe odsłanianie sprzężone ze scrollem – bez progów i przeskoków
      scrubReveal([badgeRef.current, titleRef.current, descRef.current, ctaBtnRef.current], {
        y: 50,
      });
      scrubReveal(cards, { y: 80, scale: 0.97, end: "top 65%" });
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
            <span className="text-zinc-100">Zostań Właścicielem</span> <br />
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
            ref={ctaBtnRef}
            to="/auctions"
            className="inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-[#A68E4E] text-zinc-900 rounded-full font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-gold/20 mb-20"
          >
            Przejdź do Champions Pigeon Auction
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          style={{ perspective: "1200px" }}
        >
          {features.map((feature, index) => (
            <div
              key={feature.title}
              ref={(el) => {
                cardsWrapRef.current[index] = el;
              }}
              className="h-full will-change-transform"
            >
              <EliteFeatureCard feature={feature} index={index} />
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

  useGSAP(
    () => {
      // Separatory sekcji rozciągają się płynnie razem ze scrollem
      const dividers = gsap.utils.toArray<HTMLElement>(".section-divider");
      dividers.forEach((div) => {
        gsap.fromTo(
          div,
          { scaleX: 0, opacity: 0 },
          {
            scaleX: 1,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: div,
              start: "top bottom",
              end: "top 60%",
              scrub: true,
            },
          },
        );
      });
    },
    { scope: containerRef },
  );

  // Clean up any potential global ScrollTriggers on unmount
  useEffect(() => {
    window.scrollTo(0, 0);
    const refreshId = window.setTimeout(() => {
      ScrollTrigger.refresh();
    }, 350);

    return () => {
      window.clearTimeout(refreshId);
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

        <FooterReveal />
      </main>
    </div>
  );
};

export default HomePagePremium;
