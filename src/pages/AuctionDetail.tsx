import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { useEffect, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuction, useBid, useAuctionTimer } from "@/hooks/useAuctions";
import { useAuth } from "@/contexts/AuthContext";
import { auctionService } from "@/services/auctionService";
import { paymentService } from "@/services/paymentService";
import { reviewService } from "@/services/reviewService";
import ReviewForm from "@/components/ReviewForm";
import SellerReviews from "@/components/SellerReviews";
import { UnifiedModal } from "@/components/ui/UnifiedModal";
import AccountModal from "@/components/AccountModal";
import EditAuctionModal from "@/components/auction/EditAuctionModal";
import { trackMetric } from "@/services/metricsService";
import type { Auction } from "@/types/auction";
import { AuctionTimer } from "@/components/auction/AuctionShowcaseCard"; // Using local timer if available, or just standard time display

const AuctionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { session, user, profile } = useAuth();
  const { auction, isLoading: loading, error, refetch: refetchAuction } = useAuction({ auctionId: id || '' });
  const { timeLeft, isEnded } = useAuctionTimer(auction?.endTime);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [isWatched, setIsWatched] = useState<boolean>(false);
  const [canReview, setCanReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Verification modal state
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState({ title: '', message: '' });
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const token = session?.access_token ?? null;
  const { placeBid, isLoading: bidLoading, error: bidError, success: bidSuccess } = useBid(id || '');

  // Demo preview for layout stress test (?demo=full)
  const isDemo = searchParams.get('demo') === 'full';
  const demoAuction: Auction = {
    id: 'demo-auction',
    title: 'SUPER DŁUGI TYTUŁ AUKCJI • GOŁĄB SUPER CHAMPION Z RODOWODEM – NAJLEPSZA LINIA LOTNIKÓW W EUROPIE • WIELOKROTNY LAUREAT • NIESAMOWITA GENETYKA • ODPORNOŚĆ • SZYBKOŚĆ • WYTRZYMAŁOŚĆ • PRECYZJA • WYGRANE MARATONY • LEGENDARNE DNA',
    description:
      'Ta aukcja prezentuje wyjątkowego gołębia pocztowego z linii mistrzów. Pełny opis zawiera historię lotów, genealogiczne informacje, wyniki w maratonach, a także szczegółowy opis kondycji, budowy, mięśni, skrzydeł i temperamentu. ' +
      'W komplecie dokumenty i zdjęcia w wysokiej rozdzielczości. Dodatkowo szczegółowy rodowód oraz wyniki badań zdrowotnych. ' +
      'Opis celowo jest ekstremalnie długi, aby zweryfikować zachowanie layoutu przy skrajnych przypadkach, sprawdzić line-height, zawijanie tekstu, marginesy, efekt glass i gradienty. ' +
      'Sekcja uwzględnia: historię lotów (500 km, 700 km, 1000 km), kondycję (VO2 max, tętno spoczynkowe), mięśnie (sprężystość, siła), skrzydła (długość, elastyczność), ' +
      'temperament (spokój w klatce, agresja w locie), inteligencję nawigacyjną (powroty w trudnych warunkach), odporność (wilgoć, niskie temperatury), ' +
      'genetykę (linie Janssen, Koopman, Van Loon), oraz pełną listę badań weterynaryjnych. ' +
      'Ta część tekstu powinna wypełnić kilka linii, aby sprawdzić czy kontener z glassmorphismem utrzymuje czytelność i nie generuje overflow na urządzeniach mobilnych i desktopowych.',
    startingPrice: 1000,
    currentPrice: 12500,
    buyNowPrice: 18000,
    reservePrice: 15000,
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    snipeThresholdMinutes: 5,
    snipeExtensionMinutes: 5,
    minBidIncrement: 200,
    status: 'active',
    reserveMet: false,
    category: 'RACING',
    pigeon: {
      ringNumber: 'PL-2024-CHAMP-999999',
      eyeColor: 'Bursztynowe',
      pigeonColor: 'Niebieski nakrapiany',
      construction: 'Mocna, kompaktowa',
      pedigreeUrl: 'https://example.com/pedigree.pdf',
      vitality: 'Wysoka',
      length: 'Średnia',
      endurance: 'Bardzo wysoka',
      forkStrength: 'Mocna',
      forkAlignment: 'Idealna',
      muscles: 'Sprężyste',
      shoulders: 'Szerokie',
      balance: 'Perfekcyjny',
      back: 'Stabilny',
      feathers: 'Jedwabiste',
      purpose: 'Maraton / długie dystanse',
      gender: 'male',
      dnaCertificate: true,
      colorTraits: ['Deep blue', 'Iridescent'],
      eyeTraits: ['Rich iris', 'Clear circle'],
      bodyStructureTraits: ['Compact', 'Aerodynamic'],
      breastboneTraits: ['Strong'],
      forkTraits: ['Tight'],
      musculatureTraits: ['Elastic'],
      backTraits: ['Straight'],
      wingTraits: ['Long primary'],
      wingBehaviorTraits: ['Fast return'],
      breedingValueTraits: ['High'],
      distanceTraits: ['800+ km']
    },
    sex: 'male',
    location: 'Lubań, Polska',
    seller: {
      id: 'seller-demo',
      username: 'super-seller',
      firstName: 'Jan',
      lastName: 'Kowalski',
      email: 'demo@example.com',
      phoneNumber: '+48 600 600 600',
      image: null,
      rating: 5,
      salesCount: 123,
    },
    images: [
      '/images/auth-hero.jpg',
      '/public/hero-pigeon.jpg',
      '/placeholder.svg',
      '/images/auth-hero.jpg',
    ],
    videos: [],
    documents: ['/placeholder.svg', '/images/auth-hero.jpg'],
    bids: [
      { id: 'b1', amount: 12000, createdAt: new Date().toISOString(), bidder: { id: 'u1', firstName: 'Anna', lastName: 'Nowak' } },
      { id: 'b2', amount: 11000, createdAt: new Date(Date.now() - 3600 * 1000).toISOString(), bidder: { id: 'u2', firstName: 'Piotr', lastName: 'Zieliński' } },
    ],
    _count: { bids: 12, watchlist: 34 },
  };

  const displayAuction = isDemo ? demoAuction : auction;
  const isLoadingCurrent = loading && !isDemo;
  const minimumBidValue = displayAuction ? auctionService.getMinimumBid(displayAuction as any) : 0;

  const roleActions = useMemo(() => ({
    'USER_REGISTERED': () => {
      setVerificationMessage({
        title: 'Wymagana weryfikacja emaila',
        message: 'Aby licytować, musisz najpierw zweryfikować swój adres email.\n\nSprawdź swoją skrzynkę odbiorczą i kliknij link weryfikacyjny.'
      });
      setShowVerificationModal(true);
      return false;
    },
    'USER_EMAIL_VERIFIED': () => {
      setVerificationMessage({
        title: 'Wymagana pełna weryfikacja',
        message: 'Aby licytować, musisz uzupełnić swój profil i zweryfikować numer telefonu.\n\nKliknij "Uzupełnij profil" aby kontynuować.'
      });
      setShowVerificationModal(true);
      return false;
    },
    'USER_FULL_VERIFIED': () => true,
    'ADMIN': () => true,
  }), []);

  const checkAccess = useCallback(() => {
    if (!user) {
      navigate('/auth?mode=login&callbackUrl=' + encodeURIComponent(window.location.pathname));
      return false;
    }
    if (!profile) return false;

    const action = roleActions[profile.role as keyof typeof roleActions];
    if (action) {
      return action();
    }
    return false;
  }, [navigate, profile, roleActions, user]);

  const handleBid = useCallback(async () => {
    if (!checkAccess()) return;
    if (!token || !auction) return;
    
    const amount = parseFloat(bidAmount);
    if (isNaN(amount)) return;
    
    await placeBid(amount);
    if (!bidError) {
      setBidAmount('');
    }
  }, [checkAccess, token, auction, placeBid, bidAmount, bidError]);

  const handleAdminUpdate = async (data: { currentPrice?: number; buyNowPrice?: number; endTime?: string }) => {
    if (!token || !id) return;
    try {
      await auctionService.adminUpdateAuction(id, data, token);
      refetchAuction();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Failed to update auction:', error);
    }
  };

  const handleAdminCancel = async () => {
    if (!token || !id) return;
    try {
      await auctionService.adminCancelAuction(id, token);
      refetchAuction();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Failed to cancel auction:', error);
    }
  };

  const handleBuyNow = useCallback(async () => {
    if (!checkAccess()) return;
    if (!token || !auction || !auction.buyNowPrice) return;
    setIsCheckoutLoading(true);
    try {
      const clientUrl = window.location.origin;
      const successUrl = `${clientUrl}/auctions/success`;
      const cancelUrl = `${clientUrl}/auctions/cancel`;
      const res = await paymentService.createStripeCheckout(id!, token, successUrl, cancelUrl);
      if (res.url) {
        window.location.href = res.url;
      }
    } catch (err) {
      console.warn('Stripe checkout init failed', err);
    } finally {
      setIsCheckoutLoading(false);
    }
  }, [checkAccess, token, auction, id]);

  const toggleWatch = useCallback(async () => {
    if (!token || !id) return;
    try {
      if (isWatched) {
        const r = await auctionService.removeFromWatchlist(id, token);
        setIsWatched(!!r.watched);
      } else {
        const r = await auctionService.addToWatchlist(id, token);
        setIsWatched(!!r.watched);
      }
    } catch {
      console.warn('Failed to toggle watchlist');
    }
  }, [token, id, isWatched]);

  useEffect(() => {
    if (id) {
      trackMetric('AUCTION', id).catch(() => {});
    }
  }, [id]);

  useEffect(() => {
    const run = async () => {
      if (!token || !id) return;
      try {
        const r = await auctionService.isWatched(id, token);
        setIsWatched(!!r.watched);
      } catch {
        console.warn('Failed to load watch status');
      }
    };
    run();
  }, [token, id]);

  useEffect(() => {
    if (!token || !id || !isEnded || !auction) return;
    
    const checkReviewEligibility = async () => {
      try {
        const eligibility = await reviewService.canReview(id, token);
        setCanReview(eligibility.canReview);
        if (eligibility.canReview) {
          setShowReviewForm(true);
        }
      } catch (error) {
        console.error('Error checking review eligibility:', error);
      }
    };

    checkReviewEligibility();
  }, [token, id, isEnded, auction]);

  if (loading) {
    if (isLoadingCurrent && !displayAuction) return <div className="container mx-auto py-12">Ładowanie...</div>;
    if (!displayAuction) return <div className="container mx-auto py-12 text-red-500">Nie znaleziono aukcji.</div>;
    return (
      <div className="min-h-screen">
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
      <div className="min-h-screen">
        <Header />
        <main className="pt-24 pb-12">
          <div className="container mx-auto px-4 text-center">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="font-display text-4xl md:text-5xl text-foreground font-bold leading-tight mb-4">Nie znaleziono aukcji</h1>
            <p className="text-muted-foreground mb-6">{error?.message || 'Aukcja o podanym ID nie istnieje.'}</p>
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

  const handleReviewSubmitted = () => {
    setReviewSubmitted(true);
    setShowReviewForm(false);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-12">
        {displayAuction && !error && (
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Image Gallery */}
              <div className="space-y-4">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="aspect-square rounded-3xl overflow-hidden glass-card border border-white/20 shadow-glow"
                >
                  <img 
                    src={displayAuction.images?.[0] || "/placeholder.svg"} 
                    alt={displayAuction.title}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                {displayAuction.images && displayAuction.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-4">
                    {displayAuction.images.slice(1, 5).map((img, idx) => (
                      <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-white/10 glass-card">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Auction Info */}
              <div className="space-y-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-4 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-widest border border-primary/30">
                      {displayAuction.category || "Aukcja"}
                    </span>
                    {isEnded ? (
                      <span className="px-4 py-1.5 rounded-full bg-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest border border-red-500/30">
                        Zakończona
                      </span>
                    ) : (
                      <span className="px-4 py-1.5 rounded-full bg-green-500/20 text-green-500 text-xs font-bold uppercase tracking-widest border border-green-500/30">
                        Aktywna
                      </span>
                    )}
                  </div>
                  <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-2 leading-tight">
                    {displayAuction.title}
                  </h1>
                  <p className="text-white/60 font-mono tracking-wider uppercase text-sm">
                    {displayAuction.pigeon?.ringNumber || "Brak numeru obrączki"}
                  </p>
                </div>

                <div className="h-px w-full bg-white/10" />

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-white/40 uppercase tracking-widest text-[10px] mb-1">Aktualna cena</p>
                    <p className="text-4xl font-bold text-primary">
                      {displayAuction.currentPrice.toLocaleString("pl-PL")} zł
                    </p>
                    <p className="text-white/40 text-xs mt-1">
                      Cena wywoławcza: {displayAuction.startingPrice?.toLocaleString("pl-PL")} zł
                    </p>
                  </div>
                  <div>
                    <p className="text-white/40 uppercase tracking-widest text-[10px] mb-1">Pozostały czas</p>
                    <div className="text-2xl font-bold text-white font-mono">
                      {timeLeft}
                    </div>
                  </div>
                </div>

                <div className="glass-card p-8 rounded-3xl border border-white/10 space-y-8 shadow-2xl">
                  {!isEnded && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <label className="text-white/60 text-xs uppercase tracking-[0.2em] font-semibold">
                            Twoja oferta
                          </label>
                          <span className="text-[10px] text-primary/80 uppercase tracking-wider">
                            Min. {minimumBidValue.toLocaleString("pl-PL")} zł
                          </span>
                        </div>
                        <div className="flex gap-4">
                          <div className="relative flex-1 group">
                            <input 
                              type="number"
                              value={bidAmount}
                              onChange={(e) => setBidAmount(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-xl font-bold focus:outline-none focus:border-primary/50 transition-all focus:bg-white/[0.08]"
                              placeholder="0.00"
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-white/40 font-bold">PLN</span>
                          </div>
                          <Button 
                            onClick={handleBid}
                            disabled={bidLoading}
                            className="px-10 h-auto font-bold uppercase tracking-[0.15em] rounded-2xl shadow-glow-sm hover:shadow-glow-md transition-all active:scale-95"
                            variant="premium"
                          >
                            Licytuj
                          </Button>
                        </div>
                      </div>
                      
                      {displayAuction.buyNowPrice && (
                        <div className="pt-2">
                          <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-gold/50 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                            <Button 
                              onClick={handleBuyNow}
                              disabled={isCheckoutLoading}
                              variant="outline"
                              className="relative w-full h-14 border-white/10 bg-white/5 hover:bg-white/[0.08] text-white font-bold uppercase tracking-[0.2em] rounded-2xl transition-all"
                            >
                              Kup teraz: {displayAuction.buyNowPrice.toLocaleString("pl-PL")} zł
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-white/40 uppercase tracking-widest">Ofert</span>
                        <span className="text-lg font-bold text-white">{displayAuction._count?.bids || 0}</span>
                      </div>
                      <div className="w-px h-8 bg-white/10" />
                      <div className="flex flex-col">
                        <span className="text-[10px] text-white/40 uppercase tracking-widest">Obserwujących</span>
                        <span className="text-lg font-bold text-white">{displayAuction._count?.watchlist || 0}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={toggleWatch} 
                      className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border transition-all ${
                        isWatched 
                        ? "bg-red-500/10 border-red-500/30 text-red-500" 
                        : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/20"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isWatched ? "fill-current" : ""}`} />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {isWatched ? "Obserwujesz" : "Obserwuj"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-white uppercase tracking-[0.2em] flex items-center gap-3">
                    <span className="w-12 h-px bg-primary" />
                    Szczegóły gołębia
                  </h3>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { label: "Płeć", value: displayAuction.pigeon?.gender === "male" ? "Samiec" : "Samica" },
                      { label: "Kolor", value: displayAuction.pigeon?.pigeonColor },
                      { label: "Oko", value: displayAuction.pigeon?.eyeColor },
                      { label: "Budowa", value: displayAuction.pigeon?.construction },
                      { label: "Witalność", value: displayAuction.pigeon?.vitality },
                      { label: "Cel", value: displayAuction.pigeon?.purpose },
                    ].map((spec, i) => spec.value && (
                      <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 transition-colors hover:bg-white/[0.08]">
                        <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">{spec.label}</p>
                        <p className="text-sm font-semibold text-white">{spec.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4 pt-4">
                    <h4 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      Opis hodowcy
                    </h4>
                    <div className="text-white/70 leading-relaxed whitespace-pre-wrap glass-card p-6 rounded-2xl border border-white/10 italic">
                      {displayAuction.description}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            {isEnded && displayAuction.seller?.id && (
              <div className="mt-24 pt-12 border-t border-white/10">
                <div className="grid lg:grid-cols-2 gap-12">
                  {showReviewForm && !reviewSubmitted && (
                    <ReviewForm
                      auctionId={displayAuction.id}
                      sellerId={displayAuction.seller.id}
                      auctionTitle={displayAuction.title}
                      onReviewSubmitted={handleReviewSubmitted}
                    />
                  )}
                  <SellerReviews
                    sellerId={displayAuction.seller.id}
                    sellerName={displayAuction.seller.firstName}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      
      <AccountModal 
        open={isAccountOpen} 
        onClose={() => setIsAccountOpen(false)} 
      />

      <UnifiedModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        type="warning"
        title={verificationMessage.title}
        message={verificationMessage.message}
        confirmButton={{
          text: profile?.role === 'USER_REGISTERED' ? 'Zweryfikuj email' : 'Uzupełnij profil',
          onClick: () => {
            setShowVerificationModal(false);
            if (profile?.role === 'USER_REGISTERED') {
              navigate('/verify-email');
            } else {
              setIsAccountOpen(true);
            }
          }
        }}
        cancelButton={{
          text: 'Anuluj',
          onClick: () => setShowVerificationModal(false)
        }}
      />
      
      {displayAuction && (
        <EditAuctionModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          auction={displayAuction}
          onSave={handleAdminUpdate}
          onCancel={handleAdminCancel}
        />
      )}

      <Footer />
    </div>
  );
};

export default AuctionDetail;
