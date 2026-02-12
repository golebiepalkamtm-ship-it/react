import React, { useRef, useState, useCallback, useLayoutEffect } from 'react';
import { Award, Target, Feather, Crown } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { gsap, ScrollTrigger } from '@/lib/gsapConfig';
import { useScrollTriggerSync } from "@/hooks/useScrollTriggerSync";

const FeatureCard = React.memo(({ feature, index }: { feature: { icon: any; title: string; description: string }; index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
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

  const lightX = useTransform(mouseX, [-0.5, 0.5], [0, 100]);
  const lightY = useTransform(mouseY, [-0.5, 0.5], [0, 100]);

  const lightBackground = useTransform(
    [lightX, lightY],
    ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.15) 0%, transparent 50%)`
  );

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  }, [mouseX, mouseY]);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      ref={cardRef}
      className="relative group"
      style={{ perspective: '1000px' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative p-6 rounded-2xl border border-gold/30 bg-gradient-to-br from-zinc-800/80 via-zinc-900/80 to-zinc-800/80 backdrop-blur-lg shadow-[0_0_30px_rgba(212,175,55,0.1),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ scale: { duration: 0.2 } }}
      >
        <motion.div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: lightBackground,
            opacity: isHovered ? 1 : 0,
            willChange: 'opacity',
          }}
        />

        <motion.div
          className="absolute inset-0 pointer-events-none z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 0.6 : 0.2 }}
          style={{
            background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.18) 0%, transparent 60%)',
          }}
        />

        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none z-20"
          initial={{ opacity: 0 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            boxShadow: isHovered
              ? '0 0 30px rgba(150, 150, 200, 0.3), inset 0 0 20px rgba(150, 150, 200, 0.1)'
              : 'none',
          }}
          transition={{ duration: 0.3 }}
          style={{ willChange: 'opacity, box-shadow' }}
        />

        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 0.15 : 0 }}
          style={{ willChange: 'opacity' }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(255, 255, 255, 0.03) 2px,
                rgba(255, 255, 255, 0.03) 4px
              )`
            }}
          />
        </motion.div>

        <motion.div
          className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold/20 to-gold/10 flex items-center justify-center mb-4 group-hover:from-gold/40 group-hover:to-gold/20 transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.2)]"
          whileHover={{
            scale: 1.2,
            rotate: [0, -15, 15, -15, 0],
            boxShadow: "0 0 40px rgba(212,175,55,0.6)",
            transition: { duration: 0.6 }
          }}
        >
          <feature.icon className="w-6 h-6 text-gold drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
        </motion.div>
        <h3 className="font-display text-lg text-foreground font-semibold mb-2">
          {feature.title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {feature.description}
        </p>
      </motion.div>
    </motion.div>
  );
});

