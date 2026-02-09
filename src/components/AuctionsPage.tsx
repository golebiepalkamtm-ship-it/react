import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Plus,
  X,
  ChevronLeft,
  Clock,
  Sparkles,
  TrendingUp,
  Crown,
  Diamond,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { UnifiedAuctionCard } from "@/components/auction/UnifiedAuctionCard";
import { useAuth } from "@/contexts/AuthContext";
import { useAuctions } from "@/hooks/useAuctions";
import UnifiedAuctionForm from "@/components/UnifiedAuctionForm";
import AuctionCategorySelector from "@/components/AuctionCategorySelector";
import { UnifiedModal } from "@/components/ui/UnifiedModal";
import { useAuctionFilters } from "@/hooks/useAuctionFilters";
import { resolveAuctionImage } from "@/utils/image";
import type { AuctionSortBy } from "@/types/auction";
import { gsap } from '@/lib/gsapConfig';
import { AnimatePresence } from "framer-motion";
import AccountModal from "@/components/AccountModal";

const QUICK_FILTERS = [
  {
    id: "ending-today" as const,
    label: "Końcówka",
    description: "Do 24h",
    Icon: Clock,
  },
  {
    id: "high-value" as const,
    label: "High stakes",
    description: "25k+ zł",
    Icon: TrendingUp,
  },
  {
    id: "new-royals" as const,
    label: "Nowości",
    description: "Ostatnie 48h",
    Icon: Sparkles,
  },
] as const;

type QuickFilterId = typeof QUICK_FILTERS[number]["id"];

