import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, SlidersHorizontal, Plus, X, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import AuctionCard from "./AuctionCard";
import { LuxuryAuctionCard } from "@/components/auction/LuxuryAuctionCard";
import { AuctionListItem } from "@/components/auction/AuctionListItem";
import { useAuth } from "@/contexts/AuthContext";
import { useAuctions } from "@/hooks/useAuctions";
import CreateAuctionForm from "@/components/CreateAuctionForm";
import CreateSupplementAuctionForm from "@/components/CreateSupplementAuctionForm";
import CreateAccessoryAuctionForm from "@/components/CreateAccessoryAuctionForm";
import AuctionCategorySelector from "@/components/AuctionCategorySelector";
import DraggableModal from "@/components/DraggableModal";
import AccountModal from "@/components/AccountModal";
import { UnifiedModal } from "@/components/ui/UnifiedModal";
import { useAuctionFilters } from "@/hooks/useAuctionFilters";
import { auctionService } from "@/services/auctionService";
import { resolveAuctionImage } from "@/utils/image";
import { useOptimizedToast } from "@/hooks/use-optimized-toast";
import AdvancedSearch from "@/components/AdvancedSearch";
import { canCreateAuction } from "@/components/ProtectedRoute";
import type { AuctionSortBy } from "@/types/auction";
import { CreateAuctionModal } from "@/components/CreateAuctionModal";

