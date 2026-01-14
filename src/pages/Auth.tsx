import { useEffect, useMemo, useState, useRef, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AuthMessageModal, { type MessageType } from "@/components/auth/AuthSuccessModal";

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
  const query = useQueryParams();
  const mode = (query.get("mode") as Mode) || "login";
  const callbackUrl = sanitizeCallbackUrl(query.get("callbackUrl"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOAuthSubmitting, setIsOAuthSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
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
    
    if (modalAction === 'redirect') {
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
        showModal('success', 'Logowanie zakończone!', successMessage, 'redirect');
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
    
    const loadingToast = toast.loading(`Inicjowanie logowania przez ${provider === 'google' ? 'Google' : 'Facebook'}...`, {
      description: "Przekierowujemy Cię do strony logowania...",
    });
    
    try {
      const { error } =
        provider === 'google'
          ? await signInWithGoogle()
          : await signInWithFacebook();
      
      if (error) {
        toast.dismiss(loadingToast);
        const errorMessage = error.message || `Błąd logowania przez ${provider === 'google' ? 'Google' : 'Facebook'}`;
        showModal('error', 'Błąd logowania', errorMessage, 'close');
        setIsOAuthSubmitting(false);
        return;
      }
      
      // OAuth will redirect
    } catch (err) {
      toast.dismiss(loadingToast);
      const message = err instanceof Error ? err.message : `Błąd logowania przez ${provider === 'google' ? 'Google' : 'Facebook'}`;
      showModal('error', 'Błąd logowania', message, 'close');
      setIsOAuthSubmitting(false);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log('🚀 onSubmit started:', { mode, email: email.substring(0, 3) + '***' });
    setIsSubmitting(true);

    const loadingToast = toast.loading(
      mode === "register" ? "Rejestrowanie..." : "Logowanie...",
      { description: "Proszę czekać..." }
    );

    try {
      const cleanEmail = email.trim();

      if (mode === "register") {
        if (password.length < 6) {
          toast.dismiss(loadingToast);
          showModal('error', 'Błąd walidacji', 'Hasło musi mieć co najmniej 6 znaków', 'close');
          setIsSubmitting(false);
          return;
        }
        if (password !== confirmPassword) {
          toast.dismiss(loadingToast);
          showModal('error', 'Błąd walidacji', 'Hasła nie są takie same', 'close');
          setIsSubmitting(false);
          return;
        }

        const { error } = await signUp(cleanEmail, password);
        if (error) {
          toast.dismiss(loadingToast);
          showModal('error', 'Błąd rejestracji', error.message || 'Nie udało się zarejestrować', 'close');
          setIsSubmitting(false);
          return;
        }

        toast.dismiss(loadingToast);
        showModal(
          'success', 
          'Rejestracja zakończona!', 
          `Twoje konto zostało utworzone pomyślnie!\n\nWysłaliśmy email weryfikacyjny na adres:\n${cleanEmail}\n\nSprawdź swoją skrzynkę odbiorczą oraz folder SPAM.\nKliknij link w wiadomości, aby aktywować konto.`,
          'close'
        );
      } else {
        const { error } = await signIn(cleanEmail, password);
        
        if (error) {
          toast.dismiss(loadingToast);
          showModal('error', 'Błąd logowania', error.message || 'Nie udało się zalogować', 'close');
          setIsSubmitting(false);
          return;
        }
        
        toast.dismiss(loadingToast);
        showModal('success', 'Zalogowano pomyślnie!', 'Witamy w serwisie. Kliknij OK, aby przejść dalej.', 'redirect');
      }
    } catch (err) {
      toast.dismiss(loadingToast);
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
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-28 md:pt-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto w-full max-w-md rounded-2xl border border-white/25 bg-black/70 p-6 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
            <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-black/40 p-1">
              <Button
                type="button"
                variant={mode === "login" ? "secondary" : "ghost"}
                className="w-full rounded-lg"
                onClick={() => switchMode("login")}
              >
                Logowanie
              </Button>
              <Button
                type="button"
                variant={mode === "register" ? "secondary" : "ghost"}
                className="w-full rounded-lg"
                onClick={() => switchMode("register")}
              >
                Rejestracja
              </Button>
            </div>

            <h1 className="font-display text-4xl md:text-5xl text-foreground font-bold leading-tight mb-4">
              {mode === "login" ? "Logowanie" : "Rejestracja"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "login" ? "Zaloguj się, aby korzystać z funkcji użytkownika." : "Utwórz konto, aby korzystać z funkcji użytkownika."}
            </p>

            <div className="mt-6 space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isOAuthSubmitting}
                onClick={() => handleOAuthSignIn("google")}
              >
                {isOAuthSubmitting
                  ? mode === 'login'
                    ? 'Logowanie…'
                    : 'Rejestracja…'
                  : mode === 'login'
                    ? 'Kontynuuj z Google'
                    : 'Zarejestruj / zaloguj przez Google'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isOAuthSubmitting}
                onClick={() => handleOAuthSignIn("facebook")}
              >
                {isOAuthSubmitting
                  ? mode === 'login'
                    ? 'Logowanie…'
                    : 'Rejestracja…'
                  : mode === 'login'
                    ? 'Kontynuuj z Facebook'
                    : 'Zarejestruj / zaloguj przez Facebook'}
              </Button>
              {mode === 'register' && (
                <p className="text-xs text-muted-foreground">
                  Jeśli nie masz konta, zostanie ono automatycznie utworzone po zalogowaniu przez Google/Facebook. Po utworzeniu konta nadal obowiązuje weryfikacja email.
                </p>
              )}
            </div>

            <div className="my-4 flex items-center">
              <div className="h-px flex-1 bg-border"></div>
              <span className="px-3 text-xs text-muted-foreground">
                {mode === 'login' ? 'lub' : 'albo'}
              </span>
              <div className="h-px flex-1 bg-border"></div>
            </div>

            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="email">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="twoj@email.pl"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="password">
                  Hasło
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  required
                />
              </div>

              {mode === "register" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="confirmPassword">
                    Potwierdź hasło
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                  />
                </div>
              )}

              <Button type="submit" variant="heroGold" className="w-full" disabled={isSubmitting}>
                {isSubmitting
                  ? mode === "login"
                    ? "Logowanie…"
                    : "Rejestrowanie…"
                  : mode === "login"
                    ? "Zaloguj"
                    : "Zarejestruj"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
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

              <div className="text-center text-xs text-muted-foreground">
                <Link className="hover:underline" to={callbackUrl}>
                  Wróć
                </Link>
              </div>
            </form>
          </div>
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
