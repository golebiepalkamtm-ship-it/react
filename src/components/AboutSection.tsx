import React, { useRef, useCallback, useLayoutEffect } from "react";
import { Award, Target, Feather, Crown } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { gsap } from "@/lib/gsapConfig";

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
    const translateX = useSpring(useTransform(mouseX, [-0.5, 0.5], [12, -12]), {
      stiffness: 100,
      damping: 9,
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
          className="relative overflow-hidden rounded-2xl border border-gold/40 bg-zinc-950/20 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl backdrop-brightness-125 h-full p-6"
          style={{
            transformStyle: "preserve-3d",
            rotateX,
            y: translateY,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/15 via-transparent to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(66,192,206,0.2),transparent_70%)] pointer-events-none" />

          <div className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center border border-gold/40 bg-gradient-to-br from-gold/20 via-gold/10 to-transparent">
            <feature.icon className="w-5 h-5 text-[#C8AE68] drop-shadow-[0_0_6px_rgba(200,174,104,0.8)]" />
          </div>
          <h3 className="font-display text-base text-[#C8AE68] font-semibold mb-2">
            {feature.title}
          </h3>
          <p className="text-muted-foreground text-xs leading-relaxed">
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

  // Używamy hooka do synchronizacji ScrollTrigger z Lenis - removed
  // const { refresh } = useScrollTriggerSync({
  //   refreshOnMount: true,
  //   refreshDelay: 200
  // });

  useLayoutEffect(() => {
    const ctx = gsap.context((self) => {
      const section = sectionRef.current;
      const title = titleRef.current;

      // Force initial states BEFORE timeline
      gsap.set(badgeRef.current, {
        opacity: 0,
        scale: 0.7,
        y: 40,
        rotateX: -90,
      });
      // Title opacity handled by character-reveal spans
      gsap.set([paragraph1Ref.current, paragraph2Ref.current], {
        opacity: 0,
        y: 50,
      });
      gsap.set(signatureRef.current, { opacity: 0, x: -80 });

      // Main section entrance timeline - removed scrollTrigger
      const tl = gsap.timeline({
        // scrollTrigger: {
        //   trigger: section,
        //   start: "top+=100 bottom",  // Dodano offset +100px - jeszcze wcześniejsze rozpoczęcie animacji
        //   end: "top 70%",           // Zwiększono end point z 60% na 70%
        //   toggleActions: "play none none none",
        //   once: true,               // Animacja wykona się tylko raz
        //   id: "about-main",
        // },
      });

      // 1. Badge reveal with 3D rotation
      tl.fromTo(
        badgeRef.current,
        {
          opacity: 0,
          scale: 0.7,
          y: 40,
          rotateX: -90,
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          rotateX: 0,
          duration: 1.8, // Zwiększono z 0.9 na 1.8 - wolniejsza animacja
          ease: "power2.out", // Zmieniono na power2.out dla płynniejszego ruchu
        },
        0,
      );

      // 2. Title simple reveal (preserving spans/colors)
      if (title) {
        tl.fromTo(
          title,
          {
            opacity: 0,
            y: 30,
            scale: 0.9,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.0,
            ease: "power3.out",
          },
          0.2,
        );
      }

      // 3. Paragraphs with clip-path reveal
      tl.fromTo(
        [paragraph1Ref.current, paragraph2Ref.current],
        {
          opacity: 0,
          y: 50,
          clipPath: "inset(0% 0% 100% 0%)",
        },
        {
          opacity: 1,
          y: 0,
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 2.0, // Zwiększono z 1.2 na 2.0 - wolniejsza animacja
          stagger: 0.4, // Zwiększono z 0.25 na 0.4 - większe opóźnienie między paragrafami
          ease: "power2.out", // Zmieniono na power2.out dla płynniejszego ruchu
        },
        0.6,
      );

      // 4. Signature with slide + scale
      tl.fromTo(
        signatureRef.current,
        {
          opacity: 0,
          x: -80,
          scale: 0.85,
          rotateY: -15,
        },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          rotateY: 0,
          duration: 1.1,
          ease: "expo.out",
        },
        1.0,
      );

      // 5. Cards construction with stagger
      cardsRef.current.forEach((card, i) => {
        if (!card) return;

        const direction = i % 2 === 0 ? -1 : 1;
        const rotateStart = direction * 30;

        // Force initial state for card
        gsap.set(card, {
          opacity: 0,
          y: 100,
          x: direction * 50,
          rotateY: rotateStart,
          rotateX: 20,
          scale: 0.8,
        });

        // Card entrance timeline - removed scrollTrigger
        const cardTl = gsap.timeline({
          // scrollTrigger: {
          //   trigger: card,
          //   start: "top bottom-=100",  // Karty zaczynają animację wcześniej
          //   end: "top 85%",
          //   toggleActions: "play none none none",
          //   once: true,
          // },
        });

        // Card container reveal
        cardTl.fromTo(
          card,
          {
            opacity: 0,
            y: 100,
            x: direction * 50,
            rotateY: rotateStart,
            rotateX: 20,
            scale: 0.8,
          },
          {
            opacity: 1,
            y: 0,
            x: 0,
            rotateY: 0,
            rotateX: 0,
            scale: 1,
            duration: 0.8, // Szybsza animacja
            ease: "power3.out",
          },
          0,
        );

        // Icon animation
        const icon = card.querySelector(".w-12.h-12");
        if (icon) {
          cardTl.fromTo(
            icon,
            {
              scale: 0,
              rotate: -180,
              opacity: 0,
            },
            {
              scale: 1,
              rotate: 0,
              opacity: 1,
              duration: 1,
              ease: "back.out(2.5)",
            },
            0.3,
          );
        }

        // Title reveal
        const cardTitle = card.querySelector("h3");
        if (cardTitle) {
          cardTl.fromTo(
            cardTitle,
            {
              opacity: 0,
              y: 30,
              clipPath: "inset(0% 0% 100% 0%)",
            },
            {
              opacity: 1,
              y: 0,
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 0.8,
              ease: "expo.out",
            },
            0.5,
          );
        }

        // Description reveal
        const cardDesc = card.querySelector("p");
        if (cardDesc) {
          cardTl.fromTo(
            cardDesc,
            {
              opacity: 0,
              y: 20,
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: "power2.out",
            },
            0.7,
          );
        }
      });
      // Force refresh aby ScrollTrigger zaczął monitorować - removed
      // refresh(true);  // Używamy funkcji z hooka dla bezpiecznego odświeżenia
    }, sectionRef);

    return () => ctx.revert();
  }, []); // Usunięto refresh jako zależność

  return (
    <section
      ref={sectionRef}
      id="about"
      className="min-h-screen flex items-center py-20 relative overflow-hidden bg-transparent"
      style={{
        perspective: "2000px",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Żadnego tła, żadnych gradientów */}

      <div className="container mx-auto px-4 relative z-10 -mt-48">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div style={{ transformStyle: "preserve-3d" }}>
            <span
              ref={badgeRef}
              className="inline-block px-6 py-2 rounded-full bg-[#A68E4E] text-zinc-900 text-[10px] font-bold uppercase tracking-[0.2em] mb-6 shadow-lg shadow-gold/20"
              style={{
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
              }}
            >
              O Hodowli
            </span>

            <h2
              ref={titleRef}
              className="font-display text-2xl md:text-3xl lg:text-4xl font-bold leading-tight uppercase tracking-[0.18em] mb-7"
              style={{
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
              }}
            >
              <span className="text-zinc-900">Najwyższa Jakość</span>{" "}
              <span className="text-[#A68E4E]">Hodowli</span>
            </h2>

            <p
              ref={paragraph1Ref}
              className="text-white mb-8 max-w-xl leading-relaxed text-lg md:text-xl font-light"
              style={{
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
              }}
            >
              Od ponad 50 lat dostarczamy championów hodowcom na całym świecie.
              To pasja przekuta w wyniki, która trwa niezmiennie od pokoleń.
              Nasze ptaki zdobywają czołowe miejsca w prestiżowych zawodach
              krajowych i międzynarodowych.
            </p>

            <p
              ref={paragraph2Ref}
              className="text-white mb-8 leading-relaxed text-lg md:text-xl font-light"
              style={{
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
              }}
            >
              Nasza hodowla opiera się na starannie wyselekcjonowanych liniach
              krwi od najlepszych hodowców europejskich. Każdy gołąb w naszym
              gołębniku to efekt wieloletniego doświadczenia, pasji i
              nieustannego dążenia do doskonałości.
            </p>

            <div
              ref={signatureRef}
              className="flex items-center gap-4 pt-6 border-t border-white/10"
              style={{
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
              }}
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
                <p className="text-white/50 text-sm">Trzy pokolenia hodowców</p>
              </div>
            </div>
          </div>

          <div
            className="grid sm:grid-cols-2 gap-4"
            style={{
              perspective: "1500px",
              transformStyle: "preserve-3d",
            }}
          >
            {features.map((feature, index) => (
              <div
                key={feature.title}
                ref={(el) => {
                  cardsRef.current[index] = el;
                }}
                className="will-change-transform"
                style={{
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden",
                }}
              >
                <div className="feature-icon">
                  <FeatureCard feature={feature} index={index} />
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

export default React.memo(AboutSection);
