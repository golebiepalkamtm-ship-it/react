import React, {
  useRef,
  useEffect,
  useCallback,
  memo,
  useState,
  useMemo,
} from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Trophy, Zap, Award, Star } from "lucide-react";
import Header from "@/components/Header";
import { Carousel3D } from "@/components/gallery/Carousel3D";
import AboutSection from "@/components/AboutSection";
import PressSection from "@/components/PressSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import { UnifiedModal } from "@/components/ui/UnifiedModal";
import { useAuth } from "@/contexts/AuthContext";
import { initScrollStory } from "@/lib/initScrollStory";

// ─── Type definitions ─────────────────────────────────────────────────────
interface AuthMessage {
  type: "success" | "error" | "warning" | "info";
  title: string;
  text: string;
  action?: () => void;
  actionText?: string;
}

const getAuthMessage = (user: any, profile: any): AuthMessage | null => {
  if (!user || !profile) return null;
  switch (profile.role) {
    case "USER_REGISTERED":
      return {
        type: "warning" as const,
        title: "Wymagana weryfikacja",
        text: "Twój adres email nie został jeszcze zweryfikowany. Sprawdź swoją skrzynkę odbiorczą, aby uzyskać pełny dostęp.",
        action: () => window.location.reload(),
        actionText: "Odśwież",
      };
    case "USER_EMAIL_VERIFIED":
      return {
        type: "info" as const,
        title: "Witaj w Pałka MTM!",
        text: `Jesteś zalogowany jako ${profile.email || user.email}. Uzupełnij profil i zweryfikuj telefon, aby licytować.`,
      };
    default:
      return null;
  }
};

const GOLD = "#A68E4E";

const StatCard = ({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType<{ className?: string }>;
  value: string;
  label: string;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), {
    stiffness: 280,
    damping: 14,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), {
    stiffness: 280,
    damping: 14,
  });
  const translateX = useSpring(useTransform(mouseX, [-0.5, 0.5], [12, -12]), {
    stiffness: 220,
    damping: 16,
  });
  const translateY = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), {
    stiffness: 220,
    damping: 16,
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
    <motion.div
      ref={cardRef}
      className="p-4 rounded-xl border border-teal-500/40 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.8),0_0_30px_rgba(20,184,166,0.3)] backdrop-blur-xl relative overflow-hidden group"
      style={{
        transformStyle: "preserve-3d",
        rotateX,
        rotateY,
        x: translateX,
        y: translateY,
        background:
          "linear-gradient(185deg, rgba(2, 10, 19, 0.95) 0%, rgba(6, 35, 46, 0.9) 45%, rgba(9, 61, 77, 0.85) 100%)",
      }}
      whileHover={{ scale: 1.08 }}
      transition={{ type: "spring", stiffness: 280, damping: 18 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-teal-400/30 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(66,192,206,0.7),transparent_75%)] pointer-events-none" />
      <div className="absolute inset-0 bg-teal-950/20 pointer-events-none" />
      <div
        className="w-10 h-10 mx-auto mb-3 rounded-full flex items-center justify-center border border-gold/30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 30%, rgba(66,192,206,0.3), rgba(9,61,77,0.85))",
          boxShadow: `0 0 25px rgba(66, 192, 206, 0.4)`,
        }}
      >
        <Icon className="w-5 h-5 gold-icon" />
      </div>
      <div className="text-xl font-bold text-foreground mb-1">{value}</div>
      <div className="text-muted-foreground text-[9px] uppercase tracking-[0.3em]">
        {label}
      </div>
    </motion.div>
  );
};

