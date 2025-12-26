import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CheckCircle, Clock, Euro, Mail, MapPin, Phone, Star, User } from "lucide-react";

interface SuccessData {
  type: 'buy_now' | 'auction_won';
  auctionId: string;
  auctionTitle: string;
  price: number;
  seller: {
    name: string;
    id: string;
    rating: number;
    salesCount: number;
    avatar?: string;
    location: string;
    phone: string;
    email: string;
  };
  timestamp: string;
}

const AuctionSuccess = () => {
  const [successData, setSuccessData] = useState<SuccessData | null>(() => {
    try {
      const data = localStorage.getItem('auctionSuccess');
      if (data) {
        localStorage.removeItem('auctionSuccess');
        return JSON.parse(data) as SuccessData;
      }
    } catch {
      // ignore
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const formatPrice = (value: number) => `${value.toLocaleString('pl-PL')} EUR`;
  
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="min-h-screen flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/80">Ładowanie...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!successData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="min-h-screen flex items-center justify-center pt-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Błąd</h1>
            <p className="text-white/80 mb-6">Nie znaleziono danych o transakcji.</p>
            <Link to="/auctions" className="btn-primary inline-block px-6 py-3 rounded-md bg-black text-white hover:bg-black/90 transition-colors">
              Powrót do aukcji
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="min-h-screen py-12 pt-32">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card hover:border-white/80 transition-colors">
            {/* Ikona sukcesu */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {successData.type === 'buy_now' ? 'Zakup zakończony!' : 'Wygrana licytacja!'}
              </h1>
              <p className="text-white/80">
                {successData.type === 'buy_now'
                  ? 'Pomyślnie zakupiłeś gołębia pocztowego'
                  : 'Gratulacje! Wygrałeś licytację'}
              </p>
            </div>

            {/* Szczegóły transakcji */}
            <div className="border-t border-white/20 pt-8">
              <h2 className="text-xl font-semibold text-white mb-6">Szczegóły transakcji</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-white/20">
                  <div className="flex items-center gap-3">
                    <Euro className="w-5 h-5 text-white/60" />
                    <span className="text-white/80">Cena</span>
                  </div>
                  <span className="font-semibold text-white">{formatPrice(successData.price)}</span>
                </div>

                <div className="py-3 border-b border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <User className="w-5 h-5 text-white/60" />
                    <span className="text-white/80">Sprzedawca</span>
                  </div>
                  <div className="pl-8 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{successData.seller.name}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-white/60">
                          {successData.seller.rating} ({successData.seller.salesCount} sprzedaży)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <MapPin className="w-4 h-4" />
                      <span>{successData.seller.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Phone className="w-4 h-4" />
                      <span>{successData.seller.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Mail className="w-4 h-4" />
                      <span>{successData.seller.email}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-white/20">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-white/60" />
                    <span className="text-white/80">Data</span>
                  </div>
                  <span className="font-semibold text-white">
                    {formatDate(successData.timestamp)}
                  </span>
                </div>

                <div className="py-3">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-white/80">Gołąb</span>
                  </div>
                  <span className="font-semibold text-white">{successData.auctionTitle}</span>
                </div>
              </div>
            </div>

            {/* Następne kroki */}
            <div className="mt-8 p-6 bg-blue-500/10 rounded-lg border border-blue-400/20">
              <h3 className="text-lg font-semibold text-blue-300 mb-3">Następne kroki</h3>
              <ul className="space-y-2 text-blue-200">
                <li>• Sprzedawca skontaktuje się z Tobą w ciągu 24 godzin</li>
                <li>• Uzgodnicie szczegóły dostawy i płatności</li>
                <li>• Otrzymasz dokumenty i certyfikaty gołębia</li>
                <li>• Możesz śledzić status transakcji w swoim panelu</li>
              </ul>
            </div>

            {/* Przyciski akcji */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                to="/auctions"
                className="flex-1 bg-white/10 text-white py-3 px-6 rounded-md font-medium hover:bg-white/20 transition-colors text-center border border-white/30"
              >
                Przeglądaj więcej aukcji
              </Link>
              <Link
                to="/"
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 transition-colors text-center"
              >
                Strona główna
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
