import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { Trophy, Award, Feather, Sparkles } from 'lucide-react';
import { scrollDebugEnabled } from '@/lib/scrollDebug';

gsap.registerPlugin(ScrollTrigger);

const timelineItems = [
  {
    icon: Trophy,
    title: 'Rodowód mistrzów',
    text: 'Linie olimpijskie i narodowe — każda para dobrana pod kątem dynamiki i wytrzymałości.',
  },
  {
    icon: Feather,
    title: 'Perfekcyjna kondycja',
    text: 'Reżim treningowy z długimi przelotami i lotami nocnymi dla naturalnej orientacji.',
  },
  {
    icon: Award,
    title: 'Certyfikacja i DNA',
    text: 'Pełna dokumentacja zdrowotna, badania DNA i historia lotów dla pełnej transparentności.',
  },
  {
    icon: Sparkles,
    title: 'Nowoczesna stajnia',
    text: 'Systemy UV, kontrola mikroklimatu i dieta mikroelementów — środowisko premium.',
  },
];

export const ScrollNarrativeSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!sectionRef.current) return;

      // Flight path draw
      if (pathRef.current) {
        const length = pathRef.current.getTotalLength();
        gsap.set(pathRef.current, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });

        gsap.to(pathRef.current, {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top center',
            end: 'bottom center',
            scrub: true,
            markers: scrollDebugEnabled,
          },
        });
      }

      // Cards pinned narrative
      const cards = cardsRef.current.filter(Boolean);
      if (cards.length) {
        gsap.set(cards, { opacity: 0, y: 60 });
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=250%',
          pin: true,
          scrub: true,
          markers: scrollDebugEnabled,
          onUpdate: (self) => {
            const progress = self.progress * (cards.length - 1);
            const current = Math.floor(progress);
            const localProgress = progress - current;

            cards.forEach((card, idx) => {
              const isActive = idx === current;
              const isNext = idx === current + 1;
              gsap.to(card, {
                opacity: isActive ? 1 - localProgress * 0.6 : isNext ? localProgress : 0,
                y: isActive ? -localProgress * 40 : isNext ? (1 - localProgress) * 20 : 60,
                scale: isActive ? 1 : isNext ? 0.98 : 0.96,
                duration: 0.2,
                ease: 'linear',
              });
            });
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[120vh] overflow-hidden bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.04),transparent_38%),radial-gradient(circle_at_85%_15%,rgba(212,175,55,0.12),transparent_32%),linear-gradient(180deg,#050810_0%,#0a1220_45%,#050810_100%)]"
    >
      {/* atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-10 top-20 w-64 h-64 rounded-full blur-[120px] bg-[oklch(70%_0.1_200)] opacity-35" />
        <div className="absolute right-[-4rem] bottom-10 w-96 h-96 rounded-full blur-[140px] bg-[oklch(75%_0.12_40)] opacity-25" />
        <div
          className="absolute inset-0 mix-blend-soft-light opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(120deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_35%,rgba(0,0,0,0)_70%),url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2740%27 height=%2740%27 viewBox=%270 0 40 40%27%3E%3Ccircle cx=%275%27 cy=%275%27 r=%270.7%27 fill=%27%23ffffff%27 opacity=%270.05%27/%3E%3C/svg%3E')",
          }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-xs tracking-[0.25em] uppercase text-white/70">
            Żyjąca narracja
          </p>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mt-4 mb-4">
            Lot mistrza na osi scrollu
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Scroll = kontrola kamery. Zatrzymujemy Cię w osi czasu hodowli — każdy krok odsłania kolejny etap przygotowania championów.
          </p>
        </div>

        <div className="relative grid md:grid-cols-[1fr,420px] gap-12 items-center">
          {/* SVG flight path */}
          <div className="relative h-[520px]">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 520" fill="none">
              <path
                ref={pathRef}
                d="M30 480 C180 420 160 260 300 240 C450 220 430 120 580 60"
                stroke="url(#flightGradient)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="flightGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="oklch(80% 0.12 80)" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="oklch(90% 0.15 40)" stopOpacity="1" />
                </linearGradient>
              </defs>
            </svg>
            <motion.div
              className="absolute left-1/2 top-1/3 w-32 h-32 rounded-full border border-white/10 bg-white/5 backdrop-blur-md"
              animate={{ scale: [1, 1.05, 1], rotate: [-2, 2, -2] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          {/* Cards timeline */}
          <div className="relative space-y-6">
            {timelineItems.map((item, idx) => (
              <div
                key={item.title}
                ref={(el) => {
                  if (el) cardsRef.current[idx] = el;
                }}
                className="relative p-6 rounded-2xl border border-white/10 bg-white/6 backdrop-blur-xl overflow-hidden shadow-[0_18px_45px_rgba(0,0,0,0.32)]"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.1),transparent_42%),radial-gradient(circle_at_85%_10%,rgba(212,175,55,0.14),transparent_36%)] opacity-80" />
                <div className="absolute inset-[1px] rounded-[18px] ring-1 ring-white/10 shadow-inner shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]" />
                <div className="flex items-center gap-3 mb-3">
                  <item.icon className="w-5 h-5 text-gold" />
                  <p className="text-sm uppercase tracking-[0.2em] text-white/60">Krok {idx + 1}</p>
                </div>
                <h3 className="text-2xl font-display text-white mb-2">{item.title}</h3>
                <p className="text-white/65">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScrollNarrativeSection;
