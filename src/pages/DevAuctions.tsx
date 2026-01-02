import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import exampleAuctions from '@/data/exampleAuctions';
import { auctionService } from '@/services/auctionService';

type DevAuction = {
  id: string;
  title: string;
  image: string;
  currentPrice: number;
  endTime: string;
  pigeon: any;
};

const DevAuctions = () => {
  const initial = useMemo<DevAuction[]>(() => exampleAuctions.map((a, idx) => ({
    id: `dev-${idx + 1}`,
    title: a.title,
    image: a.images[0] || '/placeholder.svg',
    currentPrice: a.startingPrice,
    endTime: a.endTime,
    pigeon: a.pigeon,
  })), []);

  const [auctions, setAuctions] = useState<DevAuction[]>(initial);
  const [selected, setSelected] = useState<DevAuction | null>(null);
  const [bidAmount, setBidAmount] = useState('');

  const openBid = (a: DevAuction) => {
    setSelected(a);
    setBidAmount(String(a.currentPrice + 100));
  };

  const placeBid = () => {
    if (!selected) return;
    const amt = Number(bidAmount);
    if (!Number.isFinite(amt) || amt <= selected.currentPrice) {
      toast('Nieprawidłowa oferta', { description: 'Kwota musi być większa niż aktualna cena.' });
      return;
    }

    setAuctions(prev => prev.map(a => a.id === selected.id ? { ...a, currentPrice: amt } : a));
    toast('Oferta złożona', { description: `Twoja oferta ${amt} zł została przyjęta (symulacja).` });
    setSelected(null);
  };

  return (
    <section className="pt-16 pb-6">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="font-display text-4xl md:text-5xl text-foreground font-bold leading-tight mb-4">Przykładowe aukcje (dev)</h1>
          <p className="text-muted-foreground">Przeglądaj aukcje i składaj testowe oferty (symulacja).</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {auctions.map(a => (
            <div key={a.id} className="rounded-2xl bg-black/70 backdrop-blur-xl border border-white/25 p-4">
              <img src={a.image} alt={a.title} className="w-full h-48 object-cover rounded-lg mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{a.title}</h3>
              <p className="text-muted-foreground mb-2">{a.pigeon.bloodline} • {a.pigeon.budowa}</p>
              <p className="font-semibold text-foreground mb-3">{a.currentPrice.toLocaleString('pl-PL')} zł</p>
              <div className="flex gap-2">
                <Button onClick={() => openBid(a)}>Licytuj</Button>
                <a className="ml-auto text-sm text-muted-foreground hover:text-gold" href={a.pigeon?.documents?.[0] || '#'} target="_blank" rel="noreferrer">Rodowód</a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="w-full max-w-md">
          <DialogHeader>
            <DialogTitle>Licytuj: {selected?.title}</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Podaj kwotę (PLN)
          </DialogDescription>

          <div className="mt-4">
            <input type="number" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-background border border-border" />
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={placeBid}>Złóż ofertę</Button>
            <Button variant="ghost" onClick={() => setSelected(null)}>Anuluj</Button>
          </div>
          <DialogClose className="sr-only" />
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default DevAuctions;
