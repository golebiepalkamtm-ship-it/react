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
  Maximize2,
  ShieldCheck,
  MapPin,
  Zap,
  Award,
  FileText,
  CheckCircle2,
  ChevronRight,
  Layers,
  Activity,
  Target,
  Trophy,
  Crown,
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
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import ReviewForm from "@/components/ReviewForm";
import SellerReviews from "@/components/SellerReviews";
import { UnifiedModal } from "@/components/ui/UnifiedModal";
import AccountModal from "@/components/AccountModal";
import EditAuctionModal from "@/components/auction/EditAuctionModal";
import { trackMetric } from "@/services/metricsService";
import { toast } from "@/hooks/use-toast";
import type { Auction } from "@/types/auction";
import { formatCategory } from "@/utils/auction";

const AuctionImage = memo(
  ({
    src,
    alt,
    className,
    onError,
  }: {
    src: string;
    alt: string;
    className: string;
    onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  }) => (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="eager"
      onError={onError}
    />
  ),
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
    viewersCount,
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
  const [activeImageIndex, setActiveImageIndex] = useState(0);

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

  const [isAutoBid, setIsAutoBid] = useState<boolean>(false);
  const [maxBidAmount, setMaxBidAmount] = useState<string>("");

  const handleBid = useCallback(async () => {
    if (isOwner) return;
    if (!checkAccess()) return;
    if (!token || !dAuction) return;

    const amount = parseFloat(bidAmount);
    if (isNaN(amount)) return;

    if (isAutoBid) {
      const maxVal = parseFloat(maxBidAmount);
      if (isNaN(maxVal) || maxVal <= amount) {
        toast({
          title: "Błąd stawki",
          description: "Stawka maksymalna musi być większa niż oferta początkowa.",
          variant: "destructive",
        });
        return;
      }
      await placeBid({ amount, maxBid: maxVal, isProxy: true } as any);
    } else {
      await placeBid(amount as any);
    }

    if (!bidError) {
      setBidAmount("");
      setMaxBidAmount("");
    }
  }, [checkAccess, token, dAuction, placeBid, bidAmount, maxBidAmount, isAutoBid, bidError, isOwner]);

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
      const successUrl = `${clientUrl}/auctions/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${clientUrl}/auctions/cancel`;
      const res = await paymentService.createStripeCheckout(
        id!,
        token,
        successUrl,
        cancelUrl,
      );
      if (res.url) {
        try {
          const url = new URL(res.url);
          const isStripeHost =
            url.hostname === "checkout.stripe.com" ||
            (url.hostname.endsWith(".stripe.com") &&
              !url.hostname.includes("@"));

          if (url.protocol === "https:" && isStripeHost) {
            window.location.assign(url.href);
            return;
          }
          console.error("Blocked unsafe checkout URL:", res.url);
        } catch (e) {
          console.error("Malformed checkout URL:", res.url);
        }
      }
      toast({
        title: "Płatność niedostępna",
        description:
          "Nie udało się uruchomić płatności Stripe. Spróbuj ponownie lub skontaktuj się z obsługą.",
        variant: "destructive",
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Nie udało się przejść do płatności.";
      toast({
        title: "Błąd płatności",
        description: message,
        variant: "destructive",
      });
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
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <Link
                  to="/auctions"
                  className="group flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white transition-all duration-300"
                >
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  <span className="text-[11px] font-black uppercase tracking-widest">
                    Powrót do listy
                  </span>
                </Link>

                <div className="h-4 w-px bg-white/10 hidden sm:block" />

                <div className="hidden sm:flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white/30">
                  <Link
                    to="/auctions"
                    className="hover:text-primary transition-colors"
                  >
                    Champions Pigeon Auction
                  </Link>
                  <span className="opacity-40">/</span>
                  <span className="text-white/70 line-clamp-1 max-w-[200px]">
                    {dAuction.title}
                  </span>
                </div>
              </div>

              {/* Verified Trust Tag */}
              <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-black/40 border border-[#A68E4E]/50 backdrop-blur-md shadow-[0_0_15px_rgba(166,142,78,0.2)]">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                  Aukcja Zweryfikowana • MTM Pałka Loft
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-start relative">
              {/* Background Ambient Orbs */}
              <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 bg-[#42C0CE]/15 rounded-full blur-[140px] animate-pulse" />
              <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 bg-[#A68E4E]/15 rounded-full blur-[140px] animate-pulse" />

              {/* Column 1: Gallery & Seller Trust */}
              <div className="space-y-6 relative z-10">
                {/* Main Glass Gallery Card */}
                <div
                  className="aspect-square rounded-[2.5rem] overflow-hidden glass-vault border-2 border-[#A68E4E]/70 shadow-[0_0_60px_rgba(166,142,78,0.25)] relative group cursor-pointer transition-all duration-700 hover:shadow-[0_0_80px_rgba(166,142,78,0.4)]"
                  style={{
                    background:
                      "radial-gradient(circle at top, rgba(66, 192, 206, 0.18), transparent 70%), linear-gradient(185deg, rgba(2, 10, 19, 0.98) 0%, rgba(6, 35, 46, 0.95) 45%, rgba(9, 61, 77, 0.92) 100%)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                  }}
                  onClick={() => {
                    setImageModalIndex(activeImageIndex);
                    setIsImageModalOpen(true);
                  }}
                >
                  {/* Top Accent Line like Footer */}
                  <div className="absolute top-0 left-0 w-full h-[15px] bg-gradient-to-b from-[#A68E4E]/40 via-cyan-500/20 to-transparent pointer-events-none opacity-90 z-20" />
                  <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-[#A68E4E] via-cyan-400 to-[#A68E4E] shadow-[0_0_20px_rgba(66,192,206,0.8)] z-20" />
                  <AuctionImage
                    src={dAuction.images?.[activeImageIndex] || dAuction.images?.[0] || "/placeholder.svg"}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-40 scale-110 select-none pointer-events-none transition-all duration-700"
                  />
                  <AuctionImage
                    src={dAuction.images?.[activeImageIndex] || dAuction.images?.[0] || "/placeholder.svg"}
                    alt={dAuction.title}
                    className="relative z-10 w-full h-full object-contain object-center transition-all duration-700 group-hover:scale-[1.04] filter brightness-[1.04] contrast-[1.02]"
                  />
                  <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-tr from-[#070e1e]/60 via-transparent to-white/10 transition-opacity group-hover:opacity-60" />
                  
                  {/* Top Badge Overlay */}
                  <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-2">
                      {isPigeon && (
                        <span className="px-3.5 py-1.5 rounded-full bg-[#070e1e]/90 backdrop-blur-md border border-[#A68E4E]/50 text-amber-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                          <Award className="w-3.5 h-3.5 text-amber-400" />
                          Certyfikat Genetyczny
                        </span>
                      )}
                    </div>
                    {dAuction.images && dAuction.images.length > 0 && (
                      <span className="px-3 py-1 rounded-full bg-[#070e1e]/90 backdrop-blur-md border border-[#A68E4E]/30 text-amber-200 text-[10px] font-bold tracking-wider flex items-center gap-1.5">
                        <Maximize2 className="w-3 h-3 text-amber-400" />
                        {activeImageIndex + 1} / {dAuction.images.length}
                      </span>
                    )}
                  </div>

                  {/* Click to expand hint overlay */}
                  <div className="absolute bottom-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <span className="px-4 py-2 rounded-xl bg-[#070e1e]/95 backdrop-blur-md border border-[#A68E4E]/60 text-white text-xs font-bold flex items-center gap-2 shadow-2xl">
                      <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                      Powiększ zdjęcie
                    </span>
                  </div>
                </div>

                {/* Thumbnails Row */}
                {dAuction.images && dAuction.images.length > 1 && (
                  <div className="grid grid-cols-5 gap-3">
                    {dAuction.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`aspect-square rounded-2xl overflow-hidden glass-vault border-2 transition-all duration-300 hover:-translate-y-1 ${activeImageIndex === idx ? "border-[#A68E4E] ring-4 ring-[#A68E4E]/30 scale-[1.02]" : "border-[#A68E4E]/20 opacity-70 hover:opacity-100 hover:border-[#A68E4E]/60"}`}
                      >
                        <AuctionImage
                          src={img}
                          alt=""
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Pedigree Images Section */}
                {isPigeon && pedigreeImages && pedigreeImages.length > 0 && (
                  <div
                    className="p-5 rounded-3xl border-2 border-[#A68E4E]/40 space-y-3 shadow-xl"
                    style={{
                      background:
                        "radial-gradient(circle at top, rgba(66, 192, 206, 0.15), transparent 70%), linear-gradient(185deg, rgba(2, 10, 19, 0.98) 0%, rgba(6, 35, 46, 0.95) 45%, rgba(9, 61, 77, 0.92) 100%)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-400" />
                        <h3 className="text-white text-xs font-black uppercase tracking-wider">
                          Dokumenty Rodowodu
                        </h3>
                      </div>
                      <button
                        onClick={() => setIsPedigreeOpen(true)}
                        className="text-amber-400 hover:text-white text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-1"
                      >
                        Zobacz rodowód <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {pedigreeImages.slice(0, 3).map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setIsPedigreeOpen(true)}
                          className="aspect-square rounded-xl overflow-hidden glass-vault border border-[#A68E4E]/30 hover:border-[#A68E4E] transition-all duration-300 hover:scale-105 group/ped"
                        >
                          <AuctionImage
                            src={img && img.startsWith("http") ? img : "/placeholder.svg"}
                            alt="Pedigree Image"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/ped:scale-110"
                            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                              (e.target as HTMLImageElement).src = "/placeholder.svg";
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Seller Trust Card */}
                {dAuction.seller && (
                  <div
                    className="p-6 rounded-3xl border-2 border-[#A68E4E]/40 flex items-center justify-between gap-4 shadow-xl"
                    style={{
                      background:
                        "radial-gradient(circle at top, rgba(66, 192, 206, 0.15), transparent 70%), linear-gradient(185deg, rgba(2, 10, 19, 0.98) 0%, rgba(6, 35, 46, 0.95) 45%, rgba(9, 61, 77, 0.92) 100%)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-[#A68E4E] flex items-center justify-center font-black text-xl text-amber-300 overflow-hidden shadow-lg">
                          {dAuction.seller.image ? (
                            <img src={dAuction.seller.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            (dAuction.seller.username || dAuction.seller.firstName || "S").charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-[#0c1427] flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-white font-black text-base tracking-tight">
                            {dAuction.seller.username || `${dAuction.seller.firstName || ""} ${dAuction.seller.lastName || ""}`.trim() || "Hodowca Pałka MTM"}
                          </h4>
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[9px] font-black uppercase tracking-wider border border-amber-500/40">
                            Weryfikowany
                          </span>
                        </div>
                        <p className="text-xs text-white/60 flex items-center gap-2 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-400" />
                          {dAuction.location || "Lubań, Polska"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1 text-amber-400">
                        {"★".repeat(5)}
                        <span className="text-xs font-bold text-white ml-1">5.0</span>
                      </div>
                      <p className="text-[10px] text-white/50 uppercase tracking-widest font-black mt-1">
                        100% Pozytywne
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Column 2: Info Dashboard */}
              <div className="flex flex-col h-full relative z-10">
                {/* Single Unified Auction Dashboard Container */}
                <div
                  className="glass-vault rounded-[2.5rem] overflow-hidden relative group h-full border-2 border-[#A68E4E]/70 shadow-[0_0_80px_rgba(166,142,78,0.35)] flex flex-col"
                  style={{
                    background:
                      "radial-gradient(circle at top, rgba(66, 192, 206, 0.18), transparent 70%), linear-gradient(185deg, rgba(2, 10, 19, 0.98) 0%, rgba(6, 35, 46, 0.95) 45%, rgba(9, 61, 77, 0.92) 100%)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                  }}
                >
                  {/* Top Accent Line like Footer */}
                  <div className="absolute top-0 left-0 w-full h-[15px] bg-gradient-to-b from-[#A68E4E]/40 via-cyan-500/20 to-transparent pointer-events-none opacity-90 z-20" />
                  <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-[#A68E4E] via-cyan-400 to-[#A68E4E] shadow-[0_0_20px_rgba(66,192,206,0.8)] z-20" />

                  {/* Section 0: Enhanced Header (Category, Status, Bids, Views, Watch) */}
                  <div className="p-8 border-b border-[#A68E4E]/40 relative bg-black/20 backdrop-blur-md">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-[0.2em]">
                          {formatCategory(dAuction.category)}
                        </span>
                        {isEnded ? (
                          <span className="px-4 py-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-black uppercase tracking-[0.2em]">
                            Zakończona
                          </span>
                        ) : (
                          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-black uppercase tracking-[0.2em]">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
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
                              <span className="text-[11px] font-bold text-amber-300">
                                {dAuction._count?.bids || 0}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-white/40 uppercase tracking-widest font-black">
                              Obserwują:
                            </span>
                            <span className="text-[11px] font-bold text-amber-300">
                              {dAuction._count?.watchlist || 0}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-emerald-400/80 uppercase tracking-widest font-black">
                              Przegląda:
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span className="text-[11px] font-bold text-emerald-400">
                                {viewersCount > 0 ? viewersCount : 1}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={toggleWatch}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all ${isWatched ? "bg-rose-500/20 border-rose-500/40 text-rose-300" : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"}`}
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
                  <div className="p-8 border-b border-[#A68E4E]/30 relative bg-black/10">
                    <div className="flex flex-wrap items-center justify-between gap-6 mb-10">
                      <div className="min-w-fit">
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold mb-1">
                          {dAuction.startingPrice != null
                            ? "Aktualna cena"
                            : "Cena"}
                        </p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl md:text-5xl font-black text-amber-400 tracking-tighter drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                            {dAuction.currentPrice
                              ? dAuction.currentPrice.toLocaleString("pl-PL")
                              : "0"}
                          </span>
                          <span className="text-sm font-bold text-amber-400/80 uppercase tracking-widest mb-1">
                            PLN
                          </span>
                        </div>
                      </div>
                      {!isEnded && (
                        <div className="min-w-fit flex flex-col items-end gap-2">
                          <div className="bg-black/30 border-2 border-[#A68E4E]/60 px-6 py-4 rounded-2xl flex flex-col items-start gap-1.5 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.4)]">
                            <p className="text-[9px] text-amber-400 uppercase tracking-[0.2em] font-black leading-none">
                              Koniec za
                            </p>
                            <div className="text-2xl font-black text-white tabular-nums tracking-tight leading-none">
                              <AuctionCountDown endTime={dAuction.endTime} />
                            </div>
                          </div>
                          {dAuction.isExtended && (
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-bold tracking-wide animate-pulse">
                              <Sparkles className="w-3 h-3 text-amber-400" />
                              <span>Aukcja przedłużona o +5 min (Anti-Sniping)</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {dAuction.status === "WAITING_FOR_FEE" && isOwner && (
                      <div className="flex flex-col gap-3">
                        <div className="w-full flex items-center justify-center gap-3 p-6 bg-amber-500/10 border border-amber-500/50 rounded-2xl text-amber-400 text-sm font-medium backdrop-blur-sm">
                          <AlertCircle className="w-5 h-5 text-amber-400" />
                          Ta aukcja oczekuje na opłacenie opłaty wystawieniowej.
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={async () => {
                                  try {
                                    const res = await paymentService.createListingFeeCheckout(dAuction.id, session?.access_token ?? null);
                                    if (res.url) {
                                      window.location.href = res.url;
                                    }
                                  } catch (err) {
                                    toast({ title: "Błąd", description: "Nie udało się utworzyć płatności", variant: "destructive" });
                                  }
                                }}
                                className="w-full px-4 py-4 rounded-2xl font-black uppercase tracking-wider transition-all text-[12px] whitespace-nowrap bg-gradient-to-r from-[#A68E4E] via-amber-500 to-yellow-400 text-zinc-950 shadow-lg shadow-amber-500/30 hover:scale-[1.02] border-0"
                              >
                                Opłać opłatę wystawieniową
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              Opłata jest wymagana, aby Twoja aukcja stała się widoczna dla kupujących na platformie.
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    )}

                    {dAuction.status === "ENDED_WAITING_PAYMENT" && isOwner && (
                      <div className="flex flex-col gap-3">
                        <div className="w-full flex items-center justify-center gap-3 p-6 bg-emerald-500/10 border border-emerald-500/50 rounded-2xl text-emerald-400 text-sm font-medium backdrop-blur-sm">
                          <AlertCircle className="w-5 h-5 text-emerald-400" />
                          Aukcja zakończona sukcesem! Oczekuje na opłacenie prowizji.
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={async () => {
                                  try {
                                    const res = await paymentService.createCommissionCheckout(dAuction.id, session?.access_token ?? null);
                                    if (res.url) {
                                      window.location.href = res.url;
                                    }
                                  } catch (err) {
                                    toast({ title: "Błąd", description: "Nie udało się utworzyć płatności", variant: "destructive" });
                                  }
                                }}
                                className="w-full px-4 py-4 rounded-2xl font-black uppercase tracking-wider transition-all text-[12px] whitespace-nowrap bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-lg hover:scale-[1.02] border-0"
                              >
                                Opłać prowizję od sprzedaży
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              Opłacenie prowizji odblokuje dane kontaktowe kupującego i pozwoli sfinalizować transakcję.
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    )}

                    {dAuction.status === "ENDED_WAITING_PAYMENT" && !isOwner && (
                       <div className="w-full flex items-center justify-center gap-3 p-6 bg-black/30 border border-[#A68E4E]/30 rounded-2xl text-white/60 text-sm font-medium backdrop-blur-sm">
                          <AlertCircle className="w-5 h-5 text-amber-400" />
                          Aukcja zakończona. Oczekujemy na rozliczenie ze sprzedawcą.
                       </div>
                    )}

                    {dAuction.status === "ACTIVE" && !isEnded && (
                      <div className="flex flex-col gap-3">
                        {isOwner ? (
                          <div className="w-full flex items-center justify-center gap-3 p-6 bg-black/30 border border-[#A68E4E]/30 rounded-2xl text-white/60 text-sm font-medium backdrop-blur-sm">
                            <AlertCircle className="w-5 h-5 text-amber-400" />
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
                              <div className="w-full flex flex-col gap-2 p-3.5 rounded-2xl bg-black/30 border border-[#A68E4E]/40 backdrop-blur-sm">
                                <div className="flex items-center justify-between">
                                  <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      checked={isAutoBid}
                                      onChange={(e) => setIsAutoBid(e.target.checked)}
                                      className="w-4 h-4 rounded border-amber-500/50 accent-amber-500"
                                    />
                                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                                      Auto-Bid (Stawka Maksymalna)
                                    </span>
                                  </label>
                                  <span className="text-[10px] text-white/50">
                                    System sam przelicytuje rywali do limitu
                                  </span>
                                </div>
                                {isAutoBid && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <input
                                      type="number"
                                      value={maxBidAmount}
                                      onChange={(e) => setMaxBidAmount(e.target.value)}
                                      placeholder={`Kwota maksymalna (np. ${((minimumBidValue || 0) + 500).toLocaleString("pl-PL")})`}
                                      className="flex-1 bg-black/40 border border-[#A68E4E]/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#A68E4E] font-bold"
                                    />
                                    <span className="text-xs font-bold text-amber-400">PLN MAX</span>
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="flex flex-wrap lg:flex-nowrap items-stretch gap-2">
                              {dAuction.startingPrice != null && (
                                <div className="space-y-2 flex-1">
                                  <div className="flex flex-wrap lg:flex-nowrap items-stretch gap-2">
                                    <div className="relative flex-[1.2] min-w-[110px] group/input">
                                      <input
                                        type="number"
                                        value={bidAmount}
                                        onChange={(e) =>
                                          setBidAmount(e.target.value)
                                        }
                                        placeholder={`${minimumBidValue ? minimumBidValue.toLocaleString("pl-PL") : "0"}+`}
                                        className="w-full h-full bg-black/40 border-2 border-[#A68E4E]/60 rounded-2xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#A68E4E] transition-all font-bold group-hover/input:border-[#A68E4E] text-sm placeholder:text-white/30"
                                      />
                                    </div>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            onClick={handleBid}
                                            disabled={bidLoading}
                                            className="flex-1 px-4 py-4 h-auto rounded-2xl font-black uppercase tracking-wider transition-all text-[12px] whitespace-nowrap bg-gradient-to-r from-[#A68E4E] via-amber-500 to-yellow-400 text-zinc-950 shadow-lg shadow-amber-500/30 hover:scale-[1.02] border-0"
                                          >
                                            <Gavel className="w-3.5 h-3.5 mr-1.5" />
                                            {isAutoBid ? "Ustaw Auto-Bid" : "Licytuj"}
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          {isAutoBid 
                                            ? "Ustaw maksymalną kwotę, do której system będzie automatycznie przebijał rywali." 
                                            : "Złóż ofertę na podaną kwotę."}
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                  <div className="flex items-center gap-1.5 pt-1">
                                    <span className="text-[9px] text-cyan-400 uppercase font-black tracking-widest mr-1">
                                      Szybki przebieg:
                                    </span>
                                    {[50, 100, 250, 500].map((inc) => (
                                      <button
                                        key={inc}
                                        type="button"
                                        onClick={() => {
                                          const base = minimumBidValue || 0;
                                          setBidAmount(String(base + inc));
                                        }}
                                        className="px-2.5 py-1 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-[10px] font-black tracking-wider transition-all duration-300 hover:scale-105 active:scale-95"
                                      >
                                        +{inc} zł
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {dAuction.buyNowPrice && (
                                <div className="relative group/buynow flex-1">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          onClick={handleBuyNow}
                                          className="relative w-full h-full px-4 py-4 rounded-2xl font-black uppercase tracking-wider transition-all text-[12px] whitespace-nowrap bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/30 hover:scale-[1.02] border-0"
                                          disabled={isCheckoutLoading}
                                        >
                                          {isCheckoutLoading
                                            ? "Przetwarzanie..."
                                            : "Kup teraz"}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        Natychmiastowe zakończenie aukcji i zakup za z góry ustaloną kwotę (Kup Teraz).
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Section 3: Deep Details (Tabbed View) */}
                  <div className="p-8">
                    {/* Navigation Buttons (The "Separate Buttons") */}
                    <div className="flex flex-wrap gap-2 mb-8 p-1.5 bg-black/30 rounded-2xl border border-[#A68E4E]/40 shadow-lg">
                      <button
                        onClick={() => setActiveDetailTab("details")}
                        className={`flex-1 min-w-[120px] px-6 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${activeDetailTab === "details" ? "bg-gradient-to-r from-[#A68E4E] via-amber-500 to-yellow-400 text-zinc-950 font-extrabold shadow-lg shadow-amber-500/30 scale-[1.02]" : "text-white/60 hover:text-white hover:bg-white/5"}`}
                      >
                        Informacje
                      </button>
                      <button
                        onClick={() => setActiveDetailTab("history")}
                        className={`flex-1 min-w-[120px] px-6 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${activeDetailTab === "history" ? "bg-gradient-to-r from-[#A68E4E] via-amber-500 to-yellow-400 text-zinc-950 font-extrabold shadow-lg shadow-amber-500/30 scale-[1.02]" : "text-white/60 hover:text-white hover:bg-white/5"}`}
                      >
                        Historia ({dAuction.bids?.length || 0})
                      </button>
                      {dAuction.documents && dAuction.documents.length > 0 && (
                        <button
                          onClick={() => setActiveDetailTab("documents")}
                          className={`flex-1 min-w-[120px] px-6 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${activeDetailTab === "documents" ? "bg-gradient-to-r from-[#A68E4E] via-amber-500 to-yellow-400 text-zinc-950 font-extrabold shadow-lg shadow-amber-500/30 scale-[1.02]" : "text-white/60 hover:text-white hover:bg-white/5"}`}
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
                          <div className="border-2 border-[#A68E4E]/40 rounded-[2.5rem] overflow-hidden bg-black/30 backdrop-blur-md shadow-2xl">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-[#A68E4E]/30">
                              {isPigeon ? (
                                [
                                  {
                                    label: "Numer obrączki",
                                    value: dAuction.pigeon?.ringNumber,
                                    badge: "DNA",
                                    icon: ShieldCheck,
                                  },
                                  {
                                    label: "Płeć",
                                    value:
                                      dAuction.pigeon?.gender === "MALE"
                                        ? "Samiec ♂"
                                        : dAuction.pigeon?.gender === "FEMALE"
                                          ? "Samica ♀"
                                          : "Młody",
                                    icon: Award,
                                  },
                                  {
                                    label: "Ubarwienie",
                                    value: dAuction.pigeon?.pigeonColor,
                                    icon: Sparkles,
                                  },
                                  {
                                    label: "Oko",
                                    value: dAuction.pigeon?.eyeColor,
                                    icon: Eye,
                                  },
                                  {
                                    label: "Budowa",
                                    value: dAuction.pigeon?.construction,
                                    icon: Layers,
                                  },
                                  {
                                    label: "Witalność",
                                    value: dAuction.pigeon?.vitality,
                                    icon: Activity,
                                  },
                                  {
                                    label: "Przeznaczenie",
                                    value: dAuction.pigeon?.purpose,
                                    icon: Target,
                                  },
                                  {
                                    label: "Wytrzymałość",
                                    value: dAuction.pigeon?.endurance,
                                    icon: Zap,
                                  },
                                  {
                                    label: "Mięśnie",
                                    value: dAuction.pigeon?.muscles,
                                    icon: Trophy,
                                  },
                                ].map((spec, i) =>
                                  spec.value ? (
                                    <div key={i} className="p-6 bg-black/40 hover:bg-black/60 transition-all duration-300 group/spec">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-1.5">
                                          <spec.icon className="w-3.5 h-3.5 text-amber-400 opacity-80 group-hover/spec:opacity-100 group-hover/spec:scale-110 transition-all" />
                                          <p className="text-[10px] text-amber-400 uppercase tracking-[0.2em] font-black">
                                            {spec.label}
                                          </p>
                                        </div>
                                        {spec.badge && (
                                          <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(66,192,206,0.3)]">
                                            {spec.badge}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-sm text-white font-black tracking-wide group-hover/spec:text-amber-200 transition-colors">
                                        {spec.value}
                                      </p>
                                    </div>
                                  ) : null,
                                )
                              ) : (
                                <div className="p-6 col-span-full bg-black/40">
                                  <p className="text-[10px] text-amber-400 uppercase tracking-[0.2em] font-black mb-1.5">
                                    Kategoria
                                  </p>
                                  <p className="text-base text-white font-bold">
                                    {formatCategory(dAuction.category)}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Pigeon Performance & Vitality Radar Bar */}
                            {isPigeon && (
                              <div className="p-8 border-t-2 border-[#42C0CE]/40 bg-black/40 backdrop-blur-md space-y-4">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-[#42C0CE] text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-[#42C0CE]" />
                                    Profil Zdolności Lotowych & Genetyki
                                  </h4>
                                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase tracking-widest shadow-[0_0_10px_rgba(66,192,206,0.3)]">Klasa S+</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {[
                                    { label: "Witalność & Kondycja", pct: 98 },
                                    { label: "Elastyczność Skrzydeł", pct: 95 },
                                    { label: "Gęstość & Sprężystość Mięśni", pct: 94 },
                                    { label: "Instynkt Nawigacyjny", pct: 99 },
                                  ].map((stat, sIdx) => (
                                    <div key={sIdx} className="space-y-1.5">
                                      <div className="flex justify-between text-xs font-bold text-white/90">
                                        <span>{stat.label}</span>
                                        <span className="text-[#42C0CE] font-black">{stat.pct}%</span>
                                      </div>
                                      <div className="h-2 w-full rounded-full bg-black/60 overflow-hidden p-0.5 border border-[#42C0CE]/40">
                                        <motion.div
                                          initial={{ width: 0 }}
                                          animate={{ width: `${stat.pct}%` }}
                                          transition={{ duration: 1, delay: sIdx * 0.1 }}
                                          className="h-full rounded-full bg-gradient-to-r from-[#42C0CE]/70 via-[#42C0CE] to-cyan-200 shadow-[0_0_12px_#42C0CE]"
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {dAuction.description && (
                              <div className="p-8 border-t-2 border-[#42C0CE]/40 bg-black/30 backdrop-blur-md">
                                <div className="text-white/80 leading-relaxed whitespace-pre-wrap font-sans text-base">
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
                                className={`flex items-center justify-between p-5 rounded-2xl transition-all duration-500 border-2 ${bidx === 0 ? "bg-cyan-500/15 border-cyan-400 shadow-[0_0_25px_rgba(66,192,206,0.35)]" : "bg-black/30 border-[#A68E4E]/30 hover:border-[#A68E4E]"}`}
                              >
                                <div className="flex items-center gap-5">
                                  <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center border ${bidx === 0 ? "border-cyan-400 bg-cyan-400/20 shadow-[0_0_15px_rgba(66,192,206,0.5)]" : "border-white/10 bg-white/10"}`}
                                  >
                                    {bidx === 0 ? (
                                      <Crown className="w-5 h-5 text-amber-400" />
                                    ) : (
                                      <span className="text-xs font-black text-white/30">
                                        #{dAuction.bids.length - bidx}
                                      </span>
                                    )}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p
                                        className={`text-base font-black ${bidx === 0 ? "text-cyan-300" : "text-white/80"}`}
                                      >
                                        {bid?.bidder?.username || "Anonimowy"}
                                      </p>
                                      {bidx === 0 && (
                                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                          Lider Aukcji
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-cyan-200/50 uppercase tracking-widest font-bold mt-0.5">
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
                                    className={`text-xl font-black ${bidx === 0 ? "text-[#42C0CE]" : "text-white"}`}
                                  >
                                    {bid.amount
                                      ? bid.amount.toLocaleString("pl-PL")
                                      : "0"}
                                    <span className="text-[10px] ml-1.5 opacity-60 font-bold tracking-tighter text-[#42C0CE]">
                                      PLN
                                    </span>
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="py-24 text-center bg-[#08232e]/60 rounded-[3rem] border border-dashed border-[#42C0CE]/30">
                              <Gavel className="w-16 h-16 text-[#42C0CE]/20 mx-auto mb-6" />
                              <p className="text-cyan-200/60 text-base font-bold">
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
                              className="group flex items-center justify-between p-6 bg-[#08232e]/80 border border-[#42C0CE]/30 rounded-2xl hover:bg-[#0c3140] hover:border-[#42C0CE] transition-all duration-500"
                            >
                              <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-xl bg-[#42C0CE]/10 flex items-center justify-center border border-[#42C0CE]/20 group-hover:bg-[#42C0CE]/30 group-hover:border-[#42C0CE] transition-all duration-500">
                                  <Sparkles className="w-6 h-6 text-[#42C0CE]" />
                                </div>
                                <div>
                                  <p className="text-xs text-white font-black uppercase tracking-widest mb-1">
                                    Dokument #{idx + 1}
                                  </p>
                                  <p className="text-[10px] text-cyan-200/50 truncate max-w-[200px]">
                                    {doc.split("/").pop()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-[9px] font-black text-[#03141b] uppercase tracking-widest px-5 py-2.5 bg-[#42C0CE] rounded-lg group-hover:bg-white transition-all duration-500">
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
        title={displayAuction?.title || ""}
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
