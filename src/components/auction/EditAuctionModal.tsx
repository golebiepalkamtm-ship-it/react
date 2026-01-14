import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import UnifiedModal from '@/components/ui/UnifiedModal';
import type { Auction } from '@/types/auction';

interface EditAuctionModalProps {
  isOpen: boolean;
  onClose: () => void;
  auction: Auction;
  onSave: (data: { currentPrice?: number; buyNowPrice?: number; endTime?: string }) => Promise<void>;
  onCancel?: () => Promise<void>;
}

const EditAuctionModal: React.FC<EditAuctionModalProps> = ({ isOpen, onClose, auction, onSave, onCancel }) => {
  const [currentPrice, setCurrentPrice] = useState(auction.currentPrice);
  const [buyNowPrice, setBuyNowPrice] = useState(auction.buyNowPrice || '');
  const [endTime, setEndTime] = useState(new Date(auction.endTime).toISOString().slice(0, 16));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (auction) {
      setCurrentPrice(auction.currentPrice);
      setBuyNowPrice(auction.buyNowPrice || '');
      setEndTime(new Date(auction.endTime).toISOString().slice(0, 16));
    }
  }, [auction]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave({
        currentPrice: Number(currentPrice),
        buyNowPrice: buyNowPrice ? Number(buyNowPrice) : undefined,
        endTime: new Date(endTime).toISOString(),
      });
      onClose();
    } catch (error) {
      console.error('Failed to save auction changes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (onCancel) {
      setIsLoading(true);
      try {
        await onCancel();
        onClose();
      } catch (error) {
        console.error('Failed to cancel auction:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      onClose();
    }
  };

  return (
    <UnifiedModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edytuj Aukcję (Admin)"
      size="md"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Cena Aktualna (PLN)</label>
          <input
            type="number"
            value={currentPrice}
            onChange={(e) => setCurrentPrice(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Cena Kup Teraz (PLN)</label>
          <input
            type="number"
            value={buyNowPrice}
            onChange={(e) => setBuyNowPrice(e.target.value)}
            placeholder="Opcjonalnie"
            className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Data Zakończenia</label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground"
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose}>Anuluj</Button>
          {onCancel && (
            <Button 
              variant="destructive" 
              onClick={handleCancel} 
              disabled={isLoading}
            >
              {isLoading ? 'Anulowanie...' : 'Anuluj aukcję'}
            </Button>
          )}
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Zapisywanie...' : 'Zapisz zmiany'}
          </Button>
        </div>
      </div>
    </UnifiedModal>
  );
};

export default EditAuctionModal;
