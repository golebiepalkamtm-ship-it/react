import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CheckCircle, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { paymentService, type PaymentSessionInfo } from "@/services/paymentService";

const typeLabels: Record<string, string> = {
  BUY_NOW: "Zakup zakończony!",
  LISTING_FEE: "Opłata za wystawienie!",
  COMMISSION: "Prowizja opłacona!",
};

const typeDescriptions: Record<string, string> = {
  BUY_NOW: "Pomyślnie zakupiłeś przedmiot z aukcji.",
  LISTING_FEE: "Aukcja jest teraz widoczna publicznie.",
  COMMISSION: "Prowizja serwisu została opłacona.",
};

const AuctionSuccess = () => {
  const [searchParams] = useSearchParams();
  const { session } = useAuth();
  const sessionId = searchParams.get("session_id");
  const [data, setData] = useState<PaymentSessionInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(sessionId));

  useEffect(() => {
    if (!sessionId || !session?.access_token) {
      if (sessionId && !session?.access_token) {
        setError("Zaloguj się, aby zobaczyć potwierdzenie płatności.");
      }
      setLoading(false);
      return;
    }

    paymentService
      .getSessionInfo(sessionId, session.access_token)
      .then(setData)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Nie udało się pobrać danych"),
      )
      .finally(() => setLoading(false));
  }, [sessionId, session?.access_token]);

  const formatPrice = (value: number) =>
    `${value.toLocaleString("pl-PL", { minimumFractionDigits: 2 })} PLN`;

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="min-h-screen flex items-center justify-center pt-20">
          <p className="text-muted-foreground">Ładowanie potwierdzenia...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!sessionId || error || !data) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="min-h-screen flex items-center justify-center pt-20 px-4 text-center">
          <div>
            <h1 className="font-display text-3xl text-foreground font-bold mb-4">
              Brak danych transakcji
            </h1>
            <p className="text-muted-foreground mb-6">
              {error ||
                "Otwórz tę stronę po powrocie ze Stripe (parametr session_id)."}
            </p>
            <Link
              to="/auctions"
              className="inline-block px-6 py-3 rounded-md border border-white/25 text-foreground hover:border-gold/30"
            >
              Powrót do aukcji
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const title = typeLabels[data.type] ?? "Płatność zakończona";
  const description = typeDescriptions[data.type] ?? "Dziękujemy za płatność.";

  return (
    <div className="min-h-screen">
      <Header />
      <div className="min-h-screen py-12 pt-32">
        <div className="max-w-2xl mx-auto px-4">
          <div className="rounded-2xl border border-white/25 bg-black/70 backdrop-blur-xl p-8">
            <div className="text-center mb-8">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h1 className="font-display text-3xl text-foreground font-bold mb-2">
                {title}
              </h1>
              <p className="text-muted-foreground">{description}</p>
            </div>

            <div className="space-y-4 border-t border-white/15 pt-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kwota</span>
                <span className="font-semibold">{formatPrice(data.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Aukcja</span>
                <span className="font-semibold">{data.auctionTitle}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Status
                </span>
                <span className="font-semibold">{data.status}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                to={`/auctions/${data.auctionId}`}
                className="flex-1 text-center py-3 px-6 rounded-md border border-white/25 hover:border-gold/30"
              >
                Zobacz aukcję
              </Link>
              <Link
                to="/auctions"
                className="flex-1 text-center py-3 px-6 rounded-md bg-gold text-navy font-medium"
              >
                Lista aukcji
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AuctionSuccess;
