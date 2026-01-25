import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Newspaper, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion, useTransform, useMotionValue, useSpring, useScroll } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PressService, PressArticle } from '@/services/pressService';
import { logger } from '@/lib/logger';

gsap.registerPlugin(ScrollTrigger);

const PressArticleCard = ({ article, index }: { article: PressArticle; index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [80, 0, -80]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.9, 1, 1, 0.9]);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), {
    stiffness: 150,
    damping: 20,
  });
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };
  
  return (
    <motion.div
      ref={cardRef}
      className="relative group h-full"
      style={{ perspective: '1000px', opacity, y, scale }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.article
        className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-zinc-800/95 via-zinc-900/95 to-zinc-800/95 backdrop-blur-xl shadow-[0_0_40px_rgba(212,175,55,0.15),inset_0_1px_0_rgba(255,255,255,0.05)] h-full flex flex-col"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ scale: { duration: 0.2 } }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/20 pointer-events-none" />
        
        <motion.div 
          className="absolute -top-10 left-1/2 -translate-x-1/2 w-[120%] h-24 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.2) 0%, transparent 60%)',
          }}
          animate={{
            opacity: isHovered ? [0.5, 0.8, 0.5] : 0.3,
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        
        <div className="relative aspect-[16/10] overflow-hidden">
          <img 
            src={article.images.main} 
            alt={article.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain p-4 md:p-5 drop-shadow-md group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&h=400&fit=crop';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        </div>
        
        <div className="relative p-6 flex-grow flex flex-col justify-between z-30">
          <div className="flex items-center gap-2 text-sm text-white/60 mb-3 flex-wrap">
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gold/10 text-gold-light/80 border border-gold/20">
              <Newspaper className="w-3 h-3" />
              {article.publication}
            </span>
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 text-white/60 border border-white/10">
              <Calendar className="w-3 h-3" />
              {new Date(article.date).toLocaleDateString('pl-PL')}
            </span>
          </div>
          
          <h3 className="font-display text-xl font-semibold mb-3 line-clamp-2 text-white group-hover:text-gold transition-colors">
            {article.title}
          </h3>
          
          <p className="text-white/60 text-sm line-clamp-4 mb-4">
            {article.excerpt}
          </p>
          
          <div className="mt-auto">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full border-gold/30 text-gold-light hover:bg-gold hover:text-black hover:border-gold transition-all duration-300 relative z-40"
              asChild
            >
              <Link to={`/press/${article.id}`}>
                Czytaj więcej
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
        
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 1, delay: index * 0.1 }}
          viewport={{ once: true }}
        />
      </motion.article>
    </motion.div>
  );
};

const PressSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const [articles, setArticles] = useState<PressArticle[]>([]);
  const [loading, setLoading] = useState(true);

  const prefersReducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const allArticles = await PressService.loadArticles();
        const featuredArticles = allArticles.filter(a => a.featured).slice(0, 3);
        setArticles(featuredArticles.length > 0 ? featuredArticles : allArticles.slice(0, 3));
      } catch (error) {
        logger.error('Failed to load press articles for section:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);
  
  useEffect(() => {
    if (loading || !sectionRef.current || !cardsContainerRef.current || articles.length === 0) return;
    if (prefersReducedMotion || window.innerWidth < 1024) return;
    
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
        }
      });

      if (headerBadge) tl.fromTo(headerBadge, { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
      if (headerTitle) tl.fromTo(headerTitle, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, '-=0.3');
      if (headerDesc) tl.fromTo(headerDesc, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.4');

      if (cards.length > 0) {
        tl.fromTo(cards, {
          y: 100,
          opacity: 0,
          scale: 0.9
        }, {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: 'back.out(1.4)',
          stagger: 0.2
        }, '-=0.5');
      }
      
      if (ctaButton) tl.fromTo(ctaButton, { y: 60, opacity: 0, scale: 0.8 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(2)' }, '-=0.3');
      
    }, section);
    
    return () => ctx.revert();
  }, [loading, articles, prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="press-section"
      className="py-20 relative overflow-hidden"
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span 
            className="header-badge inline-block px-4 py-1.5 rounded-full bg-gold/10 text-gold text-sm font-medium tracking-wide mb-6"
          >
            Media o nas
          </span>
          <h2 
            className="header-title font-display text-3xl md:text-4xl text-white font-bold leading-tight mb-4"
          >
            W centrum <span className="text-gold">uwagi</span>
          </h2>
          <p 
            className="header-desc text-white/70 max-w-2xl mx-auto"
          >
            Zobacz, jak media opisują nasze sukcesy w hodowli gołębi pocztowych.
          </p>
        </div>

        {!loading && articles.length > 0 && (
          <div 
            ref={cardsContainerRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
            style={{ perspective: '1200px' }}
          >
            {articles.map((article, index) => (
              <div
                key={article.id}
                className="press-card"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <PressArticleCard article={article} index={index} />
              </div>
            ))}
          </div>
        )}
        
        <div className="cta-button text-center">
          <Button variant="outline" size="lg" className="border-gold/50 text-gold-light hover:bg-gold hover:text-black hover:border-gold transition-all duration-300" asChild>
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