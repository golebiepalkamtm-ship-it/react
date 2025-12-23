import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import AuctionCard from "./AuctionCard";
import CreateAuctionForm from "./CreateAuctionForm";
import { useAuth } from "@/contexts/AuthContext";
import { useAuctions } from "@/hooks/useAuctions";
import { auctionService } from "@/services/auctionService";
import type { AuctionSortBy } from "@/types/auction";

const AuctionsPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<AuctionSortBy>("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [category, setCategory] = useState("all");
  const [gender, setGender] = useState("all");

  const { auctions, loading, refetch } = useAuctions({ status: 'active', sortBy });

  const filteredAuctions = useMemo(() => {
    return auctions.filter(auction => {
      const matchesSearch = 
        auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        auction.pigeon?.bloodline?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPrice = 
        (!priceMin || auction.currentPrice >= parseFloat(priceMin)) &&
        (!priceMax || auction.currentPrice <= parseFloat(priceMax));
      
      const matchesCategory = 
        category === "all" || auction.category === category;
      
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

  const hasActiveFilters = searchTerm || priceMin || priceMax || category !== "all" || gender !== "all" || sortBy !== "newest";

  if (loading) {
    return (
      <section className="pt-40 pb-12">
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
              <div key={i} className="rounded-2xl bg-card border border-border h-96 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-navy text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-navy/90 via-navy/40 to-transparent" />
          <div className="relative z-10 container mx-auto px-4">
              <h1 className="font-display text-4xl md:text-5xl text-white font-bold leading-tight mb-4">
                Wszystkie <span className="text-gradient-gold">Aukcje</span>
              </h1>
              <p className="text-white/80 text-lg max-w-2xl mx-auto">
                Przeglądaj i licytuj ekskluzywne gołębie pocztowe z rodowodami
              </p>
          </div>
      </section>
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Szukaj aukcji po nazwie lub rodowodzie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as AuctionSortBy)}
              title="Sortuj aukcje"
              className="px-4 py-3 rounded-xl bg-card border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all text-foreground"
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
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtry {hasActiveFilters && <span className="ml-1 w-2 h-2 rounded-full bg-gold"></span>}
            </Button>

            {/* Add Auction Button */}
            {user && (
              <Button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-gold to-gold-light hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                Dodaj aukcję
              </Button>
            )}
          </div>

          {/* Advanced Filters (collapsible) */}
          {showFilters && (
            <div className="p-6 rounded-xl bg-card border border-border space-y-4">
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
                      className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-gold outline-none text-foreground"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
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
                    <option value="racing">Wyścigowe</option>
                    <option value="breeding">Hodowlane</option>
                    <option value="show">Pokazowe</option>
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAuctions.map((auction, index) => (
            <AuctionCard
              key={auction.id}
              id={auction.id}
              name={auction.title}
              image={getFirstImage(auction.images)}
              currentBid={auction.currentPrice}
              timeLeft={auctionService.calculateTimeLeft(auction.endTime)}
              raceWins={auctionService.extractWins(auction.pigeon?.achievements)}
              bloodline={auction.pigeon?.bloodline || 'Rodowód elitarny'}
              featured={index < 2}
            />
          ))}
        </div>

        {filteredAuctions.length === 0 && (
          <div className="text-center py-16">
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
        )}
      </div>
      </section>

      {/* Create Auction Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Dodaj nową aukcję</DialogTitle>
            <DialogDescription>
              Wypełnij formularz, aby utworzyć nową aukcję gołębia
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <CreateAuctionForm 
              onSuccess={() => { 
                setShowCreateModal(false); 
                refetch(); 
              }} 
              onCancel={() => setShowCreateModal(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AuctionsPage;
