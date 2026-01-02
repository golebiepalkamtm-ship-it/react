import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import AuctionCard from "./AuctionCard";
import CreateAuctionModal from "./CreateAuctionModal";
import { useAuth } from "@/contexts/AuthContext";
import { useAuctions } from "@/hooks/useAuctions";
import { auctionService } from "@/services/auctionService";
import type { AuctionSortBy } from "@/types/auction";

const AuctionsPage = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<AuctionSortBy>("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [imageFit, setImageFit] = useState<'cover' | 'contain'>('cover');
  
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [category, setCategory] = useState("all");
  const [gender, setGender] = useState("all");

  const { auctions, loading, refetch } = useAuctions({ status: 'active', sortBy });

  const filteredAuctions = useMemo(() => {
    const normalizeCategory = (c: unknown) => {
      if (c === 'racing' || c === 'breeding' || c === 'show') return 'pigeons';
      return typeof c === 'string' ? c : '';
    };

    return auctions.filter(auction => {
      const matchesSearch = 
        auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        auction.pigeon?.bloodline?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPrice = 
        (!priceMin || auction.currentPrice >= parseFloat(priceMin)) &&
        (!priceMax || auction.currentPrice <= parseFloat(priceMax));
      
      const matchesCategory = category === "all" || normalizeCategory(auction.category) === category;
      
      const matchesGender = 
        gender === "all" || auction.pigeon?.gender === gender;
      
      return matchesSearch && matchesPrice && matchesCategory && matchesGender;
    });
  }, [auctions, searchTerm, priceMin, priceMax, category, gender]);

  const getFirstImage = (images: string[]) => {
    return images && images.length > 0 ? images[0] : '/placeholder.svg';
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPriceMin("");
    setPriceMax("");
    setCategory("all");
    setGender("all");
    setSortBy("newest");
  };

  const handleCreateAuctionClick = () => {
    if (!user) {
      toast("Musisz się zalogować, aby utworzyć aukcję.", {
        description: "Za chwilę przeniosę Cię do logowania.",
      });
      setTimeout(() => navigate("/auth?mode=login"), 350);
      return;
    }

    if (!profile) {
      toast('Ładuję Twój profil…', {
        description: 'Poczekaj chwilę i spróbuj ponownie.',
      });
      return;
    }

    if (profile.role === 'USER_REGISTERED') {
      toast('Najpierw potwierdź email.', {
        description: 'Wyślaliśmy do Ciebie link weryfikacyjny. Po kliknięciu wróć tutaj i spróbuj ponownie.',
      });
      setTimeout(() => navigate('/verify-email'), 350);
      return;
    }

    if (profile.role === 'USER_EMAIL_VERIFIED') {
      toast('Dokończ weryfikację konta.', {
        description: 'Uzupełnij profil i zweryfikuj numer telefonu, aby móc tworzyć aukcje.',
      });
      setTimeout(() => navigate('/complete-profile'), 350);
      return;
    }

    if (profile.role !== 'USER_FULL_VERIFIED' && profile.role !== 'ADMIN') {
      toast('Brak uprawnień do tworzenia aukcji.', {
        description: 'Dokończ weryfikację konta (email + telefon) i spróbuj ponownie.',
      });
      return;
    }

    toast("Otwieram formularz tworzenia aukcji…", {
      description: "Uzupełnij dane i kliknij „Utwórz aukcję”.",
    });
    setShowCreateModal(true);
  };

  const hasActiveFilters = searchTerm || priceMin || priceMax || category !== "all" || gender !== "all" || sortBy !== "newest";

  if (loading) {
    return (
      <section className="pt-16 pb-6">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h1 className="font-display text-4xl md:text-5xl text-foreground font-bold leading-tight mb-4">
              Wszystkie <span className="text-gradient-gold">Aukcje</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Ładowanie aukcji...
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-black/70 backdrop-blur-xl border border-white/25 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] h-96 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="relative overflow-hidden text-center">
        <div className="relative z-10 container mx-auto px-4 pt-12 pb-6 md:pt-16 md:pb-8">
          <h1 className="font-display text-4xl md:text-5xl text-foreground font-bold leading-tight mb-4">
            Wszystkie <span className="text-gradient-gold">Aukcje</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Przeglądaj i licytuj ekskluzywne gołębie pocztowe z rodowodami
          </p>
        </div>
      </section>
      <section className="py-10 section-surface-alt">
        <div className="container mx-auto px-4">
          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="rounded-2xl border border-white/25 bg-black/70 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.08)] p-4 md:p-5 shadow-lg">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Szukaj aukcji po nazwie lub rodowodzie..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Szukaj aukcji"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-background/40 border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as AuctionSortBy)}
                  title="Sortuj aukcje"
                  className="px-4 py-3 rounded-xl bg-background/40 border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all text-foreground"
                >
                  <option value="newest">Najnowsze</option>
                  <option value="ending-soon">Kończące się</option>
                  <option value="price-high">Najdroższe</option>
                  <option value="price-low">Najtańsze</option>
                </select>

                {/* Filters toggle */}
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 border-white/25 bg-black/70 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.08)] hover:border-gold/30"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filtry {hasActiveFilters && <span className="ml-1 w-2 h-2 rounded-full bg-gold"></span>}
                </Button>

                <div className="flex items-center rounded-xl border border-white/25 bg-black/70 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.08)] p-1">
                  <Button
                    type="button"
                    variant={imageFit === 'cover' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setImageFit('cover')}
                    className="rounded-lg"
                  >
                    Cover
                  </Button>
                  <Button
                    type="button"
                    variant={imageFit === 'contain' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setImageFit('contain')}
                    className="rounded-lg"
                  >
                    Contain
                  </Button>
                </div>

                {/* Add Auction Button */}
                <Button
                  ref={ (
                    (el: HTMLButtonElement | null) => { /* keep as-is for simplicity */ }
                  ) }
                  onClick={handleCreateAuctionClick}
                  className="flex items-center gap-2 bg-gradient-to-r from-gold to-gold-light hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-4 h-4" />
                  Dodaj aukcję
                </Button>
              </div>
            </div>

          {/* Advanced Filters (collapsible) */}
          {showFilters && (
            <div className="p-6 rounded-2xl bg-black/70 backdrop-blur-xl border border-white/25 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] space-y-4 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Zaawansowane filtry</h3>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Wyczyść
                  </Button>
                )}
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Przedział cenowy (PLN)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      aria-label="Cena minimalna"
                      className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-gold outline-none text-foreground"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      aria-label="Cena maksymalna"
                      className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-gold outline-none text-foreground"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Kategoria
                  </label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    title="Wybierz kategorię"
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-gold outline-none text-foreground"
                  >
                    <option value="all">Wszystkie</option>
                    <option value="pigeons">Aukcje gołębi</option>
                    <option value="supplements">Suplementy / odżywki / witaminy</option>
                    <option value="accessories">Akcesoria hodowlane</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Płeć
                  </label>
                  <select 
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    title="Wybierz płeć"
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-gold outline-none text-foreground"
                  >
                    <option value="all">Wszystkie</option>
                    <option value="male">Samiec</option>
                    <option value="female">Samica</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground">
            Znaleziono <span className="font-semibold text-foreground">{filteredAuctions.length}</span> {filteredAuctions.length === 1 ? 'aukcja' : filteredAuctions.length < 5 ? 'aukcje' : 'aukcji'}
          </p>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              Resetuj filtry
            </Button>
          )}
        </div>

        {/* Auction Grid */}
        {filteredAuctions.length > 0 && (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredAuctions.map((auction, index) => (
              <AuctionCard
                key={auction.id}
                id={auction.id}
                name={auction.title}
                image={getFirstImage(auction.images)}
                currentBid={auction.currentPrice}
                timeLeft={auctionService.calculateTimeLeft(auction.endTime)}
                bloodline={auction.pigeon?.bloodline || "Rodowód elitarny"}
                featured={index < 2}
                imageFit={imageFit}
              />
            ))}
          </div>
        )}

        {filteredAuctions.length === 0 && (
          <div className="py-16">
            <div className="text-center">
              <p className="text-muted-foreground text-lg mb-4">
                {searchTerm || hasActiveFilters
                  ? 'Nie znaleziono aukcji pasujących do kryteriów wyszukiwania'
                  : 'Obecnie brak aktywnych aukcji'}
              </p>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="mt-4"
                >
                  Wyczyść filtry
                </Button>
              )}
            </div>

          </div>
        )}
      </div>
      </section>

      {/* Create Auction Modal (reusable component) */}
      <CreateAuctionModal
        open={showCreateModal}
        onOpenChange={(open) => setShowCreateModal(open)}
        onSuccess={() => {
          setShowCreateModal(false);
          refetch();
        }}
      />
    </>
  );
};

export default AuctionsPage;