const AuctionsPage = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<AuctionSortBy>("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [category, setCategory] = useState("all");
  const [gender, setGender] = useState("all");

  const { auctions, isLoading, refetch, error } = useAuctions({ status: 'active', sortBy });
  const sanitizedAuctions = useMemo(() => {
    return auctions.filter((auction) => {
      const title = (auction.title || '').trim();
      if (!title) return false;
      if (/^a{10,}$/i.test(title)) return false;
      return true;
    });
  }, [auctions]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'pigeons' | 'supplements' | 'accessories' | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState({ title: '', message: '' });
  const [_isAuctionModalOpen, setIsAuctionModalOpen] = useState(false);
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const [activeQuickFilter, setActiveQuickFilter] = useState<QuickFilterId | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const heroRef = useRef<HTMLElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);

  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
    onClose?: () => void;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const filters = useMemo(() => ({
    searchTerm,
    priceMin: priceMin ? parseFloat(priceMin) : undefined,
    priceMax: priceMax ? parseFloat(priceMax) : undefined,
    category,
    gender,
  }), [searchTerm, priceMin, priceMax, category, gender]);

  const filteredAuctions = useAuctionFilters(sanitizedAuctions, filters);
  const uiAuctions = useMemo(() => {
    return filteredAuctions.map((auction) => ({
      id: auction.id,
      name: auction.title || "Aukcja",
      image: resolveAuctionImage(auction.images?.[0]) || "/placeholder.svg",
      ringNumber: auction.pigeon?.ringNumber || "Brak numeru",
      sex: auction.pigeon?.gender === "male" ? "samiec" : auction.pigeon?.gender === "female" ? "samica" : "samica",
      color: auction.pigeon?.pigeonColor,
      currentPrice: auction.currentPrice ?? 0,
      startPrice: auction.startingPrice ?? auction.currentPrice ?? 0,
      bidsCount: auction._count?.bids ?? auction.bids?.length ?? 0,
      endTime: auction.endTime,
      category: auction.category,
    }));
  }, [filteredAuctions]);

  const premiumStats = useMemo(() => {
    if (!filteredAuctions.length) {
      return { highestBid: 0, avgWatch: 0, finalCallCount: 0 };
    }
    const highestBid = filteredAuctions.reduce((max, a) => Math.max(max, a.currentPrice ?? 0), 0);
    const watchValues = filteredAuctions.map((a) => a._count?.watchlist ?? 0);
    const avgWatch = watchValues.reduce((s, v) => s + v, 0) / watchValues.length;
    const finalCallCount = filteredAuctions.filter((a) => {
      const end = a.endTime ? new Date(a.endTime).getTime() : 0;
      return end && end - now < 86400000 && end > now;
    }).length;
    return { highestBid, avgWatch, finalCallCount };
  }, [filteredAuctions, now]);

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
      setIsCreateOpen(true);
    },
    'ADMIN': () => {
      setIsCreateOpen(true);
    },
  }), []);

  const openCreateAuctionFlow = useCallback(() => {
    if (!user) {
      setFeedbackModal({
        isOpen: true,
        type: 'info',
        title: 'Wymagane logowanie',
        message: 'Musisz się zalogować. Za chwilę przeniosę Cię do logowania.'
      });
      setTimeout(() => navigate("/auth?mode=login"), 2000);
      return;
    }
    if (!profile) return;
    const action = roleActions[profile.role as keyof typeof roleActions];
    if (action) action();
  }, [navigate, profile, roleActions, user]);

  const handleCreateAuctionClick = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    openCreateAuctionFlow();
  };

  const handleCategorySelect = (cat: 'pigeons' | 'supplements' | 'accessories') => {
    setSelectedCategory(cat);
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
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!heroRef.current || !heroContentRef.current) return;
    const ctx = gsap.context(() => {
      const children = heroContentRef.current?.children;
      if (children) {
        gsap.set(children, { opacity: 0, y: 60 });
        gsap.to(children, { opacity: 1, y: 0, stagger: 0.3, duration: 2.0, ease: 'power3.out', delay: 0.6 });
      }
    }, heroRef);
    return () => ctx.revert();
  }, [filteredAuctions]);

  const toggleQuickFilter = (filterId: QuickFilterId) => {
    setActiveQuickFilter((prev) => {
      const next = prev === filterId ? null : filterId;
      if (next === "ending-today") setSortBy("ending-soon");
      else if (next === "high-value") setSortBy("price-high");
      else setSortBy("newest");
      return next;
    });
  };

  const statTiles = [
    { label: "Najwyższa oferta", value: premiumStats.highestBid ? `${premiumStats.highestBid.toLocaleString("pl-PL")} zł` : "—", meta: "Aktualnie aktywna", Icon: Crown },
    { label: "Średnia liczba obserwujących", value: premiumStats.avgWatch ? premiumStats.avgWatch.toFixed(0) : "—", meta: "Za aukcję", Icon: Diamond },
    { label: "Final call <24h", value: premiumStats.finalCallCount || "0", meta: "Aukcje na finiszu", Icon: Clock },
  ];

  return (
    <>
      <section ref={heroRef} className="relative isolate overflow-hidden py-12 sm:py-16 md:py-24">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-navy via-navy-dark to-navy" />
        <div className="container mx-auto px-4">
          <div ref={heroContentRef} className="text-left">
            <h1 className="mt-6 font-display text-3xl md:text-4xl lg:text-5xl font-bold text-gold leading-tight">Aukcje Champion Class</h1>
            <div className="mt-8 flex flex-wrap gap-4 justify-start">
              <Button variant="gold" size="lg">Przeglądaj aukcje</Button>
              <Button variant="outline" size="lg" onClick={handleCreateAuctionClick}>Dodaj swoją aukcję</Button>
            </div>
          </div>
          <div className="mt-12 grid gap-4 sm:mt-16 md:grid-cols-3">
            {statTiles.map(({ label, value, meta, Icon }) => (
              <div key={label} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-6 text-left transition hover:border-gold/40">
                <Icon className="h-5 w-5 text-gold mb-2" />
                <p className="text-[11px] uppercase tracking-[0.35em] text-white/60">{label}</p>
                <p className="text-2xl font-display text-white">{value}</p>
                <p className="text-sm text-white/60">{meta}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="-mt-10 pb-8 md:-mt-16 md:pb-10 relative z-10">
        <div className="container mx-auto px-4">
          <div className="group relative rounded-2xl border border-white/10 bg-white/[0.05] pt-4 px-4 pb-6 shadow-[0_20px_60px_rgba(2,4,12,0.45)] backdrop-blur-2xl space-y-8 transition hover:border-gold/40 sm:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Szukaj po nazwie, linii lub numerze obrączki"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white/90 focus:border-gold focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as AuctionSortBy)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white md:w-auto">
                  <option value="newest">Najnowsze</option>
                  <option value="ending-soon">Kończące się</option>
                  <option value="price-high">Najdroższe</option>
                </select>
                <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 rounded-2xl border-white/20">
                  <SlidersHorizontal className="h-4 w-4" /> Filtry {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-gold" />}
                </Button>
                <Button onClick={handleCreateAuctionClick} className="rounded-2xl bg-gold text-navy-dark px-5 py-2 font-bold shadow-glow">
                  <Plus className="h-4 w-4 mr-2" /> Dodaj aukcję
                </Button>
              </div>
            </div>
            {showFilters && (
              <div className="grid gap-4 md:grid-cols-3 p-6 border border-white/10 rounded-2xl bg-white/5">
                <div>
                  <label className="text-sm font-medium text-white/70 mb-2 block">Cena (PLN)</label>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Min" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white" />
                    <input type="number" placeholder="Max" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-white/70 mb-2 block">Kategoria</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white">
                    <option value="all">Wszystkie</option>
                    <option value="pigeon">Gołębie</option>
                    <option value="supplements">Suplementy</option>
                    <option value="accessories">Akcesoria</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-white/70 mb-2 block">Płeć</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white">
                    <option value="all">Wszystkie</option>
                    <option value="male">Samiec</option>
                    <option value="female">Samica</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-[620px] rounded-[24px] bg-white/5 animate-pulse" />)}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {uiAuctions.map((auction) => (
                <div key={auction.id} className="h-full">
                  <UnifiedAuctionCard
                    id={auction.id}
                    title={auction.name}
                    image={auction.image}
                    currentBid={auction.currentPrice}
                    startingPrice={auction.startPrice}
                    endTime={auction.endTime}
                    ringNumber={auction.ringNumber}
                    gender={auction.sex}
                    color={auction.color}
                    category={auction.category}
                    bidsCount={auction.bidsCount}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <UnifiedModal
        isOpen={isCreateOpen}
        onClose={handleCloseModal}
        title="Nowa aukcja"
        size="xl"
        draggable
        bodyScrollable
      >
        {!selectedCategory ? (
          <AuctionCategorySelector onSelectCategory={handleCategorySelect} onCancel={handleCloseModal} />
        ) : (
          <div className="p-4">
            <button onClick={handleBackToCategory} className="flex items-center gap-2 text-white/60 mb-4 hover:text-white">
              <ChevronLeft className="w-4 h-4" /> Powrót
            </button>
            <UnifiedAuctionForm
              category={selectedCategory}
              onCancel={handleCloseModal}
              onSuccess={() => { handleCloseModal(); refetch(); }}
            />
          </div>
        )}
      </UnifiedModal>

      <UnifiedModal isOpen={feedbackModal.isOpen} onClose={() => setFeedbackModal(p => ({ ...p, isOpen: false }))} type={feedbackModal.type} title={feedbackModal.title} message={feedbackModal.message} />
      <AccountModal open={isAccountOpen} onClose={() => setIsAccountOpen(false)} />
    </>
  );
};

export default AuctionsPage;
