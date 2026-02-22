import { useState, useEffect, useRef } from "react";
import { logger } from "@/lib/logger";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Newspaper,
  Calendar,
  Filter,
  ArrowRight,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { PressService, PressArticle } from "@/services/pressService";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
} from "framer-motion";
import { gsap } from "@/lib/gsapConfig";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useLenisContext } from "@/components/animations/SmoothScrollProvider";

const PressArticleCard = ({
  article,
  index,
}: {
  article: PressArticle;
  index: number;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [80, 0, -80]);
  const scale = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    [0.9, 1, 1, 0.9],
  );

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
    <div className="relative group h-full press-card-reveal">
      <motion.div
        ref={cardRef}
        className="h-full"
        style={{ perspective: "1000px", opacity, y, scale }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
        <motion.article
          className="relative overflow-hidden rounded-2xl border border-white/40 backdrop-blur-xl shadow-[0_16px_48px_-12px_rgba(0,0,0,0.8)] h-full flex flex-col"
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
            background:
              "radial-gradient(circle at top, rgba(166, 142, 78, 0.15), transparent 70%), linear-gradient(180deg, rgba(5, 5, 5, 0.98) 0%, rgba(10, 10, 10, 0.96) 50%, rgba(15, 15, 15, 0.95) 100%)",
          }}
          whileHover={{ scale: 1.02 }}
          transition={{ scale: { duration: 0.2 } }}
        >
          <div className="relative aspect-[16/10] overflow-hidden bg-transparent">
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
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-3 flex-wrap">
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gold/10 text-gold-dark">
                <Newspaper className="w-3 h-3 gold-icon" />
                {article.publication}
              </span>
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/10 text-white/70">
                <Calendar className="w-3 h-3 gold-icon" />
                {new Date(article.date).toLocaleDateString("pl-PL")}
              </span>
            </div>

            <h3 className="font-display text-xl font-semibold mb-3 line-clamp-2 text-[#A68E4E] transition-colors">
              {article.title}
            </h3>

            <p className="text-white/70 text-sm line-clamp-4 mb-4">
              {article.excerpt}
            </p>

            <div className="mt-auto">
              <Button
                size="sm"
                className="w-full relative z-40 bg-[#A68E4E] hover:bg-[#8e7a42] text-zinc-950 font-bold border-none transition-colors"
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
    </div>
  );
};

const PressPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
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
      import("@/lib/gsapAnimations").then(({ initHeroTextSplit }) => {
        initHeroTextSplit();
      });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // useScrollAnimation: Hero and Scroll reveal
  useScrollAnimation(
    heroRef,
    [
      // Hero content stagger reveal
      {
        targets: () => heroContentRef.current?.children,
        fromVars: { opacity: 0, y: 60 },
        toVars: {
          opacity: 1,
          y: 0,
          stagger: 0.25,
          duration: 1.5,
          ease: "expo.out",
        },
        delay: 0.3,
      },
      // Hero Parallax Scrub
      {
        targets: () => heroContentRef.current,
        toVars: {
          y: 100,
          opacity: 0.4,
          scale: 0.98,
          ease: "none",
        },
        scrollTrigger: {
          trigger: () => heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
        },
      },
      {
        targets: ".press-card-reveal",
        fromVars: { opacity: 0, y: 50 },
        toVars: {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.15,
          ease: "expo.out",
          scrollTrigger: {
            trigger: ".container",
            start: "top 80%",
          },
        },
      },
    ],
    [pressArticles],
  );

  useEffect(() => {
    const loadArticles = async () => {
      try {
        const articles = await PressService.loadArticles();
        setPressArticles(articles);
      } catch (error) {
        logger.error("Failed to load articles:", error);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, []);

  const categories = [
    { value: "all", label: "Wszystkie" },
    { value: "magazine", label: "Magazyny" },
    { value: "newspaper", label: "Gazety" },
    { value: "online", label: "Online" },
  ];

  const filteredArticles =
    selectedCategory === "all"
      ? pressArticles
      : pressArticles.filter(
          (article) => article.category === selectedCategory,
        );

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
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
          <p className="text-slate-600 text-lg">Ładowanie artykułów...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <Header />

      <main className="flex-1">
        <section
          ref={heroRef}
          className="relative min-h-[70vh] flex items-center justify-center z-10 pt-20 bg-transparent"
        >
          <div
            ref={heroContentRef}
            className="relative z-40 container mx-auto px-4 text-center"
          >
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-8"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25), rgba(166,142,78,0.85))",
                boxShadow: "0 0 20px #A68E4E55",
                border: "1px solid rgba(166,142,78,0.3)",
              }}
            >
              <Newspaper className="w-12 h-12 md:w-16 md:h-16 gold-icon" />
            </motion.div>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">
              <span className="heading-black">Prasa</span>{" "}
              <span className="gold-heading">i Media</span>
            </h1>
            <p className="text-zinc-200 text-lg md:text-xl max-w-2xl mx-auto shadow-sm">
              Przeczytaj, co piszą o nas media branżowe i ogólnopolskie.
            </p>
          </div>
        </section>

        {/* Wideo YouTube */}
        <section className="relative z-10 py-10 bg-transparent">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto relative overflow-hidden rounded-3xl border border-gold/20 bg-black/20 backdrop-blur-md shadow-[0_18px_48px_rgba(0,0,0,0.12)]">
              <div className="absolute inset-0 pointer-events-none" />
              <div className="aspect-video">
                <iframe
                  src="https://www.youtube.com/embed/utXkaMWyZfk"
                  title="MTM Pałka - video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-10 py-20">
          <div className="container mx-auto px-4">
            <motion.div
              className="flex flex-wrap items-center gap-4 mb-12 p-5 md:p-6 rounded-2xl border-2 border-[#A68E4E] bg-black/20 backdrop-blur-md shadow-[0_18px_48px_rgba(0,0,0,0.12)]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 text-slate-800 font-bold uppercase tracking-widest text-xs">
                <Filter className="w-4 h-4 text-gold" />
                <span>Filtruj:</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {categories.map((category, index) => (
                  <motion.div
                    key={category.value}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCategory(category.value)}
                      className={`px-6 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
                        selectedCategory === category.value
                          ? "bg-[#A68E4E] text-zinc-950 shadow-lg shadow-gold/20 scale-105"
                          : "bg-transparent text-white/60 hover:text-[#A68E4E] hover:bg-gold/5"
                      }`}
                    >
                      {category.label}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {filteredArticles.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredArticles.map((article, index) => (
                  <PressArticleCard
                    key={article.id}
                    article={article}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <motion.div
                className="max-w-2xl mx-auto text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="relative overflow-hidden pb-12 pt-24 sm:pb-16 sm:pt-28 md:pb-20 md:pt-32">
                  <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/15 to-black/8 backdrop-blur-[1px]" />
                  <div className="container mx-auto px-4">
                    <div className="rounded-3xl border border-dashed border-gold/40 bg-black/40 backdrop-blur-md p-8 text-center shadow-lg">
                      <p className="text-zinc-200">
                        Brak artykułów w wybranej kategorii.
                      </p>
                      <p className="text-zinc-400 text-sm">
                        Spróbuj wybrać inną kategorię lub zobacz wszystkie
                        artykuły
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* ... */}
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default PressPage;
