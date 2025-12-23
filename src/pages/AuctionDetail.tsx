import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Clock, Gavel, Trophy, MapPin, User, Phone, Mail, Heart, Share2, Eye, ChevronLeft, ChevronRight, AlertCircle, Check } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuction, useBid, useAuctionTimer } from "@/hooks/useAuctions";
import { useAuth } from "@/contexts/AuthContext";
import { auctionService } from "@/services/auctionService";

const AuctionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { auction, loading, error, refetch } = useAuction(id);
  const { timeLeft, isEnded } = useAuctionTimer(auction?.endTime);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [token, setToken] = useState<string | null>(null);
  
  const getToken = async () => {
    if (user) {
      const t = await user.getIdToken();
      setToken(t);
      return t;
    }
    return null;
  };

  const { placeBid, loading: bidLoading, error: bidError, success: bidSuccess, meta } = useBid(id || '', token);

  const handleBid = async () => {
    const t = await getToken();
    if (!t || !auction) return;
    
    const amount = parseFloat(bidAmount);
    if (isNaN(amount)) return;
    
    await placeBid(amount);
    if (!bidError) {
      refetch();
      setBidAmount('');
    }
  };

  const nextImage = () => {
    if (auction?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % auction.images.length);
    }
  };

  const prevImage = () => {
    if (auction?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + auction.images.length) % auction.images.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-12">
          <div className="container mx-auto px-4">
            <div className="animate-pulse space-y-8">
              <div className="h-8 w-48 bg-muted rounded" />
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="h-96 bg-muted rounded-2xl" />
                <div className="space-y-4">
                  <div className="h-12 bg-muted rounded" />
                  <div className="h-24 bg-muted rounded" />
                  <div className="h-32 bg-muted rounded" />
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-12">
          <div className="container mx-auto px-4 text-center">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Nie znaleziono aukcji</h1>
            <p className="text-muted-foreground mb-6">{error || 'Aukcja o podanym ID nie istnieje.'}</p>
            <Link to="/auctions">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Powrót do aukcji
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const minimumBid = auctionService.getMinimumBid(auction);
  const isNearEnd = auctionService.isNearEnd(auction);
  const wins = auctionService.extractWins(auction.pigeon?.achievements);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Link to="/auctions" className="inline-flex items-center text-muted-foreground hover:text-gold transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Powrót do aukcji
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-card border border-border aspect-[4/3]">
                <img
                  src={auction.images[currentImageIndex] || '/placeholder.svg'}
                  alt={auction.title}
                  className="w-full h-full object-cover"
                />
                {auction.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      title="Poprzednie zdjęcie"
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-navy/80 text-white hover:bg-navy transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      title="Następne zdjęcie"
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-navy/80 text-white hover:bg-navy transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
                
                <div className="absolute top-4 left-4">
                  {isEnded ? (
                    <span className="px-3 py-1 rounded-full bg-destructive text-destructive-foreground text-sm font-medium">
                      Zakończona
                    </span>
                  ) : isNearEnd ? (
                    <span className="px-3 py-1 rounded-full bg-orange-500 text-white text-sm font-medium animate-pulse">
                      Kończy się wkrótce!
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-green-500 text-white text-sm font-medium">
                      Aktywna
                    </span>
                  )}
                </div>

                <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-navy/80 text-white text-sm">
                  {currentImageIndex + 1} / {auction.images.length}
                </div>
              </div>

              {auction.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {auction.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        idx === currentImageIndex ? 'border-gold' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-gold text-sm font-medium mb-2">
                  <Trophy className="w-4 h-4" />
                  {auction.category === 'racing' ? 'Wyścigowy' : auction.category === 'breeding' ? 'Hodowlany' : 'Pokazowy'}
                </div>
                <h1 className="font-display text-3xl md:text-4xl text-foreground font-bold mb-3">
                  {auction.title}
                </h1>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {auction.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {auction._count.watchlist} obserwuje
                  </span>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Aktualna cena</p>
                    <p className="font-display text-3xl font-bold text-foreground">
                      {auction.currentPrice.toLocaleString('pl-PL')} zł
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Pozostało</span>
                    </div>
                    <p className={`font-display text-xl font-bold ${isNearEnd ? 'text-orange-500' : 'text-gold'}`}>
                      {timeLeft}
                    </p>
                  </div>
                </div>

                {bidSuccess && (
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center gap-2 text-green-500">
                    <Check className="w-5 h-5" />
                    <span>Oferta złożona pomyślnie!</span>
                    {meta?.wasExtended && (
                      <span className="text-sm opacity-80">(Czas aukcji został przedłużony)</span>
                    )}
                  </div>
                )}

                {bidError && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-2 text-destructive">
                    <AlertCircle className="w-5 h-5" />
                    <span>{bidError}</span>
                  </div>
                )}

                {!isEnded && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          placeholder={`Min. ${minimumBid.toLocaleString('pl-PL')} zł`}
                          className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground"
                          min={minimumBid}
                          step={auction.minBidIncrement || 100}
                        />
                      </div>
                      <Button
                        variant="gold"
                        size="lg"
                        onClick={handleBid}
                        disabled={!user || bidLoading || !bidAmount || parseFloat(bidAmount) < minimumBid}
                      >
                        {bidLoading ? (
                          <span className="animate-spin">⏳</span>
                        ) : (
                          <>
                            <Gavel className="w-5 h-5 mr-2" />
                            Licytuj
                          </>
                        )}
                      </Button>
                    </div>
                    {!user && (
                      <p className="text-sm text-muted-foreground text-center">
                        <Link to="/login" className="text-gold hover:underline">Zaloguj się</Link>, aby licytować
                      </p>
                    )}
                  </div>
                )}

                {auction.buyNowPrice && !isEnded && (
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Kup teraz</p>
                        <p className="font-display text-xl font-bold text-gold">
                          {auction.buyNowPrice.toLocaleString('pl-PL')} zł
                        </p>
                      </div>
                      <Button variant="outline" className="border-gold text-gold hover:bg-gold hover:text-navy">
                        Kup teraz
                      </Button>
                    </div>
                  </div>
                )}

                {auction.reservePrice && (
                  <div className={`text-sm ${auction.reserveMet ? 'text-green-500' : 'text-orange-500'}`}>
                    {auction.reserveMet ? '✓ Cena minimalna osiągnięta' : '⚠ Cena minimalna nie została osiągnięta'}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">
                  <Heart className="w-4 h-4 mr-2" />
                  Obserwuj
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  Udostępnij
                </Button>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border">
                <h3 className="font-semibold text-foreground mb-3">Sprzedający</h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                    <User className="w-6 h-6 text-gold" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {auction.seller.firstName} {auction.seller.lastName}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>⭐ {auction.seller.rating}</span>
                      <span>•</span>
                      <span>{auction.seller.salesCount} sprzedaży</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border flex flex-col gap-2 text-sm">
                  <a href={`mailto:${auction.seller.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors">
                    <Mail className="w-4 h-4" />
                    {auction.seller.email}
                  </a>
                  <a href={`tel:${auction.seller.phoneNumber}`} className="flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors">
                    <Phone className="w-4 h-4" />
                    {auction.seller.phoneNumber}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-display text-xl font-bold text-foreground mb-4">Opis</h2>
                <p className="text-muted-foreground leading-relaxed">{auction.description}</p>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-display text-xl font-bold text-foreground mb-4">Osiągnięcia</h2>
                <div className="flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-gold" />
                  <div>
                    <p className="font-medium text-foreground">{auction.pigeon.achievements}</p>
                    {wins && (
                      <p className="text-sm text-gold">{wins} wygranych zawodów</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">Charakterystyka</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Rodowód</p>
                  <p className="font-medium text-foreground">{auction.pigeon.bloodline}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Wiek</p>
                  <p className="font-medium text-foreground">{auction.age} lat</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Płeć</p>
                  <p className="font-medium text-foreground">{auction.sex === 'male' ? 'Samiec' : 'Samica'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Kolor oczu</p>
                  <p className="font-medium text-foreground">{auction.pigeon.eyeColor}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Umaszczenie</p>
                  <p className="font-medium text-foreground">{auction.pigeon.featherColor}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Witalność</p>
                  <p className="font-medium text-foreground">{auction.pigeon.vitality}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Wytrzymałość</p>
                  <p className="font-medium text-foreground">{auction.pigeon.endurance}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mięśnie</p>
                  <p className="font-medium text-foreground">{auction.pigeon.muscles}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Równowaga</p>
                  <p className="font-medium text-foreground">{auction.pigeon.balance}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Grzbiet</p>
                  <p className="font-medium text-foreground">{auction.pigeon.back}</p>
                </div>
              </div>
            </div>
          </div>

          {auction.bids.length > 0 && (
            <div className="mt-12 p-6 rounded-2xl bg-card border border-border">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">
                Historia licytacji ({auction.bids.length})
              </h2>
              <div className="space-y-3">
                {auction.bids.slice(0, 10).map((bid, index) => (
                  <div
                    key={bid.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      index === 0 ? 'bg-gold/10 border border-gold/30' : 'bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                        {bid.bidder.firstName[0]}{bid.bidder.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {bid.bidder.firstName} {bid.bidder.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(bid.createdAt).toLocaleString('pl-PL')}
                        </p>
                      </div>
                    </div>
                    <div className={`font-bold ${index === 0 ? 'text-gold' : 'text-foreground'}`}>
                      {bid.amount.toLocaleString('pl-PL')} zł
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AuctionDetail;
