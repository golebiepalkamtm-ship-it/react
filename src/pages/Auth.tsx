import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";

function useQueryParams() {
  const location = useLocation();
  return useMemo(() => new URLSearchParams(location.search), [location.search]);
}

function sanitizeCallbackUrl(callbackUrl: string | null): string {
  if (!callbackUrl || !callbackUrl.startsWith("/")) return "/";
  if (callbackUrl === "/account") return "/?openAccount=1";
  return callbackUrl;
}

type Mode = "login" | "register";

export default function Auth(props) {
  const navigate = useNavigate();
  const query = useQueryParams();
  const { t } = useLocale();

  const modeFromQuery = query.get("mode");
  const callbackUrl = sanitizeCallbackUrl(query.get("callbackUrl"));

  const [mode, setMode] = useState<Mode>(modeFromQuery === "register" ? "register" : "login");

  const { signIn, signUp, user, profile, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOAuthSubmitting, setIsOAuthSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (modeFromQuery === "register" || modeFromQuery === "login") {
      setMode(modeFromQuery);
    }
     
  }, [modeFromQuery]);

  useEffect(() => {
    if (!loading && user && profile && !(success && mode === 'register')) {
      const provider = user?.app_metadata?.provider || user?.identities?.[0]?.provider;
      const isSocial = provider === 'google' || provider === 'facebook';

      if (profile.role === "USER_REGISTERED" && !isSocial) {
        navigate("/verify-email", { replace: true });
      } else if (profile.role === "USER_FULL_VERIFIED" || profile.role === "ADMIN") {
        navigate(callbackUrl, { replace: true });
      } else {
        navigate("/?openAccount=1", { replace: true });
      }
    }
  }, [callbackUrl, loading, navigate, profile, user, success, mode]);

  const switchMode = (nextMode: Mode) => {
    setSuccess(false);
    setError(null);
    setMode(nextMode);

    const nextParams = new URLSearchParams();
    nextParams.set("mode", nextMode);
    if (callbackUrl && callbackUrl !== "/") nextParams.set("callbackUrl", callbackUrl);
    navigate(`/auth?${nextParams.toString()}`, { replace: true });
  };

  const handleOAuth = async (provider: "google" | "facebook") => {
    setIsOAuthSubmitting(true);
    setError(null);
    try {
      if (!supabase) throw new Error("Supabase not configured");

      const redirectTo = `${window.location.origin.replace(/\/$/, '')}/auth`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
        },
      });
      if (error) throw error;
    } catch (err) {
      const message = err instanceof Error ? err.message : `Błąd logowania przez ${provider}`;
      setError(message);
      setIsOAuthSubmitting(false);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const cleanEmail = email.trim();

      if (mode === "register") {
        if (password.length < 6) {
          throw new Error("Hasło musi mieć co najmniej 6 znaków");
        }
        if (password !== confirmPassword) {
          throw new Error("Hasła nie są takie same");
        }

        const { error } = await signUp(cleanEmail, password);
        if (error) throw error;

        setSuccess(true);
      } else {
        const { error } = await signIn(cleanEmail, password);
        if (error) throw error;
        // navigation happens in useEffect after profile load
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : mode === "register" ? "Nie udało się zarejestrować" : "Nie udało się zalogować";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (success && mode === "register") {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-28 md:pt-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto w-full max-w-md rounded-2xl border border-white/25 bg-black/70 p-6 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.08)] text-center">
              <h1 className="font-display text-4xl md:text-5xl text-foreground font-bold leading-tight mb-4">{t('auth.check_email.title')}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {t('auth.check_email.p1', { email })}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                {t('auth.check_email.p2')}
              </p>
              <div className="mt-6">
                <Button type="button" variant="heroGold" className="w-full" onClick={() => navigate('/verify-email')}>
                  {t('auth.check_email.cta')}
                </Button>
                <button className="mt-4 text-gold hover:underline" type="button" onClick={() => switchMode("login")}
                >
                  {t('auth.already_have')}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
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

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <div className="mt-6 space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isOAuthSubmitting}
                onClick={() => handleOAuth("google")}
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
                onClick={() => handleOAuth("facebook")}
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
    </div>
  );
}
