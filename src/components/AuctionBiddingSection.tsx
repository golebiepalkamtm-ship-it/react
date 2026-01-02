import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/lib/supabase';
import { useRealtimeAuction } from '@/hooks/useRealtimeAuction';
import { Clock, Gavel, AlertCircle } from 'lucide-react';

interface AuctionBiddingSectionProps {
  auctionId: string;
}

export function AuctionBiddingSection({ auctionId }: AuctionBiddingSectionProps) {
  const { auction, bids, loading, error, addLocalBid } = useRealtimeAuction(auctionId);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

  // Timer effect - updates every second and reacts to end_time changes
  useEffect(() => {
    if (!auction?.end_time) return;

    const updateTimer = () => {
      const now = new Date();
      const end = new Date(auction.end_time);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('Aukcja zakończona');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [auction?.end_time]);

  // Handle bid submission
  const handleBid = async () => {
    if (!auction || !bidAmount.trim()) return;

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Wprowadź prawidłową kwotę oferty');
      return;
    }

    setSubmitting(true);
    try {
      // If addLocalBid is available (development mode simulated auction), use it
      if (typeof addLocalBid === 'function') {
        addLocalBid(amount);
        toast.success('Oferta złożona (symulacja)');
        setBidAmount('');
        return;
      }

      const { error } = await supabase
        .from('bids')
        .insert({
          auction_id: auctionId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          amount: amount,
        });

      if (error) {
        // Handle validation error from database trigger
        if (error.message.includes('must be higher than') ||
            error.message.includes('must be at least')) {
          toast.error('Ktoś Cię ubiegł! Cena wzrosła.', {
            description: 'Spróbuj ponownie z wyższą kwotą.',
            icon: <AlertCircle className="w-4 h-4" />,
          });
          setBidAmount(''); // Clear input
        } else {
          toast.error('Błąd podczas składania oferty', {
            description: error.message,
          });
        }
      } else {
        toast.success('Oferta złożona pomyślnie!');
        setBidAmount('');
      }
    } catch (err) {
      toast.error('Nieoczekiwany błąd', {
        description: 'Spróbuj ponownie później.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Enter key in input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBid();
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="h-12 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
        <p className="text-destructive text-sm">{error}</p>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="p-4 bg-muted rounded-lg">
        <p className="text-muted-foreground">Aukcja nie została znaleziona.</p>
      </div>
    );
  }

  const isEnded = new Date(auction.end_time) <= new Date();
  const currentPrice = auction.current_price || auction.start_price;
  const minBid = Math.max(currentPrice + 0.01, auction.start_price);

  return (
    <div className="space-y-6">
      {/* Current Price & Timer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Gavel className="w-5 h-5 text-gold" />
            <span className="text-sm font-medium text-muted-foreground">Aktualna cena</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {currentPrice.toLocaleString('pl-PL', {
              style: 'currency',
              currency: 'PLN',
            })}
          </p>
          {bids.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {bids.length} {bids.length === 1 ? 'oferta' : bids.length < 5 ? 'oferty' : 'ofert'}
            </p>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-gold" />
            <span className="text-sm font-medium text-muted-foreground">
              {isEnded ? 'Zakończona' : 'Pozostało'}
            </span>
          </div>
          <p className={`text-2xl font-bold ${isEnded ? 'text-destructive' : 'text-foreground'}`}>
            {timeLeft}
          </p>
          {!isEnded && (
            <p className="text-sm text-muted-foreground mt-1">
              Kończy się {new Date(auction.end_time).toLocaleString('pl-PL')}
            </p>
          )}
        </div>
      </div>

      {/* Bidding Form */}
      {!isEnded && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Złóż ofertę</h3>

          <div className="space-y-4">
            <div>
              <label htmlFor="bid-amount" className="block text-sm font-medium mb-2">
                Kwota oferty (min. {minBid.toLocaleString('pl-PL', {
                  style: 'currency',
                  currency: 'PLN',
                })})
              </label>
              <div className="flex gap-3">
                <Input
                  id="bid-amount"
                  type="number"
                  step="0.01"
                  min={minBid}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`np. ${(minBid + 10).toFixed(2)}`}
                  className="flex-1"
                  disabled={submitting}
                />
                <Button
                  onClick={handleBid}
                  disabled={submitting || !bidAmount.trim()}
                  className="px-8"
                >
                  {submitting ? 'Składanie...' : 'Podbij'}
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Oferty są wiążące. Sprawdź warunki aukcji przed złożeniem oferty.
            </p>
          </div>
        </div>
      )}

      {/* Recent Bids */}
      {bids.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4">
          <h4 className="text-sm font-medium mb-3">Najnowsze oferty</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {bids.slice(0, 5).map((bid) => (
              <div key={bid.id} className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  {new Date(bid.created_at).toLocaleString('pl-PL')}
                </span>
                <span className="font-medium">
                  {bid.amount.toLocaleString('pl-PL', {
                    style: 'currency',
                    currency: 'PLN',
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}