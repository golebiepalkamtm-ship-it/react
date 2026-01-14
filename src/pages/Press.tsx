import { useState, useEffect, useRef } from 'react';
import { logger } from '@/lib/logger';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Newspaper, Calendar, Filter, ArrowRight } from 'lucide-react';
import { PressService, PressArticle } from '@/services/pressService';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

// Press Article Card z efektami ChampionCard
const PressArticleCard = ({ article, index }: { article: PressArticle; index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
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
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };
  
  return (
    <motion.div
      ref={cardRef}
      className="relative group h-full"
      style={{ perspective: '1000px' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.article
        className="bg-black/90 rounded-2xl border border-white/25 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] overflow-hidden h-full flex flex-col"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ scale: { duration: 0.2 } }}
      >
        {/* Dynamic light reflection */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: `radial-gradient(circle at ${lightX.get()}% ${lightY.get()}%, rgba(255,255,255,0.15) 0%, transparent 50%)`,
            opacity: isHovered ? 1 : 0,
          }}
        />
        
        {/* Glow border on hover - JASNY */}
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
        />
        
        {/* Scanline effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 0.15 : 0 }}
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
        
        <div className="relative aspect-[16/10] overflow-hidden bg-linear-to-b from-black/15 via-transparent to-black/20">
          <img 
            src={article.images.main} 
            alt={article.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain p-4 md:p-5 drop-shadow-md group-hover:scale-[1.02] transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&h=400&fit=crop';
            }}
          />
        </div>
        
        <div className="p-6 flex-grow flex flex-col justify-between">
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
          
          <p className="text-muted-foreground text-sm line-clamp-4 mb-4">
            {article.excerpt}
          </p>
          
          <div className="mt-auto">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full group/btn border-gold/30 hover:bg-gold hover:text-navy"
              asChild
            >
              <Link to={`/press/${article.id}`}>
                Czytaj więcej
                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.article>
    </motion.div>
  );
};

const PressPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [pressArticles, setPressArticles] = useState<PressArticle[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Header />
      
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative min-h-[30vh] flex items-center justify-center overflow-hidden text-center">
          <div className="relative z-10 container mx-auto px-4">
            <motion.div 
              className="flex items-center justify-center gap-2 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Newspaper className="w-8 h-8 text-gold" />
            </motion.div>
            <motion.div 
              className="mx-auto max-w-4xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h1 className="font-display text-4xl md:text-5xl text-foreground font-bold leading-tight mb-4">Media <span className="text-gradient-gold">o nas</span></h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Przeczytaj co piszą o nas media branżowe i ogólnopolskie
              </p>
            </motion.div>
          </div>
        </section>

        {/* Featured Video */}
        <section className="py-2 section-surface-alt">
          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="relative pb-[56.25%] h-0 rounded-2xl overflow-hidden border border-white/25 bg-black/70 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/utXkaMWyZfk"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-20 section-surface-alt">
          <div className="container mx-auto px-4">

            {/* Filter */}
            <motion.div 
              className="flex flex-wrap items-center gap-4 mb-12 rounded-2xl border border-white/25 bg-black/70 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.08)] p-4 md:p-5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 text-foreground font-medium">
                <Filter className="w-4 h-4" />
                Kategoria:
              </div>
              {categories.map((category, index) => (
                <motion.div
                  key={category.value}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                >
                  <Button
                    variant={selectedCategory === category.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.value)}
                    className={selectedCategory === category.value ? "bg-gold text-navy" : "border-gold/30 hover:bg-gold hover:text-navy"}
                  >
                    {category.label}
                  </Button>
                </motion.div>
              ))}
            </motion.div>
            {/* Articles Grid */}
            {!loading && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 h-full">
                {filteredArticles.map((article, index) => (
                  <motion.div
                    key={article.id}
                    className="h-full"
                    initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <PressArticleCard article={article} index={index} />
                  </motion.div>
                ))}
              </div>
            )}

            {loading && (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
                <p className="text-muted-foreground">Ładowanie artykułów...</p>
              </div>
            )}

            {!loading && filteredArticles.length === 0 && (
              <div className="text-center py-16">
                <Newspaper className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground text-lg mb-2">Brak artykułów w tej kategorii</p>
                <p className="text-muted-foreground text-sm">Spróbuj wybrać inną kategorię lub zobacz wszystkie artykuły</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default PressPage;