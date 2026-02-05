import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
import CreateAuctionForm from "@/components/CreateAuctionForm";
import CreateSupplementAuctionForm from "@/components/CreateSupplementAuctionForm";
import CreateAccessoryAuctionForm from "@/components/CreateAccessoryAuctionForm";
import AuctionCategorySelector from "@/components/AuctionCategorySelector";
import DraggableModal from "@/components/DraggableModal";
import AccountModal from "@/components/AccountModal";
import { UnifiedModal } from "@/components/ui/UnifiedModal";
import { useAuctionFilters } from "@/hooks/useAuctionFilters";
import { resolveAuctionImage } from "@/utils/image";
import type { AuctionSortBy } from "@/types/auction";
import { CreateAuctionModal } from "@/components/CreateAuctionModal";
import { gsap } from '@/lib/gsapConfig';

const HERO_CLAIMS = [] as const;

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
  const imageFit: 'cover' | 'contain' = 'contain';
  
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [category, setCategory] = useState("all");
  const [gender, setGender] = useState("all");

  const { auctions, isLoading, refetch } = useAuctions({ status: 'active', sortBy });
  const sanitizedAuctions = useMemo(() => {
    return auctions.filter((auction) => {
      const title = (auction.title || '').trim();
      // Wycinamy testową, sztucznie dużą kartę z tytułem składającym się z samych "a"
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
  const [isAuctionModalOpen, setIsAuctionModalOpen] = useState(false);
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const [activeQuickFilter, setActiveQuickFilter] = useState<QuickFilterId | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const heroRef = useRef<HTMLElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);

  // UnifiedModal state
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
  const premiumStats = useMemo(() => {
    if (!filteredAuctions.length) {
      return {
        highestBid: 0,
        avgWatch: 0,
        finalCallCount: 0,
      };
    }

    const highestBid = filteredAuctions.reduce(
      (max, auction) => Math.max(max, auction.currentPrice ?? 0),
      0
    );

    const watchValues = filteredAuctions.map(
      (auction) => auction._count?.watchlist ?? 0
    );
    const avgWatch =
      watchValues.reduce((sum, value) => sum + value, 0) /
      watchValues.length;

    const finalCallCount = filteredAuctions.filter((auction) => {
      const end = auction.endTime ? new Date(auction.endTime).getTime() : 0;
      if (!end) return false;
      return end - now < 24 * 60 * 60 * 1000 && end > now;
    }).length;

    return {
      highestBid,
      avgWatch,
      finalCallCount,
    };
  }, [filteredAuctions, now]);

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
      setFeedbackModal({
        isOpen: true,
        type: 'info',
        title: 'Wymagane logowanie',
        message: 'Musisz się zalogować. Za chwilę przeniosę Cię do logowania.'
      });
      setTimeout(() => navigate("/auth?mode=login"), 2000);
      return;
    }
 
    if (!profile) {
      setFeedbackModal({
        isOpen: true,
        type: 'info',
        title: 'Ładowanie profilu',
        message: 'Poczekaj i spróbuj ponownie.'
      });
      return;
    }
 
    console.log('🔍 Profile role:', profile.role);
    const action = roleActions[profile.role as keyof typeof roleActions];
    if (action) {
      console.log('🔍 Executing action for role:', profile.role);
      action();
    } else {
      setFeedbackModal({
        isOpen: true,
        type: 'warning',
        title: 'Brak uprawnień',
        message: 'Dokończ weryfikację konta.'
      });
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
  const skeletonItems = viewMode === 'grid' ? Array.from({ length: 6 }) : Array.from({ length: 3 });

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 60_000);
    return () => clearInterval(timer);
  }, []);

  // Inicjalizacja animacji tekstu hero
  useEffect(() => {
    const timer = setTimeout(() => {
      import('@/lib/gsapAnimations').then(({ initHeroTextSplit }) => {
        initHeroTextSplit();
      });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Animacje GSAP dla hero i scroll
  useEffect(() => {
    if (!heroRef.current || !heroContentRef.current) return;

    const ctx = gsap.context(() => {
      const heroContent = heroContentRef.current;
      const children = heroContent?.children;

      if (children) {
        gsap.set(children, { opacity: 0, y: 60 });
        
        gsap.to(children, {
          opacity: 1,
          y: 0,
          stagger: 0.3,
          duration: 2.0,
          ease: 'power3.out',
          delay: 0.6,
        });
      }

      // Parallax scroll dla hero
      if (heroContent) {
        gsap.to(heroContent, {
          y: 150,
          opacity: 0.3,
          scale: 0.95,
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.8,
          },
        });
      }

      // Animacja auction cards
      const auctionCards = document.querySelectorAll('.auction-card');
      auctionCards.forEach((card) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1.4,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top bottom-=100',
              end: 'top center',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, heroRef);

    return () => ctx.revert();
  }, [filteredAuctions]);

  useEffect(() => {
    // Listen for openCategorySelector event from UserPanel
    const handleOpenCategorySelector = () => {
      if (!user) {
        setFeedbackModal({
          isOpen: true,
          type: 'info',
          title: 'Wymagane logowanie',
          message: 'Musisz się zalogować, aby dodać aukcję. Za chwilę nastąpi przekierowanie.'
        });
        setTimeout(() => navigate("/auth?mode=login"), 2000);
        return;
      }

      if (!profile) {
        setFeedbackModal({
          isOpen: true,
          type: 'info',
          title: 'Ładowanie profilu',
          message: 'Poczekaj chwilę i spróbuj ponownie.'
        });
        return;
      }

      const action = roleActions[profile.role as keyof typeof roleActions];
      if (action) {
        action();
      } else {
        setFeedbackModal({
          isOpen: true,
          type: 'warning',
          title: 'Brak uprawnień',
          message: 'Dokończ weryfikację konta, aby móc dodawać aukcje.'
        });
      }
    };
    
    window.addEventListener('openCategorySelector', handleOpenCategorySelector);
    
    return () => {
      window.removeEventListener('openCategorySelector', handleOpenCategorySelector);
    };
  }, [user, profile, navigate, roleActions]);

  const toggleQuickFilter = (filterId: QuickFilterId) => {
    setActiveQuickFilter((prev) => {
      const next = prev === filterId ? null : filterId;

      switch (next) {
        case "ending-today":
          setSortBy("ending-soon");
          break;
        case "high-value":
          setSortBy("price-high");
          break;
        case "new-royals":
          setSortBy("newest");
          break;
        default:
          setSortBy("newest");
          break;
      }

      return next;
    });
  };

  const statTiles = [
    {
      label: "Najwyższa oferta",
      value: premiumStats.highestBid
        ? `${premiumStats.highestBid.toLocaleString("pl-PL")} zł`
        : "—",
      meta: "Aktualnie aktywna",
      Icon: Crown,
    },
    {
      label: "Średnia liczba obserwujących",
      value: premiumStats.avgWatch
        ? premiumStats.avgWatch.toFixed(0)
        : "—",
      meta: "Za aukcję",
      Icon: Diamond,
    },
    {
      label: "Final call <24h",
      value: premiumStats.finalCallCount || "0",
      meta: "Aukcje na finiszu",
      Icon: Clock,
    },
  ];

  return (
    <>
      <section ref={heroRef} className="relative isolate overflow-hidden py-12 sm:py-16 md:py-24">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-navy via-navy-dark to-navy" />
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/12 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-0 w-80 h-80 bg-gold/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-gold/11 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-gold/9 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/8 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-64 h-64 bg-gold/10 rounded-full blur-2xl" />
        </div>
        <div className="container mx-auto px-4">
          <div ref={heroContentRef} className="text-left">
            <h1 
              data-split-text
              className="mt-6 font-display text-3xl md:text-4xl lg:text-5xl font-bold text-gold leading-tight"
            >
              Aukcje Champion Class
            </h1>
            <div className="mt-8 flex flex-wrap gap-4 justify-start">
              <Button
                variant="gold"
                size="lg"
                className="shadow-[0_15px_50px_rgba(212,175,55,0.35)]"
              >
                Przeglądaj aukcje
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={(e) => handleCreateAuctionClick(e)}
                className="border-white/30 bg-transparent text-white/80 transition hover:border-gold/60 hover:text-white"
              >
                Dodaj swoją aukcję
              </Button>
            </div>
          </div>
          <div className="mt-12 grid gap-4 sm:mt-16 md:grid-cols-3">
            {statTiles.map(({ label, value, meta, Icon }) => (
              <div
                key={label}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-6 text-left shadow-[0_20px_60px_rgba(2,4,12,0.45)] transition hover:border-gold/40"
              >
                <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100">
                  <div className="h-full w-full bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.18),transparent_65%)]" />
                </div>
                <div className="relative space-y-2">
                  <Icon className="h-5 w-5 text-gold" />
                  <p className="text-[11px] uppercase tracking-[0.35em] text-white/60">{label}</p>
                  <p className="text-2xl font-display text-white">{value}</p>
                  <p className="text-sm text-white/60">{meta}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="-mt-10 pb-8 md:-mt-16 md:pb-10 relative z-10">
        <div className="container mx-auto px-4">
          <div className="group relative rounded-2xl border border-white/10 bg-white/[0.05] pt-4 px-4 pb-6 shadow-[0_20px_60px_rgba(2,4,12,0.45)] backdrop-blur-2xl space-y-8 transition hover:border-gold/40 sm:px-6">
            <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100 pointer-events-none rounded-2xl">
              <div className="h-full w-full bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.18),transparent_65%)]" />
            </div>
            <div className="relative space-y-8">{/* Wrapper for content to be above gradient */}
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Szukaj po nazwie, linii lub numerze obrączki"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Szukaj aukcji"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white/90 placeholder:text-white/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                />
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:justify-end">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as AuctionSortBy)}
                  title="Sortuj aukcje"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/90 focus:border-gold focus:outline-none md:w-auto"
                >
                  <option value="newest">Najnowsze</option>
                  <option value="ending-soon">Kończące się</option>
                  <option value="price-high">Najdroższe</option>
                  <option value="price-low">Najtańsze</option>
                </select>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border-white/25 bg-white/5 px-4 py-2 text-white/80 hover:border-gold/40 md:w-auto"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filtry
                  {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-gold"></span>}
                </Button>
                <div className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-1 md:w-auto md:justify-start">
                  <Button
                    type="button"
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-xl px-4 text-sm"
                  >
                    Siatka
                  </Button>
                  <Button
                    type="button"
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-xl px-4 text-sm"
                  >
                    Lista
                  </Button>
                </div>
                <Button
                  ref={triggerButtonRef}
                  onClick={(e) => handleCreateAuctionClick(e)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-gold to-gold-light px-5 py-2 shadow-[0_10px_30px_rgba(212,175,55,0.35)] md:w-auto"
                >
                  <Plus className="h-4 w-4" />
                  Dodaj aukcję
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.35em] text-white/40">Tryby Concierge</p>
              <div className="-mx-4 flex gap-3 overflow-x-auto pb-2 sm:mx-0 sm:flex-wrap">
                {QUICK_FILTERS.map(({ id, label, description, Icon }) => {
                  const isActive = activeQuickFilter === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleQuickFilter(id)}
                      className={`group flex min-w-[190px] flex-shrink-0 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition sm:min-w-0 ${
                        isActive
                          ? "border-gold/70 bg-gold/10 text-white shadow-[0_10px_40px_rgba(212,175,55,0.35)]"
                          : "border-white/10 bg-white/[0.04] text-white/70 hover:border-gold/30 hover:text-white"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? "text-gold-light" : "text-white/50"}`} />
                      <div>
                        <p className="text-sm font-semibold">{label}</p>
                        <p className="text-xs text-white/50">{description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {showFilters && (
              <div className="space-y-4 rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <h3 className="font-semibold text-white">Zaawansowane filtry</h3>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="self-start text-white/60 hover:text-white md:self-auto"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Wyczyść
                    </Button>
                  )}
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/70">
                      Przedział cenowy (PLN)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceMin}
                        onChange={(e) => setPriceMin(e.target.value)}
                        aria-label="Cena minimalna"
                        className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-white/90 focus:border-gold focus:outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceMax}
                        onChange={(e) => setPriceMax(e.target.value)}
                        aria-label="Cena maksymalna"
                        className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-white/90 focus:border-gold focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/70">Kategoria</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      title="Wybierz kategorię"
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-white/90 focus:border-gold focus:outline-none"
                    >
                      <option value="all">Wszystkie</option>
                      <option value="racing">Wyścigowe</option>
                      <option value="breeding">Hodowlane</option>
                      <option value="show">Pokazowe</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/70">Płeć</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      title="Wybierz płeć"
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-white/90 focus:border-gold focus:outline-none"
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
          </div>
        </div>
      </section>

      <section className="py-10 section-surface-alt">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 text-white/70">
            <p>
              Znaleziono{" "}
              <span className="font-semibold text-white">{filteredAuctions.length}</span>{" "}
              {filteredAuctions.length === 1
                ? "aukcję"
                : filteredAuctions.length < 5
                ? "aukcje"
                : "aukcji"}
            </p>
            <div className="flex items-center gap-3">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-white/60 hover:text-white"
                >
                  Resetuj filtry
                </Button>
              )}
              <span className="text-xs uppercase tracking-[0.3em]">
                Tryb: {viewMode === "grid" ? "Siatka" : "Lista"}
              </span>
            </div>
          </div>

          {isLoading && (
            <div
              className={
                viewMode === "grid"
                  ? "grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]"
                  : "flex flex-col gap-4"
              }
            >
              {skeletonItems.map((_, idx) =>
                viewMode === "grid" ? (
                  <div
                    key={`skeleton-grid-${idx}`}
                    className="animate-pulse rounded-3xl border border-white/10 bg-white/[0.04]"
                  >
                    <div className="h-64 w-full rounded-t-3xl bg-white/10" />
                    <div className="space-y-3 p-6">
                      <div className="h-5 w-3/4 rounded-full bg-white/10" />
                      <div className="h-4 w-1/2 rounded-full bg-white/10" />
                      <div className="h-4 w-full rounded-full bg-white/10" />
                      <div className="h-10 w-40 rounded-full bg-gold/30" />
                    </div>
                  </div>
                ) : (
                  <div
                    key={`skeleton-list-${idx}`}
                    className="flex animate-pulse gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                  >
                    <div className="h-28 w-36 rounded-xl bg-white/10" />
                    <div className="flex flex-1 flex-col gap-3">
                      <div className="h-5 w-2/3 rounded-full bg-white/10" />
                      <div className="h-4 w-1/2 rounded-full bg-white/10" />
                      <div className="h-10 w-32 rounded-full bg-gold/30" />
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {!isLoading && filteredAuctions.length > 0 && (
            viewMode === "grid" ? (
              <div className="grid gap-8 items-stretch lg:grid-cols-3 xl:grid-cols-4">
                {filteredAuctions.map((auction, index) => (
                  <div key={auction.id || `auction-${index}`} className="h-full flex auction-card">
                    <UnifiedAuctionCard
                      id={auction.id}
                      title={auction.title}
                      image={getFirstImage(auction.images)}
                      currentBid={auction.currentPrice}
                      startingPrice={auction.startingPrice}
                      endTime={auction.endTime}
                      ringNumber={auction.pigeon?.ringNumber || "Brak numeru"}
                      gender={auction.pigeon?.gender}
                      color={auction.pigeon?.pigeonColor}
                      category={auction.category}
                      location={auction.location}
                      featured={false}
                      imageFit={imageFit}
                      watchCount={auction._count?.watchlist ?? 0}
                      viewsCount={
                        typeof (auction as any).viewsCount === "number"
                          ? (auction as any).viewsCount
                          : typeof (auction._count as any)?.views === "number"
                            ? (auction._count as any)?.views
                            : 0
                      }
                      bidsCount={auction._count?.bids ?? auction.bids?.length ?? 0}
                      nowMs={now}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredAuctions.map((auction, index) => (
                  <div key={auction.id || `auction-${index}`} className="auction-card">
                    <UnifiedAuctionCard
                      id={auction.id}
                      title={auction.title}
                      image={getFirstImage(auction.images)}
                      currentBid={auction.currentPrice}
                      startingPrice={auction.startingPrice}
                      endTime={auction.endTime}
                      ringNumber={auction.pigeon?.ringNumber || "Brak numeru"}
                      gender={auction.pigeon?.gender}
                      color={auction.pigeon?.pigeonColor}
                      category={auction.category}
                      location={auction.location}
                      featured={index < 2}
                      imageFit={imageFit}
                      watchCount={auction._count?.watchlist ?? 0}
                      viewsCount={
                        typeof (auction as any).viewsCount === "number"
                          ? (auction as any).viewsCount
                          : typeof (auction._count as any)?.views === "number"
                            ? (auction._count as any)?.views
                            : 0
                      }
                      bidsCount={auction._count?.bids ?? auction.bids?.length ?? 0}
                      nowMs={now}
                    />
                  </div>
                ))}
              </div>
            )
          )}

          {!isLoading && filteredAuctions.length === 0 && null}
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
      {/* Feedback Modal */}
      <UnifiedModal
        isOpen={feedbackModal.isOpen}
        onClose={() => {
          setFeedbackModal(prev => ({ ...prev, isOpen: false }));
          if (feedbackModal.onClose) feedbackModal.onClose();
        }}
        type={feedbackModal.type}
        title={feedbackModal.title}
        message={feedbackModal.message}
        confirmButton={{
          text: feedbackModal.onClose ? "Przejdź" : "OK",
          onClick: () => {
            setFeedbackModal(prev => ({ ...prev, isOpen: false }));
            if (feedbackModal.onClose) feedbackModal.onClose();
          }
        }}
      />
    </>
  );
};

export default AuctionsPage;
