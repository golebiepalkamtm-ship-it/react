import { useState } from 'react';
import GlassModal from '@/components/GlassModal';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { paymentService } from '@/services/paymentService';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, CreditCard } from 'lucide-react';

type PaymentKind = 'LISTING_FEE' | 'COMMISSION';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  auctionId: string;
  type: PaymentKind;
  // Stała opłata za wystawienie — zgodna z backendem (server/routes/payments.ts listingFee = 20 PLN)
  listingFeeAmount?: number;
  // Informacyjnie: prowizja liczona na backendzie (10%); tutaj tylko komunikat.
}

const PaymentModal = ({ open, onClose, auctionId, type, listingFeeAmount = 20 }: PaymentModalProps) => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!session?.access_token) {
      toast.error('Musisz być zalogowany, aby opłacić.');
      return;
    }
    try {
      setLoading(true);
      const successUrl = `${window.location.origin}/auctions/success`;
      const cancelUrl = `${window.location.origin}/auctions/cancel`;

      const payload =
        type === 'LISTING_FEE'
          ? await paymentService.createListingFeeCheckout(auctionId, session.access_token, successUrl, cancelUrl)
          : await paymentService.createCommissionCheckout(auctionId, session.access_token, successUrl, cancelUrl);

      if (payload.url) {
        window.location.href = payload.url;
      } else {
        toast.error('Brak adresu płatności.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Nie udało się zainicjować płatności.');
    } finally {
      setLoading(false);
    }
  };

  const title = type === 'LISTING_FEE' ? 'Opłata za wystawienie' : 'Prowizja od sprzedaży';
  const description =
    type === 'LISTING_FEE'
      ? `Stała opłata za wystawienie aukcji: ${listingFeeAmount} PLN.`
      : 'Prowizja 10% od kwoty sprzedaży — naliczana na backendzie podczas tworzenia sesji Stripe.';

  return (
    <GlassModal open={open} onClose={onClose} title={title} description={description} size="md">
      <div className="space-y-4 text-white">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
          <div className="p-2 rounded-xl bg-gradient-to-br from-gold to-amber-500/80 text-black shadow-lg shadow-amber-500/30">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold">
              {type === 'LISTING_FEE' ? 'Opłata stała' : 'Prowizja 10%'}
            </p>
            <p className="text-sm text-white/60">
              {type === 'LISTING_FEE'
                ? `Kwota: ${listingFeeAmount} PLN. Płatność wymagana przed publikacją.`
                : 'Kwota prowizji zostanie policzona po stronie serwera na podstawie ceny sprzedaży.'}
            </p>
          </div>
        </div>

        <Button
          onClick={handlePay}
          disabled={loading}
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-gold to-amber-500 text-black hover:opacity-90"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Przekierowuję do Stripe...
            </>
          ) : (
            'Przejdź do płatności Stripe'
          )}
        </Button>
      </div>
    </GlassModal>
  );
};

export default PaymentModal;