FeatureCard.displayName = 'FeatureCard';

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

  // Używamy hooka do synchronizacji ScrollTrigger z Lenis
  const { refresh } = useScrollTriggerSync({
    refreshOnMount: true,
    refreshDelay: 200
  });

  useLayoutEffect(() => {
    const ctx = gsap.context((self) => {
      const section = sectionRef.current;
      const title = titleRef.current;
      
      // Force initial states BEFORE timeline
      gsap.set(badgeRef.current, { opacity: 0, scale: 0.7, y: 40, rotateX: -90 });
      // Title opacity handled by character-reveal spans
      gsap.set([paragraph1Ref.current, paragraph2Ref.current], { opacity: 0, y: 50 });
      gsap.set(signatureRef.current, { opacity: 0, x: -80 });
      
      // Main section entrance timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top+=100 bottom",  // Dodano offset +100px - jeszcze wcześniejsze rozpoczęcie animacji
          end: "top 70%",           // Zwiększono end point z 60% na 70%
          toggleActions: "play none none none",
          once: true,               // Animacja wykona się tylko raz
          id: "about-main",
        },
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
          duration: 1.8,         // Zwiększono z 0.9 na 1.8 - wolniejsza animacja
          ease: "power2.out",    // Zmieniono na power2.out dla płynniejszego ruchu
        },
        0
      );

      // 2. Title character-by-character reveal
      if (title) {
        const text = title.textContent || '';
        const words = text.split(' ');
        
        title.innerHTML = words
          .map(word => {
            const chars = word.split('');
            return chars
              .map(char => `<span class="char-reveal" style="display: inline-block;">${char}</span>`)
              .join('') + '<span class="char-reveal" style="display: inline-block;">&nbsp;</span>';
          })
          .join('');

        const charElements = title.querySelectorAll('.char-reveal');
        
        tl.fromTo(charElements,
          { 
            opacity: 0, 
            y: 50, 
            rotateX: -90,
            scale: 0.8,
          },
          { 
            opacity: 1, 
            y: 0, 
            rotateX: 0,
            scale: 1,
            stagger: 0.04,       // Zwiększono z 0.02 na 0.04 - wolniejsze pojawianie się znaków
            duration: 1.0,       // Zwiększono z 0.5 na 1.0 - wolniejsza animacja
            ease: "power3.out",  // Zmieniono na power3.out dla płynniejszego ruchu
          },
          0.2
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
          duration: 2.0,        // Zwiększono z 1.2 na 2.0 - wolniejsza animacja
          stagger: 0.4,         // Zwiększono z 0.25 na 0.4 - większe opóźnienie między paragrafami
          ease: "power2.out",   // Zmieniono na power2.out dla płynniejszego ruchu
        },
        0.6
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
        1.0
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

        // Card entrance timeline
        const cardTl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: "top bottom-=100",  // Karty zaczynają animację wcześniej
            end: "top 85%",
            toggleActions: "play none none none",
            once: true,
          },
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
            duration: 0.8,        // Szybsza animacja
            ease: "power3.out",
          },
          0
        );
        
        // Icon animation
        const icon = card.querySelector('.w-12.h-12');
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
            0.3
          );
        }

        // Title reveal
        const cardTitle = card.querySelector('h3');
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
            0.5
          );
        }

        // Description reveal
        const cardDesc = card.querySelector('p');
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
            0.7
          );
        }
      });
      // Force refresh aby ScrollTrigger zaczął monitorować
      refresh(true);  // Używamy funkcji z hooka dla bezpiecznego odświeżenia
    }, sectionRef);
    
    return () => ctx.revert();
  }, [refresh]);  // Dodajemy refresh jako zależność

  return (
    <section
      ref={sectionRef}
      id="about"
      className="pt-24 pb-0 relative overflow-hidden min-h-screen"
      style={{
        perspective: '2000px',
        transformStyle: 'preserve-3d',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.02] to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div style={{ transformStyle: 'preserve-3d' }}>
            <span
              ref={badgeRef}
              className="inline-block px-4 py-1.5 rounded-full bg-gold/10 text-gold text-sm font-medium tracking-wide mb-6"
              style={{
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
              }}
            >
              O naszej hodowli
            </span>
            
            <h2
              ref={titleRef}
              className="font-display text-4xl md:text-5xl text-foreground font-bold leading-tight mb-6"
              style={{
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
              }}
            >
              MTM Pałka – <span className="text-gold">Zwycięstwo</span> mamy w genach.
            </h2>
            
            <p
              ref={paragraph1Ref}
              className="text-muted-foreground text-lg leading-relaxed mb-6"
              style={{
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
              }}
            >
              Od ponad 45 lat poświęcamy się hodowli najlepszych gołębi pocztowych w Polsce.
              Nasze ptaki konsekwentnie sprawdzają się na najbardziej wymagających trasach,
              zdobywając czołowe miejsca w prestiżowych zawodach krajowych i międzynarodowych.
            </p>
            
            <p
              ref={paragraph2Ref}
              className="text-muted-foreground text-lg leading-relaxed mb-8"
              style={{
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
              }}
            >
              Nasza hodowla opiera się na starannie wyselekcjonowanych liniach krwi od najlepszych
              hodowców europejskich. Każdy gołąb w naszym gołębniku to efekt wieloletniego doświadczenia,
              pasji i nieustannego dążenia do doskonałości.
            </p>
            
            <div
              ref={signatureRef}
              className="flex items-center gap-4 pt-6 border-t border-white/10"
              style={{
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
              }}
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.4)]">
                <span className="font-display text-navy font-bold text-lg">MTM</span>
              </div>
              <div>
                <p className="font-display text-foreground font-semibold">Mariusz, Tadeusz i Marcin Pałka</p>
                <p className="text-muted-foreground text-sm">Trzy pokolenia hodowców</p>
              </div>
            </div>
          </div>

          <div
            className="grid sm:grid-cols-2 gap-5"
            style={{
              perspective: '1500px',
              transformStyle: 'preserve-3d',
            }}
          >
            {features.map((feature, index) => (
              <div
                key={feature.title}
                ref={(el) => { cardsRef.current[index] = el; }}
                className="feature-card"
                style={{
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
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
    </section>
  );
};

export default React.memo(AboutSection);
