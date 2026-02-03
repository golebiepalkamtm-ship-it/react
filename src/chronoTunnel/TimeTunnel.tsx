import React, { useEffect, useLayoutEffect, useRef, useMemo, useCallback } from "react";
import { useMotionValue } from "framer-motion";
import { gsap, ScrollTrigger } from "@/lib/gsapConfig";
import TimelineCard from "./TimelineCard";
import CosmicPortal from "./CosmicPortal";
import StatsHeader from "./StatsHeader";
import CosmicEnergyHeadline from "@/components/CosmicEnergyHeadline";
import { initHeroTextSplit } from "@/lib/gsapAnimations";
import { achievementsHistory } from "@/data/achievements-history";

// Convert achievements from new format to TimelineCard format
const timelineEvents = achievementsHistory.map(season => {
  const achievements = season.achievements.map(ach => {
    const parts: string[] = [];
    if (ach.region) parts.push(ach.region);
    if (ach.category) parts.push(`Kat ${ach.category}`);
    if (ach.position) parts.push(ach.position);
    
    const details: string[] = [];
    if (ach.points && ach.points !== "-") details.push(`${ach.points} coeff`);
    if (ach.count && ach.count !== "-") details.push(`${ach.count} con`);
    
    let result = parts.join(" – ");
    if (details.length > 0) {
      result += ` (${details.join(", ")})`;
    }
    
    return result;
  });

  const year = parseInt(season.year);
  return {
    year,
    title: `Sezon ${season.year}`,
    achievements,
    highlight: `${achievements.length} osiągnię${achievements.length === 1 ? 'cie' : 'ć'}`
  };
}).reverse(); // Reverse to show oldest first

// --- CONFIG (ostateczna wersja) ---
const STAGGER = 2.2;          // Optymalny odstęp między kartami
const DURATION = 5;           // Krótsza animacja karty
const PIXELS_PER_SECOND = 200; // Dobry współczynnik dla płynności

// Obliczenie całkowitego czasu timeline
const lastCardStart = (timelineEvents.length - 1) * STAGGER;
const lastCardEnd = lastCardStart + DURATION;
const endScreenStart = lastCardStart + 2;  // Krócej czekamy
const endScreenEnd = endScreenStart + 2;   // Krócej trwa
const totalAnimationTime = Math.max(lastCardEnd, endScreenEnd);

// Długość scrola
const totalDistance = totalAnimationTime * PIXELS_PER_SECOND;
const extraBuffer = 500; // Minimalny buffer

