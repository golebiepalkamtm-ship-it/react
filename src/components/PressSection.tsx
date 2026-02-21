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
import { gsap } from "@/lib/gsapConfig";
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
        className="relative overflow-hidden rounded-2xl border border-white/40 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl h-full flex flex-col"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          background:
            "radial-gradient(circle at top, rgba(66, 192, 206, 0.18), transparent 55%), linear-gradient(185deg, rgba(2, 10, 19, 0.96) 0%, rgba(6, 35, 46, 0.93) 45%, rgba(9, 61, 77, 0.9) 100%)",
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ scale: { duration: 0.2 } }}
      >
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
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gold/10 text-gold-light/90 border border-gold/30">
              <Newspaper className="w-3 h-3 text-[#C8AE68]" />
              {article.publication}
            </span>
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 text-white/60 border border-white/10">
              <Calendar className="w-3 h-3 text-[#C8AE68]" />
              {new Date(article.date).toLocaleDateString("pl-PL")}
            </span>
          </div>

          <h3 className="font-display text-xl font-semibold mb-3 line-clamp-2 text-white transition-colors">
            {article.title}
          </h3>

          <p className="text-white/80 text-sm font-medium line-clamp-4 mb-4">
            {article.excerpt}
          </p>

          <div className="mt-auto">
            <Button
              className="w-full inline-flex items-center justify-center bg-[#A68E4E] text-zinc-900 hover:bg-[#A68E4E]/90 border-0 font-bold uppercase tracking-wider py-5 rounded-full hover:scale-[1.05] active:scale-[0.95] transition-all shadow-md"
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

  // Używamy hooka do synchronizacji ScrollTrigger z Lenis - removed
  // const { refresh } = useScrollTriggerSync({
  //   refreshOnMount: true,
  //   refreshDelay: 200,
  // });

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
        // scrollTrigger: {
        //   trigger: sectionRef.current,
        //   start: "top bottom",
        //   end: "top 60%",
        //   toggleActions: "play none none reverse",
        //   once: true,
        // },
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

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="press-section"
      className="min-h-screen flex items-center py-20 relative overflow-hidden"
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
            className="inline-block px-6 py-2 rounded-full bg-[#A68E4E] text-zinc-900 text-[10px] font-bold uppercase tracking-[0.2em] mb-6 shadow-lg shadow-gold/20"
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
            }}
          >
            Autorytet w branży
          </span>
          <h2
            ref={titleRef}
            className="font-display text-2xl md:text-3xl lg:text-4xl font-bold leading-tight uppercase tracking-[0.18em] mb-8"
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
            }}
          >
            <span className="text-black">Pałka MTM w Mediach</span> –{" "}
            <span className="text-[#A68E4E]">Standard Doskonałości</span>
          </h2>
          <p
            ref={descRef}
            className="text-white text-lg md:text-xl max-w-2xl mx-auto mb-12 font-light leading-relaxed"
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
            }}
          >
            Nasza pasja i rekordowe wyniki są regularnie doceniane przez
            najbardziej prestiżowe magazyny oraz portale branżowe w całej
            Europie.
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
            <div className="relative overflow-hidden rounded-2xl border-2 border-[#A68E4E] bg-[#0a0a0a] shadow-[0_40px_100px_rgba(0,0,0,0.9),0_20px_40px_rgba(0,0,0,0.7)]">
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
