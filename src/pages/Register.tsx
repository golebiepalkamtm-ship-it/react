import { useMemo, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/authService";

function useCallbackUrl(): string {
  const location = useLocation();
  return useMemo(() => {
    const params = new URLSearchParams(location.search);
    const callbackUrl = params.get("callbackUrl");
    return callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/";
  }, [location.search]);
}

export default function Register() {
  const navigate = useNavigate();
  const callbackUrl = useCallbackUrl();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      await authService.register(cleanEmail, password);
      navigate(callbackUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Nie udało się zarejestrować";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-28 md:pt-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto w-full max-w-md rounded-2xl border border-border/40 bg-card/30 p-6 backdrop-blur-md">
            <h1 className="font-display text-3xl font-semibold text-foreground">Rejestracja</h1>
            <p className="mt-2 text-sm text-muted-foreground">Załóż konto, aby licytować i dodawać treści.</p>

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
                  Powtórz hasło
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
                {isSubmitting ? "Rejestracja…" : "Zarejestruj"}
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
