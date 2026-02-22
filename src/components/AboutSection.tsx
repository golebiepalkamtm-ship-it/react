import React, { useRef, useCallback, useState } from "react";
import { Award, Target, Feather, Crown } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { gsap, ScrollTrigger } from "@/lib/gsapConfig";
import { useGSAP } from "@gsap/react";

const FeatureCard = React.memo(
  ({
    feature,
    index,
  }: {
    feature: { icon: any; title: string; description: string };
    index: number;
  }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [16, -16]), {
      stiffness: 120,
      damping: 12,
    });
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-16, 16]), {
      stiffness: 120,
      damping: 12,
    });
    const translateY = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), {
      stiffness: 100,
      damping: 9,
    });

    const handleMouseMove = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        mouseX.set(x);
        mouseY.set(y);
      },
      [mouseX, mouseY],
    );

    const handleMouseLeave = useCallback(() => {
      mouseX.set(0);
      mouseY.set(0);
    }, [mouseX, mouseY]);

    return (
      <motion.div
        ref={cardRef}
        className="relative group"
        style={{ perspective: "1600px", transformStyle: "preserve-3d" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-champion-teal shadow-[0_24px_60px_rgba(0,0,0,0.6)] h-full p-6"
          style={{
            transformStyle: "preserve-3d",
            rotateX,
            y: translateY,
          }}
        >
          <motion.div
            className="absolute -top-10 left-1/2 -translate-x-1/2 w-[120%] h-24 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(212,175,55,0.2) 0%, transparent 60%)",
            }}
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center border border-gold/40 bg-gradient-to-br from-gold/20 via-gold/10 to-transparent">
            <feature.icon className="w-5 h-5 text-[#C8AE68] drop-shadow-[0_0_6px_rgba(200,174,104,0.8)]" />
          </div>
          <h3 className="font-display text-base text-[#C8AE68] font-semibold mb-2">
            {feature.title}
          </h3>
          <p className="text-zinc-300 text-xs leading-relaxed">
            {feature.description}
          </p>
        </motion.div>
      </motion.div>
    );
  },
);

FeatureCard.displayName = "FeatureCard";

const AboutSection = () => {
  const features = [
    {
      icon: Crown,
      title: "Linie mistrzowskie",
      description:
        "Nasze gołębie pochodzą z pokoleń sprawdzonych mistrzów, starannie selekcjonowanych pod kątem prędkości, wytrzymałości i instynktu nawigacyjnego.",
    },
    {
      icon: Target,
      title: "Specjaliści od sprintów",
      description:
        "Dominujemy w kategorii sprinterskiej z ptakami wyhodowanymi specjalnie do eksplozywnej prędkości na krótkich dystansach.",
    },
    {
      icon: Feather,
      title: "Elitarna genetyka",
      description:
        "Każdy ptak nosi w sobie genetykę udoskonalaną przez dziesięciolecia strategicznej hodowli i skrupulatnej selekcji.",
    },
    {
      icon: Award,
      title: "Udowodnione wyniki",
      description:
        "Konsekwentnie zajmujemy czołowe miejsca w krajowych i międzynarodowych zawodach, rok po roku.",
    },
  ];

  const sectionRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const paragraph1Ref = useRef<HTMLParagraphElement>(null);
  const paragraph2Ref = useRef<HTMLParagraphElement>(null);
  const signatureRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      // Setup Text Reveal - Dostojny Wjazd
      const textElements = [
        badgeRef.current,
        titleRef.current,
        paragraph1Ref.current,
        paragraph2Ref.current,
        signatureRef.current,
      ];

      // Zaczynamy DUŻO niżej (y: 200) dla długiego, powolnego lotu
      gsap.set(textElements, { autoAlpha: 0, y: 200 }); 

      ScrollTrigger.batch(textElements, {
        start: "top 95%", // Wcześniejszy trigger
        end: "bottom 80%",
        onEnter: (batch) => {
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            duration: 2.2, // Bardzo długi czas trwania = majestatyczny ruch
            stagger: 0.3, // Wyraźne odstępy między elementami
            ease: "power2.out", // Klasyczny, elegancki ease
            overwrite: true,
          });
        },
        once: true,
      });

      // Setup Cards Animation - Kinowy Parallax
      cardsRef.current.forEach((card, i) => {
        if (!card) return;

        // Karty startują z różnych wysokości (staggered start position)
        const startY = 250 + (i * 50); 
        gsap.set(card, { autoAlpha: 0, y: startY });
        
        ScrollTrigger.create({
          trigger: card,
          start: "top 120%", // Triggerujemy zanim w ogóle wejdą w ekran
          onEnter: () => {
            gsap.to(card, {
              autoAlpha: 1,
              y: 0,
              duration: 2.5, // Ekstremalnie wolny wjazd (slow motion)
              ease: "expo.out", // Bardzo miękkie lądowanie na końcu
              overwrite: "auto",
            });
          },
          once: true,
        });

        // 2. Parallax Effect (Lenis Style)
        // Right column (odd index) moves slightly faster/slower than left
        // creating a depth effect during scroll
        const speed = i % 2 === 0 ? 0 : 50;

        if (speed > 0) {
          gsap.to(card, {
            y: -speed,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });
        }
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="about"
      className="min-h-screen flex items-center py-20 relative z-30 bg-transparent"
    >
      <div className="container mx-auto px-4 relative z-10 -mt-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span
              ref={badgeRef}
              className="inline-block px-6 py-2 rounded-full bg-[#A68E4E] text-zinc-900 text-[10px] font-bold uppercase tracking-[0.2em] mb-6 shadow-lg shadow-gold/20"
            >
              O Hodowli
            </span>

            <h2
              ref={titleRef}
              className="font-display text-2xl md:text-3xl lg:text-4xl font-bold leading-tight uppercase tracking-[0.18em] mb-7"
            >
              <span className="text-zinc-900">Najwyższa Jakość</span>{" "}
              <span className="text-[#A68E4E]">Hodowli</span>
            </h2>

            <p
              ref={paragraph1Ref}
              className="text-white mb-8 max-w-xl leading-relaxed text-lg md:text-xl font-light"
            >
              Od ponad 50 lat dostarczamy championów hodowcom na całym świecie.
              Nasze ptaki zdobywają czołowe miejsca w prestiżowych zawodach
              krajowych i międzynarodowych.
            </p>

            <p
              ref={paragraph2Ref}
              className="text-white mb-8 leading-relaxed text-lg md:text-xl font-light"
            >
              Nasza hodowla opiera się na starannie wyselekcjonowanych liniach
              krwi od najlepszych hodowców europejskich. Każdy gołąb w naszym
              gołębniku to efekt wieloletniego doświadczenia i pasji.
            </p>

            <div
              ref={signatureRef}
              className="flex items-center gap-4 pt-6 border-t border-zinc-900/10"
            >
              <div className="w-14 h-14 rounded-full bg-[#A68E4E] flex items-center justify-center shadow-[0_0_30px_rgba(166,142,78,0.4)]">
                <span className="font-display text-zinc-900 font-bold text-lg tracking-tighter">
                  MTM
                </span>
              </div>
              <div>
                <p className="font-display text-white font-semibold">
                  Mariusz, Tadeusz i Marcin Pałka
                </p>
                <p className="text-zinc-400 text-sm">Trzy pokolenia hodowców</p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                ref={(el) => {
                  cardsRef.current[index] = el;
                }}
                className="will-change-transform"
              >
                <FeatureCard feature={feature} index={index} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-900/20 to-transparent z-20" />
    </section>
  );
};

export default React.memo(AboutSection);
