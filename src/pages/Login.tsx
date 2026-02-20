import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useOptimizedToast } from "@/hooks/use-optimized-toast";
import Header from "@/components/Header";

function useCallbackUrl(): string {
  const location = useLocation();
  return useMemo(() => {
    const params = new URLSearchParams(location.search);
    const callbackUrl = params.get("callbackUrl");
    return callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/";
  }, [location.search]);
}

export default function Login() {
  const navigate = useNavigate();
  const callbackUrl = useCallbackUrl();
  const {
    signIn,
    signInWithGoogle,
    signInWithFacebook,
    user,
    profile,
    loading,
  } = useAuth();
  const { error: showError } = useOptimizedToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOAuthSubmitting, setIsOAuthSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user && profile) {
      // Nie przekierowuj automatycznie admina po zalogowaniu
      if (profile.role === "ADMIN") return;

      // Check verification level
      if (profile.role === "USER_REGISTERED") {
        // Redirect to email confirmation or profile completion
        navigate("/verify-email");
      } else if (callbackUrl && callbackUrl !== "/") {
        // Tylko gdy mamy celny callback
        navigate(callbackUrl);
      }
    }
  }, [user, profile, loading, navigate, callbackUrl]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await signIn(email.trim(), password);
      if (error) throw error;
      // Navigation will happen in useEffect
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Nie udało się zalogować";
      showError({ message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuth = async (provider: "google" | "facebook") => {
    setIsOAuthSubmitting(true);
    try {
      if (!supabase) throw new Error("Supabase not available");

      const baseUrl = window.location.origin;
      const redirectTo = `${baseUrl}/auth`;

      const { error } =
        provider === "google"
          ? await signInWithGoogle(redirectTo)
          : await signInWithFacebook(redirectTo);
      if (error) throw error;
      // OAuth will redirect; no navigation here
    } catch (err) {
      const message =
        err instanceof Error ? err.message : `Błąd logowania przez ${provider}`;
      showError({ message });
      setIsOAuthSubmitting(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-28 md:pt-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto w-full max-w-md rounded-2xl border border-white/25 bg-black/70 p-6 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground">
              Logowanie
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Zaloguj się, aby korzystać z funkcji użytkownika.
            </p>

            <div className="mt-6 space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isOAuthSubmitting}
                onClick={() => handleOAuth("google")}
              >
                {isOAuthSubmitting ? "Logowanie…" : "Kontynuuj z Google"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isOAuthSubmitting}
                onClick={() => handleOAuth("facebook")}
              >
                {isOAuthSubmitting ? "Logowanie…" : "Kontynuuj z Facebook"}
              </Button>
            </div>

            <div className="my-4 flex items-center">
              <div className="h-px flex-1 bg-border"></div>
              <span className="px-3 text-xs text-muted-foreground">lub</span>
              <div className="h-px flex-1 bg-border"></div>
            </div>

            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-foreground"
                  htmlFor="email"
                >
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
                <label
                  className="text-sm font-medium text-foreground"
                  htmlFor="password"
                >
                  Hasło
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="heroGold"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logowanie…" : "Zaloguj"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Nie masz konta?{" "}
                <Link
                  className="gold-heading hover:underline"
                  to={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                >
                  Zarejestruj się
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
