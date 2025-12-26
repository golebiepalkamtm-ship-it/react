import { Newspaper, Calendar, ExternalLink, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface PressArticle {
  id: string;
  title: string;
  excerpt: string;
  publication: string;
  date: string;
  image: string;
  category: 'newspaper' | 'magazine' | 'online';
}

const PressSection = () => {

  // Real press articles from newspapers and magazines
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

  return (
    <motion.section
      id="press"
      className="py-20 section-surface-alt"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: "-140px" }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-gold/10 text-gold text-sm font-medium tracking-wide mb-6">
            Media o nas
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-foreground font-bold leading-tight mb-4">
            W <span className="text-gradient-gold">mediach</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Zobacz jak media opisują nasze sukcesy w hodowli gołębi pocztowych
          </p>
        </motion.div>

        {/* Articles Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-120px" }}
          variants={{
            hidden: {},
            show: {
              transition: { staggerChildren: 0.08, delayChildren: 0.05 },
            },
          }}
        >
          {pressArticles.map((article) => (
            <motion.article 
              key={article.id}
              className="group bg-card rounded-2xl border border-border overflow-hidden hover:border-gold/30 transition-all duration-300 hover-lift"
              variants={{
                hidden: { opacity: 0, y: 22, scale: 0.985 },
                show: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
                },
              }}
            >
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
          ))}
        </motion.div>
        
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 16, filter: 'blur(10px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          <Button variant="outline" size="lg" className="border-gold/50 hover:bg-gold hover:text-navy" asChild>
            <Link to="/press">
              Zobacz wszystkie artykuły
              <Newspaper className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default PressSection;