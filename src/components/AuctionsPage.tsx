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
  Gavel,
  Heart,
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
import { gsap } from "@/lib/gsapConfig";
import { AnimatePresence } from "framer-motion";
import AccountModal from "@/components/AccountModal";
import { useSocket } from "@/hooks/useSocket";
import { useOptimizedToast } from "@/hooks/use-optimized-toast";
import { auctionService } from "@/services/auctionService";
import { useQuery } from "@tanstack/react-query";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

const CONTENT_BACKGROUND =
  "radial-gradient(circle at top, rgba(66, 192, 206, 0.18), transparent 55%), linear-gradient(185deg, rgba(2, 10, 19, 0.96) 0%, rgba(6, 35, 46, 0.93) 45%, rgba(9, 61, 77, 0.9) 100%)";

const QUICK_FILTERS = [
  {
    id: "ending-today" as const,
    label: "Końcówka",
    description: "Do 24h",
    tooltip:
      "Licytacje kończące się w ciągu najbliższych 24 godzin – ostatnia szansa na wygraną!",
    Icon: Clock,
  },
  {
    id: "high-value" as const,
    label: "High stakes",
    description: "25k+ zł",
    tooltip:
      "Aukcje elitarnych ptaków z wyceną od 25 000 PLN wzwyż z rodowodami mistrzów",
    Icon: TrendingUp,
  },
  {
    id: "new-royals" as const,
    label: "Nowości",
    description: "Ostatnie 48h",
    tooltip:
      "Najświeższe aukcje gołębi i akcesoriów dodane w ciągu ostatnich 48 godzin",
    Icon: Sparkles,
  },
] as const;

type QuickFilterId = (typeof QUICK_FILTERS)[number]["id"];

