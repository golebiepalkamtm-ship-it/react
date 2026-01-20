import React, { useRef, useState, useEffect } from 'react';
import { Newspaper, Calendar, ExternalLink, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform, useScroll } from 'framer-motion';
import { Reveal, StaggeredList, fadeInUp, fadeInLeft, cardMicro, buttonMicro } from "@/components/motion";
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface PressArticle {
  id: string;
  title: string;
  excerpt: string;
  publication: string;
  date: string;
  image: string;
  category: 'newspaper' | 'magazine' | 'online';
}

// Press Card Component z efektami ChampionCard
const PressCard = ({ article, index }: { article: PressArticle; index: number }) => {
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
  
  const handleMouseEnter = () => {
    setIsHovered(true);
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };
  
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
      <motion.article
        className="h-full overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-b from-black/70 via-slate-900/60 to-black/60 shadow-[0_25px_80px_rgba(212,175,55,0.15)] backdrop-blur-xl relative"
        style={{
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ translateY: -8, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        {/* Dynamic light reflection - wzmocnione */}
        <motion.div 
          className="absolute inset-0 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: useTransform(
              [lightX, lightY],
              ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, rgba(212,175,55,0.5) 0%, rgba(255,255,255,0.2) 25%, transparent 60%)`
            ),
          }}
        />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(212,175,55,0.18),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,223,128,0.14),transparent_30%)]" />
        <div className="relative aspect-[16/10] overflow-hidden bg-linear-to-b from-black/15 via-transparent to-black/20">
          <img 
            src={article.image} 
            alt={article.title}
            loading="lazy"
            decoding="async"
            width="640"
            height="400"
            className="w-full h-full object-contain p-4 md:p-5 drop-shadow-md group-hover:scale-[1.02] transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&h=400&fit=crop';
            }}
          />
        </div>
        <div className="p-6 relative z-30">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Newspaper className="w-4 h-4" />
            <span>{article.publication}</span>
            <span>•</span>
            <Calendar className="w-4 h-4" />
            <time>{new Date(article.date).toLocaleDateString('pl-PL')}</time>
          </div>
          <h3 className="font-display text-xl font-semibold mb-3 line-clamp-2 group-hover:text-gold transition-colors">
            {article.title}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
            {article.excerpt}
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full group/btn border-gold/30 hover:bg-gold hover:text-navy relative z-40"
            asChild
          >
            <Link 
              to={`/press/${article.id}`}
              aria-label={`Czytaj więcej: ${article.title}`}
            >
              Czytaj więcej
              <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </motion.article>
    </motion.div>
  );
};

const PressSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  
  // GSAP 3D WOW animations
  useEffect(() => {
    if (!sectionRef.current || !cardsContainerRef.current) return;
    
    const section = sectionRef.current;
    const headerBadge = section.querySelector('.header-badge');
    const headerTitle = section.querySelector('.header-title');
    const headerDesc = section.querySelector('.header-desc');
    const cards = cardsContainerRef.current.querySelectorAll('.press-card');
    const ctaButton = section.querySelector('.cta-button');
    
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 70%',
          toggleActions: 'play none none reverse',
          invalidateOnRefresh: true,
          refreshPriority: -2,
        }
      });

      // Header animations - staggered entrance
      if (headerBadge) {
        tl.fromTo(headerBadge,
          { y: -30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
        );
      }
      
      if (headerTitle) {
        tl.fromTo(headerTitle,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
          '-=0.3'
        );
      }
      
      if (headerDesc) {
        tl.fromTo(headerDesc,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
          '-=0.4'
        );
      }

      // Cards - Simple fade and zoom animations (all same as center)
      if (cards.length >= 3) {
        // Left card
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
          '-=0.2'
        );
        
        // Center card
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
        
        // Right card
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
      }
      
      // CTA button - bounce in
      if (ctaButton) {
        tl.fromTo(ctaButton,
          { y: 60, opacity: 0, scale: 0.8 },
          { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(2)' },
          '-=0.3'
        );
      }
      
    }, section);
    
    return () => ctx.revert();
  }, []);
  
  // Prosty parallax scroll
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  // Tylko jeden subtelny efekt - karty przesuwają się wolniej niż scroll
  const cardsY = useTransform(scrollYProgress, [0, 1], [80, -40]);

  const pressArticles: PressArticle[] = [
    {
      id: '1',
      title: 'MTM Pałka - Tradycja i Pasja w Hodowli Gołębi Pocztowych',
      excerpt: 'Artykuł w miesięczniku "Dobry Lot" przedstawia historię hodowli MTM Pałka, jej osiągnięcia i podejście do selekcji ptaków. Poznaj sekrety sukcesu rodzinnej hodowli z Lubania.',
      publication: 'Dobry Lot - Miesięcznik',
      date: '2023-09-15',
      image: '/press/articles/older/1/dobry-lot.jpg',
      category: 'magazine'
    },
    {
      id: '2',
      title: 'Wywiad z Hodowcami MTM - Strategia i Filozofia Hodowli',
      excerpt: 'Ekskluzywny wywiad w magazynie "Hodowca" z przedstawicielami MTM Pałka. Dowiedz się o metodach hodowlanych, planach rozwoju i najważniejszych osiągnięciach hodowli.',
      publication: 'Hodowca - Magazyn Specjalistyczny',
      date: '2023-07-20',
      image: '/press/articles/older/2/Hodowca.jpg',
      category: 'magazine'
    },
    {
      id: '3',
      title: 'Sukcesy MTM Pałka w Prasie Branżowej',
      excerpt: 'Relacje z najważniejszych zawodów i aukcji, w których brały udział gołębie z hodowli MTM Pałka. Artykuł podsumowuje osiągnięcia sportowe i hodowlane.',
      publication: 'Prasa Gołębiarska',
      date: '2023-05-10',
      image: '/press/articles/older/3/Newspapers.jpg',
      category: 'newspaper'
    },
    {
      id: '4',
      title: 'Historia Sukcesu - 45 Lat Hodowli MTM Pałka',
      excerpt: 'Reportaż o historii hodowli MTM Pałka, od początków w 1978 roku do dzisiaj. Prezentacja najważniejszych momentów, osiągnięć i planów na przyszłość.',
      publication: 'Hodowca - Wydanie Specjalne 2014',
      date: '2014-08-15',
      image: '/press/articles/older/4/Hodowca2014m.jpg',
      category: 'magazine'
    }
  ];

  const articlesToRender = pressArticles.slice(0, 3);

  return (
    <section
      ref={sectionRef}
      id="press-section"
      className="py-20 relative overflow-hidden"
    >
      <div className="container mx-auto px-4 relative z-10">
        {/* Nagłówek */}
        <div className="text-center mb-16">
          <span 
            className="header-badge inline-block px-4 py-1.5 rounded-full bg-gold/10 text-gold text-sm font-medium tracking-wide mb-6 opacity-0"
          >
            Media o nas
          </span>
          <h2 
            className="header-title font-display text-3xl md:text-4xl text-gold font-bold leading-tight mb-4 opacity-0"
          >
            W <span className="text-white">mediach</span>
          </h2>
          <p 
            className="header-desc text-muted-foreground max-w-2xl mx-auto opacity-0"
          >
            Zobacz jak media opisują nasze sukcesy w hodowli gołębi pocztowych
          </p>
        </div>

        {/* Karty z parallax i 3D */}
        <div 
          ref={cardsContainerRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
          style={{ perspective: '1200px' }}
        >
          {articlesToRender.map((article, index) => (
            <div
              key={article.id}
              className="press-card opacity-0"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <PressCard article={article} index={index} />
            </div>
          ))}
        </div>
        
        {/* Przycisk */}
        <div className="cta-button text-center opacity-0">
          <Button variant="outline" size="lg" className="border-gold/50 hover:bg-gold hover:text-navy" asChild>
            <Link to="/press">
              Zobacz wszystkie artykuły
              <Newspaper className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default React.memo(PressSection);