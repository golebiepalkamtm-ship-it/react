import React, { useRef, useEffect, useState } from "react";
import { Newspaper, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  motion,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsapConfig";
import { scrubReveal } from "@/lib/scrollReveal";
import { PressService, PressArticle } from "@/services/pressService";
import { logger } from "@/lib/logger";

const PressArticleCard = ({
  article,
  index,
}: {
  article: PressArticle;
  index: number;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    stiffness: 180,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 180,
    damping: 22,
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
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={cardRef}
      className="relative group h-full"
      style={{ perspective: "1200px" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.article
        className="relative overflow-hidden rounded-2xl bg-champion-teal h-full flex flex-col"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          border: "2px solid rgba(166,142,78,0.7)",
          boxShadow:
            "0 0 12px rgba(166,142,78,0.25), 0 0 30px rgba(166,142,78,0.1), inset 0 0 0 1px rgba(166,142,78,0.08), 0 24px 60px rgba(0,0,0,0.6)",
        }}
        whileHover={{ scale: 1.015 }}
        transition={{ scale: { duration: 0.25 } }}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent pointer-events-none" />

        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={article.images.main}
            alt={article.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain p-4 md:p-5 drop-shadow-md group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src =
                "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&h=400&fit=crop";
            }}
          />
        </div>

        <div className="relative p-6 flex-grow flex flex-col justify-between z-30">
          <div className="flex items-center gap-2 text-sm text-white/60 mb-3 flex-wrap">
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gold/10 text-gold-light/90 border border-gold/30">
              <Newspaper className="w-3 h-3 text-[#C8AE68]" />
              {article.publication}
            </span>
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 text-white/60 border border-white/10">
              <Calendar className="w-3 h-3 text-[#C8AE68]" />
              {new Date(article.date).toLocaleDateString("pl-PL")}
            </span>
          </div>

          <h3 className="font-display text-xl font-semibold mb-3 line-clamp-2 text-[#A68E4E] transition-colors">
            {article.title}
          </h3>

          <p className="text-white/80 text-sm font-medium line-clamp-4 mb-4">
            {article.excerpt}
          </p>

          <div className="mt-auto">
            <Button
              className="w-full inline-flex items-center justify-center bg-[#A68E4E] text-zinc-900 hover:bg-[#A68E4E]/90 border-0 font-bold uppercase tracking-wider py-5 rounded-full hover:scale-[1.03] active:scale-[0.97] transition-all shadow-md"
              asChild
            >
              <Link to={`/press/${article.id}`}>
                CZYTAJ WIĘCEJ
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>

        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 0.9, delay: index * 0.1 }}
          viewport={{ once: true }}
        />
      </motion.article>
    </div>
  );
};

const PressSection = ({ showVideo = false }: { showVideo?: boolean }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [articles, setArticles] = useState<PressArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const allArticles = await PressService.loadArticles();
        const featuredArticles = allArticles
          .filter((a) => a.featured)
          .slice(0, 3);
        setArticles(
          featuredArticles.length > 0
            ? featuredArticles
            : allArticles.slice(0, 3),
        );
      } catch (error) {
        logger.error("Failed to load press articles for section:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  useGSAP(
    () => {
      if (loading || articles.length === 0) return;

      const cards = cardsRef.current.filter(
        (card): card is HTMLDivElement => card !== null,
      );

      // Ciągłe odsłanianie sprzężone ze scrollem – bez progów i przeskoków
      scrubReveal([badgeRef.current, titleRef.current, descRef.current], {
        y: 50,
      });
      scrubReveal(cards, { y: 80, scale: 0.97, end: "top 65%" });
      scrubReveal(ctaRef.current, { y: 40 });

      ScrollTrigger.refresh();
    },
    { dependencies: [loading, articles.length], scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="press-section"
      className="flex items-center py-24 md:py-32 relative overflow-hidden"
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span
            ref={badgeRef}
            className="inline-block px-6 py-2 rounded-full bg-[#A68E4E] text-zinc-900 text-[10px] font-bold uppercase tracking-[0.2em] mb-6 shadow-lg shadow-gold/20"
          >
            Autorytet w branży
          </span>
          <h2
            ref={titleRef}
            className="font-display text-2xl md:text-3xl lg:text-4xl font-bold leading-tight uppercase tracking-[0.18em] mb-8 text-zinc-100"
          >
            <span className="text-zinc-100">Pałka MTM w Mediach</span>
            {" – "}
            <span className="gold-heading">Standard Doskonałości</span>
          </h2>
          <p
            ref={descRef}
            className="text-white text-lg md:text-xl max-w-2xl mx-auto mb-12 font-light leading-relaxed"
          >
            Naszą odpowiedzią na rozgłos są wyniki. Skupiamy się na pracy w
            gołębniku, pozwalając, by to osiągnięcia naszych ptaków były naszą
            wizytówką.
          </p>
        </div>

        {/* YouTube Video Section - only show when showVideo is true */}
        {showVideo && (
          <motion.div
            className="max-w-4xl mx-auto mb-16"
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div
              className="relative overflow-hidden rounded-2xl bg-[#0a0a0a]"
              style={{
                border: "2px solid rgba(166,142,78,0.7)",
                boxShadow:
                  "0 0 16px rgba(166,142,78,0.3), 0 0 40px rgba(166,142,78,0.15), 0 40px 100px rgba(0,0,0,0.9)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/10 pointer-events-none" />
              <div className="relative pb-[56.25%] h-0">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/utXkaMWyZfk"
                  title="Film o Hodowli Pałka MTM"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </motion.div>
        )}

        {loading && <div className="min-h-[560px] mb-16" aria-hidden="true" />}

        {!loading && articles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {articles.map((article, index) => (
              <div
                key={article.id}
                ref={(el) => {
                  cardsRef.current[index] = el;
                }}
                className="h-full will-change-transform"
              >
                <PressArticleCard article={article} index={index} />
              </div>
            ))}
          </div>
        )}

        <div ref={ctaRef} className="text-center">
          <Button
            className="inline-flex items-center justify-center bg-[#A68E4E] text-zinc-900 font-bold uppercase tracking-widest px-12 py-6 rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gold/20"
            asChild
          >
            <Link to="/press">
              Wszystkie Artykuły
              <Newspaper className="w-5 h-5 ml-3 text-zinc-900" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent z-20" />
    </section>
  );
};

export default React.memo(PressSection);
