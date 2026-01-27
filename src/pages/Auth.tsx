import { useEffect, useMemo, useState, useRef, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useFeedback } from "@/components/ui/feedback/FeedbackProvider";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import Header from "@/components/Header";
import { motion, useReducedMotion } from "framer-motion";
import { FloatingElement } from '@/components/animations';
import AuthMessageModal, { type MessageType } from "@/components/auth/AuthSuccessModal";
import { isSupabaseConfigured, missingSupabaseEnv } from "@/lib/supabase";
import { Mail, Lock, Eye, EyeOff, User, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { VideoBackground } from '@/components/animations';

function useQueryParams() {
  const location = useLocation();
  return useMemo(() => new URLSearchParams(location.search), [location.search]);
}

function sanitizeCallbackUrl(callbackUrl: string | null): string {
  return callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/";
}

type Mode = "login" | "register";

export default function Auth() {
  const navigate = useNavigate();
  const { user, profile, loading, signUp, signIn, signInWithGoogle, signInWithFacebook } = useAuth();
  const { t } = useLocale();
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Unified modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<MessageType>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalAction, setModalAction] = useState<'redirect' | 'close'>('close');
  const hasShownOAuthSuccess = useRef(false);

  const showModal = (type: MessageType, title: string, message: string, action: 'redirect' | 'close' = 'close') => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalAction(action);
    setModalOpen(true);
  };

  const handleModalConfirm = () => {
    setModalOpen(false);
    
    if (modalAction === 'redirect' && profile?.role !== 'ADMIN') {
      // Przekieruj na podstawie roli
      if (profile?.role === "USER_REGISTERED") {
        navigate("/verify-email", { replace: true });
      } else {
        navigate("/", { replace: true, state: { openAccount: true } });
      }
    }
  };

  useEffect(() => {
    console.log('Auth useEffect:', { loading, user: !!user, profile: profile?.role, modalOpen, hasShownOAuthSuccess: hasShownOAuthSuccess.current });
    
    // Po OAuth callback - jeśli user jest zalogowany i nie pokazaliśmy jeszcze modalu sukcesu
    if (!loading && user && profile && !modalOpen && !hasShownOAuthSuccess.current) {
      // Sprawdź czy to powrót z OAuth (brak błędu w URL i user właśnie się zalogował)
      const isOAuthReturn = !query.get("error") && user;
      
      if (isOAuthReturn) {
        console.log('OAuth success detected, showing success modal');
        hasShownOAuthSuccess.current = true;
        const successMessage = profile.role === "USER_REGISTERED"
          ? "Twoje konto zostało utworzone. Sprawdź swoją skrzynkę email, aby zweryfikować adres."
          : profile.role === "USER_EMAIL_VERIFIED"
            ? "Zalogowano pomyślnie! Uzupełnij swój profil, aby w pełni korzystać z serwisu."
            : "Zalogowano pomyślnie! Witamy w serwisie.";
        const action = profile.role === "ADMIN" ? 'close' : 'redirect';
        showModal('success', 'Logowanie zakończone!', successMessage, action);
      }
    }
  }, [loading, user, profile, modalOpen, query]);

  // Handle OAuth errors from URL
  useEffect(() => {
    const errorParam = query.get("error");
    const errorDescription = query.get("error_description");
    const errorCode = query.get("error_code");
    
    if (errorParam && !modalOpen) {
      let errorMessage = "Błąd autoryzacji";
      let errorTitle = "Błąd logowania";
      
      if (errorParam === "server_error" || errorParam === "unexpected_failure" || errorCode === "unexpected_failure") {
        errorTitle = "Błąd konfiguracji OAuth";
        errorMessage = "Nie udało się zakończyć logowania przez Google.\n\nNajczęstsze przyczyny:\n1. Brak Client Secret w Supabase Dashboard\n2. Nieprawidłowy Client Secret\n3. Brak JavaScript Origin w Google Cloud Console";
      } else if (errorParam === "oauth_exchange_failed") {
        errorTitle = "Błąd przepływu OAuth";
        errorMessage = "Nie udało się zakończyć autoryzacji. Spróbuj ponownie lub użyj logowania przez email.";
      } else if (errorDescription && errorDescription.includes("issued in the future")) {
        errorTitle = "Błąd synchronizacji czasu";
        errorMessage = "Problem z synchronizacją czasu. Odśwież stronę i spróbuj ponownie.";
      } else if (errorDescription) {
        try {
          errorMessage = decodeURIComponent(errorDescription.replace(/\+/g, " "));
        } catch {
          errorMessage = errorDescription.replace(/\+/g, " ");
        }
      }
      
      showModal('error', errorTitle, errorMessage, 'close');
      
      // Clean up URL by removing error params
      const cleanParams = new URLSearchParams();
      if (mode) cleanParams.set("mode", mode);
      if (callbackUrl && callbackUrl !== "/") cleanParams.set("callbackUrl", callbackUrl);
      window.history.replaceState({}, "", `/auth?${cleanParams.toString()}`);
    }
  }, [query, mode, callbackUrl, modalOpen]);

  const switchMode = (nextMode: Mode) => {
    setModalOpen(false);

    const nextParams = new URLSearchParams();
    nextParams.set("mode", nextMode);
    if (callbackUrl && callbackUrl !== "/") nextParams.set("callbackUrl", callbackUrl);
    navigate(`/auth?${nextParams.toString()}`, { replace: true });
  };

  const handleOAuthSignIn = async (provider: 'google' | 'facebook') => {
    setIsOAuthSubmitting(true);
    
    pushToast({
      tone: 'info',
      title: `Inicjacja logowania przez ${provider === 'google' ? 'Google' : 'Facebook'}...`,
      message: "Przekierowujemy do strony logowania...",
    });
    
    try {
      const { error } =
        provider === 'google'
          ? await signInWithGoogle()
          : await signInWithFacebook();
      
      if (error) {
        const errorMessage = error.message || `Błąd logowania przez ${provider === 'google' ? 'Google' : 'Facebook'}`;
        showModal('error', 'Błąd logowania', errorMessage, 'close');
        setIsOAuthSubmitting(false);
        return;
      }
      
      // OAuth will redirect
    } catch (err) {
      const message = err instanceof Error ? err.message : `Błąd logowania przez ${provider === 'google' ? 'Google' : 'Facebook'}`;
      showModal('error', 'Błąd logowania', message, 'close');
      setIsOAuthSubmitting(false);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log('🚀 onSubmit started:', { mode, email: email.substring(0, 3) + '***' });
    setIsSubmitting(true);

    pushToast({
      tone: 'info',
      title: mode === "register" ? "Rejestrowanie..." : "Logowanie...",
      message: "Proszę czekać...",
    });

    try {
      const cleanEmail = email.trim();

      if (mode === "register") {
        if (password.length < 6) {
          showModal('error', 'Błąd walidacji', 'Hasło musi mieć co najmniej 6 znaków', 'close');
          setIsSubmitting(false);
          return;
        }
        if (password !== confirmPassword) {
          showModal('error', 'Błąd walidacji', 'Hasła nie są takie same', 'close');
          setIsSubmitting(false);
          return;
        }

        const { error } = await signUp(cleanEmail, password);
        if (error) {
          showModal('error', 'Błąd rejestracji', error.message || 'Nie udało się zarejestrować', 'close');
          setIsSubmitting(false);
          return;
        }

        showModal(
          'success', 
          'Rejestracja zakończona!', 
          `Twoje konto zostało utworzone pomyślnie!\n\nWysłaliśmy email weryfikacyjny na adres:\n${cleanEmail}\n\nSprawdź swoją skrzynkę odbiorczą oraz folder SPAM.\nKliknij link w wiadomości, aby aktywować konto.`,
          'close'
        );
      } else {
        const { error } = await signIn(cleanEmail, password);
        
        if (error) {
          const missingEnvMsg = !isSupabaseConfigured
            ? `Konfiguracja Supabase nie jest ustawiona.\nBrakujące zmienne: ${missingSupabaseEnv.join(', ') || 'nieznane'}.\nUzupełnij .env.web i uruchom ponownie.`
            : null;
          showModal(
            'error',
            'Błąd logowania',
            missingEnvMsg ?? error.message ?? 'Nie udało się zalogować',
            'close'
          );
          setIsSubmitting(false);
          return;
        }
        
        const action = profile?.role === 'ADMIN' ? 'close' : 'redirect';
        showModal('success', 'Zalogowano pomyślnie!', 'Witamy w serwisie. Kliknij OK, aby przejść dalej.', action);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : mode === "register" ? "Nie udało się zarejestrować" : "Nie udało się zalogować";
      showModal('error', 'Błąd', message, 'close');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-28 md:pt-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto w-full max-w-md rounded-2xl border border-white/25 bg-black/70 p-6 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.08)] text-center">
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin mb-4"></div>
                <p className="text-foreground font-medium">Ładowanie...</p>
                <p className="text-sm text-muted-foreground mt-2">Sprawdzanie sesji użytkownika</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen text-foreground relative overflow-hidden bg-hero-gradient`}
    >
      <Header />

      <main className="relative flex min-h-[calc(100vh-96px)] overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-background/40 to-background/85" />

        <div className="fixed inset-0 -z-10 pointer-events-none">
          <FloatingElement amplitude={15} frequency={0.3} phase={0}>
            <div
              className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gold/10 blur-3xl"
              style={{ willChange: 'transform' }}
            />
          </FloatingElement>

          <FloatingElement amplitude={20} frequency={0.25} phase={0.5}>
            <div
              className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl"
              style={{ willChange: 'transform' }}
            />
          </FloatingElement>

          <div className="absolute top-20 left-10 w-32 h-32 bg-gold/5 rounded-full blur-2xl" />
          <div className="absolute top-1/3 right-20 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
        </div>
        {/* Lewe tło wideo (desktop) */}
        <div className="hidden lg:block lg:w-[38%] xl:w-[32%] relative overflow-hidden bg-black">
          <VideoBackground
            src="/1229.mp4"
            scrub={1.2}
            start="top bottom"
            end="bottom top"
            overlayClassName="bg-gradient-to-r from-background/30 via-background/40 to-background/85"
            className="scale-[1.02]"
            fadeOut={false}
          />

          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              transition={{ duration: 0.8 }}
              style={{ background: 'radial-gradient(circle at 30% 20%, rgba(255,215,128,0.15), transparent 40%), radial-gradient(circle at 80% 60%, rgba(64,119,255,0.18), transparent 35%)' }}
            />
          </div>

          <motion.div
            initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.6 }}
            className="absolute bottom-12 left-12 z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
            style={{ perspective: 1200 }}
          >
            <motion.div
              className="rounded-3xl border border-white/15 bg-white/5 backdrop-blur-2xl px-6 py-5 shadow-[0_30px_80px_rgba(0,0,0,0.4)]"
              whileHover={reduceMotion ? undefined : { rotateX: -6, rotateY: 6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <h1 className="font-display text-5xl xl:text-6xl text-white tracking-tight">
                PALKA<span className="text-gold">MTM</span>
              </h1>
              <p className="text-white/80 mt-3 text-lg tracking-wide font-light">
                Hodowla Gołębi Sportowych
              </p>
              <p className="text-white/60 text-sm mt-2">
                Pasja • Precyzja • Dynamika lotu
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Prawy panel formularza */}
        <div className="w-full lg:w-3/5 xl:w-2/3 flex items-center justify-center p-6 sm:p-8 lg:p-14 xl:pr-20 relative">

          <motion.div
            initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md relative z-10 rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_20%_20%,rgba(255,223,128,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(75,108,183,0.15),transparent_30%),rgba(6,8,16,0.82)] backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.45)] p-6 sm:p-8"
            whileHover={reduceMotion ? undefined : { rotateX: -2.5, rotateY: 2.5, scale: 1.01 }}
            style={{ transformStyle: "preserve-3d", perspective: 1200 }}
          >
            <div className="text-center mb-10">
              <motion.div
                initial={{ scale: reduceMotion ? 1 : 0.9, opacity: reduceMotion ? 1 : 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: reduceMotion ? 0 : 0.2, duration: reduceMotion ? 0 : 0.5 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 mb-6"
              >
                <div className="w-8 h-8 rounded-lg bg-gold/80" />
              </motion.div>
              <h2 className="font-display text-3xl sm:text-4xl text-white tracking-tight mb-2">
                {mode === "register" ? "Dołącz do nas" : "Witaj ponownie"}
              </h2>
              <p className="text-white/70 text-sm">
                {mode === "register" ? "Stwórz konto i odkryj świat hodowli" : "Zaloguj się do swojego konta"}
              </p>
            </div>

            {/* Przełącznik */}
            <div className="relative bg-white/5 rounded-xl p-1 mb-8 backdrop-blur-sm border border-white/10">
              <motion.div
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white/15 rounded-lg shadow-lg border border-white/10"
                animate={{ x: mode === "register" ? "calc(100% + 4px)" : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
              <div className="relative flex">
                <button
                  onClick={() => switchMode("login")}
                  className={`flex-1 py-3 text-sm font-medium transition-colors duration-300 rounded-lg ${mode === "login" ? "text-white" : "text-white/60 hover:text-white/80"}`}
                  type="button"
                >
                  Logowanie
                </button>
                <button
                  onClick={() => switchMode("register")}
                  className={`flex-1 py-3 text-sm font-medium transition-colors duration-300 rounded-lg ${mode === "register" ? "text-white" : "text-white/60 hover:text-white/80"}`}
                  type="button"
                >
                  Rejestracja
                </button>
              </div>
            </div>

            {/* Social */}
            <div className="space-y-3 mb-8">
              <motion.button
                whileHover={reduceMotion ? undefined : { scale: 1.02, backgroundColor: "rgba(255,255,255,0.06)" }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium transition-all duration-300 hover:border-gold/30"
                type="button"
                onClick={() => handleOAuthSignIn("google")}
                disabled={isOAuthSubmitting}
              >
                <span className="w-5 h-5 rounded-full bg-white/80 inline-block" aria-hidden="true" />
                {isOAuthSubmitting
                  ? mode === "login" ? "Logowanie…" : "Rejestracja…"
                  : mode === "login" ? "Kontynuuj z Google" : "Zarejestruj / zaloguj przez Google"}
              </motion.button>

              <motion.button
                whileHover={reduceMotion ? undefined : { scale: 1.02, backgroundColor: "rgba(255,255,255,0.06)" }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium transition-all duration-300 hover:border-gold/30"
                type="button"
                onClick={() => handleOAuthSignIn("facebook")}
                disabled={isOAuthSubmitting}
              >
                <span className="w-5 h-5 rounded-full bg-white/80 inline-block" aria-hidden="true" />
                {isOAuthSubmitting
                  ? mode === "login" ? "Logowanie…" : "Rejestracja…"
                  : mode === "login" ? "Kontynuuj z Facebook" : "Zarejestruj / zaloguj przez Facebook"}
              </motion.button>

              {mode === "register" && (
                <p className="text-xs text-white/60">
                  Jeśli nie masz konta, zostanie utworzone po pierwszym logowaniu przez Google/Facebook. Pamiętaj o weryfikacji email.
                </p>
              )}
            </div>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-4 text-xs text-white/60 uppercase tracking-wider">
                  {mode === "login" ? "lub email" : "albo email"}
                </span>
              </div>
            </div>

            <form className="space-y-5" onSubmit={onSubmit}>
              {mode === "register" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white" htmlFor="name">
                    Imię i nazwisko
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                    <Input
                      id="name"
                      type="text"
                      value={email.split("@")[0]}
                      onChange={() => {}}
                      placeholder="Jan Kowalski"
                      className="pl-12 bg-white/5 border-white/10 focus:border-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                      disabled
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-white" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="twoj@email.com"
                    autoComplete="email"
                    required
                    className="pl-12 bg-white/5 border-white/10 focus:border-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white" htmlFor="password">
                  Hasło
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    required
                    className="pl-12 pr-12 bg-white/5 border-white/10 focus:border-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {mode === "register" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white" htmlFor="confirmPassword">
                    Potwierdź hasło
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      required
                      className="pl-12 pr-12 bg-white/5 border-white/10 focus:border-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              {mode === "login" && (
                <div className="flex justify-end">
                  <a href="#" className="text-sm text-gold hover:text-gold/80 transition-colors">
                    Zapomniałeś hasła?
                  </a>
                </div>
              )}

              <Button
                type="submit"
                variant="heroGold"
                className="w-full rounded-xl focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? mode === "login"
                    ? "Logowanie…"
                    : "Rejestrowanie…"
                  : mode === "login"
                    ? "Zaloguj się"
                    : "Utwórz konto"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <div className="text-center text-sm text-white/70">
                {mode === "login" ? (
                  <>
                    Nie masz konta?{" "}
                    <button className="text-gold hover:underline" type="button" onClick={() => switchMode("register")}>
                      Zarejestruj się
                    </button>
                  </>
                ) : (
                  <>
                    Masz już konto?{" "}
                    <button className="text-gold hover:underline" type="button" onClick={() => switchMode("login")}>
                      Zaloguj się
                    </button>
                  </>
                )}
              </div>

              <div className="text-center text-xs text-white/60">
                <Link className="hover:underline" to={callbackUrl}>
                  Wróć
                </Link>
              </div>
            </form>
          </motion.div>
        </div>
      </main>

      <AuthMessageModal
        isOpen={modalOpen}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        buttonText="OK"
        onConfirm={handleModalConfirm}
      />
    </div>
  );
}