const AuctionsPage = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useOptimizedToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<AuctionSortBy>("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [gridCols, setGridCols] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const imageFit: 'cover' | 'contain' = 'cover';
  
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [category, setCategory] = useState("all");
  const [gender, setGender] = useState("all");

  const { auctions, isLoading, refetch } = useAuctions({ status: 'active', sortBy });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'pigeons' | 'supplements' | 'accessories' | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState({ title: '', message: '' });
  const [isAuctionModalOpen, setIsAuctionModalOpen] = useState(false);
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const filters = useMemo(() => ({
    searchTerm,
    priceMin: priceMin ? parseFloat(priceMin) : undefined,
    priceMax: priceMax ? parseFloat(priceMax) : undefined,
    category,
    gender,
  }), [searchTerm, priceMin, priceMax, category, gender]);

  const filteredAuctions = useAuctionFilters(auctions, filters);

  const getFirstImage = (images: string[]) => resolveAuctionImage(images?.[0]);

  const clearFilters = () => {
    setSearchTerm("");
    setPriceMin("");
    setPriceMax("");
    setCategory("all");
    setGender("all");
    setSortBy("newest");
  };

  const roleActions = useMemo(() => ({
    'USER_REGISTERED': () => {
      setVerificationMessage({
        title: 'Wymagana weryfikacja emaila',
        message: 'Aby tworzyć aukcje, musisz najpierw zweryfikować swój adres email.\n\nSprawdź swoją skrzynkę odbiorczą i kliknij link weryfikacyjny.'
      });
      setShowVerificationModal(true);
    },
    'USER_EMAIL_VERIFIED': () => {
      setVerificationMessage({
        title: 'Wymagana pełna weryfikacja',
        message: 'Aby tworzyć aukcje i licytować, musisz uzupełnić swój profil i zweryfikować numer telefonu.\n\nKliknij "Uzupełnij profil" aby kontynuować.'
      });
      setShowVerificationModal(true);
    },
    'USER_FULL_VERIFIED': () => {
      setIsAuctionModalOpen(true);
    },
    'ADMIN': () => {
      setIsAuctionModalOpen(true);
    },
  }), []);

  const handleCreateAuctionClick = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('🔍 handleCreateAuctionClick called', { user: !!user, profile: profile?.role });
     
    if (!user) {
      toast("Musisz się zalogować.", { description: "Za chwilę przeniosę Cię do logowania." });
      setTimeout(() => navigate("/auth?mode=login"), 350);
      return;
    }
 
    if (!profile) {
      toast('Ładuję profil…', { description: 'Poczekaj i spróbuj ponownie.' });
      return;
    }
 
    console.log('🔍 Profile role:', profile.role);
    const action = roleActions[profile.role as keyof typeof roleActions];
    if (action) {
      console.log('🔍 Executing action for role:', profile.role);
      action();
    } else {
      toast('Brak uprawnień.', { description: 'Dokończ weryfikację konta.' });
    }
  };

  const handleCloseAuctionModal = () => {
    setIsAuctionModalOpen(false);
  };

  const handleCategorySelect = (category: 'pigeons' | 'supplements' | 'accessories') => {
    setSelectedCategory(category);
  };

  const handleCloseModal = () => {
    setIsCreateOpen(false);
    setSelectedCategory(null);
  };

  const handleBackToCategory = () => {
    setSelectedCategory(null);
  };

  const hasActiveFilters = searchTerm || priceMin || priceMax || category !== "all" || gender !== "all" || sortBy !== "newest";

  useEffect(() => {
    const updateCols = () => {
      const w = window.innerWidth;
      if (w >= 1440) setGridCols(4);
      else if (w >= 1024) setGridCols(3);
      else if (w >= 768) setGridCols(2);
      else setGridCols(1);
    };

    updateCols();
    window.addEventListener("resize", updateCols, { passive: true });
    
    // Listen for openCategorySelector event from UserPanel
    const handleOpenCategorySelector = () => {
      if (!user) {
        toast("Musisz się zalogować.", { description: "Za chwilę przeniosę Cię do logowania." });
        setTimeout(() => navigate("/auth?mode=login"), 350);
        return;
      }

      if (!profile) {
        toast('Ładuję profil…', { description: 'Poczekaj i spróbuj ponownie.' });
        return;
      }

      const action = roleActions[profile.role as keyof typeof roleActions];
      if (action) {
        action();
      } else {
        toast('Brak uprawnień.', { description: 'Dokończ weryfikację konta.' });
      }
    };
    
    window.addEventListener('openCategorySelector', handleOpenCategorySelector);
    
    return () => {
      window.removeEventListener("resize", updateCols);
      window.removeEventListener('openCategorySelector', handleOpenCategorySelector);
    };
  }, [user, profile, navigate, roleActions]);

  return (
    <>
      <section className="relative overflow-hidden text-center">
        <div className="relative z-10 container mx-auto px-4 pt-12 pb-6 md:pt-16 md:pb-8">
          <h1 className="font-display text-3xl md:text-4xl text-gold font-bold leading-tight mb-4">
            Wszystkie <span className="text-white">Aukcje</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Przeglądaj i licytuj ekskluzywne gołębie pocztowe
          </p>
        </div>
      </section>
      <section className="py-10 section-surface-alt">
        <div className="container mx-auto px-4">
          <div className="mb-8 space-y-4">
            <div className="rounded-2xl border border-white/25 bg-black/70 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.08)] p-4 md:p-5 shadow-lg">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Szukaj aukcji po nazwie lub numerze obrączki..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Szukaj aukcji"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-background/40 border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all text-foreground placeholder:text-muted-foreground"
                  />
                </div>

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
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-lg"
                  >
                    Siatka
                  </Button>
                  <Button
                    type="button"
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-lg"
                  >
                    Lista
                  </Button>
                </div>

                <Button
                  ref={triggerButtonRef}
                  onClick={(e) => handleCreateAuctionClick(e)}
                  className="flex items-center gap-2 bg-gradient-to-r from-gold to-gold-light hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-4 h-4" />
                  Dodaj aukcję
                </Button>
              </div>
            </div>

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

          {isLoading && (
            <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}>
              {Array.from({ length: gridCols * 2 }).map((_, idx) => (
                <div key={idx} className="h-64 rounded-2xl bg-black/50 border border-white/10 animate-pulse" />
              ))}
            </div>
          )}

          {!isLoading && filteredAuctions.length > 0 && (
            viewMode === "grid" ? (
              <div className="grid gap-8 items-stretch" style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}>
                {filteredAuctions.map((auction, index) => (
                  <div key={auction.id || `auction-${index}`} className="h-full flex">
                    <LuxuryAuctionCard
                      id={auction.id}
                      title={auction.title}
                      image={getFirstImage(auction.images)}
                      currentBid={auction.currentPrice}
                      endTime={auction.endTime}
                      ringNumber={auction.pigeon?.ringNumber || "Brak numeru"}
                      featured={index < 2}
                      imageFit={imageFit}
                      watchCount={auction._count?.watchlist ?? 0}
                      viewsCount={
                        typeof (auction as any).viewsCount === 'number'
                          ? (auction as any).viewsCount
                          : typeof (auction._count as any)?.views === 'number'
                            ? (auction._count as any)?.views
                            : 0
                      }
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredAuctions.map((auction, index) => (
                  <AuctionListItem
                    key={auction.id || `auction-${index}`}
                    id={auction.id}
                    title={auction.title}
                    image={getFirstImage(auction.images)}
                    currentBid={auction.currentPrice}
                    endTime={auction.endTime}
                    ringNumber={auction.pigeon?.ringNumber || "Brak numeru"}
                    imageFit={imageFit}
                    watchCount={auction._count?.watchlist ?? 0}
                    viewsCount={
                      typeof (auction as any).viewsCount === 'number'
                        ? (auction as any).viewsCount
                        : typeof (auction._count as any)?.views === 'number'
                          ? (auction._count as any)?.views
                          : 0
                    }
                    status={auction.status as any}
                  />
                ))}
              </div>
            )
          )}

          {!isLoading && filteredAuctions.length === 0 && (
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

      <AnimatePresence>
        {isCreateOpen && (
          <DraggableModal
            isOpen={isCreateOpen}
            onClose={handleCloseModal}
            title="Utwórz aukcję"
            autoWidth={true}
          >
            {!selectedCategory ? (
              <AuctionCategorySelector
                onSelectCategory={handleCategorySelect}
                onCancel={handleCloseModal}
              />
            ) : selectedCategory === 'pigeons' ? (
              <>
                <div className="mb-3">
                  <button
                    onClick={handleBackToCategory}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mb-2 group text-sm"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                    <span>Powrót do wyboru kategorii</span>
                  </button>
                  <h2 className="font-display text-lg font-bold text-foreground">Aukcja gołębi</h2>
                  <p className="text-muted-foreground text-sm">Wypełnij podstawowe informacje o gołębiu.</p>
                </div>
                <CreateAuctionForm
                  initialCategory={selectedCategory}
                  onCancel={handleCloseModal}
                  onSuccess={() => {
                    handleCloseModal();
                    void refetch();
                  }}
                />
              </>
            ) : selectedCategory === 'supplements' ? (
              <>
                <div className="mb-6">
                  <button
                    onClick={handleBackToCategory}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 group"
                  >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Powrót do wyboru kategorii</span>
                  </button>
                  <h2 className="font-display text-2xl font-bold text-foreground">Aukcja suplementów</h2>
                  <p className="text-muted-foreground">Wypełnij podstawowe informacje o suplementach.</p>
                </div>
                <CreateSupplementAuctionForm
                  onCancel={handleCloseModal}
                  onSuccess={() => {
                    handleCloseModal();
                    void refetch();
                  }}
                />
              </>
            ) : selectedCategory === 'accessories' ? (
              <>
                <div className="mb-6">
                  <button
                    onClick={handleBackToCategory}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 group"
                  >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Powrót do wyboru kategorii</span>
                  </button>
                  <h2 className="font-display text-2xl font-bold text-foreground">Aukcja akcesoriów hodowlanych</h2>
                  <p className="text-muted-foreground">Wypełnij podstawowe informacje o akcesoriach.</p>
                </div>
                <CreateAccessoryAuctionForm
                  onCancel={handleCloseModal}
                  onSuccess={() => {
                    handleCloseModal();
                    void refetch();
                  }}
                />
              </>
            ) : null}
          </DraggableModal>
        )}
      </AnimatePresence>

      <AccountModal
        open={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
      />

      <CreateAuctionModal
        isOpen={isAuctionModalOpen}
        onClose={handleCloseAuctionModal}
        onSuccess={() => {
          handleCloseAuctionModal();
          void refetch();
        }}
      />

      {/* Modal informujący o wymaganej weryfikacji */}
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
    </>
  );
};

export default AuctionsPage;
