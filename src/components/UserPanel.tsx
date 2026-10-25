import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  MapPin,
  Star,
  Shield,
  Settings,
  X,
  Calendar,
  Phone,
  Lock,
  Save,
  Trophy,
  Package,
  Clock,
  Award,
  CreditCard,
  LogOut,
  Edit3,
  Check,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Heart,
  Eye,
  EyeOff,
  Crown,
  Zap,
  Sparkles,
  Plus,
  Gavel,
  PlayCircle,
} from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { useProfile } from "@/hooks/useProfile";
import { useTutorial } from "@/hooks/useTutorial";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { UnifiedModal } from "@/components/ui/UnifiedModal";
import PhoneVerification from "@/components/auth/PhoneVerification";
import { auctionService } from "@/services/auctionService";
import apiClient from "@/services/api";
import { paymentService } from "@/services/paymentService";
import { Auction, translateAuctionStatus } from "@/types/auction";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";
import { UserPaymentsSection } from "@/components/user/UserPaymentsSection";
import {
  formatIban,
  normalizeIban,
  validatePolishIbanChecksum,
} from "@/utils/payoutValidation";

type PanelTab = "overview" | "profile" | "security" | "auctions" | "payments";

interface UserPanelProps {
  onClose: () => void;
  defaultTab?: PanelTab;
}

/** Czytelne nazwy ról zamiast kodów z bazy. */
const ROLE_LABELS: Record<string, string> = {
  USER_REGISTERED: "Konto niezweryfikowane",
  USER_EMAIL_VERIFIED: "E-mail potwierdzony",
  USER_FULL_VERIFIED: "Konto zweryfikowane",
  ADMIN: "Administrator",
};

const TABS: { id: PanelTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "overview", label: "Przegląd", icon: User },
  { id: "profile", label: "Profil", icon: Settings },
  { id: "security", label: "Bezpieczeństwo", icon: Shield },
  { id: "auctions", label: "Aukcje", icon: Package },
  { id: "payments", label: "Płatności", icon: CreditCard },
];

/** Wspólny wygląd pól formularza: biały tekst, złote obramowanie przy fokusie. */
const inputClass =
  "w-full px-4 py-3 bg-black/40 border border-white/15 rounded-xl text-white placeholder-white/35 focus:outline-none focus:ring-2 focus:ring-[#A68E4E]/40 focus:border-[#A68E4E]/70 transition-colors duration-200 hover:border-white/25";

/** Wspólna karta sekcji – spokojna, bez podskakiwania przy najechaniu. */
const cardClass =
  "rounded-2xl border border-[#A68E4E]/20 bg-[#0a1324]/80 p-6 shadow-xl";