export default function TimeTunnel() {
  const visibleEvents = useMemo(() => timelineEvents.filter((e) => e.year <= 2024), []);
  const containerRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const statsRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);
  const scrollProgress = useMotionValue(0);
  
  const stats = useMemo(() => {
    let mistrz = 0;
    let wicemistrz = 0;
    let przodownik = 0;

    visibleEvents.forEach(event => {
      event.achievements.forEach(ach => {
        const lower = ach.toLowerCase();
        if (lower.includes("wicemistrz") || lower.includes("v-ce mistrz") || lower.includes("v-ce  mistrz")) {
          wicemistrz++;
        } else if (lower.includes("mistrz")) {
          mistrz++;
        } else if (lower.includes("przodownik")) {
          przodownik++;
        }
      });
    });

    return { mistrz, wicemistrz, przodownik };
  }, [visibleEvents]);

  // --- ROBUST TIMELINE ANIMATION ---
  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {

        // Init state - everything starts deep in Z except Stats and Title (briefly)
        if (titleRef.current) gsap.set(titleRef.current, { z: 0, autoAlpha: 1 });
        if (endRef.current) gsap.set(endRef.current, { z: -3000, autoAlpha: 0 });
        if (statsRef.current) gsap.set(statsRef.current, { autoAlpha: 1, z: 100 });
        
        // Hide cards initially (mniej głęboko, żeby były widoczne)
        cardsRef.current.forEach(card => {
             if(card) gsap.set(card, { z: -2000, autoAlpha: 0, scale: 0.5 });
        });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: `+=${totalDistance + extraBuffer}`,
            scrub: 1,
            pin: true,
            onUpdate: (self) => {
              scrollProgress.set(self.progress);
            },
            invalidateOnRefresh: true
          },
        });

        // 1. Title Exit
        if (titleRef.current) {
            tl.to(titleRef.current, { z: 1000, autoAlpha: 0, duration: 1 }, 0);
        }

        // 2. Card Tunnel Sequence
        cardsRef.current.forEach((card, index) => {
            if (!card) return;
            const startTime = index * STAGGER;

            // Phase A: Appear from fog
            tl.to(card, {
                z: -200,
                autoAlpha: 1,
                scale: 0.95,
                duration: DURATION * 0.3, // 1.8s
                ease: "power1.out"
            }, startTime);

            // Phase B: Fly to reading position (0)
            tl.to(card, {
                z: 0,
                scale: 1,
                duration: DURATION * 0.4, // 2.4s
                ease: "power1.inOut"
            }, startTime + (DURATION * 0.3));

            // Phase C: Fly past camera and disappear
            tl.to(card, {
                z: 600,
                autoAlpha: 0,
                scale: 1.3,
                duration: DURATION * 0.3, // 1.8s
                ease: "power1.in",
                onComplete: () => {
                    // Całkowicie ukryj kartę po zakończeniu
                    gsap.set(card, { visibility: 'hidden', opacity: 0, pointerEvents: 'none' });
                }
            }, startTime + (DURATION * 0.7));

            // Dodatkowo ukryj kartę przed następną (żeby się nie nakładały)
            if (index < visibleEvents.length - 1) {
                const nextCardStart = (index + 1) * STAGGER;
                tl.set(card, { visibility: 'hidden', opacity: 0, pointerEvents: 'none' }, nextCardStart);
            }

            // Rotation effect
            const rotX = index % 2 === 0 ? 3 : -3;
            const rotY = index % 3 === 0 ? 3 : -3;
            gsap.set(card, { rotationX: rotX, rotationY: rotY });
            tl.to(card, {
                 rotationX: 0,
                 rotationY: 0,
                 duration: DURATION * 0.6,
                 ease: "power1.out"
            }, startTime);
        });

        // 3. End Screen
        if (endRef.current) {
            const lastCardStart = (visibleEvents.length - 1) * STAGGER;
            const endStart = lastCardStart + 3; // Krócej czekamy na end screen

            // Ukryj wszystkie karty przed end screen
            tl.set(cardsRef.current, { visibility: 'hidden', opacity: 0, pointerEvents: 'none' }, endStart - 0.1);

            tl.to(endRef.current, {
                z: 0,
                autoAlpha: 1,
                duration: 3, // Krócej
                ease: "power2.out",
                onStart: () => {
                     if (endRef.current && !endRef.current.classList.contains('animated')) {
                         endRef.current.classList.add('animated');
                         try {
                           initHeroTextSplit();
                         } catch (error) {
                           console.warn('[TimeTunnel] initHeroTextSplit failed', error);
                         }
                     }
                }
            }, endStart);
        }

    }, containerRef);
    
    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [scrollProgress, visibleEvents]);

  return (
    <div
      ref={containerRef}
      className="relative bg-black z-[50]"
      style={{ height: `${totalDistance + extraBuffer}px` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden perspective-1000 z-[100]">
        
        <CosmicPortal scrollProgress={scrollProgress} />
        
        {/* 3D Content Container */}
        <div className="absolute inset-0 w-full h-full transform-style-3d pointer-events-none flex items-center justify-center">
          
          {/* Page title - leci przez tunel razem z resztą */}
          <div
            ref={titleRef}
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            style={{ transformStyle: "preserve-3d", opacity: 1 }}
          >
            <div className="-translate-y-32 md:-translate-y-40">
              <CosmicEnergyHeadline text="Historia osiągnięć" className="px-4" />
            </div>
          </div>

          {/* Stats Header - widoczne od razu, ale też "lecą" z tunelu */}
          <div
            ref={statsRef}
            className="pointer-events-auto"
            style={{ transformStyle: "preserve-3d", opacity: 1 }}
          >
            <StatsHeader {...stats} />
          </div>

          {/* Timeline Cards */}
          {visibleEvents.map((event, index) => (
            <div
              key={event.year}
              ref={(el) => {
                cardsRef.current[index] = el;
              }}
              className="pointer-events-auto translate-y-24 md:translate-y-32 lg:translate-y-40"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transformStyle: "preserve-3d",
                opacity: 0,
              }}
            >
              <TimelineCard event={event} index={index} isActive />
            </div>
          ))}

          {/* End Text - At the very end (ukryte na load) */}
          <div
            ref={endRef}
            className="pointer-events-auto end-screen-container"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transformStyle: "preserve-3d",
              opacity: 0,
              visibility: "hidden",
              zIndex: 100,
            }}
          >
            <div className="text-center px-4">
              <h1 
                data-split-text
                className="end-title text-5xl sm:text-6xl md:text-8xl lg:text-9xl text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 font-bold font-display tracking-widest drop-shadow-[0_0_40px_rgba(251,191,36,0.6)]"
                style={{ 
                  textShadow: '0 0 60px rgba(251,191,36,0.4), 0 0 120px rgba(251,191,36,0.2)',
                  filter: 'drop-shadow(0 0 30px rgba(251,191,36,0.5))'
                }}
              >
                Historia Trwa...
              </h1>
              <p 
                className="end-subtitle text-white/70 mt-8 text-xl md:text-2xl font-light tracking-wide"
                style={{ opacity: 0 }}
              >
                I wciąż piszemy nowe rozdziały
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
