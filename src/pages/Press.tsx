import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Newspaper, Calendar, Filter, ArrowRight } from 'lucide-react';
import { PressService, PressArticle } from '@/services/pressService';

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
        console.error('Failed to load articles:', error);
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
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-navy text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-navy/90 via-navy/40 to-transparent" />
          <div className="relative z-10 container mx-auto px-4">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Newspaper className="w-8 h-8 text-gold" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl text-white font-bold leading-tight mb-4">
              Media <span className="text-gradient-gold">o nas</span>
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Przeczytaj co piszą o nas media branżowe i ogólnopolskie
            </p>
          </div>
        </section>

        {/* Featured Video */}
        <section className="py-12 bg-background/0">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-8">
              <h2 className="font-display text-3xl text-foreground font-bold mb-2">Film o nas</h2>
              <p className="text-muted-foreground">Zobacz materiał wideo</p>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="relative pb-[56.25%] h-0">
                <iframe
                  className="absolute inset-0 w-full h-full rounded-xl shadow-lg"
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
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            
            {/* Filter */}
            <div className="flex flex-wrap items-center gap-4 mb-12">
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
                    className="group bg-card rounded-2xl border border-border overflow-hidden hover:border-gold/30 transition-all duration-300 hover-lift"
                  >
                    <div className="h-56 overflow-hidden">
                      <img 
                        src={article.images.main} 
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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

      <Footer />
    </div>
  );
};

export default PressPage;