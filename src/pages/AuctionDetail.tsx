import {
  useParams,
  useNavigate,
  Link,
  useSearchParams,
} from "react-router-dom";
import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  AlertCircle,
  Heart,
  Tag,
  Gavel,
  Sparkles,
  Eye,
  Clock,
  TrendingUp,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PedigreeModal } from "@/components/gallery/PedigreeModal";
import { Button } from "@/components/ui/button";
import { FullscreenImageModal } from "@/components/ui/FullscreenImageModal";
import { useAuction, useBid, useAuctionTimer } from "@/hooks/useAuctions";
import { AuctionCountDown } from "@/components/auction/AuctionCountDown";
import { useAuth } from "@/contexts/AuthContext";
import { auctionService } from "@/services/auctionService";
import { paymentService } from "@/services/paymentService";
import { reviewService } from "@/services/reviewService";
import ReviewForm from "@/components/ReviewForm";
import SellerReviews from "@/components/SellerReviews";
import { UnifiedModal } from "@/components/ui/UnifiedModal";
import AccountModal from "@/components/AccountModal";
import EditAuctionModal from "@/components/auction/EditAuctionModal";
import { trackMetric } from "@/services/metricsService";
import type { Auction } from "@/types/auction";
import { formatCategory } from "@/utils/auction";

const AuctionImage = memo(
  ({
    src,
    alt,
    className,
  }: {
    src: string;
    alt: string;
    className: string;
  }) => <img src={src} alt={alt} className={className} loading="eager" />,
);
AuctionImage.displayName = "AuctionImage";

const AuctionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { session, user, profile } = useAuth();
  const {
    auction,
    isLoading: loading,
    error,
    refetch: refetchAuction,
  } = useAuction({ auctionId: id || "" });
  const { isEnded } = useAuctionTimer(auction?.endTime);
  const [bidAmount, setBidAmount] = useState<string>("");
  const [isWatched, setIsWatched] = useState<boolean>(false);
  const [canReview, setCanReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPedigreeOpen, setIsPedigreeOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageModalIndex, setImageModalIndex] = useState(0);

  // Verification modal state
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState({
    title: "",
    message: "",
  });
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<
    "details" | "history" | "documents"
  >("details");

  const token = session?.access_token ?? null;
  const {
    placeBid,
    isLoading: bidLoading,
    error: bidError,
    success: bidSuccess,
  } = useBid(id || "", auction?.endTime);

  // Demo preview for layout stress test (?demo=full)
  const isDemo = searchParams.get("demo") === "full";
  const demoAuction: Auction = {
    id: "demo-auction",
    title:
      "SUPER DŁUGI TYTUŁ AUKCJI • GOŁĄB SUPER CHAMPION Z RODOWODEM – NAJLEPSZA LINIA LOTNIKÓW W EUROPIE • WIELOKROTNY LAUREAT • NIESAMOWITA GENETYKA • ODPORNOŚĆ • SZYBKOŚĆ • WYTRZYMAŁOŚĆ • PRECYZJA • WYGRANE MARATONY • LEGENDARNE DNA",
    description:
      "Ta aukcja prezentuje wyjątkowego gołębia pocztowego z linii mistrzów. Pełny opis zawiera historię lotów, genealogiczne informacje, wyniki w maratonach, a także szczegółowy opis kondycji, budowy, mięśni, skrzydeł i temperamentu. " +
      "W komplecie dokumenty i zdjęcia w wysokiej rozdzielczości. Dodatkowo szczegółowy rodowód oraz wyniki badań zdrowotnych. " +
      "Opis celowo jest ekstremalnie długi, aby zweryfikować zachowanie layoutu przy skrajnych przypadkach, sprawdzić line-height, zawijanie tekstu, marginesy, efekt glass i gradienty. " +
      "Sekcja uwzględnia: historię lotów (500 km, 700 km, 1000 km), kondycję (VO2 max, tętno spoczynkowe), mięśnie (sprężystość, siła), skrzydła (długość, elastyczność), " +
      "temperament (spokój w klatce, agresja w locie), inteligencję nawigacyjną (powroty w trudnych warunkach), odporność (wilgoć, niskie temperatury), " +
      "genetykę (linie Janssen, Koopman, Van Loon), oraz pełną listę badań weterynaryjnych. " +
      "Ta część tekstu powinna wypełnić kilka linii, aby sprawdzić czy kontener z glassmorphismem utrzymuje czytelność i nie generuje overflow na urządzeniach mobilnych i desktopowych.",
    startingPrice: 1000,
    currentPrice: 12500,
    buyNowPrice: 18000,
    reservePrice: 15000,
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    snipeThresholdMinutes: 5,
    snipeExtensionMinutes: 5,
    minBidIncrement: 5,
    status: "active",
    reserveMet: false,
    category: "PIGEONS",
    pigeon: {
      ringNumber: "PL-2024-CHAMP-999999",
      eyeColor: "Bursztynowe",
      pigeonColor: "Niebieski nakrapiany",
      construction: "Mocna, kompaktowa",
      pedigreeUrl: "https://example.com/pedigree.pdf",
      vitality: "Wysoka",
      length: "Średnia",
      endurance: "Bardzo wysoka",
      forkStrength: "Mocna",
      forkAlignment: "Idealna",
      muscles: "Sprężyste",
      shoulders: "Szerokie",
      balance: "Perfekcyjny",
      back: "Stabilny",
      feathers: "Jedwabiste",
      purpose: "Maraton / długie dystanse",
      gender: "MALE",
      dnaCertificate: true,
      colorTraits: ["Deep blue", "Iridescent"],
      eyeTraits: ["Rich iris", "Clear circle"],
      bodyStructureTraits: ["Compact", "Aerodynamic"],
      breastboneTraits: ["Strong"],
      forkTraits: ["Tight"],
      musculatureTraits: ["Elastic"],
      backTraits: ["Straight"],
      wingTraits: ["Long primary"],
      wingBehaviorTraits: ["Fast return"],
      breedingValueTraits: ["High"],
      distanceTraits: ["800+ km"],
    },
    sex: "MALE",
    location: "Lubań, Polska",
    seller: {
      id: "seller-demo",
      username: "super-seller",
      firstName: "Jan",
      lastName: "Kowalski",
      email: "demo@example.com",
      phoneNumber: "+48 600 600 600",
      image: null,
      rating: 5,
      salesCount: 123,
    },
    images: [
      "/images/auth-hero.jpg",
      "/public/hero-pigeon.jpg",
      "/placeholder.svg",
      "/images/auth-hero.jpg",
    ],
    videos: [],
    documents: ["/placeholder.svg", "/images/auth-hero.jpg"],
    bids: [
      {
        id: "b1",
        amount: 12000,
        createdAt: new Date().toISOString(),
        bidder: { id: "u1", username: "anna-n" },
      },
      {
        id: "b2",
        amount: 11000,
        createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
        bidder: { id: "u2", username: "piotr-z" },
      },
    ],
    _count: { bids: 12, watchlist: 34 },
    views: 0,
  };

  const displayAuction = isDemo ? demoAuction : auction;
  const dAuction = displayAuction;
  const isLoadingCurrent = loading && !isDemo;

  const isOwner = useMemo(() => {
    if (!dAuction || !user) return false;
    return user.id === dAuction.seller?.id;
  }, [user, dAuction]);

  const minimumBidValue = useMemo(() => {
    if (!displayAuction) return 0;
    const hasBids = (displayAuction._count?.bids || 0) > 0;
    if (!hasBids && displayAuction.startingPrice != null) {
      return displayAuction.startingPrice;
    }
    return (
      (displayAuction.currentPrice || 0) + (displayAuction.minBidIncrement || 5)
    );
  }, [displayAuction]);

  const isPigeon = useMemo(() => {
    const cat = (displayAuction?.category || "").toUpperCase();
    return !cat.includes("SUPPLEMENT") && !cat.includes("ACCESSOR");
  }, [displayAuction?.category]);

  const pedigreeUrl = useMemo(() => {
    if (!isPigeon) return null;
    const fromPigeon = displayAuction?.pigeon?.pedigreeUrl || null;
    if (fromPigeon) return fromPigeon;
    const doc =
      displayAuction?.documents?.find((d: string) =>
        /\.(pdf|jpg|jpeg|png|gif|webp|bmp|tiff)(\?.*)?$/i.test(d),
      ) || null;
    return doc || null;
  }, [displayAuction, isPigeon]);
  const pedigreeImages = useMemo(() => {
    const isImage = (u: string) =>
      /\.(jpg|jpeg|png|gif|webp|bmp|tiff)(\?.*)?$/i.test(u);
    const imgs: string[] = [];
    if (
      displayAuction?.pigeon?.pedigreeUrl &&
      isImage(displayAuction.pigeon.pedigreeUrl)
    ) {
      imgs.push(displayAuction.pigeon.pedigreeUrl);
    }
    if (Array.isArray(displayAuction?.documents)) {
      imgs.push(...displayAuction!.documents.filter(isImage));
    }
    return imgs;
  }, [displayAuction]);

  const roleActions = useMemo(
    () => ({
      USER_REGISTERED: () => {
        setVerificationMessage({
          title: "Wymagana weryfikacja emaila",
          message:
            "Aby licytować, musisz najpierw zweryfikować swój adres email.\n\nSprawdź swoją skrzynkę odbiorczą i kliknij link weryfikacyjny.",
        });
        setShowVerificationModal(true);
        return false;
      },
      USER_EMAIL_VERIFIED: () => {
        setVerificationMessage({
          title: "Wymagana pełna weryfikacja",
          message:
            'Aby licytować, musisz uzupełnić swój profil i zweryfikować numer telefonu.\n\nKliknij "Uzupełnij profil" aby kontynuować.',
        });
        setShowVerificationModal(true);
        return false;
      },
      USER_FULL_VERIFIED: () => true,
      ADMIN: () => true,
    }),
    [],
  );

  const checkAccess = useCallback(() => {
    if (!user) {
      navigate(
        "/auth?mode=login&callbackUrl=" +
          encodeURIComponent(window.location.pathname),
      );
      return false;
    }
    if (!profile) return false;

    const action = roleActions[profile.role as keyof typeof roleActions];
    if (action) {
      return action();
    }
    return false;
  }, [navigate, profile, roleActions, user]);

  const handleBid = useCallback(async () => {
    if (isOwner) return;
    if (!checkAccess()) return;
    if (!token || !dAuction) return;

    const amount = parseFloat(bidAmount);
    if (isNaN(amount)) return;

    await placeBid(amount);
    if (!bidError) {
      setBidAmount("");
    }
  }, [checkAccess, token, dAuction, placeBid, bidAmount, bidError, isOwner]);

  const handleAdminUpdate = async (data: {
    currentPrice?: number;
    buyNowPrice?: number;
    endTime?: string;
  }) => {
    if (!token || !id) return;
    try {
      await auctionService.adminUpdateAuction(id, data, token);
      refetchAuction();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Failed to update auction:", error);
    }
  };

  const handleAdminCancel = async () => {
    if (!token || !id) return;
    try {
      await auctionService.adminCancelAuction(id, token);
      refetchAuction();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Failed to cancel auction:", error);
    }
  };

  const handleBuyNow = useCallback(async () => {
    if (isOwner) return;
    if (!checkAccess()) return;
    if (!token || !dAuction || !dAuction.buyNowPrice) return;
    setIsCheckoutLoading(true);
    try {
      const clientUrl = window.location.origin;
      const successUrl = `${clientUrl}/auctions/success`;
      const cancelUrl = `${clientUrl}/auctions/cancel`;
      const res = await paymentService.createStripeCheckout(
        id!,
        token,
        successUrl,
        cancelUrl,
      );
      if (res.url) {
        window.location.href = res.url;
      }
    } catch (err) {
      console.warn("Stripe checkout init failed", err);
    } finally {
      setIsCheckoutLoading(false);
    }
  }, [checkAccess, token, dAuction, id, isOwner]);

  const toggleWatch = useCallback(async () => {
    if (!token || !id) return;
    try {
      if (isWatched) {
        const r = await auctionService.removeFromWatchlist(id, token);
        setIsWatched(!!r.watched);
      } else {
        const r = await auctionService.addToWatchlist(id, token);
        setIsWatched(!!r.watched);
      }
    } catch {
      console.warn("Failed to toggle watchlist");
    }
  }, [token, id, isWatched]);

  useEffect(() => {
    if (id) {
      trackMetric("AUCTION", id).catch(() => {});
    }
  }, [id]);

  useEffect(() => {
    const run = async () => {
      if (!token || !id) return;
      try {
        const r = await auctionService.isWatched(id, token);
        setIsWatched(!!r.watched);
      } catch {
        console.warn("Failed to load watch status");
      }
    };
    run();
  }, [token, id]);

  useEffect(() => {
    if (!token || !id || !isEnded || !auction) return;

    const checkReviewEligibility = async () => {
      try {
        const eligibility = await reviewService.canReview(id, token);
        setCanReview(eligibility.canReview);
        if (eligibility.canReview) {
          setShowReviewForm(true);
        }
      } catch (error) {
        console.error("Error checking review eligibility:", error);
      }
    };

    checkReviewEligibility();
  }, [token, id, isEnded, auction]);

  if (loading) {
    if (isLoadingCurrent && !displayAuction)
      return <div className="container mx-auto py-12">Ładowanie...</div>;
    if (!displayAuction)
      return (
        <div className="container mx-auto py-12 text-red-500">
          Nie znaleziono aukcji.
        </div>
      );
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-24 pb-12">
          <div className="container mx-auto px-4">
            <div className="animate-pulse space-y-8">
              <div className="h-8 w-48 bg-muted rounded" />
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="h-96 bg-muted rounded-2xl" />
                <div className="space-y-4">
                  <div className="h-12 bg-muted rounded" />
                  <div className="h-24 bg-muted rounded" />
                  <div className="h-32 bg-muted rounded" />
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-24 pb-12">
          <div className="container mx-auto px-4 text-center">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground font-bold leading-tight mb-4">
              Nie znaleziono aukcji
            </h1>
            <p className="text-muted-foreground mb-6">
              {error?.message || "Aukcja o podanym ID nie istnieje."}
            </p>
            <Link to="/auctions">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Powrót do aukcji
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleReviewSubmitted = () => {
    setReviewSubmitted(true);
    setShowReviewForm(false);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-12">
        {dAuction ? (
          <div className="container mx-auto px-4">
            {/* Navigation & Breadcrumb */}
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link
                  to="/auctions"
                  className="group flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white transition-all duration-300"
                >
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  <span className="text-[11px] font-black uppercase tracking-widest">
                    Powrót
                  </span>
                </Link>

                <div className="h-4 w-px bg-white/10 hidden sm:block" />

                <div className="hidden sm:flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white/30">
                  <Link
                    to="/auctions"
                    className="hover:text-primary transition-colors"
                  >
                    Aukcje
                  </Link>
                  <span className="opacity-40">/</span>
                  <span className="text-white/70 line-clamp-1 max-w-[200px]">
                    {dAuction.title}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Column 1: Gallery */}
              <div className="space-y-4">
                <div
                  className="aspect-square rounded-[2rem] overflow-hidden glass-vault border-gold shadow-2xl relative group backdrop-blur-md bg-zinc-950/20 cursor-pointer"
                  onClick={() => {
                    setImageModalIndex(0);
                    setIsImageModalOpen(true);
                  }}
                >
                  <AuctionImage
                    src={dAuction.images?.[0] || "/placeholder.svg"}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-40 scale-110 select-none pointer-events-none"
                  />
                  <AuctionImage
                    src={dAuction.images?.[0] || "/placeholder.svg"}
                    alt={dAuction.title}
                    className="relative z-10 w-full h-full object-contain object-center transition-all duration-700 group-hover:scale-[1.03] filter brightness-[1.02] contrast-[1.02]"
                  />
                  <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-tr from-white/5 to-transparent transition-opacity group-hover:opacity-0" />
                  <div className="absolute inset-0 z-20 pointer-events-none shadow-[inset_0_0_60px_rgba(0,0,0,0.4)]" />
                </div>
                {dAuction.images && dAuction.images.length > 1 ? (
                  <div className="grid grid-cols-4 gap-4">
                    {dAuction.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setImageModalIndex(idx);
                          setIsImageModalOpen(true);
                        }}
                        className={`aspect-square rounded-2xl overflow-hidden glass-vault border-white/5 hover:border-gold/50 transition-all duration-500 hover:-translate-y-1 ${imageModalIndex === idx ? "border-gold/50 ring-2 ring-gold/20" : ""}`}
                      >
                        <AuctionImage
                          src={img}
                          alt=""
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        />
                      </button>
                    ))}
                  </div>
                ) : null}

                {/* Pedigree Images Section */}
                {isPigeon && pedigreeImages && pedigreeImages.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white/70 text-sm font-bold uppercase tracking-wider">
                        Zdjęcia Rodowodu
                      </h3>
                      <button
                        onClick={() => setIsPedigreeOpen(true)}
                        className="text-gold/60 hover:text-gold text-xs font-black uppercase tracking-wider transition-colors"
                      >
                        Zobacz wszystkie
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {pedigreeImages.slice(0, 3).map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setIsPedigreeOpen(true)}
                          className="aspect-square rounded-xl overflow-hidden glass-vault border-white/5 hover:border-gold/50 transition-all duration-500 hover:-translate-y-1"
                        >
                          <AuctionImage
                            src={img}
                            alt=""
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Column 2: Info Dashboard */}
              <div className="flex flex-col h-full">
                {/* Single Unified Auction Dashboard Container */}
                <div
                  className="glass-vault rounded-[2.5rem] overflow-hidden relative group h-full !border-2 !border-[#A68E4E] !shadow-[0_0_50px_rgba(166,142,78,0.5)]"
                  style={{
                    background:
                      "radial-gradient(circle at top, rgba(166, 142, 78, 0.05), transparent 50%), linear-gradient(185deg, rgba(2, 10, 19, 0.4) 0%, rgba(6, 35, 46, 0.3) 45%, rgba(9, 61, 77, 0.2) 100%)",
                    border: "2px solid #A68E4E",
                    boxShadow: "0 0 50px rgba(166,142,78,0.5)",
                  }}
                >
                  {/* Decorative glow */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[100px] rounded-full -mr-32 -mt-32 transition-all duration-1000 group-hover:bg-gold/10" />

                  {/* Section 0: Enhanced Header (Category, Status, Bids, Views, Watch) */}
                  <div className="p-8 border-b-2 border-[#A68E4E] relative bg-white/[0.02]">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="px-4 py-1.5 rounded-full bg-gold/10 text-gold text-[10px] font-black uppercase tracking-[0.2em] border border-gold/30">
                          {formatCategory(dAuction.category)}
                        </span>
                        {isEnded ? (
                          <span className="px-4 py-1.5 rounded-full bg-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] border border-red-500/30">
                            Zakończona
                          </span>
                        ) : (
                          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/20 text-green-500 text-[10px] font-black uppercase tracking-[0.2em] border border-green-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            Aktywna
                          </div>
                        )}

                        <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block" />

                        <div className="flex items-center gap-4">
                          {dAuction.startingPrice != null && (
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] text-white/40 uppercase tracking-widest font-black">
                                Ofert:
                              </span>
                              <span className="text-[11px] font-bold text-white">
                                {dAuction._count?.bids || 0}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-white/40 uppercase tracking-widest font-black">
                              Obserwują:
                            </span>
                            <span className="text-[11px] font-bold text-white">
                              {dAuction._count?.watchlist || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={toggleWatch}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all ${isWatched ? "bg-red-500/10 border-red-500/30 text-red-500" : "bg-white/5 border-white/10 text-white/40 hover:text-white"}`}
                      >
                        <Heart
                          className={`w-3 h-3 ${isWatched ? "fill-current" : ""}`}
                        />
                        <span className="text-[9px] font-black uppercase tracking-wider">
                          {isWatched ? "Obserwujesz" : "Obserwuj"}
                        </span>
                      </button>
                    </div>
                    <h1 className="font-display text-3xl md:text-4xl text-white font-black leading-tight tracking-tight">
                      {dAuction.title}
                    </h1>
                  </div>

                  {/* Section 1: Bidding & Price (The "Hot" Zone) */}
                  <div className="p-8 border-b-2 border-[#A68E4E] relative bg-gradient-to-b from-white/[0.02] to-transparent">
                    <div className="flex flex-wrap items-center justify-between gap-6 mb-10">
                      <div className="min-w-fit">
                        <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold mb-1">
                          {dAuction.startingPrice != null
                            ? "Aktualna cena"
                            : "Cena"}
                        </p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl md:text-5xl font-black text-gold tracking-tighter">
                            {dAuction.currentPrice
                              ? dAuction.currentPrice.toLocaleString("pl-PL")
                              : "0"}
                          </span>
                          <span className="text-sm font-bold text-gold/60 uppercase tracking-widest mb-1">
                            PLN
                          </span>
                        </div>
                      </div>
                      {!isEnded && (
                        <div className="min-w-fit">
                          <div className="bg-white/[0.05] border-2 border-[#A68E4E] px-6 py-4 rounded-2xl flex flex-col items-start gap-1.5 backdrop-blur-sm shadow-[0_0_15px_-5px_rgba(166,142,78,0.3)]">
                            <p className="text-[9px] text-gold/60 uppercase tracking-[0.2em] font-black leading-none">
                              Koniec za
                            </p>
                            <div className="text-2xl font-black text-white tabular-nums tracking-tight leading-none">
                              <AuctionCountDown endTime={dAuction.endTime} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {!isEnded && (
                      <div className="flex flex-wrap lg:flex-nowrap items-stretch gap-2">
                        {isOwner ? (
                          <div className="w-full flex items-center justify-center gap-3 p-6 bg-white/5 border border-gold/20 rounded-2xl text-white/50 text-sm font-medium backdrop-blur-sm">
                            <AlertCircle className="w-5 h-5 text-gold/50" />
                            {dAuction.startingPrice != null &&
                            dAuction.buyNowPrice
                              ? "To jest Twoja aukcja. Nie możesz licytować ani kupować własnych przedmiotów."
                              : dAuction.startingPrice != null
                                ? "To jest Twoja aukcja. Nie możesz licytować własnych przedmiotów."
                                : "To jest Twoja aukcja. Nie możesz kupować własnych przedmiotów."}
                          </div>
                        ) : (
                          <>
                            {dAuction.startingPrice != null && (
                              <>
                                <div className="relative flex-[1.2] min-w-[110px] group/input">
                                  <input
                                    type="number"
                                    value={bidAmount}
                                    onChange={(e) =>
                                      setBidAmount(e.target.value)
                                    }
                                    placeholder={`${minimumBidValue ? minimumBidValue.toLocaleString("pl-PL") : "0"}+`}
                                    className="w-full h-full bg-white/[0.05] border-2 border-[#A68E4E] rounded-2xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#A68E4E] transition-all font-bold group-hover/input:border-[#A68E4E] text-sm placeholder:text-white/20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                                  />
                                </div>
                                <Button
                                  onClick={handleBid}
                                  disabled={bidLoading}
                                  className="flex-1 px-4 py-4 h-auto rounded-2xl font-black uppercase tracking-tighter shadow-glow hover:shadow-glow-lg transition-all text-[12px] whitespace-nowrap gold-button text-zinc-950 hover:bg-gold/90 border-0"
                                  style={{
                                    backgroundImage:
                                      "linear-gradient(135deg, rgba(166,142,78,0.9), rgba(166,142,78,0.8))",
                                    color: "#0f0f0f",
                                  }}
                                >
                                  <Gavel className="w-3.5 h-3.5 mr-1.5" />
                                  Licytuj
                                </Button>
                              </>
                            )}
                            {dAuction.buyNowPrice && (
                              <div className="relative group/buynow flex-1">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-gold/50 to-primary/50 rounded-2xl blur opacity-0 group-hover/buynow:opacity-30 transition duration-500" />
                                <Button
                                  onClick={handleBuyNow}
                                  className="relative w-full h-full px-4 py-4 bg-white/5 border-2 border-[#A68E4E] hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-tighter transition-all text-[12px] whitespace-nowrap hover:border-[#A68E4E] hover:shadow-[0_0_15px_-5px_rgba(166,142,78,0.4)]"
                                  style={{
                                    backgroundImage:
                                      "linear-gradient(135deg, rgba(166,142,78,0.9), rgba(166,142,78,0.8))",
                                    color: "#0f0f0f",
                                  }}
                                  disabled={isCheckoutLoading}
                                >
                                  {isCheckoutLoading
                                    ? "Przetwarzanie..."
                                    : "Kup teraz"}
                                </Button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Section 3: Deep Details (Tabbed View) */}
                  <div className="p-8">
                    {/* Navigation Buttons (The "Separate Buttons") */}
                    <div className="flex flex-wrap gap-2 mb-8 p-1 bg-white/5 rounded-2xl border-2 border-[#A68E4E] shadow-[0_0_20px_-10px_rgba(166,142,78,0.2)]">
                      <button
                        onClick={() => setActiveDetailTab("details")}
                        className={`flex-1 min-w-[120px] px-6 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-500 ${activeDetailTab === "details" ? "bg-gold text-zinc-950 shadow-glow scale-[1.02]" : "text-white/40 hover:text-white hover:bg-white/5"}`}
                        style={
                          activeDetailTab === "details"
                            ? {
                                backgroundImage:
                                  "linear-gradient(135deg, rgba(166,142,78,0.9), rgba(166,142,78,0.8))",
                              }
                            : {}
                        }
                      >
                        Informacje
                      </button>
                      <button
                        onClick={() => setActiveDetailTab("history")}
                        className={`flex-1 min-w-[120px] px-6 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-500 ${activeDetailTab === "history" ? "bg-gold text-zinc-950 shadow-glow scale-[1.02]" : "text-white/40 hover:text-white hover:bg-white/5"}`}
                        style={
                          activeDetailTab === "history"
                            ? {
                                backgroundImage:
                                  "linear-gradient(135deg, rgba(166,142,78,0.9), rgba(166,142,78,0.8))",
                              }
                            : {}
                        }
                      >
                        Historia ({dAuction.bids?.length || 0})
                      </button>
                      {dAuction.documents && dAuction.documents.length > 0 && (
                        <button
                          onClick={() => setActiveDetailTab("documents")}
                          className={`flex-1 min-w-[120px] px-6 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-500 ${activeDetailTab === "documents" ? "bg-gold text-zinc-950 shadow-glow scale-[1.02]" : "text-white/40 hover:text-white hover:bg-white/5"}`}
                          style={
                            activeDetailTab === "documents"
                              ? {
                                  backgroundImage:
                                    "linear-gradient(135deg, rgba(166,142,78,0.9), rgba(166,142,78,0.8))",
                                }
                              : {}
                          }
                        >
                          Dokumenty ({dAuction.documents.length})
                        </button>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="relative min-h-[400px]">
                      {activeDetailTab === "details" && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="space-y-6"
                        >
                          <div
                            className="border-2 border-[#A68E4E] rounded-[2.5rem] overflow-hidden shadow-[0_0_30px_-15px_rgba(166,142,78,0.2)]"
                            style={{
                              background:
                                "radial-gradient(circle at top, rgba(66, 192, 206, 0.1), transparent 50%), linear-gradient(185deg, rgba(2, 10, 19, 0.5) 0%, rgba(6, 35, 46, 0.4) 45%, rgba(9, 61, 77, 0.3) 100%)",
                            }}
                          >
                            <div className="grid grid-cols-2 md:grid-cols-3">
                              {isPigeon ? (
                                [
                                  {
                                    label: "Płeć",
                                    value:
                                      dAuction.pigeon?.gender === "MALE"
                                        ? "Samiec"
                                        : "Samica",
                                  },
                                  {
                                    label: "Ubarwienie",
                                    value: dAuction.pigeon?.pigeonColor,
                                  },
                                  {
                                    label: "Oko",
                                    value: dAuction.pigeon?.eyeColor,
                                  },
                                  {
                                    label: "Budowa",
                                    value: dAuction.pigeon?.construction,
                                  },
                                  {
                                    label: "Witalność",
                                    value: dAuction.pigeon?.vitality,
                                  },
                                  {
                                    label: "Przeznaczenie",
                                    value: dAuction.pigeon?.purpose,
                                  },
                                ].map((spec, i) =>
                                  spec.value ? (
                                    <div key={i} className="p-6">
                                      <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black mb-1.5">
                                        {spec.label}
                                      </p>
                                      <p className="text-sm text-white font-bold tracking-wide">
                                        {spec.value}
                                      </p>
                                    </div>
                                  ) : null,
                                )
                              ) : (
                                <div className="p-6 col-span-full">
                                  <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black mb-1.5">
                                    Kategoria
                                  </p>
                                  <p className="text-base text-white font-bold">
                                    {dAuction.category}
                                  </p>
                                </div>
                              )}
                            </div>

                            {dAuction.description && (
                              <div className="p-10 border-t-2 border-[#A68E4E]">
                                <div className="text-white/70 leading-relaxed whitespace-pre-wrap font-sans text-base">
                                  {dAuction.description}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}

                      {activeDetailTab === "history" && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-3"
                        >
                          {dAuction.bids && dAuction.bids.length > 0 ? (
                            dAuction.bids.map((bid, bidx) => (
                              <div
                                key={bid.id}
                                className={`flex items-center justify-between p-5 rounded-2xl transition-all duration-500 border-2 ${bidx === 0 ? "bg-gold/10 border-[#A68E4E] shadow-[0_0_20px_-5px_rgba(166,142,78,0.4)]" : "bg-white/[0.03] border-[#A68E4E]/50 hover:border-[#A68E4E]"}`}
                              >
                                <div className="flex items-center gap-5">
                                  <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center border ${bidx === 0 ? "border-primary/50 bg-primary/20" : "border-white/10 bg-white/10"}`}
                                  >
                                    {bidx === 0 ? (
                                      <TrendingUp className="w-5 h-5 text-primary" />
                                    ) : (
                                      <span className="text-xs font-black text-white/20">
                                        #{dAuction.bids.length - bidx}
                                      </span>
                                    )}
                                  </div>
                                  <div>
                                    <p
                                      className={`text-base font-black ${bidx === 0 ? "text-white" : "text-white/70"}`}
                                    >
                                      {bid?.bidder?.username || "Anonimowy"}
                                    </p>
                                    <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                                      {new Date(
                                        bid.createdAt,
                                      ).toLocaleDateString("pl-PL")}{" "}
                                      •{" "}
                                      {new Date(
                                        bid.createdAt,
                                      ).toLocaleTimeString("pl-PL", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p
                                    className={`text-xl font-black ${bidx === 0 ? "text-primary" : "text-white"}`}
                                  >
                                    {bid.amount
                                      ? bid.amount.toLocaleString("pl-PL")
                                      : "0"}
                                    <span className="text-[10px] ml-1.5 opacity-40 font-bold tracking-tighter">
                                      PLN
                                    </span>
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="py-24 text-center bg-white/[0.02] rounded-[3rem] border border-dashed border-white/10">
                              <Gavel className="w-16 h-16 text-white/5 mx-auto mb-6" />
                              <p className="text-white/30 text-base font-bold">
                                Brak ofert. Rozpocznij licytację!
                              </p>
                            </div>
                          )}
                        </motion.div>
                      )}

                      {activeDetailTab === "documents" && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="grid grid-cols-1 gap-3"
                        >
                          {dAuction.documents?.map((doc, idx) => (
                            <a
                              key={idx}
                              href={doc}
                              target="_blank"
                              rel="noreferrer"
                              className="group flex items-center justify-between p-6 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.06] hover:border-primary/30 transition-all duration-500"
                            >
                              <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-primary/20 group-hover:border-primary/50 transition-all duration-500">
                                  <Sparkles className="w-6 h-6 text-white/20 group-hover:text-primary" />
                                </div>
                                <div>
                                  <p className="text-xs text-white font-black uppercase tracking-widest mb-1">
                                    Dokument #{idx + 1}
                                  </p>
                                  <p className="text-[10px] text-white/30 truncate max-w-[200px]">
                                    {doc.split("/").pop()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-[9px] font-black text-primary uppercase tracking-widest px-5 py-2.5 bg-primary/10 rounded-lg group-hover:bg-primary group-hover:text-black transition-all duration-500">
                                  Pobierz
                                </span>
                              </div>
                            </a>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            {isEnded && dAuction.seller?.id ? (
              <div className="mt-24 pt-12 border-t border-white/10">
                <div className="grid lg:grid-cols-2 gap-12">
                  {showReviewForm && !reviewSubmitted ? (
                    <ReviewForm
                      auctionId={dAuction.id}
                      sellerId={dAuction.seller.id}
                      auctionTitle={dAuction.title}
                      onReviewSubmitted={handleReviewSubmitted}
                    />
                  ) : null}
                  <SellerReviews
                    sellerId={dAuction.seller.id}
                    sellerName={dAuction.seller?.firstName || "Sprzedawca"}
                  />
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="container mx-auto px-4 py-20 text-center">
            <AlertCircle className="w-16 h-16 text-primary/40 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Aukcja niedostępna
            </h2>
            <p className="text-white/40 mb-8">
              Przepraszamy, nie udało się załadować danych aukcji.
            </p>
            <Link to="/auctions">
              <Button
                variant="outline"
                className="rounded-xl border-white/10 text-white/60 hover:text-white"
              >
                Powrót do listy aukcji
              </Button>
            </Link>
          </div>
        )}
      </main>

      <AccountModal
        open={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
      />

      <UnifiedModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        type="warning"
        title={verificationMessage.title}
        message={verificationMessage.message}
        confirmButton={{
          text:
            profile?.role === "USER_REGISTERED"
              ? "Zweryfikuj email"
              : "Uzupełnij profil",
          onClick: () => {
            setShowVerificationModal(false);
            if (profile?.role === "USER_REGISTERED") {
              navigate("/verify-email");
            } else {
              setIsAccountOpen(true);
            }
          },
        }}
        cancelButton={{
          text: "Anuluj",
          onClick: () => setShowVerificationModal(false),
        }}
      />

      <PedigreeModal
        isOpen={isPedigreeOpen}
        onClose={() => setIsPedigreeOpen(false)}
        pedigreeUrl={pedigreeUrl}
        images={pedigreeImages}
        startIndex={0}
      />
      <FullscreenImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        images={displayAuction?.images || []}
        currentIndex={imageModalIndex}
        title={displayAuction?.title}
      />

      {dAuction && (
        <EditAuctionModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          auction={dAuction}
          onSave={handleAdminUpdate}
          onCancel={handleAdminCancel}
        />
      )}

      <Footer />
    </div>
  );
};

export default AuctionDetail;
