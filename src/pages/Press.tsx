import { useState, useEffect, useRef } from 'react';
import { logger } from '@/lib/logger';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Newspaper, Calendar, Filter, ArrowRight, Sparkles, ChevronDown } from 'lucide-react';
import { PressService, PressArticle } from '@/services/pressService';
import { motion, useMotionValue, useSpring, useTransform, useScroll } from 'framer-motion';
import { gsap } from '@/lib/gsapConfig';

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
      className="relative group h-full press-card"
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

const PressPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [pressArticles, setPressArticles] = useState<PressArticle[]>([]);
  const [loading, setLoading] = useState(true);
  
  const heroRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -50]);

  // Inicjalizacja animacji tekstu hero
  useEffect(() => {
    const timer = setTimeout(() => {
      import('@/lib/gsapAnimations').then(({ initHeroTextSplit }) => {
        initHeroTextSplit();
      });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Animacje GSAP dla hero i scroll
  useEffect(() => {
    if (!heroRef.current || !heroContentRef.current) return;

    const ctx = gsap.context(() => {
      const heroContent = heroContentRef.current;
      const children = heroContent?.children;

      if (children) {
        gsap.set(children, { opacity: 0, y: 60 });
        
        gsap.to(children, {
          opacity: 1,
          y: 0,
          stagger: 0.25,
          duration: 1.8,
          ease: 'power3.out',
          delay: 0.5,
        });
      }

      // Parallax scroll dla hero
      if (heroContent) {
        gsap.to(heroContent, {
          y: 150,
          opacity: 0.3,
          scale: 0.95,
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.5,
          },
        });
      }

      // Animacja press cards
      const pressCards = document.querySelectorAll('.press-card');
      pressCards.forEach((card) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top bottom-=100',
              end: 'top center',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, heroRef);

    return () => ctx.revert();
  }, [pressArticles]);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        const articles = await PressService.loadArticles();
        setPressArticles(articles);
      } catch (error) {
        logger.error('Failed to load articles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, []);

  const categories = [
    { value: 'all', label: 'Wszystkie' },
    { value: 'magazine', label: 'Magazyny' },
    { value: 'newspaper', label: 'Gazety' },
    { value: 'online', label: 'Online' }
  ];

  const filteredArticles = selectedCategory === 'all' 
    ? pressArticles 
    : pressArticles.filter(article => article.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="relative w-16 h-16 mx-auto mb-6">
            <motion.div 
              className="absolute inset-0 rounded-full border-2 border-gold/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute inset-2 rounded-full border-2 border-t-gold border-r-transparent border-b-transparent border-l-transparent"
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-gold" />
          </div>
          <p className="text-white/60 text-lg">Ładowanie artykułów...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">

      <Header />

      <section 
        ref={heroRef}
        className="relative min-h-[70vh] flex items-center justify-center z-10 pt-20"
      >
        <div className="absolute inset-0 overflow-hidden" />

        <div ref={heroContentRef} className="relative z-10 container mx-auto px-4 text-center">
            <motion.div 
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gold/20 border border-gold/40 mb-8"
              animate={{ 
                boxShadow: ['0 0 30px rgba(250,204,21,0.2)', '0 0 60px rgba(250,204,21,0.4)', '0 0 30px rgba(250,204,21,0.2)']
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Newspaper className="w-10 h-10 text-gold" />
            </motion.div>

            <h1 
              data-split-text
              className="font-display text-4xl md:text-5xl lg:text-7xl font-bold text-gold mb-6"
            >
              Prasa i Media
            </h1>

            <motion.p 
              className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Przeczytaj co piszą o nas media branżowe i ogólnopolskie
            </motion.p>

            <motion.div 
              className="flex flex-wrap justify-center gap-6 md:gap-12 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div 
                className="text-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-2 bg-gradient-to-br from-gold-light to-gold shadow-lg">
                  <Newspaper className="w-7 h-7 text-black/80" />
                </div>
                <div className="font-display text-3xl md:text-4xl font-bold text-white">
                  {pressArticles.length}
                </div>
                <div className="text-white/50 text-sm uppercase tracking-wider">
                  Artykułów
                </div>
              </motion.div>
            </motion.div>

            <motion.div 
              className="mt-12 flex flex-col items-center gap-2"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-white/40 text-sm uppercase tracking-widest">Przewijaj</span>
              <ChevronDown className="w-6 h-6 text-gold/60" />
            </motion.div>
        </div>
      </section>

      <section className="relative z-10 py-8">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-zinc-800/90 via-zinc-900/90 to-zinc-800/90 backdrop-blur-xl shadow-[0_0_40px_rgba(212,175,55,0.15)]">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/10 pointer-events-none" />
              <div className="relative pb-[56.25%] h-0">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/utXkaMWyZfk"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="flex flex-wrap items-center gap-4 mb-12 p-4 md:p-5 rounded-2xl border border-gold/20 bg-gradient-to-br from-zinc-800/80 via-zinc-900/80 to-zinc-800/80 backdrop-blur-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 text-white font-medium">
              <Filter className="w-4 h-4 text-gold" />
              <span>Kategoria:</span>
            </div>
            {categories.map((category, index) => (
              <motion.div
                key={category.value}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              >
                <Button
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                  className={selectedCategory === category.value 
                    ? "bg-gradient-to-r from-gold to-gold text-black font-bold border-none" 
                    : "border-gold/30 text-gold-light hover:bg-gold hover:text-black hover:border-gold"
                  }
                >
                  {category.label}
                </Button>
              </motion.div>
            ))}
          </motion.div>

          {filteredArticles.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article, index) => (
                <PressArticleCard key={article.id} article={article} index={index} />
              ))}
            </div>
          ) : (
            <motion.div 
              className="max-w-2xl mx-auto text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="relative overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-zinc-800/90 via-zinc-900/90 to-zinc-800/90 backdrop-blur-xl p-12">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/20 pointer-events-none" />
                <Newspaper className="w-16 h-16 text-gold/50 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-white mb-4">Brak artykułów</h2>
                <p className="text-white/60 mb-4">
                  Brak artykułów w tej kategorii
                </p>
                <p className="text-white/40 text-sm">
                  Spróbuj wybrać inną kategorię lub zobacz wszystkie artykuły
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default PressPage;
