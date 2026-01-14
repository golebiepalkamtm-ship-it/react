import React from 'react';
import { Trophy, Mail, Phone, User, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWinnerInfo } from '@/hooks/useWinnerInfo';

interface WinnerInfoProps {
  auctionId: string;
}

const WinnerInfo: React.FC<WinnerInfoProps> = ({ auctionId }) => {
  const { winnerInfo, loading, error } = useWinnerInfo(auctionId);

  if (loading) {
    return (
      <div className="p-6 rounded-2xl bg-black/70 backdrop-blur-xl border border-white/25 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
        <div className="animate-pulse">
          <div className="h-6 bg-gold/20 rounded mb-4"></div>
          <div className="h-4 bg-white/10 rounded mb-2"></div>
          <div className="h-4 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-black/70 backdrop-blur-xl border border-white/25 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
        <div className="flex items-center gap-3 text-orange-500">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!winnerInfo) {
    return null;
  }

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-gold/10 to-gold/5 backdrop-blur-xl border border-gold/30 shadow-[0_0_0_1px_rgba(255,215,0,0.2)]">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-gold" />
        <h3 className="font-display text-xl font-bold text-gold">Gratulacje! Wygrałeś aukcję</h3>
      </div>

      <div className="space-y-4 mb-6">
        <div className="p-4 rounded-xl bg-black/50 border border-white/10">
          <h4 className="font-semibold text-foreground mb-2">Szczegóły aukcji</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tytuł:</span>
              <span className="font-medium text-foreground">{winnerInfo.auction.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cena końcowa:</span>
              <span className="font-bold text-gold">
                {winnerInfo.auction.finalPrice.toLocaleString('pl-PL')} zł
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data zakończenia:</span>
              <span className="font-medium text-foreground">
                {new Date(winnerInfo.auction.endedAt).toLocaleDateString('pl-PL')}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-black/50 border border-white/10">
          <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-gold" />
            Dane sprzedającego
          </h4>
          <div className="space-y-3">
            {winnerInfo.seller.name && (
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{winnerInfo.seller.name}</span>
              </div>
            )}
            {winnerInfo.seller.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <a 
                  href={`mailto:${winnerInfo.seller.email}`}
                  className="text-gold hover:text-gold/80 transition-colors"
                >
                  {winnerInfo.seller.email}
                </a>
              </div>
            )}
            {winnerInfo.seller.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <a 
                  href={`tel:${winnerInfo.seller.phone}`}
                  className="text-gold hover:text-gold/80 transition-colors"
                >
                  {winnerInfo.seller.phone}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button className="flex-1 bg-gold hover:bg-gold/90 text-navy font-semibold">
          <Mail className="w-4 h-4 mr-2" />
          Skontaktuj się ze sprzedającym
        </Button>
        <Button variant="outline" className="border-gold text-gold hover:bg-gold hover:text-navy">
          <Calendar className="w-4 h-4 mr-2" />
          Umów odbiór
        </Button>
      </div>

      <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
        <div className="flex items-center gap-2 text-green-500 text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>Płatność i odbiór do uzgodnienia ze sprzedającym</span>
        </div>
      </div>
    </div>
  );
};

export default WinnerInfo;
