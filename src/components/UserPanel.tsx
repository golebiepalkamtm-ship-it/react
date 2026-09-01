import {
  motion,
  AnimatePresence,
  PanInfo,
  useMotionValue,
  useTransform,
  useDragControls,
} from "framer-motion";
import {
  User,
  MapPin,
  Star,
  Shield,
  Settings,
  X,
  Calendar,
  Phone,
  Mail,
  Lock,
  Save,
  Trophy,
  Package,
  Clock,
  Award,
  CreditCard,
  Bell,
  LogOut,
  Edit3,
  Check,
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
} from "lucide-react";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { useProfile } from "@/hooks/useProfile";
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

interface UserPanelProps {
  onClose: () => void;
  defaultTab?: "overview" | "profile" | "security" | "auctions" | "payments";
}

const UserPanel: React.FC<UserPanelProps> = ({ onClose, defaultTab = "overview" }) => {
  const { user, profile, session, signOut } = useAuth();
  const { t } = useLocale();
  const {
    updateUserProfile,
    loading: profileSaving,
    error: profileError,
  } = useProfile();
  const navigate = useNavigate();

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"success" | "error">(
    "success",
  );
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // Mouse tracking for parallax effects (disabled to prevent flickering)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);

  // Glitch effect states (disabled to prevent flickering)
  const [glitchIntensity, setGlitchIntensity] = useState(0);
  const [chromaticShift, setChromaticShift] = useState(0);

  // Mouse tracking effect (disabled to prevent flickering)
  useEffect(() => {
    // Disabled mouse tracking to prevent flickering effects
    return () => {};
  }, []);

  // Parallax transforms for different layers
  const layer1X = useTransform(mouseX, [0, 1], [-20, 20]);
  const layer1Y = useTransform(mouseY, [0, 1], [-15, 15]);
  const layer2X = useTransform(mouseX, [0, 1], [-40, 40]);
  const layer2Y = useTransform(mouseY, [0, 1], [-30, 30]);
  const layer3X = useTransform(mouseX, [0, 1], [-60, 60]);
  const layer3Y = useTransform(mouseY, [0, 1], [-45, 45]);

  const [activeTab, setActiveTab] = useState<
    "overview" | "profile" | "security" | "auctions" | "payments"
  >(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dragConstraintsRef = useRef(null);
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
  const [payoutIban, setPayoutIban] = useState(profile?.payoutIban ?? "");
  const [payoutPhone, setPayoutPhone] = useState(profile?.payoutPhone ?? "");
  const [showSmsAuth, setShowSmsAuth] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [cardLoading, setCardLoading] = useState(false);
  const [passSaving, setPassSaving] = useState(false);
  const [passError, setPassError] = useState("");
  const dragControls = useDragControls();

  const [userAuctions, setUserAuctions] = useState<Auction[]>([]);
  const [watchedAuctions, setWatchedAuctions] = useState<Auction[]>([]);
  const [biddingAuctions, setBiddingAuctions] = useState<Auction[]>([]);
  const [wonAuctions, setWonAuctions] = useState<Auction[]>([]);
  const [loadingAuctions, setLoadingAuctions] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!session?.access_token) return;
      try {
        setLoadingAuctions(true);
        const [my, watched, bidding, won] = await Promise.all([
          auctionService.getUserAuctions(session.access_token),
          auctionService.getWatchlist(session.access_token),
          auctionService.getBiddingAuctions(session.access_token),
          auctionService.getWonAuctions(session.access_token),
        ]);
        setUserAuctions(my);
        setWatchedAuctions(watched);
        setBiddingAuctions(bidding);
        setWonAuctions(won);
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
    if (!username.trim() || username.trim().length < 3) {
      setFeedbackType("error");
      setFeedbackTitle("Błąd");
      setFeedbackMessage("Nick jest wymagany i musi mieć min. 3 znaki");
      setFeedbackOpen(true);
      return;
    }
    try {
      await updateUserProfile({
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
        payoutIban: payoutMethod === "IBAN" ? payoutIban.trim() : "",
        payoutPhone: payoutMethod === "BLIK" ? payoutPhone.trim() : phone.trim(),
      });
      setFeedbackType("success");
      setFeedbackTitle("Zapisano");
      setFeedbackMessage(
        "Profil został zaktualizowany. Teraz musisz wykonać weryfikację SMS, aby w pełni aktywować konto.",
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
    setPayoutIban(profile.payoutIban ?? "");
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
      <motion.div
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      <motion.div
        drag
        dragListener={false}
        dragControls={dragControls}
        dragMomentum={false}
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative w-full max-w-7xl h-auto max-h-[94vh] md:max-h-[90vh] bg-[#0c1427] border-2 border-[#A68E4E]/70 rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(166,142,78,0.35)] flex flex-col z-10 text-white"
        data-lenis-prevent="true"
        data-lenis-prevent-touch="true"
      >
        {/* Header */}
        <div 
          onPointerDown={(e) => dragControls.start(e)}
          className="relative flex-shrink-0 px-6 py-4 border-b border-[#A68E4E]/40 bg-[#070e1e]/95 backdrop-blur-md flex items-center justify-between gap-4 cursor-move"
        >
          <div className="flex items-center gap-4">
            <motion.div
              className="relative w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-[#A68E4E]/40 via-amber-600/30 to-yellow-500/20 border border-[#A68E4E]/60 flex items-center justify-center shadow-md shadow-[#A68E4E]/20"
              whileHover={{ scale: 1.05 }}
            >
              <Crown className="w-6 h-6 md:w-7 md:h-7 text-gold" />
            </motion.div>

            <div className="space-y-0.5">
              <div className="font-display text-xl md:text-2xl font-extrabold text-white tracking-tight">
                Panel<span className="text-[#A68E4E]"> Użytkownika</span>
              </div>
              <div className="text-xs text-zinc-300 font-medium">
                {user?.email}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl bg-red-500/25 border border-red-500/50 text-red-200 hover:bg-red-500/40 transition-all flex items-center gap-2 text-xs md:text-sm font-bold shrink-0 shadow-md shadow-red-950/40"
            aria-label="Zamknij panel użytkownika"
          >
            <X className="w-4 h-4 md:w-5 md:h-5 text-red-200" />
            <span className="hidden sm:inline">Zamknij</span>
          </button>
        </div>

        {/* Status Cards */}
        <div className="flex-shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 md:p-6 bg-[#070e1e]/60 border-b border-[#A68E4E]/30">
          {[
            {
              icon: Mail,
              label: "Email",
              value: user?.email ?? "",
              gradient: "from-cyan-500/20 via-blue-950/70 to-[#0e1832]",
              border: "border-cyan-500/40",
              textColor: "text-cyan-300",
              iconColor: "text-cyan-400",
            },
            {
              icon: Star,
              label: "Status",
              value: profile?.role ?? "-",
              gradient: "from-amber-500/25 via-orange-950/70 to-[#0e1832]",
              border: "border-amber-500/40",
              textColor: "text-amber-300",
              iconColor: "text-amber-400",
            },
            {
              icon: Calendar,
              label: "Następny krok",
              value:
                profile?.role === "USER_REGISTERED"
                  ? "Zweryfikuj email"
                  : profile?.role === "USER_EMAIL_VERIFIED"
                    ? "Uzupełnij profil"
                    : profile?.role === "USER_FULL_VERIFIED" ||
                        profile?.role === "ADMIN"
                      ? "Konto aktywne"
                      : "-",
              gradient: "from-emerald-500/20 via-teal-950/70 to-[#0e1832]",
              border: "border-emerald-500/40",
              textColor: "text-emerald-300",
              iconColor: "text-emerald-400",
            },
            {
              icon: Phone,
              label: "Telefon",
              value: profile?.phone ?? "Nie dodano",
              gradient: "from-purple-500/20 via-indigo-950/70 to-[#0e1832]",
              border: "border-purple-500/40",
              textColor: "text-purple-300",
              iconColor: "text-purple-400",
            },
          ].map((card, index) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.04 }}
              whileHover={{ y: -4 }}
              className={`bg-gradient-to-br ${card.gradient} rounded-2xl border ${card.border} p-4 shadow-lg backdrop-blur-md transition-all duration-300`}
            >
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1.5">
                <card.icon className={`w-4 h-4 ${card.iconColor}`} />
                <span className={card.textColor}>{card.label}</span>
              </div>
              <div className="text-white text-sm font-extrabold break-words line-clamp-2">
                {card.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex-shrink-0 flex gap-2 p-3 md:px-6 border-b border-[#A68E4E]/30 bg-[#070e1e]/90 overflow-x-auto no-scrollbar" data-lenis-prevent="true">
          {[
            {
              id: "overview",
              label: "Przegląd",
              icon: User,
              activeBg: "bg-gradient-to-r from-[#A68E4E] via-amber-500 to-yellow-400 text-zinc-950 font-extrabold shadow-lg shadow-amber-500/30",
              iconColor: "text-amber-400",
            },
            {
              id: "profile",
              label: "Profil",
              icon: Settings,
              activeBg: "bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 text-white font-extrabold shadow-lg shadow-blue-500/30",
              iconColor: "text-cyan-400",
            },
            {
              id: "security",
              label: "Bezpieczeństwo",
              icon: Shield,
              activeBg: "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-extrabold shadow-lg shadow-amber-500/30",
              iconColor: "text-amber-400",
            },
            {
              id: "auctions",
              label: "Aukcje",
              icon: Package,
              activeBg: "bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white font-extrabold shadow-lg shadow-purple-500/30",
              iconColor: "text-purple-400",
            },
            {
              id: "payments",
              label: "Płatności",
              icon: CreditCard,
              activeBg: "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-extrabold shadow-lg shadow-emerald-500/30",
              iconColor: "text-emerald-400",
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.id
                  ? `${tab.activeBg} scale-[1.02]`
                  : "text-zinc-100 bg-[#121f3d] border border-[#A68E4E]/30 hover:bg-[#A68E4E]/30 hover:text-white"
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-current" : tab.iconColor}`} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div
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
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div
                      className="rounded-2xl border border-[#A68E4E]/20 p-6 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-[#A68E4E]/30 transition-all duration-300"
                      style={{
                        background:
                          "linear-gradient(145deg, rgba(2, 10, 19, 0.6), rgba(6, 35, 46, 0.4))",
                      }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <h3 className="font-display text-xl font-semibold text-white mb-4 flex items-center gap-3">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 3,
                          }}
                        >
                          <Trophy className="w-6 h-6 text-gold" />
                        </motion.div>
                        Podsumowanie konta
                      </h3>
                      <div className="space-y-4">
                        <motion.button
                          onClick={() => setActiveTab("auctions")}
                          className="w-full flex items-center justify-between p-4 rounded-xl bg-black/20 hover:bg-[#A68E4E]/10 hover:border-[#A68E4E]/30 transition-all border border-[#A68E4E]/10 group"
                          whileHover={{ x: 5 }}
                        >
                          <span className="text-white/70 text-sm flex items-center gap-2 group-hover:text-white transition-colors">
                            <Package className="w-4 h-4" />
                            Twoje aukcje
                          </span>
                          <motion.span
                            className="text-white text-2xl font-bold group-hover:text-gold transition-colors"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: "spring" }}
                          >
                            {userAuctions.length}
                          </motion.span>
                        </motion.button>
                        <motion.button
                          onClick={() => setActiveTab("auctions")}
                          className="w-full flex items-center justify-between p-4 rounded-xl bg-black/20 hover:bg-[#A68E4E]/10 hover:border-[#A68E4E]/30 transition-all border border-[#A68E4E]/10 group"
                          whileHover={{ x: 5 }}
                        >
                          <span className="text-white/70 text-sm flex items-center gap-2 group-hover:text-white transition-colors">
                            <TrendingUp className="w-4 h-4" />
                            Aktywne licytacje
                          </span>
                          <motion.span
                            className="text-white text-2xl font-bold group-hover:text-gold transition-colors"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.4, type: "spring" }}
                          >
                            {biddingAuctions.length}
                          </motion.span>
                        </motion.button>
                        <motion.button
                          onClick={() => setActiveTab("auctions")}
                          className="w-full flex items-center justify-between p-4 rounded-xl bg-black/20 hover:bg-[#A68E4E]/10 hover:border-[#A68E4E]/30 transition-all border border-[#A68E4E]/10 group"
                          whileHover={{ x: 5 }}
                        >
                          <span className="text-white/70 text-sm flex items-center gap-2 group-hover:text-white transition-colors">
                            <Heart className="w-4 h-4" />
                            Obserwowane
                          </span>
                          <motion.span
                            className="text-white text-2xl font-bold group-hover:text-gold transition-colors"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5, type: "spring" }}
                          >
                            {watchedAuctions.length}
                          </motion.span>
                        </motion.button>
                      </div>
                    </motion.div>

                    <motion.div
                      className="rounded-2xl border border-[#A68E4E]/20 p-6 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-[#A68E4E]/30 transition-all duration-300"
                      style={{
                        background:
                          "linear-gradient(145deg, rgba(2, 10, 19, 0.6), rgba(6, 35, 46, 0.4))",
                      }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h3 className="font-display text-xl font-semibold text-white mb-4 flex items-center gap-3">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Star className="w-6 h-6 text-gold" />
                        </motion.div>
                        Ukończenie profilu
                      </h3>
                      <div className="space-y-4">
                        {(() => {
                          const isEmailVerified = profile?.role !== "USER_REGISTERED";
                          const isProfileComplete = !!(profile?.phone && profile?.first_name && profile?.last_name);
                          const isPayoutSet = !!(
                            (profile?.payoutMethod === "IBAN" && profile?.payoutIban) ||
                            (profile?.payoutMethod === "BLIK" && (profile?.payoutPhone || profile?.phone))
                          );
                          const isStripeSet = !!profile?.stripeCustomerId;
                          
                          const steps = [
                            { id: 1, label: "Potwierdź e-mail", done: isEmailVerified, tab: "overview" },
                            { id: 2, label: "Podaj dane i telefon", done: isProfileComplete, tab: "profile" },
                            { id: 3, label: "Metoda wypłat", done: isPayoutSet, tab: "payments" },
                            { id: 4, label: "Podepnij kartę Stripe", done: isStripeSet, tab: "payments" },
                          ];
                          
                          const completedSteps = steps.filter(s => s.done).length;
                          const progressPercent = Math.round((completedSteps / steps.length) * 100);

                          return (
                            <>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold text-white/80">Progres</span>
                                <span className="text-sm font-bold text-gold">{progressPercent}%</span>
                              </div>
                              <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden mb-6 border border-[#A68E4E]/20">
                                <motion.div 
                                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progressPercent}%` }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                />
                              </div>
                              
                              <div className="space-y-3">
                                {steps.map((step, idx) => (
                                  <motion.button
                                    key={step.id}
                                    onClick={() => setActiveTab(step.tab as any)}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + idx * 0.1 }}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                                      step.done 
                                        ? "bg-green-500/10 border-green-500/30 hover:bg-green-500/20" 
                                        : "bg-black/30 border-white/10 hover:border-[#A68E4E]/40 hover:bg-[#A68E4E]/10"
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step.done ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'}`}>
                                        {step.done ? <Check className="w-3 h-3" /> : <span className="text-xs font-bold">{step.id}</span>}
                                      </div>
                                      <span className={`text-sm font-medium ${step.done ? 'text-green-100' : 'text-white/70'}`}>
                                        {step.label}
                                      </span>
                                    </div>
                                    {!step.done && (
                                      <span className="text-[10px] uppercase font-bold text-[#A68E4E] bg-[#A68E4E]/10 px-2 py-1 rounded-md">
                                        Wymagane
                                      </span>
                                    )}
                                  </motion.button>
                                ))}
                              </div>
                            </>
                          );
                        })()}
                        <div className="pt-4 space-y-3">
                          <div className="flex items-center justify-between text-sm border-t border-white/5 pt-4">
                            <span className="text-white/60 font-medium">
                              Wskaźnik zaufania (Trust Score)
                            </span>
                            <span className="text-gold font-mono font-bold">
                              {profile?.trustScore ? `${Number(profile.trustScore).toFixed(1)} / 5.0` : "0.0 / 5.0"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Ostatnia aktywność & Powiadomienia */}
                  <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div
                      className="rounded-2xl border border-[#A68E4E]/20 p-6 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-[#A68E4E]/30 transition-all duration-300"
                      style={{
                        background:
                          "linear-gradient(145deg, rgba(2, 10, 19, 0.6), rgba(6, 35, 46, 0.4))",
                      }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h3 className="font-display text-xl font-semibold text-white mb-4 flex items-center gap-3">
                        <Clock className="w-6 h-6 text-gold" />
                        Ostatnia aktywność
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm text-white/70">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span>Ostatnie logowanie: {profile?.last_sign_in_at ? new Date(profile.last_sign_in_at).toLocaleString('pl-PL') : 'Brak danych'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-white/70">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <span>Konto utworzono: {profile?.created_at ? new Date(profile.created_at).toLocaleString('pl-PL') : 'Brak danych'}</span>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      className="rounded-2xl border border-[#A68E4E]/20 p-6 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-[#A68E4E]/30 transition-all duration-300 flex flex-col justify-center items-center text-center"
                      style={{
                        background:
                          "linear-gradient(145deg, rgba(2, 10, 19, 0.6), rgba(6, 35, 46, 0.4))",
                      }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Bell className="w-8 h-8 text-gold mb-3" />
                      <h3 className="font-display text-xl font-semibold text-white mb-2">
                        Powiadomienia
                      </h3>
                      <p className="text-sm text-white/60 mb-4">
                        Twój system powiadomień. Wkrótce dodamy tu ważne alerty z systemu.
                      </p>
                      <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10 hover:border-gold/50" disabled>
                        Zobacz powiadomienia (Wkrótce)
                      </Button>
                    </motion.div>
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
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div
                      className="rounded-2xl border border-white/20 bg-gradient-to-br from-black/60 to-black/40 p-6 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-white/30 transition-all duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      whileHover={{ y: -3 }}
                    >
                      <h3 className="font-display text-xl font-semibold text-white mb-4 flex items-center gap-3">
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <User className="w-6 h-6 text-gold" />
                        </motion.div>
                        Dane podstawowe
                      </h3>
                      <div className="space-y-4">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <label className="text-sm font-medium text-white/90 mb-2 block">
                            Nick
                          </label>
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Nazwa użytkownika"
                            className="w-full px-4 py-3 bg-black/40 border border-[#A68E4E]/20 rounded-xl text-[#A68E4E] placeholder-[#A68E4E]/40 focus:outline-none focus:ring-2 focus:ring-[#A68E4E]/30 focus:border-[#A68E4E]/50 transition-all duration-200 hover:bg-black/50"
                          />
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.25 }}
                        >
                          <label className="text-sm font-medium text-white/90 mb-2 block">
                            Imię
                          </label>
                          <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Imię"
                            className="w-full px-4 py-3 bg-black/40 border border-[#A68E4E]/20 rounded-xl text-[#A68E4E] placeholder-[#A68E4E]/40 focus:outline-none focus:ring-2 focus:ring-[#A68E4E]/30 focus:border-[#A68E4E]/50 transition-all duration-200 hover:bg-black/50"
                          />
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <label className="text-sm font-medium text-white/90 mb-2 block">
                            Nazwisko
                          </label>
                          <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Nazwisko"
                            className="w-full px-4 py-3 bg-black/40 border border-[#A68E4E]/20 rounded-xl text-[#A68E4E] placeholder-[#A68E4E]/40 focus:outline-none focus:ring-2 focus:ring-[#A68E4E]/30 focus:border-[#A68E4E]/50 transition-all duration-200 hover:bg-black/50"
                          />
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.35 }}
                        >
                          <label className="text-sm font-medium text-white/90 mb-2 block">
                            Telefon
                          </label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+48 600 000 000"
                            className="w-full px-4 py-3 bg-black/40 border border-[#A68E4E]/20 rounded-xl text-[#A68E4E] placeholder-[#A68E4E]/40 focus:outline-none focus:ring-2 focus:ring-[#A68E4E]/30 focus:border-[#A68E4E]/50 transition-all duration-200 hover:bg-black/50"
                          />
                        </motion.div>
                      </div>
                    </motion.div>

                    <motion.div
                      className="rounded-2xl border border-white/20 bg-gradient-to-br from-black/60 to-black/40 p-6 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-white/30 transition-all duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      whileHover={{ y: -3 }}
                    >
                      <h3 className="font-display text-xl font-semibold text-white mb-4 flex items-center gap-3">
                        <motion.div
                          whileHover={{ scale: 1.2 }}
                          transition={{ duration: 0.3 }}
                        >
                          <MapPin className="w-6 h-6 text-gold" />
                        </motion.div>
                        Adres
                      </h3>
                      <div className="space-y-4">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <label className="text-sm font-medium text-white/90 mb-2 block">
                            Ulica i numer
                          </label>
                          <input
                            type="text"
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                            placeholder="Ulica i numer"
                            className="w-full px-4 py-3 bg-black/40 border border-[#A68E4E]/20 rounded-xl text-[#A68E4E] placeholder-[#A68E4E]/40 focus:outline-none focus:ring-2 focus:ring-[#A68E4E]/30 focus:border-[#A68E4E]/50 transition-all duration-200 hover:bg-black/50"
                          />
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.25 }}
                        >
                          <label className="text-sm font-medium text-white/90 mb-2 block">
                            Miasto
                          </label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Miasto"
                            className="w-full px-4 py-3 bg-black/40 border border-[#A68E4E]/20 rounded-xl text-[#A68E4E] placeholder-[#A68E4E]/40 focus:outline-none focus:ring-2 focus:ring-[#A68E4E]/30 focus:border-[#A68E4E]/50 transition-all duration-200 hover:bg-black/50"
                          />
                        </motion.div>
                        <div className="grid grid-cols-2 gap-4">
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            <label className="text-sm font-medium text-white/90 mb-2 block">
                              Kod pocztowy
                            </label>
                            <input
                              type="text"
                              value={postalCode}
                              onChange={(e) => setPostalCode(e.target.value)}
                              placeholder="00-000"
                              className="w-full px-4 py-3 bg-black/40 border border-[#A68E4E]/20 rounded-xl text-[#A68E4E] placeholder-[#A68E4E]/40 focus:outline-none focus:ring-2 focus:ring-[#A68E4E]/30 focus:border-[#A68E4E]/50 transition-all duration-200 hover:bg-black/50"
                            />
                          </motion.div>
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.35 }}
                          >
                            <label className="text-sm font-medium text-white/90 mb-2 block">
                              Kraj
                            </label>
                            <input
                              type="text"
                              value={country}
                              onChange={(e) => setCountry(e.target.value)}
                              placeholder="Polska"
                              className="w-full px-4 py-3 bg-black/40 border border-[#A68E4E]/20 rounded-xl text-[#A68E4E] placeholder-[#A68E4E]/40 focus:outline-none focus:ring-2 focus:ring-[#A68E4E]/30 focus:border-[#A68E4E]/50 transition-all duration-200 hover:bg-black/50"
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
                    >
                      <Button
                        disabled={profileSaving}
                        onClick={onSaveProfile}
                        className="bg-gradient-to-r from-gold to-gold-dark text-navy hover:from-gold-light hover:to-gold font-semibold shadow-lg shadow-gold/30 hover:shadow-xl hover:shadow-gold/50 transition-all duration-300"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {profileSaving ? "Zapisywanie..." : "Zapisz profil"}
                      </Button>
                    </motion.div>

                    {isEmailVerified && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
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
                      className="rounded-2xl border border-white/20 bg-gradient-to-br from-black/60 to-black/40 p-6 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-white/30 transition-all duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      whileHover={{ y: -3 }}
                    >
                      <h3 className="font-display text-xl font-semibold text-white mb-4 flex items-center gap-3">
                        <motion.div
                          animate={{ rotate: [0, -10, 10, 0] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 3,
                          }}
                        >
                          <Shield className="w-6 h-6 text-gold" />
                        </motion.div>
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
                              className="w-full px-4 py-3 bg-black/40 border border-[#A68E4E]/20 rounded-xl text-[#A68E4E] placeholder-[#A68E4E]/40 focus:outline-none focus:ring-2 focus:ring-[#A68E4E]/30 focus:border-[#A68E4E]/50 transition-all duration-200 hover:bg-black/50"
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
                              className="w-full px-4 py-3 bg-black/40 border border-[#A68E4E]/20 rounded-xl text-[#A68E4E] placeholder-[#A68E4E]/40 focus:outline-none focus:ring-2 focus:ring-[#A68E4E]/30 focus:border-[#A68E4E]/50 transition-all duration-200 hover:bg-black/50"
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
                            className="w-full bg-gradient-to-r from-gold to-gold-dark text-navy hover:from-gold-light hover:to-gold font-semibold shadow-lg shadow-gold/30 hover:shadow-xl hover:shadow-gold/50 transition-all duration-300"
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
                        🎓 Samouczek
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
                        🔄 Uruchom samouczek
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
                      whileHover={{ y: -3 }}
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
                  className="h-full space-y-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                              className="w-full bg-gold text-navy hover:bg-gold-light text-xs py-2 h-auto"
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
                                    className="w-full bg-gold text-navy hover:bg-gold-light text-xs py-2 h-auto mt-2"
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
                      <div className="rounded-2xl border border-[#A68E4E]/30 bg-black/40 p-6 space-y-4 flex flex-col justify-between">
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
                                Numer IBAN
                              </label>
                              <input
                                type="text"
                                value={payoutIban}
                                onChange={(e) => setPayoutIban(e.target.value.toUpperCase())}
                                placeholder="PL61 1090 1014 0000 0712 1981 2874"
                                className="w-full px-4 py-3 bg-black/40 border border-[#A68E4E]/20 rounded-xl text-[#A68E4E] placeholder-[#A68E4E]/40 focus:outline-none"
                              />
                            </div>
                          ) : (
                            <div>
                              <label className="text-sm font-medium text-white/90 mb-2 block">
                                Telefon do BLIK
                              </label>
                              <input
                                type="tel"
                                value={payoutPhone}
                                onChange={(e) => setPayoutPhone(e.target.value)}
                                placeholder="+48 600 000 000"
                                className="w-full px-4 py-3 bg-black/40 border border-[#A68E4E]/20 rounded-xl text-[#A68E4E] placeholder-[#A68E4E]/40 focus:outline-none"
                              />
                            </div>
                          )}
                        </div>
                        
                        <Button
                          disabled={profileSaving}
                          onClick={onSaveProfile}
                          className="bg-gradient-to-r from-[#A68E4E] to-gold-dark text-navy hover:from-gold-light hover:to-gold w-fit font-semibold shadow-lg shadow-gold/30 hover:shadow-xl hover:shadow-gold/50 transition-all duration-300 mt-4"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {profileSaving ? "Zapisywanie..." : "Zapisz ustawienia wypłat"}
                        </Button>
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