// Pre-defined static particles for consistent rendering
const STATIC_PARTICLES = [
  { id: 0, left: "12%", top: "8%", size: 3, delay: 0.5, duration: 5 },
  { id: 1, left: "25%", top: "45%", size: 2, delay: 1.2, duration: 4 },
  { id: 2, left: "42%", top: "22%", size: 4, delay: 2.1, duration: 6 },
  { id: 3, left: "58%", top: "78%", size: 3, delay: 0.8, duration: 5 },
  { id: 4, left: "71%", top: "33%", size: 2, delay: 1.5, duration: 4 },
  { id: 5, left: "85%", top: "55%", size: 5, delay: 2.8, duration: 7 },
  { id: 6, left: "5%", top: "68%", size: 3, delay: 0.2, duration: 5 },
  { id: 7, left: "33%", top: "91%", size: 2, delay: 1.9, duration: 4 },
  { id: 8, left: "62%", top: "12%", size: 4, delay: 3.2, duration: 6 },
  { id: 9, left: "78%", top: "86%", size: 3, delay: 0.7, duration: 5 },
  { id: 10, left: "18%", top: "55%", size: 2, delay: 2.4, duration: 4 },
  { id: 11, left: "52%", top: "38%", size: 5, delay: 1.1, duration: 7 },
  { id: 12, left: "88%", top: "20%", size: 3, delay: 2.9, duration: 5 },
  { id: 13, left: "35%", top: "72%", size: 2, delay: 0.4, duration: 4 },
  { id: 14, left: "95%", top: "62%", size: 4, delay: 1.8, duration: 6 },
  { id: 15, left: "8%", top: "28%", size: 3, delay: 3.5, duration: 5 },
  { id: 16, left: "48%", top: "58%", size: 2, delay: 1.3, duration: 4 },
  { id: 17, left: "72%", top: "4%", size: 5, delay: 2.6, duration: 7 },
  { id: 18, left: "22%", top: "82%", size: 3, delay: 0.9, duration: 5 },
  { id: 19, left: "68%", top: "48%", size: 2, delay: 2.2, duration: 4 },
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// HERO PREMIUM
// ═══════════════════════════════════════════════════════════════════════════
const HeroPremium = memo(() => {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-zinc-950">
      {/* Beautiful Aurora Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Base gradient - deep dark */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950" />

        {/* Aurora effect - top */}
        <div className="hero-blur absolute top-0 left-1/4 w-[600px] h-[400px] bg-gradient-to-r from-amber-500/20 via-yellow-400/15 to-orange-500/20 rounded-full blur-[100px] animate-pulse" />

        {/* Aurora effect - middle left */}
        <div className="hero-blur absolute top-1/3 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-yellow-600/15 via-amber-500/10 to-transparent rounded-full blur-[120px]" />

        {/* Aurora effect - right side */}
        <div className="hero-blur absolute top-1/4 right-0 w-[700px] h-[600px] bg-gradient-to-l from-yellow-500/10 via-amber-400/8 to-transparent rounded-full blur-[140px]" />

        {/* Bottom aurora - gold/amber */}
        <div className="hero-blur absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-gradient-to-t from-amber-600/15 via-yellow-500/10 to-transparent rounded-full blur-[100px]" />

        {/* Center glow */}
        <div className="hero-blur absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-radial from-amber-500/8 via-transparent to-transparent rounded-full blur-[80px]" />

        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(212, 175, 55, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212, 175, 55, 0.3) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Vignette effect */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-zinc-950/80" />

        {/* Wow Factor - Subtle Watermark Decoration */}
        <div className="absolute top-1/2 -right-20 -translate-y-1/2 w-[600px] h-[600px] opacity-[0.04] pointer-events-none select-none">
          <Trophy className="w-full h-full text-gold rotate-12" />
        </div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {STATIC_PARTICLES.map((particle) => (
          <div
            key={particle.id}
            className="floating-particle absolute rounded-full"
            style={{
              left: particle.left,
              top: particle.top,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: `radial-gradient(circle, rgba(212, 175, 55, 0.8) 0%, rgba(212, 175, 55, 0.2) 70%, transparent 100%)`,
              boxShadow:
                "0 0 6px rgba(212, 175, 55, 0.5), 0 0 12px rgba(212, 175, 55, 0.3)",
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="parallax-layer absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent pointer-events-none" />
      <div className="parallax-layer absolute -inset-x-20 top-10 h-64 bg-gradient-to-r from-gold/15 via-transparent to-gold/10 blur-3xl pointer-events-none" />
      <motion.div
        ref={contentRef}
        className="relative z-10 max-w-6xl mx-auto px-4 md:px-12 w-full text-left"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.3 },
          },
        }}
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0 },
          }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-400/20 text-gray-400 text-[9px] font-medium backdrop-blur-sm uppercase tracking-[0.4em]">
            <Star className="w-4 h-4 gold-icon" />
            <span>Hodowla Gołębi Pocztowych od 1979</span>
          </span>
        </motion.div>

        <motion.h1
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: { opacity: 1, y: 0 },
          }}
          className="text-3xl md:text-5xl lg:text-6xl font-bold font-display mb-6 gold-heading tracking-tight"
        >
          Pałka <span className="text-white">MTM</span> - Geny Zwycięzców
        </motion.h1>

        <motion.p
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0 },
          }}
          className="text-xs md:text-sm text-slate-100/50 font-display italic max-w-xl mb-12 leading-relaxed tracking-wider"
        >
          Wyniki budowane przez pokolenia. Topowe gołębie pocztowe z Dolnego
          Śląska.
        </motion.p>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0 },
          }}
          className="flex flex-col sm:flex-row items-start justify-start gap-4 mb-20"
        >
          <Link
            to="/champions"
            className="group flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm gold-button"
          >
            <span>Eksploruj Championy</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-zinc-950" />
          </Link>
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 50 },
            visible: { opacity: 1, y: 0 },
          }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl"
          style={{ perspective: "1200px", transformStyle: "preserve-3d" }}
        >
          {[
            { icon: Trophy, value: "150+", label: "Mistrzostw" },
            { icon: Award, value: "45+", label: "Lat Doświadczenia" },
            { icon: Zap, value: "3", label: "Pokolenia Hodowców" },
          ].map((stat) => (
            <StatCard
              key={stat.label}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
            />
          ))}
        </motion.div>

        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent z-20" />
      </motion.div>
    </section>
  );
});

HeroPremium.displayName = "HeroPremium";

// ═══════════════════════════════════════════════════════════════════════════
// FEATURE CARD PREMIUM
// ═══════════════════════════════════════════════════════════════════════════
interface FeatureData {
  icon: React.ElementType<{ className?: string }>;
  title: string;
  description: string;
}