const AuctionsPage = () => {
  const { user, profile, session } = useAuth();
  const navigate = useNavigate();
  const { info: showInfo, warning: showWarning } = useOptimizedToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<AuctionSortBy>("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [category, setCategory] = useState("all");
  const [gender, setGender] = useState("all");
  const [isWatchlistActive, setIsWatchlistActive] = useState(false);

  const { auctions, isLoading, refetch, error } = useAuctions({
    status: "active",
    sortBy,
  });

  const { data: watchlistAuctions = [], isLoading: isWatchlistLoading } =
    useQuery({
      queryKey: ["watchlist", session?.access_token],
      queryFn: () => auctionService.getWatchlist(session?.access_token || null),
      enabled: !!session?.access_token,
      staleTime: 15000,
    });

  const handleWatchlistToggle = useCallback(() => {
    if (!user || !session?.access_token) {
      setFeedbackModal({
        isOpen: true,
        type: "info",
        title: "Obsługuj ulubione aukcje",
        message: "Zaloguj się, aby zobaczyć swoje obserwowane aukcje.",
      });
      return;
    }
    setIsWatchlistActive((prev) => !prev);
    setActiveQuickFilter(null);
  }, [user, session?.access_token]);

  const sanitizedAuctions = useMemo(() => {
    const source = isWatchlistActive ? watchlistAuctions : auctions;
    return source.filter((auction) => {
      const title = (auction.title || "").trim();
      if (!title) return false;
      if (/^a{10,}$/i.test(title)) return false;
      return true;
    });
  }, [auctions, watchlistAuctions, isWatchlistActive]);

  useSocket({
    onBidPlaced: (data: {
      auctionId: string;
      bid?: any;
      currentPrice?: number;
      meta?: any;
    }) => {
      if (!data?.auctionId) return;
      const price = Number(
        data.currentPrice ?? data.bid?.amount ?? data.meta?.currentPrice,
      );
      const priceFormatted = Number.isFinite(price)
        ? `${price.toLocaleString("pl-PL")} zł`
        : "";

      const targetAuction = sanitizedAuctions.find(
        (a) => a.id === data.auctionId,
      );
      const title = targetAuction?.title || "Aukcja";

      const previousBidderId =
        data.bid?.previousBidderId || data.meta?.previousBidderId;
      const isUserOutbid = user?.id && previousBidderId === user.id;

      if (isUserOutbid) {
        showWarning({
          message: `🚨 Twoja oferta na aukcji "${title}" została przebita! Nowa cena: ${priceFormatted}`,
        });
      } else {
        showInfo({
          message: `⚡ Nowa oferta na żywo w aukcji "${title}": ${priceFormatted}`,
        });
      }
    },
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    "pigeons" | "supplements" | "accessories" | null
  >(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState({
    title: "",
    message: "",
  });
  const [_isAuctionModalOpen, setIsAuctionModalOpen] = useState(false);
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const [activeQuickFilter, setActiveQuickFilter] =
    useState<QuickFilterId | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const heroRef = useRef<HTMLElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);

  const [shouldShowSkeletons, setShouldShowSkeletons] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isLoading) {
      timer = setTimeout(() => {
        setShouldShowSkeletons(true);
      }, 400);
    } else {
      timer = setTimeout(() => {
        setShouldShowSkeletons(false);
      }, 0);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "info" | "warning";
    title: string;
    message: string;
    onClose?: () => void;
  }>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });

  const filters = useMemo(() => {
    const f: any = { searchTerm, category, gender };
    if (priceMin) f.priceMin = parseFloat(priceMin);
    if (priceMax) f.priceMax = parseFloat(priceMax);
    return f;
  }, [searchTerm, priceMin, priceMax, category, gender]);

  const filteredAuctions = useAuctionFilters(sanitizedAuctions, filters);
  const uiAuctions = useMemo(() => {
    return filteredAuctions.map((auction) => ({
      id: auction.id,
      name: auction.title || "Aukcja",
      image: resolveAuctionImage(auction.images?.[0]) || "/placeholder.svg",
      ringNumber: auction.pigeon?.ringNumber || "Brak numeru",
      sex:
        auction.pigeon?.gender?.toLowerCase() === "male"
          ? "samiec"
          : auction.pigeon?.gender?.toLowerCase() === "female"
            ? "samica"
            : "samica",
      color: auction.pigeon?.pigeonColor,
      currentPrice: auction.currentPrice ?? 0,
      startPrice: auction.startingPrice,
      buyNowPrice: auction.buyNowPrice,
      bidsCount: auction._count?.bids ?? auction.bids?.length ?? 0,
      endTime: auction.endTime,
      category: auction.category,
      views: auction.views ?? 0,
      watchListCount: auction._count?.watchlist ?? 0,
    }));
  }, [filteredAuctions]);

  const premiumStats = useMemo(() => {
    if (!filteredAuctions.length) {
      return { highestBid: 0, avgWatch: 0, finalCallCount: 0 };
    }
    const highestBid = filteredAuctions.reduce(
      (max, a) => Math.max(max, a.currentPrice ?? 0),
      0,
    );
    const watchValues = filteredAuctions.map((a) => a._count?.watchlist ?? 0);
    const avgWatch =
      watchValues.reduce((s, v) => s + v, 0) / watchValues.length;
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

  const roleActions = useMemo(
    () => ({
      USER_REGISTERED: () => {
        setVerificationMessage({
          title: "Wymagana weryfikacja emaila",
          message:
            "Aby tworzyć aukcje, musisz najpierw zweryfikować swój adres email.\n\nSprawdź swoją skrzynkę odbiorczą i kliknij link weryfikacyjny.",
        });
        setShowVerificationModal(true);
      },
      USER_EMAIL_VERIFIED: () => {
        setVerificationMessage({
          title: "Wymagana pełna weryfikacja",
          message:
            'Aby tworzyć aukcje i licytować, musisz uzupełnić swój profil i zweryfikować numer telefonu.\n\nKliknij "Uzupełnij profil" aby kontynuować.',
        });
        setShowVerificationModal(true);
      },
      USER_FULL_VERIFIED: () => {
        setIsCreateOpen(true);
      },
      ADMIN: () => {
        setIsCreateOpen(true);
      },
    }),
    [],
  );

  const openCreateAuctionFlow = useCallback(() => {
    if (!user) {
      setFeedbackModal({
        isOpen: true,
        type: "info",
        title: "Wymagane logowanie",
        message: "Musisz się zalogować. Za chwilę przeniosę Cię do logowania.",
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

  const handleCategorySelect = (
    cat: "pigeons" | "supplements" | "accessories",
  ) => {
    setSelectedCategory(cat);
  };

  const handleCloseModal = () => {
    setIsCreateOpen(false);
    setSelectedCategory(null);
  };

  const handleBackToCategory = () => {
    setSelectedCategory(null);
  };

  const hasActiveFilters =
    searchTerm ||
    priceMin ||
    priceMax ||
    category !== "all" ||
    gender !== "all" ||
    sortBy !== "newest";

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!heroRef.current || !heroContentRef.current || hasAnimated.current)
      return;
    const ctx = gsap.context(() => {
      const children = heroContentRef.current?.children;
      if (children && children.length > 0) {
        hasAnimated.current = true;
        gsap.set(children, { opacity: 0, y: 60 });
        gsap.to(children, {
          opacity: 1,
          y: 0,
          stagger: 0.3,
          duration: 2.0,
          ease: "power3.out",
          delay: 0.6,
          clearProps: "all",
        });
      }
    }, heroRef);
    return () => ctx.revert();
  }, []);

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
      value: premiumStats.avgWatch ? premiumStats.avgWatch.toFixed(0) : "—",
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
    <TooltipProvider delayDuration={100}>
      <div className="relative isolate min-h-screen overflow-hidden bg-white">
        <section
          ref={heroRef}
          className="relative isolate overflow-hidden py-12 sm:py-16 md:py-24 bg-white"
        >
          <div className="container mx-auto px-4">
            <div ref={heroContentRef} className="text-left">
              <h1 className="mt-6 font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight uppercase tracking-wide">
                <span style={{ color: "#A68E4E" }}>Champions Pigeon</span>{" "}
                <span className="text-white">Auction</span>
              </h1>
              <p className="max-w-xl text-zinc-400 mt-4 text-sm uppercase tracking-wider font-light">
                Ekskluzywny portal aukcyjny Pałka MTM
              </p>
              <div className="mt-8 flex flex-wrap gap-4 justify-start">
                <Button
                  variant="gold"
                  size="lg"
                  className="gold-button text-zinc-950 border-0"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, rgba(166,142,78,0.9), rgba(166,142,78,0.8))",
                    color: "#0f0f0f",
                  }}
                >
                  Przeglądaj aukcje
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleCreateAuctionClick}
                  className="gold-button text-zinc-950 border-0 hover:bg-gold/90"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, rgba(166,142,78,0.9), rgba(166,142,78,0.8))",
                    color: "#0f0f0f",
                  }}
                >
                  Dodaj swoją aukcję
                </Button>
              </div>
            </div>
            <div className="mt-12 grid gap-4 sm:mt-16 md:grid-cols-3">
              {statTiles.map(({ label, value, meta, Icon }) => (
                <div
                  key={label}
                  className="group rounded-2xl px-5 py-6 text-left shadow-xl backdrop-blur-md transition-all hover:scale-[1.02]"
                  style={{
                    backgroundImage: CONTENT_BACKGROUND,
                    backgroundColor: "#010509",
                    border: "2px solid rgba(166,142,78,0.7)",
                    boxShadow:
                      "0 0 12px rgba(166,142,78,0.25), 0 0 30px rgba(166,142,78,0.1), inset 0 0 0 1px rgba(166,142,78,0.08), 0 24px 60px rgba(0,0,0,0.6)",
                  }}
                >
                  <Icon className="h-5 w-5 text-[#A68E4E] mb-2" />
                  <p className="text-[11px] uppercase tracking-[0.35em] text-[#A68E4E]/80">
                    {label}
                  </p>
                  <p className="text-2xl font-display text-[#A68E4E] font-bold">
                    {value}
                  </p>
                  <p className="text-sm text-[#A68E4E]/70">{meta}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="-mt-10 pb-8 md:-mt-16 md:pb-10 relative z-10">
          <div className="container mx-auto px-4">
            <div
              className="group rounded-2xl pt-4 px-4 pb-6 space-y-6 sm:px-6 shadow-2xl backdrop-blur-md"
              style={{
                backgroundImage: CONTENT_BACKGROUND,
                backgroundColor: "#010509",
                border: "2px solid rgba(166,142,78,0.7)",
                boxShadow:
                  "0 0 12px rgba(166,142,78,0.25), 0 0 30px rgba(166,142,78,0.1), inset 0 0 0 1px rgba(166,142,78,0.08), 0 24px 60px rgba(0,0,0,0.6)",
              }}
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#A68E4E]/60" />
                  <input
                    type="text"
                    placeholder="Szukaj po nazwie, linii lub numerze obrączki"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-2xl border border-[#A68E4E]/30 bg-black/40 py-3 pl-12 pr-4 text-[#A68E4E] placeholder:text-[#A68E4E]/40 focus:border-[#A68E4E] focus:outline-none transition-all backdrop-blur-sm"
                  />
                </div>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <select
                        value={sortBy}
                        onChange={(e) =>
                          setSortBy(e.target.value as AuctionSortBy)
                        }
                        className="rounded-2xl border border-[#A68E4E]/30 bg-black/40 px-4 py-3 text-sm text-[#A68E4E] md:w-auto focus:border-[#A68E4E] focus:outline-none appearance-none cursor-pointer backdrop-blur-sm"
                      >
                        <option value="newest" className="bg-[#020a13]">
                          Najnowsze
                        </option>
                        <option value="ending-soon" className="bg-[#020a13]">
                          Kończące się
                        </option>
                        <option value="price-high" className="bg-[#020a13]">
                          Najdroższe
                        </option>
                      </select>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-[#020a13] border border-[#A68E4E]/50 text-[#A68E4E] text-xs">
                      Zmień kolejność wyświetlania aukcji na siatce
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 rounded-2xl border-[#A68E4E]/30 bg-black/40 text-[#A68E4E] hover:bg-[#A68E4E] hover:text-[#020a13] transition-all backdrop-blur-sm"
                      >
                        <SlidersHorizontal className="h-4 w-4" /> Filtry{" "}
                        {hasActiveFilters && (
                          <span className="h-2 w-2 rounded-full bg-[#A68E4E] shadow-[0_0_8px_#A68E4E]" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-[#020a13] border border-[#A68E4E]/50 text-[#A68E4E] text-xs">
                      Rozwiń panel zaawansowanego filtrowania cenowego i kategorii
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleCreateAuctionClick}
                        className="rounded-2xl bg-[#A68E4E] text-[#064e3b] px-5 py-2 font-bold shadow-lg border-0 hover:bg-[#A68E4E]/90 transition-all"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Dodaj aukcję
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-[#020a13] border border-[#A68E4E]/50 text-[#A68E4E] text-xs">
                      Wystaw swojego gołębia, suplementy lub akcesoria na licytację
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Quick Filters & Watchlist Bar */}
              <div className="flex flex-col gap-2 pt-2 border-t border-[#A68E4E]/20">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-[#A68E4E]/70 font-semibold">
                    Szybkie filtry aukcji (najedź aby zobaczyć opis):
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => {
                          setIsWatchlistActive(false);
                          setActiveQuickFilter(null);
                          setSortBy("newest");
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                          !isWatchlistActive && !activeQuickFilter
                            ? "bg-[#A68E4E] text-zinc-950 shadow-[0_0_15px_rgba(166,142,78,0.4)] font-bold"
                            : "bg-black/30 text-[#A68E4E]/80 border border-[#A68E4E]/20 hover:border-[#A68E4E]/60 hover:text-[#A68E4E]"
                        }`}
                      >
                        <Gavel className="w-3.5 h-3.5" /> Wszystkie aukcje
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-[#020a13] border border-[#A68E4E]/50 text-[#A68E4E] text-xs max-w-xs">
                      Wyświetl pełną listę wszystkich aktywnych licytacji w portalu
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={handleWatchlistToggle}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                          isWatchlistActive
                            ? "bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)] font-bold"
                            : "bg-black/30 text-[#A68E4E]/80 border border-[#A68E4E]/20 hover:border-rose-500/60 hover:text-rose-400"
                        }`}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${isWatchlistActive ? "fill-current" : ""}`}
                        />
                        Obserwowane
                        {session?.access_token && (
                          <span className="ml-1 rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] text-rose-300 font-bold border border-rose-500/30">
                            {watchlistAuctions.length}
                          </span>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-[#020a13] border border-rose-500/50 text-rose-300 text-xs max-w-xs">
                      Pokaż Twoje ulubione aukcje zapisane do obserwowania
                    </TooltipContent>
                  </Tooltip>

                  {QUICK_FILTERS.map(({ id, label, Icon, tooltip }) => (
                    <Tooltip key={id}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => {
                            setIsWatchlistActive(false);
                            toggleQuickFilter(id);
                          }}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                            !isWatchlistActive && activeQuickFilter === id
                              ? "bg-[#A68E4E] text-zinc-950 shadow-[0_0_15px_rgba(166,142,78,0.4)] font-bold"
                              : "bg-black/30 text-[#A68E4E]/80 border border-[#A68E4E]/20 hover:border-[#A68E4E]/60 hover:text-[#A68E4E]"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" /> {label}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="bg-[#020a13] border border-[#A68E4E]/50 text-[#A68E4E] text-xs max-w-xs">
                        {tooltip}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            {showFilters && (
              <div className="grid gap-4 md:grid-cols-3 p-6 rounded-2xl bg-black/20 border border-[#A68E4E]/20 backdrop-blur-sm">
                <div>
                  <label className="text-sm font-medium text-[#A68E4E]/90 mb-2 block">
                    Cena (PLN)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      className="w-full rounded-xl bg-black/40 border border-[#A68E4E]/30 px-3 py-2 text-[#A68E4E] placeholder:text-[#A68E4E]/40 focus:border-[#A68E4E] focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      className="w-full rounded-xl bg-black/40 border border-[#A68E4E]/30 px-3 py-2 text-[#A68E4E] placeholder:text-[#A68E4E]/40 focus:border-[#A68E4E] focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#A68E4E]/90 mb-2 block">
                    Kategoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl bg-black/40 border border-[#A68E4E]/30 px-3 py-2 text-[#A68E4E] focus:border-[#A68E4E] focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="all" className="bg-[#020a13]">
                      Wszystkie
                    </option>
                    <option value="PIGEONS" className="bg-[#020a13]">
                      Gołębie
                    </option>
                    <option value="SUPPLEMENTS" className="bg-[#020a13]">
                      Suplementy
                    </option>
                    <option value="ACCESSORIES" className="bg-[#020a13]">
                      Akcesoria
                    </option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#A68E4E]/90 mb-2 block">
                    Płeć
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full rounded-xl bg-black/40 border border-[#A68E4E]/30 px-3 py-2 text-[#A68E4E] focus:border-[#A68E4E] focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="all" className="bg-[#020a13]">
                      Wszystkie
                    </option>
                    <option value="male" className="bg-[#020a13]">
                      Samiec
                    </option>
                    <option value="female" className="bg-[#020a13]">
                      Samica
                    </option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="relative py-10">
        <div className="container mx-auto px-4">
          {isLoading ? (
            shouldShowSkeletons && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-[580px] rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm animate-pulse"
                  />
                ))}
              </div>
            )
          ) : uiAuctions.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {uiAuctions.map((auction) => (
                <UnifiedAuctionCard
                  key={auction.id}
                  id={auction.id}
                  title={auction.name}
                  image={auction.image}
                  currentBid={auction.currentPrice}
                  startingPrice={auction.startPrice}
                  buyNowPrice={auction.buyNowPrice}
                  endTime={auction.endTime}
                  ringNumber={auction.ringNumber}
                  gender={auction.sex}
                  color={auction.color}
                  category={auction.category}
                  bidsCount={auction.bidsCount}
                  watchCount={auction.watchListCount}
                  viewsCount={auction.views}
                  nowMs={now}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 px-8 rounded-3xl border border-[#A68E4E]/30 bg-black/40 backdrop-blur-md max-w-2xl mx-auto shadow-2xl">
              <div className="w-20 h-20 bg-[#A68E4E]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#A68E4E]/20">
                <Gavel className="w-10 h-10 text-[#A68E4E]" />
              </div>
              <h2 className="text-[#A68E4E] text-2xl font-display font-bold mb-3">
                Aktualnie nie ma żadnych aktywnych aukcji
              </h2>
              <p className="text-[#A68E4E]/60 text-lg leading-relaxed mb-8">
                Wróć do nas niebawem! Stale dodajemy nowe gołębie champion klasy
                do naszych ofert.
              </p>
              <Button
                onClick={handleCreateAuctionClick}
                className="rounded-xl bg-[#A68E4E] text-zinc-950 px-8 py-6 text-lg font-bold hover:bg-[#A68E4E]/90 transition-all shadow-[0_0_30px_rgba(166,142,78,0.3)]"
              >
                <Plus className="w-5 h-5 mr-2" /> Dodaj własną aukcję
              </Button>
            </div>
          )}
        </div>
      </section>

      <UnifiedModal
        isOpen={isCreateOpen}
        onClose={handleCloseModal}
        title="Nowa aukcja"
        size="2xl"
        draggable
        bodyScrollable
      >
        {!selectedCategory ? (
          <AuctionCategorySelector
            onSelectCategory={handleCategorySelect}
            onCancel={handleCloseModal}
          />
        ) : (
          <UnifiedAuctionForm
            category={selectedCategory}
            onCancel={handleBackToCategory}
            onSuccess={() => {
              handleCloseModal();
              refetch();
            }}
          />
        )}
      </UnifiedModal>

      <UnifiedModal
        isOpen={feedbackModal.isOpen}
        onClose={() => setFeedbackModal((p) => ({ ...p, isOpen: false }))}
        type={feedbackModal.type}
        title={feedbackModal.title}
        message={feedbackModal.message}
      />
      <AccountModal
        open={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
      />
    </div>
  </TooltipProvider>
  );
};

export default AuctionsPage;
