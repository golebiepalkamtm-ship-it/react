import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
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

const AuctionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
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

  const checkAccess = () => {
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
  };

  const handleBid = async () => {
    if (!checkAccess()) return;
    if (!token || !auction) return;
    
    const amount = parseFloat(bidAmount);
    if (isNaN(amount)) return;
    
    await placeBid(amount);
    if (!bidError) {
      setBidAmount('');
    }
  };
  
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

  const handleBuyNow = async () => {
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
  };

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

  const toggleWatch = async () => {
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
  };

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

  const minimumBid = auction ? auctionService.getMinimumBid(auction) : 0;
  const isNearEnd = auction ? auctionService.isNearEnd(auction) : false;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16 pb-12">
        {auction && !error && (
          <>
            <LuxuryAuctionDetail 
              auction={auction}
              isWatched={isWatched}
              isEnded={isEnded}
              minimumBid={minimumBid}
              bidAmount={bidAmount}
              bidLoading={bidLoading}
              bidError={bidError?.message || null}
              bidSuccess={bidSuccess}
              onBidAmountChange={(value) => setBidAmount(value)}
              onPlaceBid={handleBid}
              onBuyNow={handleBuyNow}
              onToggleWatch={toggleWatch}
              onEdit={() => setIsEditModalOpen(true)}
            />
            
            {/* Sekcja recenzji - tylko dla zakończonych aukcji */}
            {isEnded && (
              <div className="container mx-auto px-4 mt-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Formularz recenzji - tylko dla zwycięzcy */}
                  {showReviewForm && !reviewSubmitted && (
                    <ReviewForm
                      auctionId={auction.id}
                      sellerId={auction.seller.id}
                      auctionTitle={auction.title}
                      onReviewSubmitted={handleReviewSubmitted}
                    />
                  )}
                  
                  {/* Recenzje sprzedającego */}
                  <SellerReviews
                    sellerId={auction.seller.id}
                    sellerName={auction.seller.firstName}
                  />
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
      
      {auction && (
        <EditAuctionModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          auction={auction}
          onSave={handleAdminUpdate}
          onCancel={handleAdminCancel}
        />
      )}

      <Footer />
    </div>
  );
};

export default AuctionDetail;