const FeatureCardPremium = memo(
  ({
    feature,
    index,
    className,
  }: {
    feature: FeatureData;
    index: number;
    className?: string;
  }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
      stiffness: 160,
      damping: 18,
    });
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
      stiffness: 160,
      damping: 18,
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
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        className={`h-full flex flex-col p-6 rounded-xl border border-gold/40 bg-zinc-950/20 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.4)] backdrop-blur-xl backdrop-brightness-125 transition-all duration-300 relative group overflow-hidden ${className || ""}`}
        ref={cardRef}
        style={{ transformStyle: "preserve-3d", rotateX, rotateY }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(66,192,206,0.12),transparent_60%)] pointer-events-none" />
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 border border-gold/30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2), rgba(166,142,78,0.9))",
            boxShadow: `0 0 20px ${GOLD}55`,
          }}
        >
          <feature.icon className="w-6 h-6 gold-icon" />
        </div>
        <h3 className="text-lg font-semibold font-display text-white mb-3">
          {feature.title}
        </h3>
        <p className="text-white/60 text-sm leading-relaxed">
          {feature.description}
        </p>
      </motion.div>
    );
  },
);

FeatureCardPremium.displayName = "FeatureCardPremium";

const FeaturesSection = () => {
  const features: FeatureData[] = [
    {
      icon: Trophy,
      title: "Elitarne Rodowody",
      description:
        "Każdy gołąb pochodzi z linii wielokrotnych mistrzów i championów.",
    },
    {
      icon: Zap,
      title: "Prędkość & Wytrzymałość",
      description:
        "Rekordy prędkości i dystansu potwierdzone w najważniejszych zawodach.",
    },
    {
      icon: Award,
      title: "Gwarancja Jakości",
      description:
        "Pełna dokumentacja, badania DNA i historia lotów każdego ptaka.",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto py-24 px-4 section-pin relative overflow-hidden">
      <div className="pin-overlay absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60 pointer-events-none" />
      <div className="text-center mb-16">
        <span className="inline-block px-4 py-1.5 border border-gold/20 rounded-full text-[10px] tracking-[0.2em] text-gold uppercase mb-4 bg-gold/5 backdrop-blur-sm">
          Wartości
        </span>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold font-display mb-6 uppercase tracking-tight bg-gradient-to-r from-white via-white to-[#42C0CE] text-transparent bg-clip-text">
          Nasza Filozofia – Geny Mistrzów
        </h2>
        <p className="font-display italic text-white/40 text-[11px] md:text-xs max-w-xl mx-auto">
          Fundamenty naszej pasji, które prowadzą nas do zwycięstwa.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <FeatureCardPremium
            key={i}
            feature={f}
            index={i}
            className="pin-card"
          />
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN INDEX COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
const Index = () => {
  const { user, profile, loading } = useAuth();
  const [showAuthMessage, setShowAuthMessage] = useState(() => {
    return !sessionStorage.getItem("hasShownWelcome");
  });

  const authMessage = useMemo(() => {
    if (!loading && user && profile && showAuthMessage) {
      return getAuthMessage(user, profile);
    }
    return null;
  }, [loading, user, profile, showAuthMessage]);

  useEffect(() => {
    if (authMessage && showAuthMessage) {
      sessionStorage.setItem("hasShownWelcome", "true");
    }
  }, [authMessage, showAuthMessage]);

  useEffect(() => {
    const cleanup = initScrollStory();
    return () => cleanup();
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-foreground selection:bg-gray-400 selection:text-zinc-950">
      <Header />

      <main className="relative z-0">
        <div className="section-wrapper">
          <HeroPremium />
        </div>

        <div className="section-wrapper">
          <AboutSection />
        </div>

        <div className="section-wrapper">
          <Carousel3D />
        </div>

        <div className="section-wrapper section-stagger">
          <FeaturesSection />
        </div>

        <div className="py-12 section-wrapper">
          <PressSection />
        </div>

        <section className="py-24 px-4 bg-transparent section-wrapper section-stagger">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold mb-6 uppercase tracking-[0.18em] bg-gradient-to-r from-white via-white to-[#42C0CE] text-transparent bg-clip-text">
              Gotowy na swojego Championa?
            </h2>
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto font-display italic leading-relaxed">
              Przeglądaj naszą ekskluzywną kolekcję i znajdź swój klucz do
              sukcesu.
            </p>
            <Link
              to="/auctions"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-bold text-base gold-button"
            >
              Przejdź do Aukcji
              <ArrowRight className="w-5 h-5 text-zinc-950" />
            </Link>
          </motion.div>
        </section>

        <div className="section-wrapper">
          <ContactSection />
        </div>
      </main>

      <Footer />

      {authMessage && (
        <UnifiedModal
          isOpen={showAuthMessage}
          onClose={() => setShowAuthMessage(false)}
          type={authMessage.type}
          title={authMessage.title}
          message={authMessage.text}
          confirmButton={{
            text: authMessage.actionText || "OK",
            onClick: authMessage.action || (() => setShowAuthMessage(false)),
          }}
        />
      )}
    </div>
  );
};

export default Index;
