import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ImageOff,
  MapPin,
  MessageSquareQuote,
  Quote,
  Sparkles,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddReferenceForm } from "@/components/references/AddReferenceForm";
import { type Reference, referenceService } from "@/services/referenceService";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { UnifiedModal } from "@/components/ui/UnifiedModal";
import AccountModal from "@/components/AccountModal";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface ReferenceCardProps {
  reference: Reference;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

function ReferenceCard({
  reference,
  index,
  isActive,
  onClick,
}: ReferenceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [50, 0, -50]);

  const getPrimaryImage = () => {
    const img = reference?.images?.[0];
    return typeof img === "string" && img.length > 0 ? img : null;
  };

  return (
    <motion.div
      ref={cardRef}
      style={{ opacity, y }}
      className={`reference-card group cursor-pointer rounded-2xl border p-6 transition-all duration-500 bg-white shadow-lg
        ${isActive ? "border-gold/50 scale-[1.015]" : "border-gold/20 hover:border-gold/40"}
      `}
      onClick={onClick}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ scale: isActive ? 1.02 : 1.01 }}
    >
      {isActive && (
        <motion.div
          className="absolute -top-8 left-1/2 -translate-x-1/2 w-[100%] h-24 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(250,204,21,0.25) 0%, transparent 60%)",
          }}
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <div className="relative flex items-center gap-4 mb-4">
        <div
          className={`
          w-14 h-14 rounded-full overflow-hidden border-2 flex-shrink-0 bg-white
          ${isActive ? "border-gold/60 shadow-[0_0_20px_rgba(212,175,55,0.25)]" : "border-gold/20"}
        `}
        >
          {getPrimaryImage() ? (
            <img
              src={getPrimaryImage() as string}
              alt={reference.breeder_name}
              className="w-full h-full object-cover object-top"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-100">
              <ImageOff className="w-5 h-5 text-slate-400" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className={`
            font-semibold truncate transition-colors
            ${isActive ? "text-gold-dark" : "text-slate-900 group-hover:text-gold-dark"}
          `}
          >
            {reference.breeder_name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="w-3 h-3 flex-shrink-0 text-gold" />
            <span className="truncate">{reference.location}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center mb-3">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < Math.max(1, Math.min(5, reference.rating)) ? "text-gold fill-gold" : "text-slate-200"}`}
          />
        ))}
        <span className="text-xs text-slate-600 ml-2">
          {reference.rating}/5
        </span>
      </div>

      <p className="text-sm text-slate-700 line-clamp-3 mb-3 italic">
        "{reference.opinion}"
      </p>

      {reference.pigeon_name && (
        <div className="flex items-center gap-2 text-xs text-gold-dark font-medium">
          <Trophy className="w-3 h-3" />
          {reference.pigeon_name}
        </div>
      )}
    </motion.div>
  );
}

