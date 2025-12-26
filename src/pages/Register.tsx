import { useMemo, useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

function useCallbackUrl(): string {
  const location = useLocation();
  return useMemo(() => {
    const params = new URLSearchParams(location.search);
    const callbackUrl = params.get("callbackUrl");
    return callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/";
  }, [location.search]);
}

export default function Register() {
  const callbackUrl = useCallbackUrl();
  const { signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const cleanEmail = email.trim();
      if (password.length < 6) {
        throw new Error("Hasło musi mieć co najmniej 6 znaków");
      }
      if (password !== confirmPassword) {
        throw new Error("Hasła nie są takie same");
      }

      const { error } = await signUp(cleanEmail, password);
      if (error) throw error;

      setSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Nie udało się zarejestrować";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-28 md:pt-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto w-full max-w-md rounded-2xl border border-border/40 bg-card/30 p-6 backdrop-blur-md text-center">
              <h1 className="font-display text-3xl font-semibold text-foreground">Sprawdź swoją skrzynkę email</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Wysyłaliśmy link potwierdzający na {email}. Kliknij w niego, aby aktywować konto.
              </p>
              <div className="mt-6">
                <Link
                  className="text-gold hover:underline"
                  to={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                >
                  Powrót do logowania
                </Link>
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
          <div className="mx-auto w-full max-w-md rounded-2xl border border-border/40 bg-card/30 p-6 backdrop-blur-md">
            <h1 className="font-display text-3xl font-semibold text-foreground">Rejestracja</h1>
            <p className="mt-2 text-sm text-muted-foreground">Utwórz konto, aby korzystać z funkcji użytkownika.</p>

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

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
                  autoComplete="new-password"
                  required
                />
              </div>

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

              <Button type="submit" variant="heroGold" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Rejestrowanie…" : "Zarejestruj"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Masz już konto?{" "}
                <Link
                  className="text-gold hover:underline"
                  to={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                >
                  Zaloguj się
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
