import React, { useRef, useState, useLayoutEffect } from 'react';
import { Award, Target, Feather, Crown } from "lucide-react";
import { gsap, ScrollTrigger } from '@/lib/gsapConfig';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

// Feature Card Component with 3D hover effects like PressCard
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
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };
  
  const handleMouseEnter = () => setIsHovered(true);
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };
  
  const Icon = feature.icon;
  
  return (
    <motion.div
      ref={cardRef}
      className="group h-full"
      style={{ 
        perspective: 1000,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className={`h-full p-6 overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-b from-black/70 via-slate-900/60 to-black/60 shadow-[0_25px_80px_rgba(212,175,55,0.15)] backdrop-blur-xl relative flex flex-col justify-start ${index === 1 || index === 3 ? 'pt-4' : ''}`}
        style={{
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ translateY: -8, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        {/* Dynamic light reflection */}
        <motion.div 
          className="absolute inset-0 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: useTransform(
              [lightX, lightY],
              ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, rgba(212,175,55,0.5) 0%, rgba(255,255,255,0.2) 25%, transparent 60%)`
            ),
          }}
        />
        
        {/* Gold glow overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(212,175,55,0.18),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,223,128,0.14),transparent_30%)]" />
        
        {/* Icon */}
        <motion.div 
          className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold/20 to-gold/10 flex items-center justify-center mb-3 group-hover:from-gold/40 group-hover:to-gold/20 transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.3)] shrink-0"
          whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.4 }}
        >
          <Icon className="w-6 h-6 text-gold drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
        </motion.div>
        
        <h3 className="font-display text-lg text-foreground font-semibold mb-2 group-hover:text-gold transition-colors">
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
      title: "Dziedzictwo Zwycięzców",
      description:
        "Nasze gołębie to owoc wielopokoleniowej selekcji ukierunkowanej na żelazną wytrzymałość i bezbłędny instynkt nawigacyjny. Każdy ptak w naszym gołębniku wywodzi się z rodziny sprawdzonych mistrzów, co daje pewność najwyższej jakości materiału lotowego.",
    },
    {
      icon: Target,
      title: "Dynamika i Szybkość",
      description:
        "Jako specjaliści od sprintu, skupiamy się na ptakach zdolnych do utrzymania maksymalnego tempa na krótkich dystansach. Nasza praca hodowlana koncentruje się na budowie anatomicznej i psychice, które pozwalają naszym gołębiom wygrywać sekundy decydujące o zwycięstwie.",
    },
    {
      icon: Feather,
      title: "Elitarna genetyka",
      description:
        "Każdy ptak nosi w sobie genetykę udoskonalaną przez dziesięciolecia strategicznej hodowli i skrupulatnej selekcji.",
    },
    {
      icon: Award,
      title: "Potwierdzona Klasa",
      description:
        "O klasie naszych ptaków świadczy ich uniwersalność – doskonale adaptują się do różnych warunków pogodowych i systemów motywacyjnych. Ich wartość potwierdzają liczne listy konkursowe i satysfakcja hodowców, którzy dzięki naszej krwi sięgnęli po najwyższe trofea w kraju.",
    },
  ];

  const sectionRef = useRef<HTMLElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const leftContentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!sectionRef.current || !cardsContainerRef.current || !leftContentRef.current) {
      return;
    }

    const section = sectionRef.current;
    const cards = cardsContainerRef.current.querySelectorAll('.feature-card');
    const leftContent = leftContentRef.current;

    const ctx = gsap.context(() => {
      // Create timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 60%',
          toggleActions: 'play none none reverse',
          invalidateOnRefresh: true,
          refreshPriority: -1,
        }
      });

      // Animate Left Content - dramatic entrance
      tl.fromTo(leftContent, 
        { 
          x: -200, 
          opacity: 0,
          rotateY: 30,
          scale: 0.8
        },
        { 
          x: 0, 
          opacity: 1,
          rotateY: 0,
          scale: 1, 
          duration: 1.2, 
          ease: 'power3.out',
          immediateRender: true
        }
      );

      // Cards - Simple fade and zoom animations (all same)
      if (cards.length >= 4) {
        // Card 0
        tl.fromTo(cards[0],
          { 
            y: 100,
            opacity: 0, 
            scale: 0.8
          },
          { 
            y: 0,
            opacity: 1, 
            scale: 1,
            duration: 1.2, 
            ease: 'back.out(1.2)'
          },
          '-=0.6'
        );
        
        // Card 1
        tl.fromTo(cards[1],
          { 
            y: 100,
            opacity: 0, 
            scale: 0.8
          },
          { 
            y: 0,
            opacity: 1, 
            scale: 1,
            duration: 1.2, 
            ease: 'back.out(1.2)'
          },
          '-=1.0'
        );
        
        // Card 2
        tl.fromTo(cards[2],
          { 
            y: 100,
            opacity: 0, 
            scale: 0.8
          },
          { 
            y: 0,
            opacity: 1, 
            scale: 1,
            duration: 1.2, 
            ease: 'back.out(1.2)'
          },
          '-=1.0'
        );
        
        // Card 3
        tl.fromTo(cards[3],
          { 
            y: 100,
            opacity: 0, 
            scale: 0.8
          },
          { 
            y: 0,
            opacity: 1, 
            scale: 1,
            duration: 1.2, 
            ease: 'back.out(1.2)'
          },
          '-=1.0'
        );
      }

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="pt-24 pb-0 relative overflow-hidden scroll-mt-[100px] min-h-screen"
      style={{ perspective: '1500px' }}
    >
      <div 
        className="absolute top-20 left-10 w-96 h-96 bg-gold/5 rounded-full blur-3xl opacity-20"
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div ref={leftContentRef} className="opacity-0" style={{ transformStyle: 'preserve-3d' }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-gold/10 text-gold text-sm font-medium tracking-wide mb-6">
              O naszej hodowli
            </span>
            <h2 className="font-display text-3xl md:text-4xl text-gold font-bold leading-tight mb-6">
              MTM Pałka – <span className="text-white">Zwycięstwo</span> mamy w genach.
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Od ponad 45 lat poświęcamy się hodowli najlepszych gołębi pocztowych, budując markę opartą na wynikach i unikalnej genetyce. Naszym największym atutem jest autorski system hodowlany: od 25 lat utrzymujemy własne linie krwi, konsekwentnie łącząc ptaki w bliskim pokrewieństwie.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Każdy gołąb w naszym gołębniku to efekt ćwierćwiecza rygorystycznej selekcji i dążenia do doskonałości. Dzięki prowadzeniu czystych linii, nasze ptaki cechują się potężną siłą dziedziczenia i wybitną witalnością, co pozwala im seryjnie wygrywać konkursy zarówno w naszym gołębniku, jak i u hodowców z każdego regionu Polski.
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
            style={{ perspective: '1200px' }}
          >
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="feature-card opacity-0"
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

export default AboutSection;