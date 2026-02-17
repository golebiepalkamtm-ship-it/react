import React, { useRef, useEffect, useMemo, useState } from "react";
import { Newspaper, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  motion,
  useTransform,
  useMotionValue,
  useSpring,
  useScroll,
} from "framer-motion";
import { gsap, ScrollTrigger } from "@/lib/gsapConfig";
import { PressService, PressArticle } from "@/services/pressService";
import { logger } from "@/lib/logger";
import { useScrollTriggerSync } from "@/hooks/useScrollTriggerSync";

gsap.registerPlugin(ScrollTrigger);

const PressArticleCard = ({
  article,
  index,
}: {
  article: PressArticle;
  index: number;
}) => {
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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={cardRef}
      className="relative group h-full"
      style={{ perspective: "1000px" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.article
        className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-zinc-800/95 via-zinc-900/95 to-zinc-800/95 backdrop-blur-xl shadow-[0_0_40px_rgba(212,175,55,0.15),inset_0_1px_0_rgba(255,255,255,0.05)] h-full flex flex-col"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ scale: { duration: 0.2 } }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/20 pointer-events-none" />

        <motion.div
          className="absolute -top-10 left-1/2 -translate-x-1/2 w-[120%] h-24 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(212,175,55,0.2) 0%, transparent 60%)",
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
              target.src =
                "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&h=400&fit=crop";
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
              {new Date(article.date).toLocaleDateString("pl-PL")}
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

  const prefersReducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

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

  // Używamy hooka do synchronizacji ScrollTrigger z Lenis
  const { refresh } = useScrollTriggerSync({
    refreshOnMount: true,
    refreshDelay: 200,
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Force initial states
      gsap.set(badgeRef.current, { opacity: 0, y: 40, scale: 0.9 });
      gsap.set(titleRef.current, { opacity: 0, y: 60 });
      gsap.set(descRef.current, { opacity: 0, y: 40 });

      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        const angle = (i % 2 === 0 ? -1 : 1) * 5;
        gsap.set(card, {
          opacity: 0,
          y: 100,
          rotateX: 10,
          rotateY: angle,
          scale: 0.9,
        });
      });

      const headerTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "top 60%",
          toggleActions: "play none none reverse",
          once: true,
        },
      });

      headerTl
        .fromTo(
          badgeRef.current,
          { opacity: 0, y: 40, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(1.5)" },
          0,
        )
        .fromTo(
          titleRef.current,
          { opacity: 0, y: 60, clipPath: "inset(0% 0% 100% 0%)" },
          {
            opacity: 1,
            y: 0,
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1,
            ease: "expo.out",
          },
          0.2,
        )
        .fromTo(
          descRef.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" },
          0.4,
        );

      cardsRef.current.forEach((card, i) => {
        if (!card) return;

        const angle = (i % 2 === 0 ? -1 : 1) * 5;

        gsap.fromTo(
          card,
          {
            opacity: 0,
            y: 100,
            rotateX: 10,
            rotateY: angle,
            scale: 0.9,
          },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            rotateY: 0,
            scale: 1,
            duration: 1.0,
            ease: "expo.out",
            scrollTrigger: {
              trigger: card,
              start: "top bottom",
              end: "top 70%",
              toggleActions: "play none none reverse",
              once: true,
            },
          },
        );
      });

      if (ctaRef.current) {
        gsap.fromTo(
          ctaRef.current,
          { opacity: 0, y: 50, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            ease: "back.out(1.3)",
            scrollTrigger: {
              trigger: ctaRef.current,
              start: "top bottom",
              end: "top 70%",
              toggleActions: "play none none reverse",
              once: true,
            },
          },
        );
      }
    }, sectionRef);

    // Odświeżamy ScrollTriggery po zakończeniu animacji
    refresh(true);

    return () => ctx.revert();
  }, [loading, articles, prefersReducedMotion, refresh]);

  return (
    <section
      ref={sectionRef}
      id="press-section"
      className="py-20 relative overflow-hidden"
      style={{
        perspective: "2000px",
        transformStyle: "preserve-3d",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.015] to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div
          className="text-center mb-16"
          style={{ transformStyle: "preserve-3d" }}
        >
          <span
            ref={badgeRef}
            className="inline-block px-4 py-1.5 rounded-full bg-gold/10 text-gold text-sm font-medium tracking-wide mb-6"
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
            }}
          >
            Media o nas
          </span>
          <h2
            ref={titleRef}
            className="font-display text-3xl md:text-4xl text-white font-bold leading-tight mb-4"
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
            }}
          >
            W centrum <span className="text-gold">uwagi</span>
          </h2>
          <p
            ref={descRef}
            className="text-white/70 max-w-2xl mx-auto"
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
            }}
          >
            Zobacz, jak media opisują nasze sukcesy w hodowli gołębi pocztowych.
          </p>
        </div>

        {/* YouTube Video Section - only show when showVideo is true */}
        {showVideo && (
          <motion.div
            className="max-w-4xl mx-auto mb-16"
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
                  src="https://www.youtube.com/embed/s5R-tUv5d2o"
                  title="Tadeusz Pałka - Lubań"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </motion.div>
        )}

        {!loading && articles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {articles.map((article, index) => (
              <div
                key={article.id}
                ref={(el) => {
                  if (el) cardsRef.current[index] = el;
                }}
              >
                <PressArticleCard article={article} index={index} />
              </div>
            ))}
          </div>
        )}

        <div
          ref={ctaRef}
          className="text-center"
          style={{
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
          }}
        >
          <Button
            variant="outline"
            size="lg"
            className="border-gold/50 text-gold-light hover:bg-gold hover:text-black hover:border-gold transition-all duration-300"
            asChild
          >
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
