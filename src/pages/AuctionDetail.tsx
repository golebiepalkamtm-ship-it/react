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
import LuxuryAuctionDetail from "@/components/auction/LuxuryAuctionDetail";
import ReviewForm from "@/components/ReviewForm";
import SellerReviews from "@/components/SellerReviews";
import { UnifiedModal } from "@/components/ui/UnifiedModal";
import AccountModal from "@/components/AccountModal";
import EditAuctionModal from "@/components/auction/EditAuctionModal";
import { trackMetric } from "@/services/metricsService";
import type { Auction } from "@/types/auction";

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

  const luxuryAuctionDetailProps = useMemo(() => ({
    auction: displayAuction,
    isWatched,
    isEnded,
    minimumBid: minimumBidValue,
    bidAmount,
    bidLoading,
    bidError: bidError?.message || null,
    bidSuccess,
    onBidAmountChange: setBidAmount,
    onPlaceBid: handleBid,
    onBuyNow: handleBuyNow,
    onToggleWatch: toggleWatch,
    onEdit: () => setIsEditModalOpen(true),
  }), [displayAuction, isWatched, isEnded, minimumBidValue, bidAmount, bidLoading, bidError, bidSuccess, setBidAmount, handleBid, handleBuyNow, toggleWatch]);

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
      <main className="pt-16 pb-12">
        {displayAuction && !error && (
          <>
            <LuxuryAuctionDetail {...luxuryAuctionDetailProps} />
            
            {/* Sekcja recenzji - tylko dla zakończonych aukcji */}
            {isEnded && displayAuction.seller?.id && (
              <div className="container mx-auto px-4 mt-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Formularz recenzji - tylko dla zwycięzcy */}
                  {showReviewForm && !reviewSubmitted && displayAuction.seller?.id && (
                    <ReviewForm
                      auctionId={displayAuction.id}
                      sellerId={displayAuction.seller.id}
                      auctionTitle={displayAuction.title}
                      onReviewSubmitted={handleReviewSubmitted}
                    />
                  )}
                  
                  {/* Recenzje sprzedającego */}
                  {displayAuction.seller?.id && (
                    <SellerReviews
                      sellerId={displayAuction.seller.id}
                      sellerName={displayAuction.seller.firstName}
                    />
                  )}
                </div>
              </div>
            )}
          </>
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
