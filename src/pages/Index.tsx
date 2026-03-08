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
import { MagneticButton } from "@/components/effects/MagneticButton";

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

const StatCard = memo(
  ({
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
    const spotlightX = useMotionValue(50);
    const spotlightY = useMotionValue(50);

    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), {
      stiffness: 200,
      damping: 25,
    });
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), {
      stiffness: 200,
      damping: 25,
    });

    const handleMouseMove = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
        const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

        spotlightX.set(xPercent);
        spotlightY.set(yPercent);

        mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
        mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
      },
      [mouseX, mouseY, spotlightX, spotlightY],
    );

    const handleMouseLeave = useCallback(() => {
      mouseX.set(0);
      mouseY.set(0);
      // Let spotlight stay where it was for a smoother transition
    }, [mouseX, mouseY]);

    return (
      <motion.div
        ref={cardRef}
        className="p-3.5 rounded-xl spotlight-card relative group text-center"
        style={
          {
            transformStyle: "preserve-3d",
            rotateX,
            rotateY,
            "--mouse-x": useTransform(spotlightX, (v) => `${v}%`),
            "--mouse-y": useTransform(spotlightY, (v) => `${v}%`),
          } as any
        }
        whileHover={{ scale: 1.05 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-gold/5 transition-opacity duration-500 group-hover:opacity-100 opacity-20 pointer-events-none" />

        <div
          className="w-9 h-9 mx-auto mb-2.5 rounded-lg flex items-center justify-center relative z-10"
          style={{
            background: "#A68E4E",
            boxShadow: "0 0 15px rgba(166,142,78,0.4)",
          }}
        >
          <Icon className="w-5 h-5 text-black" />
        </div>
        <div className="text-xl font-bold text-white mb-0.5 tracking-tight group-hover:scale-110 transition-transform duration-300">
          {value}
        </div>
        <div className="text-[8px] font-black uppercase tracking-[0.35em] text-white/40 group-hover:text-gold/80 transition-colors">
          {label}
        </div>
      </motion.div>
    );
  },
);

StatCard.displayName = "StatCard";

// ═══════════════════════════════════════════════════════════════════════════
// HERO PREMIUM
// ═══════════════════════════════════════════════════════════════════════════
const HeroPremium = memo(() => {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden premium-mesh-bg">
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
          className="text-4xl md:text-6xl lg:text-7xl font-bold font-display mb-6 tracking-tight"
        >
          <span className="text-white shimmer-text">Pałka</span>{" "}
          <span className="text-gold">MTM</span>
          <br />
          <span className="relative inline-block mt-2">
            <span className="text-white/90">Geny Zwycięzców</span>
            <motion.div
              className="absolute -bottom-2 left-0 h-[2px] bg-gold"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 1 }}
            />
          </span>
        </motion.h1>

        <motion.p
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0 },
          }}
          className="text-xs md:text-sm text-slate-100/70 font-display italic max-w-xl mb-12 leading-relaxed tracking-wider"
        >
          <span className="font-black text-white">
            Trzy pokolenia pasji. Setki mistrzostw.
          </span>
          <br />
          <span className="font-medium text-white/80">
            Elitarne gołębie pocztowe z Dolnego Śląska.
          </span>
        </motion.p>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0 },
          }}
          className="flex flex-col sm:flex-row items-start justify-start gap-4 mb-20"
        >
          <MagneticButton strength={0.2}>
            <Link
              to="/champions"
              className="group flex items-center gap-3 px-8 py-3.5 rounded-full font-bold text-sm bg-gold text-zinc-950 shadow-[0_0_20px_rgba(166,142,78,0.3)] hover:shadow-[0_0_35px_rgba(166,142,78,0.5)] transition-shadow"
            >
              <span>Eksploruj Championy</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </MagneticButton>
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
    const spotlightX = useMotionValue(50);
    const spotlightY = useMotionValue(50);

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
      const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
      const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

      spotlightX.set(xPercent);
      spotlightY.set(yPercent);

      mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
      mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
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
        className={`h-full flex flex-col p-6 rounded-2xl spotlight-card transition-all duration-300 relative group overflow-hidden ${className || ""}`}
        ref={cardRef}
        style={
          {
            transformStyle: "preserve-3d",
            rotateX,
            rotateY,
            "--mouse-x": useTransform(spotlightX, (v) => `${v}%`),
            "--mouse-y": useTransform(spotlightY, (v) => `${v}%`),
          } as any
        }
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 relative z-10"
          style={{
            background: "#A68E4E",
            boxShadow: "0 0 15px rgba(166,142,78,0.4)",
          }}
        >
          <feature.icon className="w-6 h-6 text-black" />
        </div>
        <h3 className="text-xl font-bold font-display text-white mb-3 relative z-10">
          {feature.title}
        </h3>
        <p className="text-white/50 text-sm leading-relaxed relative z-10 font-medium">
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
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold font-display mb-6 uppercase">
          <span className="heading-black">Nasza Filozofia</span>
          {" – "}
          <span className="gold-heading">Geny Mistrzów</span>
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
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold mb-6 uppercase tracking-[0.18em]">
              <span className="text-zinc-900">Gotowy na swojego</span>{" "}
              <span className="text-[#A68E4E]">Championa?</span>
            </h2>
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto font-display italic leading-relaxed">
              Przeglądaj naszą ekskluzywną kolekcję i znajdź swój klucz do
              sukcesu.
            </p>
            <div className="flex justify-center">
              <MagneticButton strength={0.15}>
                <Link
                  to="/auctions"
                  className="inline-flex items-center gap-3 px-10 py-4 rounded-full font-bold text-lg bg-gold text-zinc-950 shadow-[0_0_25px_rgba(166,142,78,0.3)] hover:shadow-[0_0_40px_rgba(166,142,78,0.5)] transition-all"
                >
                  Przejdź do Aukcji
                  <ArrowRight className="w-6 h-6" />
                </Link>
              </MagneticButton>
            </div>
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
