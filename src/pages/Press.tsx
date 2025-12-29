import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ParticleBackground } from '@/components/gallery/ParticleBackground';
import { Newspaper, Calendar, Filter, ArrowRight } from 'lucide-react';
import { PressService, PressArticle } from '@/services/pressService';

const PressPage = (props) => {
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
    <div className="min-h-screen relative isolate overflow-hidden">
      <ParticleBackground particleCount={70} variant="mixed" />
      <div className="fixed inset-0 bg-hero-gradient grid-overlay -z-10 pointer-events-none" />
      <Header />
      
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden text-center">
          <div className="relative z-10 container mx-auto px-4">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Newspaper className="w-8 h-8 text-gold" />
            </div>
            <div className="mx-auto max-w-4xl">
              <h1 className="font-display text-4xl md:text-5xl text-foreground font-bold leading-tight mb-4">Media <span className="text-gradient-gold">o nas</span></h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Przeczytaj co piszą o nas media branżowe i ogólnopolskie
              </p>
            </div>
          </div>
        </section>

        {/* Featured Video */}
        <section className="py-12 section-surface-alt">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-8">
              <h2 className="font-display text-3xl text-foreground font-bold mb-2">Film o nas</h2>
              <p className="text-muted-foreground">Zobacz materiał wideo</p>
            </div>
            <div className="max-w-4xl mx-auto">
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
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16 section-surface-alt">
          <div className="container mx-auto px-4">
            
            {/* Filter */}
            <div className="flex flex-wrap items-center gap-4 mb-12 rounded-2xl border border-white/25 bg-black/70 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.08)] p-4 md:p-5">
              <div className="flex items-center gap-2 text-foreground font-medium">
                <Filter className="w-4 h-4" />
                Kategoria:
              </div>
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                  className={selectedCategory === category.value ? "bg-gold text-navy" : "border-gold/30 hover:bg-gold hover:text-navy"}
                >
                  {category.label}
                </Button>
              ))}
            </div>

            {/* Articles Grid */}
            {!loading && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredArticles.map((article) => (
                  <article 
                    key={article.id}
                    className="group bg-black/70 backdrop-blur-xl rounded-2xl border border-white/25 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] overflow-hidden hover:border-gold/30 transition-all duration-300 hover-lift"
                  >
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
                      
                      <p className="text-muted-foreground text-sm line-clamp-4 mb-4">
                        {article.excerpt}
                      </p>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full group/btn border-gold/30 hover:bg-gold hover:text-navy"
                        asChild
                      >
                        <Link to={`/press/${article.id}`}>
                          Czytaj artykuł
                          <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </div>
                  </article>
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