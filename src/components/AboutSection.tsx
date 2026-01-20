import React, { useRef, useState, useCallback, useLayoutEffect } from 'react';
import { Award, Target, Feather, Crown } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { gsap, ScrollTrigger } from '@/lib/gsapConfig';

// Feature Card Component z efektami ChampionCard - ZOPTYMALIZOWANY
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
  
  // Użyj useTransform zamiast .get() dla lepszej wydajności
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
        className="relative p-6 rounded-2xl bg-black/90 border border-white/25 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] overflow-hidden"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ scale: { duration: 0.2 } }}
      >
        {/* Dynamic light reflection - WZMOCNIONE */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: lightBackground,
            opacity: isHovered ? 1 : 0,
            willChange: 'opacity',
          }}
        />
        
        {/* Dodatkowa złota poświata */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 0.6 : 0 }}
          style={{
            background: 'radial-gradient(circle at 50% 0%, rgba(212,175,55,0.4) 0%, transparent 50%)',
          }}
        />
        
        {/* Glow border on hover - JASNY jak w ChampionCard */}
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
        
        {/* Scanline effect */}
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
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const leftContentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!sectionRef.current || !cardsContainerRef.current || !leftContentRef.current) return;

    const cards = cardsContainerRef.current.querySelectorAll('.feature-card');
    const section = sectionRef.current;
    const leftContent = leftContentRef.current;
    
    console.log('📌 AboutSection: Pinning section, cards:', cards.length);

    // Daj chwilę na renderowanie
    const ctx = gsap.context(() => {
      // Ustaw karty jako niewidoczne na start
      gsap.set(cards, {
        y: 150,
        rotateX: 60,
        opacity: 0,
        transformOrigin: 'bottom center',
      });

      // Ustaw tekst po lewej jako niewidoczny
      gsap.set(leftContent, {
        x: -100,
        opacity: 0,
      });

      // Stwórz timeline dla animacji
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=250%',
          pin: true,
          scrub: 0.5,
          id: 'about-section-pin',
          anticipatePin: 1,
        }
      });

      // Faza 1: Tekst po lewej wjeżdża na początku
      tl.to(leftContent, {
        x: 0,
        opacity: 1,
        duration: 1.5,
        ease: 'power2.out',
      }, 0);

      // Faza 2-5: Karty pojawiają się jedna po drugiej
      cards.forEach((card, i) => {
        tl.to(card, {
          y: 0,
          rotateX: 0,
          opacity: 1,
          duration: 1,
          ease: 'power2.out',
        }, 1.5 + (i * 0.8)); // Karty zaczynają po tekście
      });

    }, section);

    // Odśwież ScrollTrigger po utworzeniu
    setTimeout(() => {
      ScrollTrigger.refresh();
      console.log('✅ AboutSection: ScrollTrigger refreshed');
    }, 100);

    // Cleanup
    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="pt-24 pb-0 relative overflow-hidden scroll-mt-[100px] min-h-screen"
    >
      <motion.div 
        className="absolute top-20 left-10 w-96 h-96 bg-gold/5 rounded-full blur-3xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content - animowany przez GSAP */}
          <div ref={leftContentRef}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-gold/10 text-gold text-sm font-medium tracking-wide mb-6">
              O naszej hodowli
            </span>
            <h2 className="font-display text-4xl md:text-5xl text-foreground font-bold leading-tight mb-6">
              MTM Pałka – <span className="text-gold">Zwycięstwo</span> mamy w genach.
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Od ponad 45 lat poświęcamy się hodowli najlepszych gołębi pocztowych w Polsce. 
              Nasze ptaki konsekwentnie sprawdzają się na najbardziej wymagających trasach, 
              zdobywając czołowe miejsca w prestiżowych zawodach krajowych i międzynarodowych.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Nasza hodowla opiera się na starannie wyselekcjonowanych liniach krwi od najlepszych 
              hodowców europejskich. Każdy gołąb w naszym gołębniku to efekt wieloletniego doświadczenia, 
              pasji i nieustannego dążenia do doskonałości.
            </p>
            <div className="flex items-center gap-4 pt-6 border-t border-white/10">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
                <span className="font-display text-navy font-bold text-lg">MTM</span>
              </div>
              <div>
                <p className="font-display text-foreground font-semibold">Mariusz, Tadeusz i Marcin Pałka</p>
                <p className="text-muted-foreground text-sm">Trzy pokolenia hodowców</p>
              </div>
            </div>
          </div>

          {/* Right Content - Feature Grid */}
          <div 
            ref={cardsContainerRef}
            className="grid sm:grid-cols-2 gap-5"
            style={{ perspective: '1000px' }}
          >
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="feature-card"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <FeatureCard feature={feature} index={index} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(AboutSection);
