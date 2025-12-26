import { useEffect, useMemo, useState } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
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
  const [gridCols, setGridCols] = useState(1);
  const [imageFit, setImageFit] = useState<'cover' | 'contain'>('cover');
  const [showDemoAuctions, setShowDemoAuctions] = useState(true);
  
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

  const demoAuctions = useMemo(() => {
    return [
      {
        id: "demo-1",
        title: "Przykład (czempion)",
        image: "/champions/1/gallery/DV-02906-11-98t_OLIMP (1).jpg",
        currentPrice: 12500,
        timeLeft: "12h",
        bloodline: "Linia: Janssen (demo)",
        featured: true,
      },
      {
        id: "demo-2",
        title: "Przykład (czempion)",
        image: "/champions/4/gallery/PL-11-160651t_b2 (1).jpg",
        currentPrice: 8900,
        timeLeft: "1d 6h",
        bloodline: "Linia: Janssen (demo)",
        featured: false,
      },
      {
        id: "demo-3",
        title: "Przykład (czempion)",
        image: "/champions/16/gallery/pl-0446-16-1124_h.jpg",
        currentPrice: 15400,
        timeLeft: "90m",
        bloodline: "Linia: Janssen (demo)",
        featured: false,
      },
    ];
  }, []);

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

  useEffect(() => {
    const updateCols = () => {
      const w = window.innerWidth;
      if (w >= 1024) setGridCols(3);
      else if (w >= 768) setGridCols(2);
      else setGridCols(1);
    };

    updateCols();
    window.addEventListener("resize", updateCols, { passive: true });
    return () => window.removeEventListener("resize", updateCols);
  }, []);

  const rowCount = useMemo(() => {
    const cols = Math.max(1, gridCols);
    return Math.ceil(filteredAuctions.length / cols);
  }, [filteredAuctions.length, gridCols]);

  const rowVirtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => 460,
    overscan: 5,
  });

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
      <section className="relative overflow-hidden text-center">
        <div className="relative z-10 container mx-auto px-4 pt-28 pb-10 md:pt-32 md:pb-14">
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
            <div className="rounded-2xl border border-border/70 bg-card/55 backdrop-blur-md p-4 md:p-5 shadow-lg">
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
                  className="flex items-center gap-2 border-border/70 bg-background/20 hover:bg-background/30"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filtry {hasActiveFilters && <span className="ml-1 w-2 h-2 rounded-full bg-gold"></span>}
                </Button>

                <div className="flex items-center rounded-xl border border-border/70 bg-background/20 p-1">
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
            </div>

          {/* Advanced Filters (collapsible) */}
          {showFilters && (
            <div className="p-6 rounded-2xl bg-card/55 backdrop-blur-md border border-border/70 space-y-4 shadow-lg">
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
        {filteredAuctions.length > 0 && (
          <div className="relative" style={{ height: rowVirtualizer.getTotalSize() }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const rowIndex = virtualRow.index;
              const baseIndex = rowIndex * gridCols;

              return (
                <div
                  key={virtualRow.key}
                  className="absolute left-0 top-0 w-full"
                  style={{ transform: `translateY(${virtualRow.start}px)` }}
                >
                  <div
                    className="grid gap-8"
                    style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
                  >
                    {Array.from({ length: gridCols }).map((_, colIndex) => {
                      const itemIndex = baseIndex + colIndex;
                      const auction = filteredAuctions[itemIndex];
                      if (!auction) return <div key={`empty-${rowIndex}-${colIndex}`} />;

                      return (
                        <AuctionCard
                          key={auction.id}
                          id={auction.id}
                          name={auction.title}
                          image={getFirstImage(auction.images)}
                          currentBid={auction.currentPrice}
                          timeLeft={auctionService.calculateTimeLeft(auction.endTime)}
                          raceWins={auctionService.extractWins(auction.pigeon?.achievements)}
                          bloodline={auction.pigeon?.bloodline || "Rodowód elitarny"}
                          featured={itemIndex < 2}
                          imageFit={imageFit}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
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
              {!hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={() => setShowDemoAuctions((v) => !v)}
                  className="mt-4"
                >
                  {showDemoAuctions ? 'Ukryj przykładowe aukcje' : 'Pokaż przykładowe aukcje'}
                </Button>
              )}
            </div>

            {!hasActiveFilters && showDemoAuctions && (
              <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {demoAuctions.map((a, idx) => (
                  <AuctionCard
                    key={a.id}
                    id={a.id}
                    name={a.title}
                    image={a.image}
                    currentBid={a.currentPrice}
                    timeLeft={a.timeLeft}
                    bloodline={a.bloodline}
                    featured={idx === 0}
                    imageFit={imageFit}
                  />
                ))}
              </div>
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
