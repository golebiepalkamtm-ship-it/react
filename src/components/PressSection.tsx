import React, { useRef, useState } from 'react';
import { Newspaper, Calendar, ExternalLink, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform, useScroll } from 'framer-motion';
import { Reveal, StaggeredList, fadeInUp, fadeInLeft, cardMicro, buttonMicro } from "@/components/motion";

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
      className="relative group"
      style={{ perspective: '1000px' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.article
        className="bg-black/70 backdrop-blur-xl rounded-2xl border border-white/25 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] overflow-hidden flex flex-col h-full"
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
            src={article.image} 
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
        
        <div className="p-6">
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
            className="w-full group/btn border-gold/30 hover:bg-gold hover:text-navy"
            asChild
          >
            <Link to={`/press/${article.id}`}>
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
      id="press"
      className="py-20 relative overflow-hidden"
    >
      <div className="container mx-auto px-4 relative z-10">
        {/* Nagłówek */}
        <div className="text-center mb-16">
          <motion.span 
            className="inline-block px-4 py-1.5 rounded-full bg-gold/10 text-gold text-sm font-medium tracking-wide mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Media o nas
          </motion.span>
          <motion.h2 
            className="font-display text-4xl md:text-5xl text-foreground font-bold leading-tight mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            W <span className="text-gradient-gold">mediach</span>
          </motion.h2>
          <motion.p 
            className="text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Zobacz jak media opisują nasze sukcesy w hodowli gołębi pocztowych
          </motion.p>
        </div>

        {/* Karty z parallax */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
          style={{ y: cardsY }}
        >
          {articlesToRender.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <PressCard article={article} index={index} />
            </motion.div>
          ))}
        </motion.div>
        
        {/* Przycisk */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button variant="outline" size="lg" className="border-gold/50 hover:bg-gold hover:text-navy" asChild>
            <Link to="/press">
              Zobacz wszystkie artykuły
              <Newspaper className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default React.memo(PressSection);