export function ReferencesPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [references, setReferences] = useState<Reference[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);
  const [infoModal, setInfoModal] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "info" | "warning";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const heroContentRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -50]);

  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState({
    title: "",
    message: "",
  });
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Component-level animations using useScrollAnimation hook
  useScrollAnimation(
    heroRef as React.RefObject<HTMLElement>,
    [
      // Hero content children animation
      {
        targets: () => {
          const heroContent = heroContentRef.current;
          return heroContent?.children ? Array.from(heroContent.children) : [];
        },
        fromVars: { opacity: 0, y: 60 },
        toVars: {
          opacity: 1,
          y: 0,
          stagger: 0.25,
          duration: 1.8,
          ease: "power3.out",
          delay: 0.5,
        },
        scrollTrigger: {
          trigger: () => heroRef.current,
          start: "top+=100 bottom", // Dodano offset +100px - jeszcze wcześniejsze rozpoczęcie animacji
          end: "top 70%", // Zwiększono end point z 60% na 70%
          toggleActions: "play none none none",
          once: true,
        },
      },
      // Parallax scroll for hero
      {
        targets: heroContentRef,
        toVars: {
          y: 150,
          opacity: 0.3,
          scale: 0.95,
        },
        scrollTrigger: {
          trigger: () => heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
        },
      },
    ],
    [references],
  );

  // Reference cards animation
  useScrollAnimation(
    containerRef as React.RefObject<HTMLElement>,
    [
      {
        targets: ".reference-card",
        fromVars: { opacity: 0, y: 50 },
        toVars: {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
        },
        scrollTrigger: {
          trigger: ".reference-card",
          start: "top bottom-=200", // Zwiększono offset z 150px na 200px
          end: "top center",
          toggleActions: "play none none reverse",
          once: true,
        },
      },
    ],
    [references],
  );

  const roleActions = useMemo(
    () => ({
      USER_REGISTERED: () => {
        setVerificationMessage({
          title: "Wymagana weryfikacja emaila",
          message:
            "Aby dodać referencję, musisz najpierw zweryfikować swój adres email.\n\nSprawdź swoją skrzynkę odbiorczą i kliknij link weryfikacyjny.",
        });
        setShowVerificationModal(true);
      },
      USER_EMAIL_VERIFIED: () => {
        setVerificationMessage({
          title: "Wymagana pełna weryfikacja",
          message:
            'Aby dodać referencję, musisz uzupełnić swój profil i zweryfikować numer telefonu.\n\nKliknij "Uzupełnij profil" aby kontynuować.',
        });
        setShowVerificationModal(true);
      },
      USER_FULL_VERIFIED: () => {
        setIsFormOpen(true);
      },
      ADMIN: () => {
        setIsFormOpen(true);
      },
    }),
    [],
  );

  const handleAddReference = () => {
    if (!user) {
      setPendingRedirect("/references");
      setShowLoginPrompt(true);
      return;
    }

    if (!profile) {
      setInfoModal({
        isOpen: true,
        type: "info",
        title: "Informacja",
        message: "Ładowanie profilu...",
      });
      return;
    }

    const action = roleActions[profile.role as keyof typeof roleActions];
    if (action) {
      action();
    } else {
      setInfoModal({
        isOpen: true,
        type: "info",
        title: "Brak uprawnień",
        message: "Brak uprawnień do dodawania referencji.",
      });
    }
  };

  const loadReferences = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await referenceService.getReferences();
      setReferences(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReferences();
  }, [loadReferences]);

  useEffect(() => {
    if (references.length === 0) {
      setCurrentIndex(0);
      return;
    }
    if (currentIndex >= references.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex, references.length]);

  const currentRef = references[currentIndex];

  const stats = useMemo(() => {
    const avgRating =
      references.length > 0
        ? (
            references.reduce((acc, r) => acc + r.rating, 0) / references.length
          ).toFixed(1)
        : "0";
    return {
      total: references.length,
      avgRating,
    };
  }, [references]);

  const getPrimaryImage = (ref: Reference | undefined) => {
    const img = ref?.images?.[0];
    return typeof img === "string" && img.length > 0 ? img : null;
  };

  const getReferenceTitle = (ref: Reference) => {
    return ref.pigeon_name?.trim() || "Gołębie z hodowli MTM Pałka";
  };

  const formatDatePl = (iso: string | undefined) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("pl-PL");
  };

  const renderAchievements = (ref: Reference) => {
    if (!ref.achievements) return null;

    try {
      const parsed = JSON.parse(ref.achievements) as Array<{
        competition?: string;
        place?: number;
        date?: string;
      }>;
      if (!Array.isArray(parsed) || parsed.length === 0) return null;

      return (
        <ul className="space-y-1 text-slate-700 text-sm">
          {parsed.slice(0, 4).map((a, i) => (
            <li key={`achievement-${i}`} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gold/60" />
              {typeof a.place === "number" ? `${a.place}. miejsce` : "Wynik"}
              {a.competition ? ` — ${a.competition}` : ""}
              {a.date ? ` (${formatDatePl(a.date)})` : ""}
            </li>
          ))}
        </ul>
      );
    } catch {
      return <p className="text-slate-700 text-sm">{ref.achievements}</p>;
    }
  };

  const nextSlide = () => {
    if (references.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % references.length);
  };

  const prevSlide = () => {
    if (references.length === 0) return;
    setCurrentIndex(
      (prev) => (prev - 1 + references.length) % references.length,
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f7fb]">
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
          <p className="text-slate-600 text-lg">Ładowanie referencji...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen relative overflow-hidden bg-transparent"
    >
      <section
        ref={heroRef}
        className="relative min-h-[70vh] flex items-center justify-center z-10 pt-20"
      >
        <div className="absolute inset-0 overflow-hidden" />

        <div
          ref={heroContentRef}
          className="relative z-10 container mx-auto px-4 text-center"
        >
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-8"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25), rgba(166,142,78,0.85))",
              boxShadow: "0 0 20px #A68E4E55",
              border: "1px solid rgba(166,142,78,0.3)",
            }}
            animate={{
              boxShadow: [
                "0 0 30px rgba(212,175,55,0.2)",
                "0 0 60px rgba(212,175,55,0.4)",
                "0 0 30px rgba(212,175,55,0.2)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <MessageSquareQuote className="w-10 h-10 gold-icon" />
          </motion.div>

          <motion.h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-black mb-6">
            <span className="gold-heading">Referencje</span>
          </motion.h1>

          <motion.p
            className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Opinie zadowolonych hodowców o naszych gołębiach
          </motion.p>

          <motion.div
            className="flex flex-wrap justify-center gap-6 md:gap-12 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {[
              { label: "Referencji", value: stats.total, icon: Users },
              { label: "Średnia ocena", value: stats.avgRating, icon: Star },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6 + i * 0.1, type: "spring" }}
              >
                <div
                  className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-2"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25), rgba(166,142,78,0.85))",
                    boxShadow: "0 0 20px #A68E4E55",
                    border: "1px solid rgba(166,142,78,0.3)",
                  }}
                >
                  <stat.icon className="w-7 h-7 gold-icon" />
                </div>
                <div className="font-display text-3xl md:text-4xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-white/60 text-sm uppercase tracking-wider">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Button
              ref={triggerButtonRef}
              onClick={handleAddReference}
              className="gold-button text-zinc-950 font-bold px-8 py-3 rounded-full"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, rgba(166,142,78,0.9), rgba(166,142,78,0.8))",
                color: "#0f0f0f",
              }}
            >
              <MessageSquareQuote className="w-5 h-5 mr-2" />
              Dodaj referencję
            </Button>
          </motion.div>

          <motion.div
            className="mt-12 flex flex-col items-center gap-2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-white/50 text-sm uppercase tracking-widest">
              Przewijaj
            </span>
            <ChevronDown className="w-6 h-6 gold-icon" />
          </motion.div>
        </div>
      </section>

      {currentRef && (
        <section className="relative z-10 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <motion.div
                className="grid lg:grid-cols-2 gap-12 items-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="space-y-8">
                  <div className="relative">
                    <Quote className="absolute -top-4 -left-4 w-12 h-12 text-gold/20" />
                    <motion.blockquote
                      key={currentRef.id}
                      className="text-xl md:text-2xl text-white leading-relaxed italic pl-8"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      "{currentRef.opinion}"
                    </motion.blockquote>
                  </div>

                  <motion.div
                    className="flex items-center gap-2"
                    key={`rating-${currentRef.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-6 h-6 ${i < Math.max(1, Math.min(5, currentRef.rating)) ? "text-gold fill-gold" : "text-slate-200"}`}
                      />
                    ))}
                    <span className="text-white/60 ml-3">
                      {currentRef.rating}/5
                    </span>
                  </motion.div>

                  <motion.div
                    className="space-y-3"
                    key={`info-${currentRef.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3 className="text-2xl font-bold gold-heading">
                      {currentRef.breeder_name}
                    </h3>
                    <div className="flex items-center gap-2 text-white/70">
                      <MapPin className="w-4 h-4 gold-icon" />
                      <span>{currentRef.location}</span>
                    </div>
                    <div className="text-sm text-white/50">
                      {formatDatePl(currentRef.created_at)}
                    </div>
                  </motion.div>

                  <motion.div
                    className="relative overflow-hidden rounded-2xl border border-gold/30 bg-white p-6 shadow-lg"
                    key={`achievements-${currentRef.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/30 to-transparent pointer-events-none" />
                    <div className="relative flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-gold" />
                      </div>
                      <h4 className="font-semibold text-slate-900">
                        {getReferenceTitle(currentRef)}
                      </h4>
                    </div>
                    {renderAchievements(currentRef)}
                  </motion.div>
                </div>

                <div className="relative">
                  <motion.div
                    className="relative rounded-2xl overflow-hidden border border-gold/30 shadow-[0_18px_48px_rgba(0,0,0,0.12)] bg-white"
                    key={`image-${currentRef.id}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent z-10 pointer-events-none" />
                    {getPrimaryImage(currentRef) ? (
                      <div className="flex items-center justify-center min-h-[300px] max-h-[500px]">
                        <img
                          src={getPrimaryImage(currentRef) as string}
                          alt={getReferenceTitle(currentRef)}
                          className="w-full h-full object-contain max-h-[500px]"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="w-full aspect-square flex items-center justify-center bg-slate-100">
                        <div className="text-center text-slate-500">
                          <ImageOff className="w-16 h-16 mx-auto mb-4" />
                          <div>Brak zdjęcia</div>
                        </div>
                      </div>
                    )}
                  </motion.div>

                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="flex items-center gap-4 bg-white backdrop-blur-xl border border-gold/30 rounded-full p-2 shadow-[0_18px_48px_rgba(0,0,0,0.12)]">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={prevSlide}
                        disabled={references.length === 0}
                        className="rounded-full w-10 h-10 p-0 text-slate-800 hover:text-gold hover:bg-gold/10"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Button>

                      <span className="text-sm text-slate-700 px-2 min-w-[60px] text-center">
                        {currentIndex + 1} / {references.length}
                      </span>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={nextSlide}
                        disabled={references.length === 0}
                        className="rounded-full w-10 h-10 p-0 text-slate-800 hover:text-gold hover:bg-gold/10"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      <section className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              <span className="text-white">Wszystkie </span>
              <span className="gold-heading">referencje</span>
            </h2>
            <p className="font-display text-xl md:text-2xl text-white/80 font-semibold max-w-2xl mx-auto">
              Zobacz pełną listę opinii zadowolonych hodowców
            </p>
          </motion.div>

          {references.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {references.map((ref, index) => (
                <ReferenceCard
                  key={ref.id}
                  reference={ref}
                  index={index}
                  isActive={index === currentIndex}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
          ) : (
            <motion.div
              className="max-w-2xl mx-auto text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="relative overflow-hidden rounded-2xl border border-gold/20 bg-white shadow-lg p-12">
                <div className="absolute inset-0 bg-gradient-to-b from-white via-white/60 to-transparent pointer-events-none" />
                <MessageSquareQuote className="w-16 h-16 text-gold/60 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  Brak referencji
                </h2>
                <p className="text-slate-600 mb-8">
                  Dodaj pierwszą opinię – pojawi się tutaj od razu.
                </p>
                <Button
                  onClick={handleAddReference}
                  className="bg-gradient-to-r from-gold to-gold text-black font-bold"
                >
                  <MessageSquareQuote className="w-4 h-4 mr-2" />
                  Dodaj pierwszą referencję
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <UnifiedModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        type="default"
        title="Dodaj referencję"
        showCloseButton={true}
        closeOnBackdrop={true}
        closeOnEscape={true}
        size="full"
        draggable={true}
        backdropClassName="bg-black/60"
      >
        <AddReferenceForm
          onCancel={() => setIsFormOpen(false)}
          onSuccess={() => {
            setIsFormOpen(false);
            void loadReferences();
          }}
        />
      </UnifiedModal>

      <AccountModal
        open={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
      />

      <UnifiedModal
        isOpen={infoModal.isOpen}
        onClose={() => setInfoModal((prev) => ({ ...prev, isOpen: false }))}
        type={infoModal.type}
        title={infoModal.title}
        message={infoModal.message}
        confirmButton={{
          text: "OK",
          onClick: () => setInfoModal((prev) => ({ ...prev, isOpen: false })),
        }}
      />

      <UnifiedModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        type="warning"
        title={verificationMessage.title}
        message={verificationMessage.message}
        confirmButton={{
          text:
            profile?.role === "USER_REGISTERED"
              ? "Zweryfikuj email"
              : "Uzupełnij profil",
          onClick: () => {
            setShowVerificationModal(false);
            if (profile?.role === "USER_REGISTERED") {
              navigate("/verify-email");
            } else {
              setIsAccountOpen(true);
            }
          },
        }}
        cancelButton={{
          text: "Anuluj",
          onClick: () => setShowVerificationModal(false),
        }}
      />

      <UnifiedModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        type="info"
        title="Wymagane logowanie"
        message="Aby dodać referencję, musisz się zalogować. Po zamknięciu komunikatu przeniosę Cię do strony logowania."
        confirmButton={{
          text: "Przejdź do logowania",
          onClick: () => {
            const target = pendingRedirect || "/references";
            setShowLoginPrompt(false);
            navigate(
              `/auth?mode=login&callbackUrl=${encodeURIComponent(target)}`,
            );
          },
        }}
        cancelButton={{
          text: "Anuluj",
          onClick: () => setShowLoginPrompt(false),
        }}
      />
    </div>
  );
}

function ModalSideEffects({
  modalRef,
  triggerRef,
  onClose,
}: {
  modalRef: React.RefObject<HTMLDivElement | null>;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}) {
  const previouslyActive = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previouslyActive.current = document.activeElement as HTMLElement | null;

    const container = modalRef.current;
    if (container) {
      const first = container.querySelector<HTMLElement>(
        'input,select,textarea,button,a[href],[tabindex]:not([tabindex="-1"])',
      );
      try {
        first?.focus();
      } catch (err) {
        // focus can fail in some browsers/states
      }
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKey);

    const triggerEl = triggerRef.current;
    return () => {
      document.removeEventListener("keydown", onKey);
      try {
        (triggerEl ?? previouslyActive.current)?.focus();
      } catch (err) {
        // focus can fail in some browsers/states
      }
    };
  }, [modalRef, onClose, triggerRef]);

  return null;
}
