import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { logger } from "@/lib/logger";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  Newspaper,
  Share2,
  Image as ImageIcon,
} from "lucide-react";
import { PressService, PressArticle } from "@/services/pressService";

const PressArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<PressArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadArticle = async () => {
      if (!id) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        const foundArticle = await PressService.getArticleById(id);
        if (foundArticle) {
          setArticle(foundArticle);
        } else {
          setError(true);
        }
      } catch (err) {
        logger.error("Failed to load article:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen relative isolate bg-transparent">
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
            <p className="text-slate-600">Ładowanie artykułu...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen relative isolate flex items-center justify-center bg-transparent">
        <div className="text-center">
          <h1 className="font-display text-4xl md:text-5xl text-zinc-900 font-bold leading-tight mb-4">
            Artykuł nie został znaleziony
          </h1>
          <Button asChild>
            <Link to="/press">Wróć do listy artykułów</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href,
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen relative isolate bg-transparent">
      <Header />

      <main>
        <article className="py-16">
          <div className="container mx-auto px-4">
            {/* Back Navigation */}
            <div className="mb-8">
              <Button variant="ghost" size="sm" asChild>
                <Link
                  to="/press"
                  className="text-white hover:text-gold hover:bg-white/10"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Wróć do artykułów
                </Link>
              </Button>
            </div>

            {/* Featured Image */}
            <div className="max-w-5xl mx-auto mb-12">
              <div className="rounded-2xl overflow-hidden border border-gold/25 bg-black/20 backdrop-blur-md shadow-[0_18px_48px_rgba(0,0,0,0.12)]">
                <img
                  src={article.images.main}
                  alt={article.title}
                  className="w-full h-auto max-h-[600px] object-contain bg-black/40"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop";
                  }}
                />
              </div>
            </div>

            {/* Article Content */}
            <div className="max-w-5xl mx-auto">
              <div className="rounded-2xl border border-white/25 bg-black/60 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.08)] p-8 md:p-12 mb-12">
                {/* Article Header Inside Container */}
                <header className="mb-12 border-b border-white/10 pb-8">
                  <div className="flex items-center gap-2 text-sm text-zinc-300 mb-4">
                    <Newspaper className="w-4 h-4 text-gold" />
                    <span>{article.publication}</span>
                    {article.author && (
                      <>
                        <span>•</span>
                        <span>{article.author}</span>
                      </>
                    )}
                    <span>•</span>
                    <Calendar className="w-4 h-4 text-gold" />
                    <time>
                      {new Date(article.date).toLocaleDateString("pl-PL")}
                    </time>
                  </div>

                  <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-white font-bold leading-tight mb-6">
                    {article.title}
                  </h1>

                  <div className="flex items-center justify-between text-zinc-300">
                    <div className="flex items-center gap-3">
                      <ImageIcon className="w-5 h-5 text-gold" />
                      <span>
                        {article.images.pages?.length || 0} dodatkowych zdjęć
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Share2 className="w-5 h-5" />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShare}
                        className="border-gold/30 hover:bg-gold hover:text-navy text-white hover:text-navy"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Udostępnij
                      </Button>
                    </div>
                  </div>
                </header>

                <div className="prose prose-lg max-w-none prose-headings:text-white prose-p:text-zinc-300 prose-strong:text-white text-zinc-300">
                  {article.content.split("\n\n").map((paragraph, index) => {
                    if (
                      paragraph.startsWith("**") &&
                      paragraph.endsWith("**")
                    ) {
                      return (
                        <h3
                          key={index}
                          className="text-xl font-semibold mt-8 mb-4 text-gold"
                        >
                          {paragraph.replace(/\*\*/g, "")}
                        </h3>
                      );
                    }
                    return (
                      <p
                        key={index}
                        className="mb-4 leading-relaxed text-lg text-zinc-300"
                      >
                        {paragraph.replace(/\*\*/g, "")}
                      </p>
                    );
                  })}
                </div>
              </div>

              {/* Scanned Pages */}
              {article.images.pages && article.images.pages.length > 0 && (
                <div className="mb-12">
                  <div className="flex items-center gap-2 mb-6">
                    <ImageIcon className="w-5 h-5 text-gold" />
                    <h3 className="text-xl font-semibold text-foreground">
                      Skany z gazety
                    </h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    {article.images.pages.map((imageSrc, index) => (
                      <div
                        key={index}
                        className="border border-white/25 rounded-2xl overflow-hidden bg-black/60 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
                      >
                        <img
                          src={imageSrc}
                          alt={`Strona ${index + 1} artykułu`}
                          className="w-full h-auto cursor-pointer hover:scale-105 transition-transform duration-300"
                          onClick={() => window.open(imageSrc, "_blank")}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-4 text-center">
                    Kliknij na zdjęcie, aby powiększyć
                  </p>
                </div>
              )}

              {/* Share Section */}
              <div className="mt-12 pt-8 border-t border-white/15">
                <h3 className="text-lg font-semibold mb-4 text-foreground">
                  Podziel się artykułem
                </h3>
                <div className="flex flex-wrap gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="border-gold/30 hover:bg-gold hover:text-navy"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Udostępnij
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default PressArticleDetail;
