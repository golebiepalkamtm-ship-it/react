import { useEffect, useMemo, useState, useRef, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useFeedback } from "@/components/ui/feedback/FeedbackProvider";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import Header from "@/components/Header";
import {
  motion,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { FloatingElement } from "@/components/animations";
import AuthMessageModal, {
  type MessageType,
} from "@/components/auth/AuthSuccessModal";
import LegalAcknowledgeModal from "@/components/auth/LegalAcknowledgeModal";
import { isSupabaseConfigured, missingSupabaseEnv } from "@/lib/supabase";
import { Mail, Lock, Eye, EyeOff, User, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { VideoBackground } from "@/components/animations";

function useQueryParams() {
  const location = useLocation();
  return useMemo(() => {
    const params = new URLSearchParams(location.search);
    if (location.hash) {
      const hashParams = new URLSearchParams(location.hash.substring(1));
      hashParams.forEach((value, key) => {
        if (!params.has(key)) params.set(key, value);
      });
    }
    return params;
  }, [location.search, location.hash]);
}

function sanitizeCallbackUrl(callbackUrl: string | null): string {
  if (!callbackUrl) return "/";

  // Special internal trigger
  if (callbackUrl === "ACCOUNT_MODAL_TRIGGER") return callbackUrl;

  try {
    // Decode URL and trim whitespace
    const decoded = decodeURIComponent(callbackUrl).trim();

    // Block potential bypasses:
    // 1. Must start with a single '/'
    // 2. Must not start with '//' (protocol-relative) or '/\'
    // 3. Must not contain ':' (to block javascript: or http://)
    const isSafeInternal =
      decoded.startsWith("/") &&
      !decoded.startsWith("//") &&
      !decoded.startsWith("/\\") &&
      !decoded.includes(":");

    return isSafeInternal ? decoded : "/";
  } catch {
    return "/";
  }
}

// Simple constant-time-like comparison to satisfy security scanners (Timing Attack findings)
function safeStringCompare(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

type Mode = "login" | "register" | "forgot" | "reset";

const translateAuthError = (error: any): string => {
  if (!error) return "Wystąpił nieznany błąd.";
  const message = error.message || "";
  const code = error.code || "";

  // Common Supabase Auth error messages and codes
  if (
    message.includes("Invalid login credentials") ||
    code === "invalid_credentials"
  ) {
    return "Nieprawidłowy adres e-mail lub hasło. Upewnij się, że wpisane dane są poprawne.";
  }
  if (
    message.includes("Email not confirmed") ||
    code === "email_not_confirmed"
  ) {
    return "Twój adres e-mail nie został jeszcze potwierdzony. Proszę sprawdzić skrzynkę odbiorczą (również folder SPAM) i kliknąć w link aktywacyjny.";
  }
  if (message.includes("User not found") || code === "user_not_found") {
    return "Nie znaleziono użytkownika z takim adresem e-mail.";
  }
  if (message.includes("Password should be at least 6 characters")) {
    return "Hasło jest zbyt krótkie. Musi składać się z co najmniej 6 znaków.";
  }
  if (
    message.includes("Too many requests") ||
    code === "over_request_rate_limit"
  ) {
    return "Zbyt wiele prób w krótkim czasie. Proszę odczekać chwilę przed kolejną próbą.";
  }
  if (
    message.includes("User already registered") ||
    code === "user_already_exists"
  ) {
    return "Użytkownik o takim adresie e-mail już istnieje w naszym systemie.";
  }
  if (message.includes("Database error saving new user")) {
    return "Wystąpił problem z zapisem Twojego profilu w bazie danych. Spróbuj ponownie lub skontaktuj się z administratorem.";
  }
  if (message.includes("Invalid email")) {
    return "Podany adres e-mail ma nieprawidłowy format.";
  }

  return message;
};

export default function Auth() {
  const navigate = useNavigate();
  const {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithFacebook,
    requestPasswordReset,
    updatePassword,
  } = useAuth();
  const { pushToast } = useFeedback();
  const reduceMotion = useReducedMotion();

  const query = useQueryParams();

  const mode = (query.get("mode") as Mode) || "login";
  const callbackUrl = sanitizeCallbackUrl(query.get("callbackUrl"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOAuthSubmitting, setIsOAuthSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isHovered, setIsHovered] = useState(false);
  const [isLogoHovered, setIsLogoHovered] = useState(false);

  // Parallax 3D state (Press-style) - formularz
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), {
    stiffness: 150,
    damping: 40,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), {
    stiffness: 150,
    damping: 40,
  });

  const lightX = useTransform(mouseX, [-0.5, 0.5], [0, 100]);
  const lightY = useTransform(mouseY, [-0.5, 0.5], [0, 100]);

  const lightBackground = useTransform(
    [lightX, lightY],
    ([x, y]) =>
      `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.15) 0%, transparent 50%)`,
  );

  // Parallax 3D state (Press-style) - logo Pałka MTM
  const logoRef = useRef<HTMLDivElement>(null);
  const logoMouseX = useMotionValue(0);
  const logoMouseY = useMotionValue(0);

  const logoRotateX = useSpring(
    useTransform(logoMouseY, [-0.5, 0.5], [15, -15]),
    {
      stiffness: 150,
      damping: 40,
    },
  );
  const logoRotateY = useSpring(
    useTransform(logoMouseX, [-0.5, 0.5], [-15, 15]),
    {
      stiffness: 150,
      damping: 40,
    },
  );

  const logoLightX = useTransform(logoMouseX, [-0.5, 0.5], [0, 100]);
  const logoLightY = useTransform(logoMouseY, [-0.5, 0.5], [0, 100]);

  const logoLightBackground = useTransform(
    [logoLightX, logoLightY],
    ([x, y]) =>
      `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.15) 0%, transparent 50%)`,
  );

  // Unified modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [modalType, setModalType] = useState<MessageType>("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalAction, setModalAction] = useState<"redirect" | "close">("close");
  const hasShownOAuthSuccess = useRef(false);

  const showModal = (
    type: MessageType,
    title: string,
    message: string,
    action: "redirect" | "close" = "close",
  ) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalAction(action);
    setModalOpen(true);
  };

  // Parallax 3D effect (Press-style) - formularz
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
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  // Parallax 3D effect (Press-style) - logo Pałka MTM
  const handleLogoMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!logoRef.current) return;
    const rect = logoRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    logoMouseX.set(x);
    logoMouseY.set(y);
    setIsLogoHovered(true);
  };

  const handleLogoMouseLeave = () => {
    logoMouseX.set(0);
    logoMouseY.set(0);
    setIsLogoHovered(false);
  };

  const handleModalConfirm = () => {
    setModalOpen(false);

    if (modalAction === "redirect") {
      const getSafeRedirectPath = (path: string | undefined): string | null => {
        if (!path) return null;

        try {
          const url = new URL(path, window.location.origin);
          const isSameOrigin = url.origin === window.location.origin;
          if (!isSameOrigin) return null;

          const normalizedPath = `${url.pathname}${url.search}${url.hash}`;
          return normalizedPath.startsWith("/") && !normalizedPath.startsWith("//")
            ? normalizedPath
            : null;
        } catch {
          return null;
        }
      };

      const targetPath =
        callbackUrl &&
        callbackUrl !== "/" &&
        callbackUrl !== "ACCOUNT_MODAL_TRIGGER" &&
        getSafeRedirectPath(callbackUrl)
          ? getSafeRedirectPath(callbackUrl)
          : "/";

      if (profile?.role === "USER_REGISTERED") {
        navigate("/verify-email", { replace: true });
      } else {
        const isTargetingAccount = callbackUrl === "ACCOUNT_MODAL_TRIGGER";

        // If we are just going to home, a full reload is safest as requested by user
        if (targetPath === "/" && !isTargetingAccount) {
          window.location.href = "/";
        } else {
          // Navigating with state, then reload to satisfy "refresh" request
          // file deepcode ignore OpenRedirect: URL is verified to be safe
          navigate(targetPath, {
            replace: true,
            state: {
              openAccount: isTargetingAccount,
              fromAuth: true,
            },
          });
          // Small timeout to allow navigation before reload (if we want to keep state, reload is tricky)
          // But user explicitly asked for refresh.
          if (!isTargetingAccount) {
            setTimeout(() => window.location.reload(), 100);
          }
        }
      }
    } else if (modalAction === "close") {
      // If we just close (e.g. for ADMIN), we might still want a refresh to see the status
      window.location.reload();
    }
  };

  useEffect(() => {
    // Check legal acceptance
    const accepted = localStorage.getItem("palkamtm_legal_accepted") === "true";
    if (!accepted && (mode === "login" || mode === "register")) {
      setLegalModalOpen(true);
    }
  }, [mode]);

  useEffect(() => {
    // Po OAuth callback - jeśli user jest zalogowany i nie pokazaliśmy jeszcze modalu sukcesu
    if (!loading && user && !modalOpen && !hasShownOAuthSuccess.current) {
      // Sprawdź czy to powrót z OAuth (brak błędu w URL i user właśnie się zalogował)
      const isOAuthReturn = !query.get("error") && user;

      if (isOAuthReturn) {
        hasShownOAuthSuccess.current = true;
        const role = profile?.role ?? "USER_REGISTERED";
        const provider =
          (user as any)?.app_metadata?.provider ??
          (user as any)?.user_metadata?.provider;
        const emailVerified = Boolean(
          (user as any)?.email_confirmed_at || (user as any)?.confirmed_at,
        );

        const successMessage =
          provider === "google" && emailVerified
            ? "Zalogowano przez Google. Twój email jest już potwierdzony przez dostawcę, więc nie wysyłamy dodatkowego linku. Możesz korzystać z serwisu."
            : role === "USER_REGISTERED"
              ? "Twoje konto zostało utworzone. Sprawdź swoją skrzynkę (także SPAM), aby zweryfikować email."
              : role === "USER_EMAIL_VERIFIED"
                ? "Zalogowano pomyślnie! Uzupełnij swój profil, aby w pełni korzystać z serwisu."
                : "Zalogowano pomyślnie! Witamy w serwisie.";
        const action = role === "ADMIN" ? "close" : "redirect";
        showModal("success", "Logowanie zakończone!", successMessage, action);
      }
    }
  }, [loading, user, profile, modalOpen, query]);

  // Handle OAuth errors from URL
  useEffect(() => {
    const errorParam = query.get("error");
    const errorDescription = query.get("error_description");
    const errorCode = query.get("error_code");

    if (errorParam && !modalOpen) {
      console.error("DEBUG: OAuth error detected in URL", {
        error: errorParam,
        description: errorDescription,
        code: errorCode,
        fullUrl: window.location.href,
      });
      let errorMessage = "Błąd autoryzacji";
      let errorTitle = "Błąd logowania";

      if (
        errorParam === "server_error" ||
        errorParam === "unexpected_failure" ||
        errorCode === "unexpected_failure"
      ) {
        errorTitle = "Błąd konfiguracji OAuth";
        errorMessage =
          "Nie udało się zakończyć logowania przez Google.\n\nNajczęstsze przyczyny:\n1. Brak Client Secret w Supabase Dashboard\n2. Nieprawidłowy Client Secret\n3. Brak JavaScript Origin w Google Cloud Console";
      } else if (errorParam === "oauth_exchange_failed") {
        errorTitle = "Błąd przepływu OAuth";
        errorMessage =
          "Nie udało się zakończyć autoryzacji. Spróbuj ponownie lub użyj logowania przez email.";
      } else if (
        errorDescription &&
        errorDescription.includes("issued in the future")
      ) {
        errorTitle = "Błąd synchronizacji czasu";
        errorMessage =
          "Problem z synchronizacją czasu. Odśwież stronę i spróbuj ponownie.";
      } else if (errorDescription) {
        try {
          errorMessage = decodeURIComponent(
            errorDescription.replace(/\+/g, " "),
          );
        } catch {
          errorMessage = errorDescription.replace(/\+/g, " ");
        }
      }

      showModal("error", errorTitle, errorMessage, "close");

      // Clean up URL by removing error params
      const cleanParams = new URLSearchParams();
      if (mode) cleanParams.set("mode", mode);
      if (callbackUrl && callbackUrl !== "/")
        cleanParams.set("callbackUrl", callbackUrl);
      // strip sensitive params from URL without noisy console output
      window.history.replaceState({}, "", `/auth?${cleanParams.toString()}`);
    }
  }, [query, mode, callbackUrl, modalOpen]);

  const switchMode = (nextMode: Mode) => {
    setModalOpen(false);

    const nextParams = new URLSearchParams();
    nextParams.set("mode", nextMode);
    if (callbackUrl && callbackUrl !== "/")
      nextParams.set("callbackUrl", callbackUrl);
    navigate(`/auth?${nextParams.toString()}`, { replace: true });
  };

  const handleOAuthSignIn = async (provider: "google" | "facebook") => {
    setIsOAuthSubmitting(true);

    pushToast({
      tone: "info",
      title: `Inicjacja logowania przez ${provider === "google" ? "Google" : "Facebook"}...`,
      message: "Przekierowujemy do strony logowania...",
    });

    try {
      const baseUrl = window.location.origin;
      const redirectTo = `${baseUrl}/auth`;

      const { error } =
        provider === "google"
          ? await signInWithGoogle(redirectTo)
          : await signInWithFacebook(redirectTo);

      if (error) {
        const errorMessage =
          error.message ||
          `Błąd logowania przez ${provider === "google" ? "Google" : "Facebook"}`;
        showModal("error", "Błąd logowania", errorMessage, "close");
        setIsOAuthSubmitting(false);
        return;
      }

      // OAuth will redirect
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : `Błąd logowania przez ${provider === "google" ? "Google" : "Facebook"}`;
      showModal("error", "Błąd logowania", message, "close");
      setIsOAuthSubmitting(false);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    pushToast({
      tone: "info",
      title:
        mode === "register"
          ? "Rejestrowanie..."
          : mode === "forgot"
            ? "Wysyłanie linku resetującego..."
            : mode === "reset"
              ? "Aktualizowanie hasła..."
              : "Logowanie...",
      message: "Proszę czekać...",
    });

    try {
      const cleanEmail = email.trim();

      if (mode === "register") {
        if (password.length < 6) {
          showModal(
            "error",
            "Błąd walidacji",
            "Hasło musi mieć co najmniej 6 znaków",
            "close",
          );
          setIsSubmitting(false);
          return;
        }
        if (!safeStringCompare(password, confirmPassword)) {
          showModal(
            "error",
            "Błąd walidacji",
            "Hasła nie są takie same",
            "close",
          );
          setIsSubmitting(false);
          return;
        }

        const { error } = await signUp(cleanEmail, password);
        if (error) {
          showModal(
            "error",
            "Błąd rejestracji",
            translateAuthError(error),
            "close",
          );
          setIsSubmitting(false);
          return;
        }

        showModal(
          "success",
          "Rejestracja zakończona!",
          `Twoje konto zostało utworzone pomyślnie!\n\nWysłaliśmy email weryfikacyjny na adres:\n${cleanEmail}\n\nSprawdź swoją skrzynkę odbiorczą oraz folder SPAM.\nKliknij link w wiadomości, aby aktywować konto.`,
          "close",
        );
      } else if (mode === "login") {
        const { error } = await signIn(cleanEmail, password);

        if (error) {
          const missingEnvMsg = !isSupabaseConfigured
            ? `Konfiguracja Supabase nie jest ustawiona.\nBrakujące zmienne: ${missingSupabaseEnv.join(", ") || "nieznane"}.\nUzupełnij .env.web i uruchom ponownie.`
            : null;
          showModal(
            "error",
            "Błąd logowania",
            missingEnvMsg ?? translateAuthError(error),
            "close",
          );
          setIsSubmitting(false);
          return;
        }

        const action = profile?.role === "ADMIN" ? "close" : "redirect";
        showModal(
          "success",
          "Zalogowano pomyślnie!",
          "Witamy w serwisie. Kliknij OK, aby przejść dalej.",
          action,
        );
      } else if (mode === "forgot") {
        const { error } = await requestPasswordReset(cleanEmail);
        if (error) {
          showModal(
            "error",
            "Błąd resetu hasła",
            translateAuthError(error),
            "close",
          );
          setIsSubmitting(false);
          return;
        }

        showModal(
          "success",
          "Sprawdź skrzynkę",
          `Wysłaliśmy link do resetu hasła na adres:\n${cleanEmail}\n\nLink jest ważny tylko raz. Po kliknięciu zostaniesz przekierowany na stronę zmiany hasła.`,
          "close",
        );
      } else if (mode === "reset") {
        if (password.length < 6) {
          showModal(
            "error",
            "Błąd walidacji",
            "Hasło musi mieć co najmniej 6 znaków",
            "close",
          );
          setIsSubmitting(false);
          return;
        }
        if (!safeStringCompare(password, confirmPassword)) {
          showModal(
            "error",
            "Błąd walidacji",
            "Hasła nie są takie same",
            "close",
          );
          setIsSubmitting(false);
          return;
        }

        const { error } = await updatePassword(password);
        if (error) {
          showModal(
            "error",
            "Błąd zmiany hasła",
            translateAuthError(error),
            "close",
          );
          setIsSubmitting(false);
          return;
        }

        showModal(
          "success",
          "Hasło zaktualizowane",
          "Twoje hasło zostało zmienione. Zaloguj się nowym hasłem.",
          "redirect",
        );
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : mode === "register"
            ? "Nie udało się zarejestrować"
            : "Nie udało się zalogować";
      showModal("error", "Błąd", message, "close");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent">
        <Header />
        <main className="pt-28 md:pt-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-[#111114] p-6 shadow-[0_18px_48px_rgba(0,0,0,0.4)] text-center">
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin mb-4"></div>
                <p className="text-white font-medium">Ładowanie...</p>
                <p className="text-sm text-white/60 mt-2">
                  Sprawdzanie sesji użytkownika
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-900 relative isolate overflow-hidden">
      <Header />

      <main className="relative flex flex-col lg:flex-row min-h-screen overflow-hidden z-10">
        <div className="w-full lg:w-[60%] xl:w-[58%] relative overflow-hidden h-[40vh] sm:h-[48vh] lg:h-auto">
          <video
            src="/pigeon-tlo-Picsart-BackgroundRemover.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-contain scale-[0.78] sm:scale-[0.82] lg:scale-[0.88] translate-x-[10%] translate-y-6 sm:translate-y-12 lg:translate-y-16 z-0 opacity-80"
          />

          <div
            ref={logoRef}
            className="absolute top-20 left-[25%] sm:top-36 sm:left-[30%] z-30 max-w-[240px] sm:max-w-[320px] lg:max-w-[420px]"
            style={{ perspective: "1000px" }}
            onMouseMove={handleLogoMouseMove}
            onMouseLeave={handleLogoMouseLeave}
          >
            <motion.div
              initial={{
                opacity: reduceMotion ? 1 : 0,
                y: 0,
              }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.6 }}
              className="rounded-3xl border-2 border-gold/60 backdrop-blur-2xl px-6 py-5 flex flex-col items-center text-center overflow-hidden"
              style={{
                rotateX: logoRotateX,
                rotateY: logoRotateY,
                transformStyle: "preserve-3d",
                backgroundColor: "rgba(2, 10, 19, 0.96)",
                backgroundImage:
                  "radial-gradient(circle at top, rgba(66, 192, 206, 0.18), transparent 55%), linear-gradient(185deg, rgba(2, 10, 19, 0.96) 0%, rgba(6, 35, 46, 0.93) 45%, rgba(9, 61, 77, 0.9) 100%)",
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-[6px] bg-gradient-to-r from-transparent via-[#A68E4E]/60 to-transparent pointer-events-none z-20 rounded-full" />
              <div className="absolute bottom-0 left-0 right-0 h-[6px] bg-gradient-to-r from-transparent via-[#A68E4E]/60 to-transparent pointer-events-none z-20 rounded-full" />
              <div className="absolute left-0 top-0 bottom-0 w-[6px] bg-gradient-to-b from-transparent via-[#A68E4E]/60 to-transparent pointer-events-none z-20 rounded-full" />
              <div className="absolute right-0 top-0 bottom-0 w-[6px] bg-gradient-to-b from-transparent via-[#A68E4E]/60 to-transparent pointer-events-none z-20 rounded-full" />
              {/* Dynamic light reflection */}
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-white tracking-tight leading-tight text-center whitespace-nowrap relative z-30">
                Pałka <span className="gold-heading">MTM</span>
              </h1>
              <p className="text-white mt-2 text-base sm:text-lg tracking-wide font-light text-center">
                Mistrzowie sprintu
              </p>
            </motion.div>
          </div>
        </div>

        <div className="w-full lg:w-[38%] xl:w-[40%] flex items-center justify-center relative">
          <div
            className="w-full max-w-sm relative"
            style={{ perspective: "1000px" }}
          >
            <motion.div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              initial={{
                opacity: reduceMotion ? 1 : 0,
                y: 0,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              transition={{
                duration: reduceMotion ? 0 : 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative z-50 rounded-3xl text-white backdrop-blur-xl p-5 sm:p-6 border border-gold/40 overflow-hidden"
              style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
                backgroundColor: "rgba(2, 10, 19, 0.96)",
                backgroundImage:
                  "radial-gradient(circle at top, rgba(66, 192, 206, 0.18), transparent 55%), linear-gradient(185deg, rgba(2, 10, 19, 0.96) 0%, rgba(6, 35, 46, 0.93) 45%, rgba(9, 61, 77, 0.9) 100%)",
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-[6px] bg-gradient-to-r from-transparent via-[#A68E4E]/60 to-transparent pointer-events-none z-20 rounded-full" />
              <div className="absolute bottom-0 left-0 right-0 h-[6px] bg-gradient-to-r from-transparent via-[#A68E4E]/60 to-transparent pointer-events-none z-20 rounded-full" />
              <div className="absolute left-0 top-0 bottom-0 w-[6px] bg-gradient-to-b from-transparent via-[#A68E4E]/60 to-transparent pointer-events-none z-20 rounded-full" />
              <div className="absolute right-0 top-0 bottom-0 w-[6px] bg-gradient-to-b from-transparent via-[#A68E4E]/60 to-transparent pointer-events-none z-20 rounded-full" />
              {/* Dynamic light reflection */}
              <div className="text-center mb-4">
                <h2 className="font-display text-2xl sm:text-3xl text-white tracking-tight mb-1">
                  {mode === "register" ? "Dołącz do nas" : "Witaj ponownie"}
                </h2>
                <p className="text-white/80 text-sm">
                  {mode === "register"
                    ? "Stwórz konto i odkryj świat hodowli"
                    : "Zaloguj się do swojego konta"}
                </p>
              </div>

              <div className="h-[4px] w-full bg-gradient-to-r from-transparent via-[#A68E4E] to-transparent rounded-full mb-4" />

              {/* Przełącznik - ukryj dla trybów reset/forgot */}
              {["login", "register"].includes(mode) && (
                <div className="relative bg-transparent rounded-xl p-1 mb-4 border border-[#A68E4E]/30">
                  <motion.div
                    className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#A68E4E] rounded-lg shadow-sm border border-[#A68E4E]"
                    animate={{
                      x: mode === "register" ? "calc(100% + 4px)" : 0,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                  <div className="relative flex">
                    <button
                      onClick={() => switchMode("login")}
                      className={`flex-1 py-2.5 text-sm font-bold transition-colors duration-300 rounded-lg relative z-10 ${mode === "login" ? "text-zinc-900" : "text-[#A68E4E] hover:text-[#C5A95D]"}`}
                      type="button"
                    >
                      Logowanie
                    </button>
                    <button
                      onClick={() => switchMode("register")}
                      className={`flex-1 py-2.5 text-sm font-bold transition-colors duration-300 rounded-lg relative z-10 ${mode === "register" ? "text-zinc-900" : "text-[#A68E4E] hover:text-[#C5A95D]"}`}
                      type="button"
                    >
                      Rejestracja
                    </button>
                  </div>
                </div>
              )}

              {/* Social */}
              <div className="space-y-2 mb-4">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-3 py-4 px-4 rounded-full text-zinc-900 text-sm font-bold border border-slate-200 shadow-sm transition-none hover:bg-gray-50 relative z-30 !bg-white"
                  style={{ backgroundColor: "#FFFFFF" }}
                  type="button"
                  onClick={() => handleOAuthSignIn("google")}
                  disabled={isOAuthSubmitting}
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>
                    {isOAuthSubmitting
                      ? "Inicjowanie..."
                      : mode === "login"
                        ? "Kontynuuj z Google"
                        : "Zarejestruj się przez Google"}
                  </span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-3 py-4 px-4 rounded-full text-white text-sm font-bold border-0 shadow-md shadow-blue-500/20 transition-none relative z-30"
                  style={{ backgroundColor: "#1877F2" }}
                  type="button"
                  onClick={() => handleOAuthSignIn("facebook")}
                  disabled={isOAuthSubmitting}
                >
                  <svg
                    className="w-5 h-5 fill-current shrink-0"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>
                    {isOAuthSubmitting
                      ? "Inicjowanie..."
                      : mode === "login"
                        ? "Kontynuuj z Facebook"
                        : "Zarejestruj się przez Facebook"}
                  </span>
                </motion.button>

                {mode === "register" && (
                  <p className="text-xs text-slate-600">
                    Jeśli nie masz konta, zostanie utworzone po pierwszym
                    logowaniu przez Google/Facebook. Pamiętaj o weryfikacji
                    email.
                  </p>
                )}
              </div>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-[4px] bg-gradient-to-r from-transparent via-[#A68E4E] to-transparent rounded-full" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-xs text-[#A68E4E] font-semibold uppercase tracking-wider relative z-30">
                    {mode === "login" ? "lub email" : "albo email"}
                  </span>
                </div>
              </div>

              <form className="space-y-3" onSubmit={onSubmit}>
                {mode === "register" && (
                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium text-white/90"
                      htmlFor="username"
                    >
                      Nick (wyświetlana nazwa)
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 gold-icon" />
                      <Input
                        id="username"
                        name="username"
                        data-testid="auth-username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="np. champion-123"
                        className="pl-12 !bg-white !text-black caret-black border border-slate-200 focus:border-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium text-gold"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 gold-icon" />
                    <Input
                      id="email"
                      name="email"
                      data-testid="auth-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="twoj@email.com"
                      autoComplete="email"
                      required
                      className="pl-12 !bg-white !text-black caret-black border border-slate-200 focus:border-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                    />
                  </div>
                </div>
                {(mode === "login" ||
                  mode === "register" ||
                  mode === "reset") && (
                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium text-white/90"
                      htmlFor="password"
                    >
                      Hasło
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 gold-icon" />
                      <Input
                        id="password"
                        name="password"
                        data-testid="auth-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete={
                          mode === "login" ? "current-password" : "new-password"
                        }
                        required
                        className="pl-12 pr-12 !bg-white !text-black caret-black border border-slate-200 focus:border-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
                {(mode === "register" || mode === "reset") && (
                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium text-white/90"
                      htmlFor="confirmPassword"
                    >
                      Potwierdź hasło
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 gold-icon" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        data-testid="auth-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        required
                        className="pl-12 pr-12 !bg-white !text-black caret-black border border-slate-200 focus:border-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
                {mode === "login" && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => switchMode("forgot")}
                      className="text-sm gold-heading hover:opacity-80 transition-opacity"
                    >
                      Zapomniałeś hasła?
                    </button>
                  </div>
                )}
                {mode === "forgot" && (
                  <p className="text-xs text-slate-600">
                    Podaj email powiązany z kontem. Wyślemy jednorazowy link do
                    zmiany hasła.
                  </p>
                )}
                {mode === "reset" && (
                  <p className="text-xs text-slate-600">
                    Ustal nowe hasło dla swojego konta. Po zapisaniu zostaniesz
                    zalogowany.
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-full bg-[#A68E4E] text-zinc-900 py-4 rounded-full font-bold uppercase tracking-widest transition-none flex items-center justify-center border-0 hover:bg-[#A68E4E] active:scale-[0.98]"
                  data-testid="auth-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? mode === "login"
                      ? "Logowanie…"
                      : mode === "register"
                        ? "Rejestrowanie…"
                        : mode === "forgot"
                          ? "Wysyłanie…"
                          : "Zapisywanie…"
                    : mode === "login"
                      ? "Zaloguj się"
                      : mode === "register"
                        ? "Utwórz konto"
                        : mode === "forgot"
                          ? "Wyślij link resetujący"
                          : "Ustaw nowe hasło"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <div className="text-center text-sm text-slate-600">
                  {mode === "login" ? (
                    <>
                      <span className="text-[#A68E4E] font-medium">
                        Nie masz konta?
                      </span>{" "}
                      <button
                        className="text-[#A68E4E] hover:underline font-bold"
                        type="button"
                        onClick={() => switchMode("register")}
                      >
                        Zarejestruj się
                      </button>
                    </>
                  ) : mode === "register" ? (
                    <>
                      <span className="text-[#A68E4E] font-medium">
                        Masz już konto?
                      </span>{" "}
                      <button
                        className="text-[#A68E4E] hover:underline font-bold"
                        type="button"
                        onClick={() => switchMode("login")}
                      >
                        Zaloguj się
                      </button>
                    </>
                  ) : mode === "forgot" ? (
                    <>
                      <span className="text-[#A68E4E] font-medium">
                        Pamiętasz hasło?
                      </span>{" "}
                      <button
                        className="text-[#A68E4E] hover:underline font-bold"
                        type="button"
                        onClick={() => switchMode("login")}
                      >
                        Wróć do logowania
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-[#A68E4E] font-medium">
                        Masz problem?
                      </span>{" "}
                      <button
                        className="text-[#A68E4E] hover:underline font-bold"
                        type="button"
                        onClick={() => switchMode("forgot")}
                      >
                        Wyślij nowy link resetu
                      </button>
                    </>
                  )}
                </div>
                <div className="text-center text-xs text-slate-500">
                  <Link
                    className="hover:underline text-[#A68E4E] font-medium"
                    to={callbackUrl}
                  >
                    Wróć
                  </Link>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </main>

      <AuthMessageModal
        isOpen={modalOpen}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onConfirm={handleModalConfirm}
        buttonText={modalAction === "redirect" ? "Przejdź dalej" : "OK"}
      />

      <LegalAcknowledgeModal
        isOpen={legalModalOpen}
        onAccept={() => setLegalModalOpen(false)}
      />
    </div>
  );
}