const UserPanel: React.FC<UserPanelProps> = ({ onClose, defaultTab = "overview" }) => {
  const { user, profile, session, signOut } = useAuth();
  const { t } = useLocale();
  const {
    updateUserProfile,
    loading: profileSaving,
    error: profileError,
  } = useProfile();
  const { start: startTutorial } = useTutorial();
  const navigate = useNavigate();

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"success" | "error">(
    "success",
  );
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const [activeTab, setActiveTab] = useState<PanelTab>(defaultTab);
  const contentRef = useRef<HTMLDivElement>(null);

  // Nowa zakładka zaczyna się od góry – inaczej krótsza treść
  // lądowała poza widokiem po przewinięciu poprzedniej.
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [activeTab]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState(profile?.username ?? "");
  const [firstName, setFirstName] = useState(profile?.first_name ?? "");
  const [lastName, setLastName] = useState(profile?.last_name ?? "");
  const [street, setStreet] = useState(profile?.street ?? "");
  const [postalCode, setPostalCode] = useState(profile?.postal_code ?? "");
  const [city, setCity] = useState(profile?.city ?? "");
  const [country, setCountry] = useState(profile?.country ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [payoutMethod, setPayoutMethod] = useState<"IBAN" | "BLIK">(
    profile?.payoutMethod === "BLIK" ? "BLIK" : "IBAN",
  );
  const [payoutIban, setPayoutIban] = useState(
    profile?.payoutIban ? formatIban(profile.payoutIban) : "",
  );
  const [payoutPhone, setPayoutPhone] = useState(profile?.payoutPhone ?? "");

  const ibanValidation = useMemo(() => {
    if (payoutMethod !== "IBAN" || !payoutIban) return null;
    return validatePolishIbanChecksum(payoutIban);
  }, [payoutMethod, payoutIban]);
  const [showSmsAuth, setShowSmsAuth] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [cardLoading, setCardLoading] = useState(false);
  const [passSaving, setPassSaving] = useState(false);
  const [passError, setPassError] = useState("");

  const [userAuctions, setUserAuctions] = useState<Auction[]>([]);
  const [watchedAuctions, setWatchedAuctions] = useState<Auction[]>([]);
  const [biddingAuctions, setBiddingAuctions] = useState<Auction[]>([]);
  const [wonAuctions, setWonAuctions] = useState<Auction[]>([]);
  const [loadingAuctions, setLoadingAuctions] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!session?.access_token) {
        setLoadingAuctions(false);
        return;
      }
      try {
        setLoadingAuctions(true);
        const results = await Promise.allSettled([
          auctionService.getUserAuctions(session.access_token),
          auctionService.getWatchlist(session.access_token),
          auctionService.getBiddingAuctions(session.access_token),
          auctionService.getWonAuctions(session.access_token),
        ]);
        
        setUserAuctions(results[0].status === 'fulfilled' ? results[0].value : []);
        setWatchedAuctions(results[1].status === 'fulfilled' ? results[1].value : []);
        setBiddingAuctions(results[2].status === 'fulfilled' ? results[2].value : []);
        setWonAuctions(results[3].status === 'fulfilled' ? results[3].value : []);
        
        results.forEach((r, i) => {
          if (r.status === 'rejected') {
            console.error(`Failed to fetch auction data at index ${i}:`, r.reason);
          }
        });
      } catch (err) {
        console.error("Failed to fetch user auction data:", err);
      } finally {
        setLoadingAuctions(false);
      }
    };

    fetchStats();
  }, [session?.access_token]);

  const isEmailVerified =
    profile?.role === "USER_EMAIL_VERIFIED" ||
    profile?.role === "USER_FULL_VERIFIED" ||
    profile?.role === "ADMIN";

  // Jedna lista kroków dla karty „Następny krok” i listy w Przeglądzie –
  // wcześniej każda liczyła postęp inaczej.
  const setupSteps = useMemo(() => {
    const isProfileComplete = Boolean(
      profile?.phone && profile?.first_name && profile?.last_name,
    );
    const isPayoutSet = Boolean(
      (profile?.payoutMethod === "IBAN" && profile?.payoutIban) ||
        (profile?.payoutMethod === "BLIK" &&
          (profile?.payoutPhone || profile?.phone)),
    );
    return [
      { id: 1, label: "Potwierdź e-mail", done: isEmailVerified, tab: "overview" as PanelTab },
      { id: 2, label: "Podaj dane i telefon", done: isProfileComplete, tab: "profile" as PanelTab },
      { id: 3, label: "Metoda wypłat", done: isPayoutSet, tab: "payments" as PanelTab },
      { id: 4, label: "Podepnij kartę Stripe", done: Boolean(profile?.stripeCustomerId), tab: "payments" as PanelTab },
    ];
  }, [profile, isEmailVerified]);

  const nextStep = setupSteps.find((step) => !step.done) ?? null;
  const progressPercent = Math.round(
    (setupSteps.filter((step) => step.done).length / setupSteps.length) * 100,
  );

  // Escape zamyka panel, chyba że otwarte jest okno SMS lub komunikat.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !showSmsAuth && !feedbackOpen) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, showSmsAuth, feedbackOpen]);

  const profileCompleteForSms = useMemo(() => {
    if (!isEmailVerified) return false;
    return Boolean(
      firstName.trim() &&
      lastName.trim() &&
      street.trim() &&
      postalCode.trim() &&
      city.trim() &&
      country.trim() &&
      phone.trim(),
    );
  }, [
    firstName,
    lastName,
    street,
    postalCode,
    city,
    country,
    phone,
    isEmailVerified,
  ]);

  const onSaveProfile = async () => {
    let payload: any = {};

    if (activeTab === "profile") {
      if (!username.trim() || username.trim().length < 3) {
        setFeedbackType("error");
        setFeedbackTitle("Błąd");
        setFeedbackMessage("Nick jest wymagany i musi mieć min. 3 znaki");
        setFeedbackOpen(true);
        return;
      }
      payload = {
        username: username.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        street: street.trim(),
        postal_code: postalCode.trim(),
        city: city.trim(),
        country: country.trim(),
        phone: phone.trim(),
      };
    } else if (activeTab === "payments") {
      if (payoutMethod === "IBAN" && payoutIban.trim()) {
        const validation = validatePolishIbanChecksum(payoutIban);
        if (!validation.isValid) {
          setFeedbackType("error");
          setFeedbackTitle("Nieprawidłowy numer konta");
          setFeedbackMessage(validation.message);
          setFeedbackOpen(true);
          return;
        }
      }
      payload = {
        payoutMethod,
        payoutIban: payoutMethod === "IBAN" ? normalizeIban(payoutIban) : "",
        payoutPhone: payoutMethod === "BLIK" ? payoutPhone.trim() : phone.trim(),
      };
    } else {
      // Fallback just in case
      payload = {
        username: username.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        street: street.trim(),
        postal_code: postalCode.trim(),
        city: city.trim(),
        country: country.trim(),
        phone: phone.trim(),
        payoutMethod,
        payoutIban: payoutMethod === "IBAN" ? normalizeIban(payoutIban) : "",
        payoutPhone: payoutMethod === "BLIK" ? payoutPhone.trim() : phone.trim(),
      };
    }

    try {
      await updateUserProfile(payload);
      setFeedbackType("success");
      setFeedbackTitle("Zapisano");
      const isAlreadyVerified =
        profile?.role === "USER_FULL_VERIFIED" || profile?.role === "ADMIN";
      setFeedbackMessage(
        isAlreadyVerified
          ? "Profil został pomyślnie zaktualizowany."
          : "Profil został zaktualizowany. Teraz wykonaj weryfikację SMS, aby w pełni aktywować konto i móc licytować.",
      );
      setFeedbackOpen(true);
    } catch (err) {
      console.error("Profile save failed:", err);
      const message =
        (err as any)?.message ||
        profileError ||
        "Nie udało się zapisać profilu.";
      setFeedbackType("error");
      setFeedbackTitle("Nie zapisano");
      setFeedbackMessage(message);
      setFeedbackOpen(true);
    }
  };

  const handleAttachCard = async () => {
    if (!session?.access_token) return;
    setCardLoading(true);
    try {
      const res = await paymentService.createSetupSession(session.access_token);
      if (res.url) {
        window.location.assign(res.url);
      }
    } catch (err: any) {
      setFeedbackType("error");
      setFeedbackTitle("Błąd płatności");
      setFeedbackMessage(err.message || "Nie udało się uruchomić sesji Stripe.");
      setFeedbackOpen(true);
    } finally {
      setCardLoading(false);
    }
  };

  const onChangePassword = async () => {
    setPassError("");
    if (!newPassword || newPassword.length < 6) {
      setPassError("Hasło musi mieć co najmniej 6 znaków");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError("Hasła nie są takie same");
      return;
    }
    try {
      setPassSaving(true);
      const { supabase } = await import("@/lib/supabase");
      if (!supabase) {
        setPassError("Brak połączenia z bazą danych");
        return;
      }
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        setPassError(error.message ?? "Nie udało się zmienić hasła");
        return;
      }
      setNewPassword("");
      setConfirmPassword("");
      setFeedbackType("success");
      setFeedbackTitle("Hasło zmienione");
      setFeedbackMessage("Twoje hasło zostało pomyślnie zaktualizowane.");
      setFeedbackOpen(true);
    } catch (err: any) {
      setPassError(err?.message ?? "Wystąpił błąd przy zmianie hasła");
      setFeedbackType("error");
      setFeedbackTitle("Błąd zmiany hasła");
      setFeedbackMessage(err?.message ?? "Wystąpił błąd przy zmianie hasła");
      setFeedbackOpen(true);
    } finally {
      setPassSaving(false);
    }
  };

  useEffect(() => {
    if (!profile) return;
    setUsername(profile.username ?? "");
    setFirstName(profile.first_name ?? "");
    setLastName(profile.last_name ?? "");
    setStreet(profile.street ?? "");
    setPostalCode(profile.postal_code ?? "");
    setPayoutMethod(profile.payoutMethod === "BLIK" ? "BLIK" : "IBAN");
    setPayoutIban(profile.payoutIban ? formatIban(profile.payoutIban) : "");
    setPayoutPhone(profile.payoutPhone ?? profile.phone ?? "");
    setCity(profile.city ?? "");
    setCountry(profile.country ?? "");
    setPhone(profile.phone ?? "");
  }, [profile]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 md:p-6"
      data-lenis-prevent="true"
      data-lenis-prevent-touch="true"
    >
      {/* Kliknięcie w tło zamyka panel */}
      <motion.div
        className="absolute inset-0 bg-black/85 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        aria-hidden="true"
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-panel-title"
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative w-full max-w-7xl h-auto max-h-[94vh] md:max-h-[90vh] bg-[#0c1427] border border-[#A68E4E]/50 rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(166,142,78,0.2)] flex flex-col z-10 text-white"
        data-lenis-prevent="true"
        data-lenis-prevent-touch="true"
      >
        {/* Nagłówek */}
        <div className="relative flex-shrink-0 px-4 md:px-6 py-4 border-b border-[#A68E4E]/30 bg-[#070e1e]/95 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            <div className="w-11 h-11 md:w-14 md:h-14 shrink-0 rounded-2xl bg-[#A68E4E]/15 border border-[#A68E4E]/50 flex items-center justify-center">
              <Crown className="w-6 h-6 md:w-7 md:h-7 text-gold" />
            </div>

            <div className="min-w-0">
              <h2
                id="user-panel-title"
                className="font-display text-lg md:text-2xl font-extrabold text-white tracking-tight"
              >
                {profile?.first_name ? (
                  <>
                    Witaj, <span className="text-[#A68E4E]">{profile.first_name}</span>
                  </>
                ) : (
                  <>
                    Panel <span className="text-[#A68E4E]">Użytkownika</span>
                  </>
                )}
              </h2>
              <p className="text-xs text-zinc-400 font-medium truncate">
                {user?.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 md:w-auto md:px-4 md:py-2 rounded-xl border border-white/15 bg-white/5 text-zinc-200 hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm font-bold shrink-0"
            aria-label="Zamknij panel użytkownika"
          >
            <X className="w-5 h-5" />
            <span className="hidden md:inline">Zamknij</span>
          </button>
        </div>

        {/* Karty statusu – na telefonie po dwie w rzędzie */}
        <div className="flex-shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 p-3 md:p-5 bg-[#070e1e]/60 border-b border-[#A68E4E]/20">
          {[
            {
              icon: Star,
              label: "Status",
              value: profile?.role ? ROLE_LABELS[profile.role] ?? profile.role : "—",
            },
            {
              icon: Calendar,
              label: "Następny krok",
              value: nextStep ? nextStep.label : "Konto aktywne",
              onClick: nextStep ? () => setActiveTab(nextStep.tab) : undefined,
              highlight: Boolean(nextStep),
            },
            {
              icon: Phone,
              label: "Telefon",
              value: profile?.phone || "Nie dodano",
            },
            {
              icon: Shield,
              label: "Profil",
              value: `${progressPercent}% gotowe`,
            },
          ].map((card) => {
            const content = (
              <>
                <div className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1 text-[#A68E4E]">
                  <card.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span>{card.label}</span>
                </div>
                <div className="text-white text-xs md:text-sm font-bold break-words line-clamp-2">
                  {card.value}
                </div>
              </>
            );
            const base = `rounded-xl md:rounded-2xl border p-3 md:p-4 text-left ${
              card.highlight
                ? "border-[#A68E4E]/60 bg-[#A68E4E]/10"
                : "border-white/10 bg-white/[0.03]"
            }`;
            return card.onClick ? (
              <button
                key={card.label}
                type="button"
                onClick={card.onClick}
                className={`${base} hover:bg-[#A68E4E]/20 transition-colors`}
              >
                {content}
              </button>
            ) : (
              <div key={card.label} className={base}>
                {content}
              </div>
            );
          })}
        </div>

        {/* Zakładki */}
        <div className="flex-shrink-0 flex items-center justify-between px-3 py-2.5 md:px-6 border-b border-[#A68E4E]/20 bg-[#070e1e]/90 gap-3">
          <div
            role="tablist"
            aria-label="Sekcje panelu"
            className="flex gap-1.5 overflow-x-auto no-scrollbar"
            data-lenis-prevent="true"
          >
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 md:px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors duration-200 ${
                    active
                      ? "bg-[#A68E4E] text-zinc-950"
                      : "text-zinc-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => startTutorial(`userpanel-${activeTab}` as any)}
            className="hidden sm:flex items-center justify-center gap-2 px-3.5 py-2.5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl text-xs font-bold transition-colors shrink-0"
            aria-label="Włącz samouczek dla tej zakładki"
          >
            <PlayCircle className="w-4 h-4" />
            Samouczek
          </button>
        </div>

        {/* Tab Content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 no-scrollbar overscroll-contain"
          data-lenis-prevent="true"
          data-lenis-prevent-touch="true"
        >
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="h-full"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6" data-tutorial="up-stats">
                    <div className={cardClass}>
                      <h3 className="font-display text-xl font-semibold text-white mb-4 flex items-center gap-3">
                        <Trophy className="w-6 h-6 text-gold" />
                        Podsumowanie konta
                      </h3>
                      <div className="space-y-3">
                        {[
                          { label: "Twoje aukcje", icon: Package, count: userAuctions.length },
                          { label: "Aktywne licytacje", icon: TrendingUp, count: biddingAuctions.length },
                          { label: "Wygrane aukcje", icon: Award, count: wonAuctions.length },
                          { label: "Obserwowane", icon: Heart, count: watchedAuctions.length },
                        ].map((row) => (
                          <button
                            key={row.label}
                            type="button"
                            onClick={() => setActiveTab("auctions")}
                            className="w-full flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5 hover:border-[#A68E4E]/30 hover:bg-[#A68E4E]/10 transition-colors group"
                          >
                            <span className="text-white/70 text-sm flex items-center gap-2 group-hover:text-white transition-colors">
                              <row.icon className="w-4 h-4" />
                              {row.label}
                            </span>
                            {loadingAuctions ? (
                              <span
                                className="w-8 h-6 rounded-md bg-white/10 animate-pulse"
                                aria-label="Ładowanie"
                              />
                            ) : (
                              <span className="text-white text-2xl font-bold tabular-nums group-hover:text-gold transition-colors">
                                {row.count}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className={cardClass}>
                      <h3 className="font-display text-xl font-semibold text-white mb-4 flex items-center gap-3">
                        <Star className="w-6 h-6 text-gold" />
                        Ukończenie profilu
                      </h3>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-white/80">Postęp</span>
                        <span className="text-sm font-bold text-gold tabular-nums">
                          {progressPercent}%
                        </span>
                      </div>
                      <div
                        className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden mb-5 border border-[#A68E4E]/20"
                        role="progressbar"
                        aria-valuenow={progressPercent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label="Ukończenie profilu"
                      >
                        <motion.div
                          className="h-full bg-[#A68E4E] origin-left"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: progressPercent / 100 }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>

                      <div className="space-y-2.5">
                        {setupSteps.map((step) => (
                          <button
                            key={step.id}
                            type="button"
                            onClick={() => setActiveTab(step.tab)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${
                              step.done
                                ? "bg-emerald-500/10 border-emerald-500/25 hover:bg-emerald-500/15"
                                : "bg-black/30 border-white/10 hover:border-[#A68E4E]/40 hover:bg-[#A68E4E]/10"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                  step.done ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white/50"
                                }`}
                              >
                                {step.done ? (
                                  <Check className="w-3.5 h-3.5" />
                                ) : (
                                  <span className="text-xs font-bold">{step.id}</span>
                                )}
                              </div>
                              <span className={`text-sm font-medium ${step.done ? "text-emerald-100" : "text-white/80"}`}>
                                {step.label}
                              </span>
                            </div>
                            {!step.done && (
                              <span className="text-[10px] uppercase font-bold text-[#A68E4E] bg-[#A68E4E]/10 px-2 py-1 rounded-md">
                                {step === nextStep ? "Teraz" : "Wymagane"}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-sm border-t border-white/5 pt-4 mt-5">
                        <span className="text-white/60 font-medium">Wskaźnik zaufania</span>
                        <span className="text-gold font-mono font-bold">
                          {Number(profile?.trustScore ?? 0).toFixed(1)} / 5.0
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 md:mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    <div className={cardClass}>
                      <h3 className="font-display text-xl font-semibold text-white mb-4 flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-gold" />
                        Szybkie akcje
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            navigate("/auctions");
                            setTimeout(() => {
                              window.dispatchEvent(new CustomEvent("openCategorySelector"));
                            }, 100);
                          }}
                          className="flex items-center gap-3 p-4 rounded-xl bg-[#A68E4E] text-zinc-950 font-bold text-sm hover:brightness-110 transition-[filter]"
                        >
                          <Plus className="w-5 h-5" />
                          Wystaw aukcję
                        </button>
                        <Link
                          to="/auctions"
                          onClick={onClose}
                          className="flex items-center gap-3 p-4 rounded-xl border border-[#A68E4E]/40 text-[#A68E4E] font-bold text-sm hover:bg-[#A68E4E]/10 transition-colors"
                        >
                          <Gavel className="w-5 h-5" />
                          Przeglądaj aukcje
                        </Link>
                        <Link
                          to="/champions"
                          onClick={onClose}
                          className="flex items-center gap-3 p-4 rounded-xl border border-white/10 text-white/80 font-bold text-sm hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <Trophy className="w-5 h-5" />
                          Galeria championów
                        </Link>
                        <button
                          type="button"
                          onClick={() => setActiveTab("profile")}
                          className="flex items-center gap-3 p-4 rounded-xl border border-white/10 text-white/80 font-bold text-sm hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <Edit3 className="w-5 h-5" />
                          Edytuj profil
                        </button>
                      </div>
                    </div>

                    <div className={cardClass}>
                      <h3 className="font-display text-xl font-semibold text-white mb-4 flex items-center gap-3">
                        <Clock className="w-6 h-6 text-gold" />
                        Ostatnia aktywność
                      </h3>
                      <dl className="space-y-3 text-sm">
                        <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-black/20">
                          <dt className="text-white/60">Ostatnie logowanie</dt>
                          <dd className="text-white font-medium text-right">
                            {profile?.last_sign_in_at
                              ? formatDistanceToNow(new Date(profile.last_sign_in_at), { addSuffix: true, locale: pl })
                              : "Brak danych"}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-black/20">
                          <dt className="text-white/60">Konto utworzono</dt>
                          <dd className="text-white font-medium text-right">
                            {profile?.created_at
                              ? new Date(profile.created_at).toLocaleDateString("pl-PL", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })
                              : "Brak danych"}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-tutorial="up-profile-form">
                    <motion.div
                      className={cardClass}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <h3 className="font-display text-xl font-semibold text-white mb-4 flex items-center gap-3">
                        <User className="w-6 h-6 text-gold" />
                        Dane podstawowe
                      </h3>
                      <div className="space-y-4">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <label htmlFor="up-username" className="text-sm font-medium text-white/90 mb-2 block">
                            Nick
                          </label>
                          <input
                            id="up-username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Nazwa użytkownika"
                            className={inputClass}
                          />
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.25 }}
                        >
                          <label htmlFor="up-firstName" className="text-sm font-medium text-white/90 mb-2 block">
                            Imię
                          </label>
                          <input
                            id="up-firstName"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Imię"
                            className={inputClass}
                          />
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <label htmlFor="up-lastName" className="text-sm font-medium text-white/90 mb-2 block">
                            Nazwisko
                          </label>
                          <input
                            id="up-lastName"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Nazwisko"
                            className={inputClass}
                          />
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.35 }}
                        >
                          <label htmlFor="up-phone" className="text-sm font-medium text-white/90 mb-2 block">
                            Telefon
                          </label>
                          <input
                            id="up-phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+48 600 000 000"
                            className={inputClass}
                          />
                        </motion.div>
                      </div>
                    </motion.div>

                    <motion.div
                      className={cardClass}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      <h3 className="font-display text-xl font-semibold text-white mb-4 flex items-center gap-3">
                        <MapPin className="w-6 h-6 text-gold" />
                        Adres
                      </h3>
                      <div className="space-y-4">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <label htmlFor="up-street" className="text-sm font-medium text-white/90 mb-2 block">
                            Ulica i numer
                          </label>
                          <input
                            id="up-street"
                            type="text"
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                            placeholder="Ulica i numer"
                            className={inputClass}
                          />
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.25 }}
                        >
                          <label htmlFor="up-city" className="text-sm font-medium text-white/90 mb-2 block">
                            Miasto
                          </label>
                          <input
                            id="up-city"
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Miasto"
                            className={inputClass}
                          />
                        </motion.div>
                        <div className="grid grid-cols-2 gap-4">
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            <label htmlFor="up-postalCode" className="text-sm font-medium text-white/90 mb-2 block">
                              Kod pocztowy
                            </label>
                            <input
                              id="up-postalCode"
                              type="text"
                              value={postalCode}
                              onChange={(e) => setPostalCode(e.target.value)}
                              placeholder="00-000"
                              className={inputClass}
                            />
                          </motion.div>
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.35 }}
                          >
                            <label htmlFor="up-country" className="text-sm font-medium text-white/90 mb-2 block">
                              Kraj
                            </label>
                            <input
                              id="up-country"
                              type="text"
                              value={country}
                              onChange={(e) => setCountry(e.target.value)}
                              placeholder="Polska"
                              className={inputClass}
                            />
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  </div>


                  <motion.div
                    className="flex gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      data-tutorial="up-profile-save"
                    >
                      <Button
                        disabled={profileSaving}
                        onClick={onSaveProfile}
                        className="bg-[#A68E4E] text-zinc-950 hover:bg-[#b89e5c] font-bold transition-colors"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {profileSaving ? "Zapisywanie..." : "Zapisz profil"}
                      </Button>
                    </motion.div>

                    {isEmailVerified && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        data-tutorial="up-profile-sms"
                      >
                        <Button
                          variant="outline"
                          disabled={!profileCompleteForSms}
                          onClick={() => setShowSmsAuth(true)}
                          className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-300"
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Weryfikacja SMS
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              )}

              {activeTab === "security" && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="h-full"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div
                      className={cardClass}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      data-tutorial="up-security-pass"
                    >
                      <h3 className="font-display text-xl font-semibold text-white mb-4 flex items-center gap-3">
                        <Shield className="w-6 h-6 text-gold" />
                        Zmień hasło
                      </h3>
                      <form
                        className="space-y-4"
                        onSubmit={(e) => {
                          e.preventDefault();
                          onChangePassword();
                        }}
                        noValidate
                      >
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <label htmlFor="userpanel-new-password" className="text-sm font-medium text-white/90 mb-2 block">
                            Nowe hasło
                          </label>
                          <div className="relative">
                            <input
                              id="userpanel-new-password"
                              name="newPassword"
                              type={showPassword ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Nowe hasło"
                              autoComplete="new-password"
                              className={inputClass}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                            >
                              {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.25 }}
                        >
                          <label htmlFor="userpanel-confirm-password" className="text-sm font-medium text-white/90 mb-2 block">
                            Potwierdź hasło
                          </label>
                          <div className="relative">
                            <input
                              id="userpanel-confirm-password"
                              name="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) =>
                                setConfirmPassword(e.target.value)
                              }
                              placeholder="Potwierdź hasło"
                              autoComplete="new-password"
                              className={inputClass}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </motion.div>
                        {passError && (
                          <motion.div
                            className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl backdrop-blur-sm"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                          >
                            <p className="text-red-400 text-sm flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" />
                              {passError}
                            </p>
                          </motion.div>
                        )}
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            type="submit"
                            disabled={passSaving}
                            className="w-full bg-[#A68E4E] text-zinc-950 hover:bg-[#b89e5c] font-bold transition-colors"
                          >
                            <Lock className="w-4 h-4 mr-2" />
                            {passSaving ? "Zmienianie..." : "Zmień hasło"}
                          </Button>
                        </motion.div>
                      </form>
                    </motion.div>

                    {/* Tutorial restart */}
                    <motion.div
                      className="rounded-2xl border border-[#A68E4E]/30 bg-[#A68E4E]/5 p-6 backdrop-blur-xl"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      <h4 className="font-display text-xl font-semibold text-[#A68E4E] mb-3 flex items-center gap-2">
                        <PlayCircle className="w-5 h-5" />
                        Samouczek
                      </h4>
                      <p className="text-white/60 text-sm mb-4">
                        Pokaż ponownie samouczek z chmurkami, który przeprowadzi Cię przez funkcje platformy.
                      </p>
                      <Button
                        variant="outline"
                        className="w-full border-[#A68E4E]/40 text-[#A68E4E] hover:bg-[#A68E4E]/20 hover:border-[#A68E4E]/70 transition-all"
                        onClick={() => {
                          onClose();
                          setTimeout(() => {
                            window.dispatchEvent(new CustomEvent("restartTutorial"));
                          }, 400);
                        }}
                      >
                        Uruchom samouczek
                      </Button>
                    </motion.div>

                    <motion.div
                      className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 backdrop-blur-xl"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h4 className="font-display text-xl font-semibold text-red-200 mb-3">
                        Usuń konto
                      </h4>
                      <p className="text-red-300/80 text-sm mb-4">
                        Trwałe usunięcie konta. Wymaga braku aktywnych aukcji.
                      </p>
                      <Button
                        variant="outline"
                        className="w-full border-red-500/40 text-red-300"
                        onClick={async () => {
                          if (
                            !confirm(
                              "Na pewno usunąć konto? Tej operacji nie można cofnąć.",
                            )
                          )
                            return;
                          try {
                            if (!session?.access_token) return;
                            await apiClient.delete(
                              "/auth/account",
                              session.access_token,
                            );
                            await signOut();
                            window.location.href = "/";
                          } catch (err) {
                            setFeedbackType("error");
                            setFeedbackTitle("Błąd");
                            setFeedbackMessage(
                              err instanceof Error
                                ? err.message
                                : "Nie udało się usunąć konta.",
                            );
                            setFeedbackOpen(true);
                          }
                        }}
                      >
                        Usuń konto
                      </Button>
                    </motion.div>

                    <motion.div
                      className="rounded-2xl border border-red-500/40 bg-gradient-to-br from-red-500/20 to-red-900/20 p-6 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-red-500/60 transition-all duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      <h4 className="font-display text-xl font-semibold text-red-200 mb-3 flex items-center gap-2">
                        <LogOut className="w-6 h-6" />
                        Wyloguj się
                      </h4>
                      <p className="text-red-300 text-sm mb-4 leading-relaxed">
                        Zakończ sesję i wyloguj się ze swojego konta. Będziesz
                        musiał ponownie zalogować się, aby uzyskać dostęp do
                        swojego konta.
                      </p>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="outline"
                          onClick={() => {
                            signOut().then(() => {
                              window.location.href = "/";
                            });
                            onClose();
                          }}
                          className="w-full border-red-500/50 text-red-300 hover:bg-red-500/30 hover:border-red-500/70 transition-all duration-300"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Wyloguj się
                        </Button>
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {activeTab === "auctions" && (
                <motion.div
                  key="auctions"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-tutorial="up-auctions-tabs">
                    {/* Moje aukcje */}
                    <motion.div
                      className="rounded-2xl border border-[#A68E4E]/20 p-6 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-[#A68E4E]/30 transition-all duration-300"
                      style={{
                        background:
                          "linear-gradient(145deg, rgba(2, 10, 19, 0.6), rgba(6, 35, 46, 0.4))",
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <h3 className="font-display text-xl font-semibold text-white mb-4 flex items-center gap-3">
                        <Package className="w-6 h-6 text-gold" />
                        Moje aukcje ({userAuctions.length})
                      </h3>
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {userAuctions.length > 0 ? (
                          userAuctions.map((auction) => (
                            <Link
                              key={auction.id}
                              to={`/auctions/${auction.id}`}
                              onClick={onClose}
                              className="flex items-center gap-3 p-3 bg-black/20 rounded-xl border border-[#A68E4E]/10 hover:border-[#A68E4E]/30 hover:bg-black/40 transition-all group"
                            >
                              <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10">
                                <img
                                  src={
                                    auction.images?.[0] || "/placeholder.svg"
                                  }
                                  alt=""
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-bold text-sm truncate group-hover:text-gold transition-colors">
                                  {auction.title}
                                </p>
                                <p className="text-xs text-white/40">
                                  {auction.currentPrice.toLocaleString("pl-PL")}{" "}
                                  PLN
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] text-white/40 block">
                                  {translateAuctionStatus(auction.status)}
                                </span>
                              </div>
                            </Link>
                          ))
                        ) : (
                          <div className="text-center py-6">
                            <p className="text-white/40 text-sm mb-4">
                              Nie masz jeszcze żadnych aukcji
                            </p>
                            <Button
                              onClick={() => {
                                onClose();
                                navigate("/auctions");
                                setTimeout(() => {
                                  window.dispatchEvent(
                                    new CustomEvent("openCategorySelector"),
                                  );
                                }, 100);
                              }}
                              className="w-full bg-[#A68E4E] text-zinc-950 hover:bg-[#b89e5c] font-bold transition-colors text-xs py-2 h-auto"
                            >
                              Stwórz aukcję
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>

                    {/* Moje licytacje */}
                    <motion.div
                      className="rounded-2xl border border-[#A68E4E]/20 p-6 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-[#A68E4E]/30 transition-all duration-300"
                      style={{
                        background:
                          "linear-gradient(145deg, rgba(2, 10, 19, 0.6), rgba(6, 35, 46, 0.4))",
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      <h3 className="font-display text-xl font-semibold text-white mb-4 flex items-center gap-3">
                        <Gavel className="w-6 h-6 text-gold" />
                        Moje licytacje ({biddingAuctions.length})
                      </h3>
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {biddingAuctions.length > 0 ? (
                          biddingAuctions.map((auction) => (
                            <Link
                              key={auction.id}
                              to={`/auctions/${auction.id}`}
                              onClick={onClose}
                              className="flex items-center gap-3 p-3 bg-black/20 rounded-xl border border-[#A68E4E]/10 hover:border-[#A68E4E]/30 hover:bg-black/40 transition-all group"
                            >
                              <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10">
                                <img
                                  src={
                                    auction.images?.[0] || "/placeholder.svg"
                                  }
                                  alt=""
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-bold text-sm truncate group-hover:text-gold transition-colors">
                                  {auction.title}
                                </p>
                                <p className="text-xs text-white/40">
                                  {auction.currentPrice.toLocaleString("pl-PL")}{" "}
                                  PLN
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] text-primary font-bold block">
                                  Licytujesz
                                </span>
                              </div>
                            </Link>
                          ))
                        ) : (
                          <div className="text-center py-6">
                            <p className="text-white/40 text-sm">
                              Nie bierzesz udziału w licytacjach
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>

                    {/* Moje Wygrane */}
                    <motion.div
                      data-tutorial="up-auctions-won"
                      className="rounded-2xl border border-[#A68E4E]/20 p-6 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-[#A68E4E]/30 transition-all duration-300 lg:col-span-2"
                      style={{
                        background:
                          "linear-gradient(145deg, rgba(2, 10, 19, 0.6), rgba(6, 35, 46, 0.4))",
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.18 }}
                    >
                      <h3 className="font-display text-xl font-semibold text-white mb-4 flex items-center gap-3">
                        <Trophy className="w-6 h-6 text-gold" />
                        Wygrane aukcje ({wonAuctions.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {wonAuctions.length > 0 ? (
                          wonAuctions.map((auction) => {
                            const isPaid = (auction as any).payments?.length > 0;
                            return (
                              <div
                                key={auction.id}
                                className="flex flex-col gap-3 p-3 bg-black/20 rounded-xl border border-[#A68E4E]/10 transition-all group"
                              >
                                <Link
                                  to={`/auctions/${auction.id}`}
                                  onClick={onClose}
                                  className="flex items-center gap-3"
                                >
                                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10">
                                    <img
                                      src={auction.images?.[0] || "/placeholder.svg"}
                                      alt=""
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-white font-bold text-sm truncate group-hover:text-gold transition-colors">
                                      {auction.title}
                                    </p>
                                    <p className="text-xs text-gold font-mono">
                                      {isPaid ? "Zapłacono: " : "Do zapłaty: "}
                                      {auction.currentPrice.toLocaleString("pl-PL")} PLN
                                    </p>
                                  </div>
                                </Link>
                                {!isPaid ? (
                                  <Button
                                    size="sm"
                                    className="w-full bg-[#A68E4E] text-zinc-950 hover:bg-[#b89e5c] font-bold transition-colors text-xs py-2 h-auto mt-2"
                                    onClick={async () => {
                                      try {
                                        const res = await paymentService.createStripeCheckout(auction.id, session?.access_token || null);
                                        window.location.href = res.url;
                                      } catch (err: any) {
                                        setFeedbackType("error");
                                        setFeedbackTitle("Błąd płatności");
                                        setFeedbackMessage(err.message || "Nie udało się rozpocząć płatności");
                                        setFeedbackOpen(true);
                                      }
                                    }}
                                  >
                                    <CreditCard className="w-3 h-3 mr-2" />
                                    Opłać przez Stripe
                                  </Button>
                                ) : (
                                  <div className="flex items-center justify-center gap-2 text-green-400 bg-green-500/10 p-2 rounded-lg border border-green-500/20 text-xs mt-2 h-[32px]">
                                    <Check className="w-3 h-3" />
                                    Aukcja opłacona
                                  </div>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-6 col-span-1 md:col-span-2">
                            <p className="text-white/40 text-sm mb-4">
                              Nie masz jeszcze wygranych aukcji.
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>

                    {/* Obserwowane */}
                    <motion.div
                      className="rounded-2xl border border-[#A68E4E]/20 p-6 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-[#A68E4E]/30 transition-all duration-300 lg:col-span-2"
                      style={{
                        background:
                          "linear-gradient(145deg, rgba(2, 10, 19, 0.6), rgba(6, 35, 46, 0.4))",
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h3 className="font-display text-xl font-semibold text-white mb-4 flex items-center gap-3">
                        <Heart className="w-6 h-6 text-red-500" />
                        Obserwowane ({watchedAuctions.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {watchedAuctions.length > 0 ? (
                          watchedAuctions.map((auction) => (
                            <Link
                              key={auction.id}
                              to={`/auctions/${auction.id}`}
                              onClick={onClose}
                              className="flex items-center gap-3 p-3 bg-black/20 rounded-xl border border-[#A68E4E]/10 hover:border-[#A68E4E]/30 hover:bg-black/40 transition-all group"
                            >
                              <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10">
                                <img
                                  src={
                                    auction.images?.[0] || "/placeholder.svg"
                                  }
                                  alt=""
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-bold text-sm truncate group-hover:text-gold transition-colors">
                                  {auction.title}
                                </p>
                                <p className="text-xs text-white/40">
                                  {auction.currentPrice.toLocaleString("pl-PL")}{" "}
                                  PLN
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] text-white/20 block">
                                  {translateAuctionStatus(auction.status)}
                                </span>
                              </div>
                            </Link>
                          ))
                        ) : (
                          <div className="col-span-full text-center py-6 text-white/40 text-sm">
                            Brak obserwowanych aukcji
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {activeTab === "payments" && (
                <motion.div
                  key="payments"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Stripe Card Setup */}
                      <div className="rounded-2xl border border-[#A68E4E]/30 bg-black/40 p-6 flex flex-col justify-between">
                        <div className="text-[#A68E4E] font-medium flex items-center gap-2 text-xl mb-4">
                          <CreditCard className="w-6 h-6 text-[#A68E4E]" />
                          Karta w Stripe
                        </div>
                        <div className="flex flex-col gap-3">
                          <span className="text-sm font-bold text-amber-200">
                            {profile?.stripeCustomerId ? "✓ Karta podpięta (możesz licytować)" : "✕ Brak podpiętej karty"}
                          </span>
                          <p className="text-sm text-white/70">
                            Podpięcie karty jest wymagane, aby licytować i wystawiać aukcje na platformie. 
                            Twoje dane są bezpiecznie przechowywane przez Stripe.
                          </p>
                          <Button
                            onClick={handleAttachCard}
                            disabled={cardLoading}
                            className="bg-gradient-to-r from-[#A68E4E] to-[#8e7a42] text-black w-fit font-bold shadow-lg hover:shadow-xl transition-all mt-2"
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            {cardLoading ? "Łączenie ze Stripe..." : profile?.stripeCustomerId ? "Zarządzaj kartą" : "Podepnij kartę"}
                          </Button>
                        </div>
                      </div>

                      {/* Payout Method */}
                      <div className="rounded-2xl border border-[#A68E4E]/30 bg-black/40 p-6 space-y-4 flex flex-col justify-between" data-tutorial="up-payments-info">
                        <div>
                          <h3 className="font-display text-xl font-semibold text-white mb-2">
                            Wypłata za sprzedane ptaki
                          </h3>
                          <p className="text-sm text-white/70 mb-4">
                            Bez tych danych nie wystawisz aukcji. Kupujący płaci tylko przez portal.
                          </p>
                          <div className="flex flex-wrap gap-3 mb-4">
                            <button
                              type="button"
                              onClick={() => setPayoutMethod("IBAN")}
                              className={`px-4 py-2 rounded-xl text-sm font-bold ${
                                payoutMethod === "IBAN"
                                  ? "bg-[#A68E4E] text-black"
                                  : "bg-white/10 text-white"
                              }`}
                            >
                              Przelew na konto (IBAN)
                            </button>
                            <button
                              type="button"
                              onClick={() => setPayoutMethod("BLIK")}
                              className={`px-4 py-2 rounded-xl text-sm font-bold ${
                                payoutMethod === "BLIK"
                                  ? "bg-[#A68E4E] text-black"
                                  : "bg-white/10 text-white"
                              }`}
                            >
                              BLIK / telefon
                            </button>
                          </div>
                          {payoutMethod === "IBAN" ? (
                            <div>
                              <label className="text-sm font-medium text-white/90 mb-2 block">
                                Numer konta bankowego (IBAN do wypłat)
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={payoutIban}
                                  onChange={(e) =>
                                    setPayoutIban(formatIban(e.target.value))
                                  }
                                  placeholder="PL61 1090 1014 0000 0712 1981 2874"
                                  className={`w-full px-4 py-3 bg-black/40 border rounded-xl text-white font-mono tracking-wider placeholder-white/35 focus:outline-none transition-colors ${
                                    ibanValidation?.isValid
                                      ? "border-emerald-500/70 focus:border-emerald-500"
                                      : payoutIban.trim()
                                      ? "border-amber-500/70 focus:border-amber-500"
                                      : "border-[#A68E4E]/20 focus:border-[#A68E4E]"
                                  }`}
                                />
                                {ibanValidation?.isValid && (
                                  <CheckCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                                )}
                              </div>
                              {payoutIban.trim() && (
                                <p
                                  className={`text-xs mt-1.5 flex items-center gap-1.5 ${
                                    ibanValidation?.isValid
                                      ? "text-emerald-400 font-medium"
                                      : "text-amber-400/90"
                                  }`}
                                >
                                  {ibanValidation?.isValid ? (
                                    <span>Poprawny polski numer konta (26 cyfr)</span>
                                  ) : (
                                    <>
                                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                      <span>{ibanValidation?.message}</span>
                                    </>
                                  )}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div>
                              <label className="text-sm font-medium text-white/90 mb-2 block">
                                Telefon do wypłat BLIK
                              </label>
                              <input
                                type="tel"
                                value={payoutPhone}
                                onChange={(e) => setPayoutPhone(e.target.value)}
                                placeholder="+48 600 000 000"
                                className={`${inputClass} font-mono`}
                              />
                            </div>
                          )}
                        </div>
                        
                        <div data-tutorial="up-payments-save">
                          <Button
                            disabled={profileSaving}
                            onClick={onSaveProfile}
                            className="bg-[#A68E4E] text-zinc-950 hover:bg-[#b89e5c] font-bold transition-colors w-fit mt-4"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {profileSaving ? "Zapisywanie..." : "Zapisz ustawienia wypłat"}
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <UserPaymentsSection />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <UnifiedModal
        isOpen={showSmsAuth}
        onClose={() => setShowSmsAuth(false)}
        title={null as any}
        showCloseButton={true}
        size="md"
        type="default"
      >
        <PhoneVerification
          onVerified={() => {
            setShowSmsAuth(false);
            setFeedbackType("success");
            setFeedbackTitle("Sukces");
            setFeedbackMessage(
              "Numer telefonu został zweryfikowany pomyślnie.",
            );
            setFeedbackOpen(true);
          }}
          initialPhone={phone}
          lockPhone={false}
          embedded={true}
        />
      </UnifiedModal>

      <UnifiedModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        type={feedbackType}
        title={feedbackTitle}
        message={feedbackMessage}
        confirmButton={{
          text:
            feedbackType === "success" &&
            feedbackMessage.includes("weryfikację SMS")
              ? "Weryfikuj SMS"
              : "OK",
          onClick: () => {
            setFeedbackOpen(false);
            if (
              feedbackType === "success" &&
              feedbackMessage.includes("weryfikację SMS")
            ) {
              setShowSmsAuth(true);
            }
          },
        }}
        showCloseButton={true}
        closeOnBackdrop={true}
        closeOnEscape={true}
        size="md"
      />
    </>,
    document.body,
  );
};

export default UserPanel;
