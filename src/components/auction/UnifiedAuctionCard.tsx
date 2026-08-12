import { useEffect, useMemo, useState, useRef, memo, useCallback } from "react";
import type { CSSProperties } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Gavel,
  Heart,
  Clock,
  TrendingUp,
  Eye,
  Tag,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  useScroll,
} from "framer-motion";
import { gsap } from "@/lib/gsapConfig";
import { CardTimer } from "./CardTimer";
import { formatCategory } from "@/utils/auction";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

const AuctionImage = memo(
  ({
    src,
    alt,
    className,
    onError,
    style,
  }: {
    src: string;
    alt: string;
    className: string;
    onError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
    style?: React.CSSProperties;
  }) => (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      onError={onError}
      style={style}
    />
  ),
);
AuctionImage.displayName = "AuctionImage";

const AUCTION_PLACEHOLDER_SRC = "/placeholder.svg";

const GOLD_LINE_BASE_STYLE: CSSProperties = {
  height: "4px",
  width: "100%",
  borderRadius: "999px",
  background:
    "linear-gradient(90deg, transparent 0%, rgba(255,215,128,0.2) 8%, rgba(255,215,128,0.95) 50%, rgba(255,215,128,0.2) 92%, transparent 100%)",
  clipPath: "polygon(0% 50%, 7% 0%, 93% 0%, 100% 50%, 93% 100%, 7% 100%)",
  boxShadow: "0 0 22px rgba(255, 215, 128, 0.35)",
  pointerEvents: "none",
};

type UnifiedAuctionCardProps = {
  id: string;
  title: string;
  image?: string | undefined;
  currentBid?: number | undefined;
  startingPrice?: number | undefined;
  buyNowPrice?: number | undefined;
  endTime?: string | undefined;
  ringNumber?: string | undefined;
  gender?: string | undefined;
  color?: string | undefined;
  category?: string | undefined;
  location?: string | undefined;
  watchCount?: number | undefined;
  viewsCount?: number | undefined;
  bidsCount?: number | undefined;
  featured?: boolean | undefined;
  imageFit?: "cover" | "contain" | undefined;
  highlight?: boolean | undefined;
  nowMs?: number | undefined;
};

const CONTENT_BACKGROUND =
  "radial-gradient(circle at top, rgba(66, 192, 206, 0.25), transparent 60%), linear-gradient(185deg, rgba(15, 23, 42, 0.88) 0%, rgba(30, 41, 59, 0.85) 45%, rgba(15, 23, 42, 0.92) 100%)";

const formatNumber = (value?: number, suffix = "zł") => {
  if (typeof value !== "number") return "—";
  return `${value.toLocaleString("pl-PL")} ${suffix}`.trim();
};

export const UnifiedAuctionCard = memo(
  ({
    id,
    title,
    image,
    currentBid,
    startingPrice,
    buyNowPrice,
    endTime,
    ringNumber,
    gender,
    color,
    category,
    bidsCount = 0,
    featured = false,
    imageFit = "contain",
    highlight = false,
    nowMs,
    viewsCount = 0,
  }: UnifiedAuctionCardProps) => {
    const navigate = useNavigate();
    const [isLiked, setIsLiked] = useState(false);

    // Use passed nowMs for stable, low-frequency updates (e.g. every minute)
    // avoiding 1Hz re-renders of the entire card
    const [initialNow] = useState(() => Date.now());
    const referenceTime = typeof nowMs === "number" ? nowMs : initialNow;

    const cardRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    const [isHovered, setIsHovered] = useState(false);

    // const { scrollYProgress } = useScroll({
    //   target: cardRef,
    //   offset: ["start end", "end start"],
    // });

    // const opacity = useTransform(
    //   scrollYProgress,
    //   [0, 0.2, 0.8, 1],
    //   [0, 1, 1, 0],
    // );
    // const y = useTransform(scrollYProgress, [0, 0.5, 1], [80, 0, -80]);
    // const scale = useTransform(
    //   scrollYProgress,
    //   [0, 0.3, 0.7, 1],
    //   [0.9, 1, 1, 0.9],
    // );

    // Enhanced 3D effect - constant depth based on mouse position
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const z = useSpring(useTransform(mouseY, [-0.5, 0.5], [25, -25]), {
      stiffness: 400,
      damping: 30,
    });

    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [-15, 15]), {
      stiffness: 400,
      damping: 30,
    });
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [15, -15]), {
      stiffness: 400,
      damping: 30,
    });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      const card = cardRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      mouseX.set(x);
      mouseY.set(y);
      card.style.setProperty("--mouse-x", `${(x + 0.5) * 100}%`);
      card.style.setProperty("--mouse-y", `${(y + 0.5) * 100}%`);
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      mouseX.set(0);
      mouseY.set(0);
      setIsHovered(false);
    };

    // GSAP animations on mount disabled for performance
    /*
    useEffect(() => {
      const card = cardRef.current;
      if (!card) return;

      gsap.fromTo(
        card,
        {
          opacity: 0,
          y: 100,
          scale: 0.9,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          clearProps: "all",
        },
      );

      return () => {};
    }, []);
    */

    // Removed internal timer effect to prevent re-renders.
    // Timer precision is handled by isolated CardTimer component.

    const timeMeta = useMemo(() => {
      if (!endTime) {
        return { ended: false, endingSoon: false };
      }
      const end = new Date(endTime).getTime();
      const diff = Math.max(end - referenceTime, 0);

      return {
        ended: diff === 0,
        endingSoon: diff > 0 && diff < 3600000,
      };
    }, [endTime, referenceTime]);

    const isPigeon = useMemo(() => {
      const cat = (category || "").toUpperCase();
      return !cat.includes("SUPPLEMENT") && !cat.includes("ACCESSOR");
    }, [category]);

    const hasBuyNow = typeof buyNowPrice === "number" && buyNowPrice > 0;
    const hasBidding = startingPrice !== undefined && startingPrice !== null;

    const ringBadge = isPigeon ? ringNumber : null;

    const specBadges = useMemo(() => {
      const badges: string[] = [];
      if (isPigeon && gender) {
        const g = gender.toLowerCase();
        badges.push(
          g === "female" ? "Samica" : g === "male" ? "Samiec" : gender,
        );
      }
      if (isPigeon && color) badges.push(color);
      if (category) badges.push(formatCategory(category));
      return badges.slice(0, 3);
    }, [gender, color, category, isPigeon]);

    const displayTitle = useMemo(() => {
      if (!title) return "—";
      return title.length > 40 ? `${title.slice(0, 40)}…` : title;
    }, [title]);

    const imgSrc = useMemo(() => {
      const trimmed = (image || "").trim();
      if (!trimmed) return AUCTION_PLACEHOLDER_SRC;
      return trimmed.includes("placeholder")
        ? AUCTION_PLACEHOLDER_SRC
        : trimmed;
    }, [image]);

    const imageObjectClass = useMemo(() => {
      return imageFit === "contain"
        ? "object-contain w-full h-full"
        : "object-cover w-full h-full";
    }, [imageFit]);

    const handleImageError = useCallback(
      (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const t = e.currentTarget as HTMLImageElement;
        if (t.src !== AUCTION_PLACEHOLDER_SRC) {
          t.src = AUCTION_PLACEHOLDER_SRC;
        }
      },
      [],
    );

    // Dynamic card styling based on status
    const cardStyles = useMemo(() => {
      if (timeMeta.ended) {
        return {
          gradient:
            "radial-gradient(circle at top, rgba(255,255,255,0.08) 0%, transparent 35%), linear-gradient(165deg, #000000 0%, #030308 55%, #080b12 100%)",
          base: "#010104",
          border: "transparent",
          glow: "none",
        };
      }
      if (timeMeta.endingSoon) {
        return {
          gradient:
            "radial-gradient(circle at top, rgba(255,125,125,0.06) 0%, transparent 35%), linear-gradient(165deg, #000000 0%, #080103 55%, #150205 100%)",
          base: "#040003",
          border: "transparent",
          glow: "none",
        };
      }
      if (featured || highlight) {
        return {
          gradient:
            "radial-gradient(circle at top, rgba(100,150,255,0.06) 0%, transparent 35%), linear-gradient(165deg, #000000 0%, #01050e 55%, #020a16 100%)",
          base: "#01030a",
          border: "transparent",
          glow: "none",
        };
      }
      return {
        gradient: CONTENT_BACKGROUND,
        base: "rgba(15, 23, 42, 0.88)",
        border: "transparent",
        glow: "none",
      };
    }, [timeMeta.ended, timeMeta.endingSoon, featured, highlight]);

    return (
      <motion.article
        ref={cardRef}
        data-auction-card
        role="button"
        tabIndex={0}
        onClick={() => navigate(`/auctions/${id}`)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            navigate(`/auctions/${id}`);
          }
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="auction-card-shell group relative mx-auto flex h-auto min-h-[580px] w-full flex-col overflow-hidden rounded-2xl cursor-pointer"
        style={{
          backgroundImage: cardStyles.gradient,
          backgroundColor: cardStyles.base,
          border: "2px solid",
          borderColor: "rgba(166,142,78,0.7)",
          boxShadow:
            "0 0 12px rgba(166,142,78,0.25), 0 0 30px rgba(166,142,78,0.1), inset 0 0 0 1px rgba(166,142,78,0.08)",
        }}
        onMouseEnter={() => setIsHovered(true)}
      >
        {/* Dynamic spotlight background overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl z-10"
          style={{
            background: `radial-gradient(500px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(212, 175, 55, 0.16), transparent 60%)`,
          }}
        />

        {/* Inner container for 3D parallax effect */}
        <div
          className="auction-card-inner relative h-full w-full flex flex-col"
          // style={{ transformStyle: "preserve-3d" }} // Disabled to prevent blur
        >
          {/* Decorative gold lines */}
          <div className="absolute top-0 left-0 right-0 h-[6px] bg-gradient-to-r from-transparent via-gold/50 to-transparent pointer-events-none rounded-full" />
          <div className="absolute bottom-0 left-0 right-0 h-[6px] bg-gradient-to-r from-transparent via-gold/50 to-transparent pointer-events-none rounded-full" />
          <div className="absolute left-0 top-0 bottom-0 w-[6px] bg-gradient-to-b from-transparent via-gold/50 to-transparent pointer-events-none rounded-full" />
          <div className="absolute right-0 top-0 bottom-0 w-[6px] bg-gradient-to-b from-transparent via-gold/50 to-transparent pointer-events-none rounded-full" />

          {/* Status badge - Priority statuses */}
          {timeMeta.endingSoon || featured || timeMeta.ended ? (
            <div
              className="absolute left-4 top-4 z-20 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all"
              style={{
                background: "#A68E4E",
                color: "#000000",
                boxShadow: "0 2px 12px rgba(166,142,78,0.5)",
                border: "1px solid rgba(166,142,78,0.8)",
              }}
            >
              {timeMeta.ended ? (
                <div className="flex">
                  <span className="font-mono text-[11px] tracking-wider font-bold text-black">
                    {ringBadge ?? "Zakończona"}
                  </span>
                </div>
              ) : timeMeta.endingSoon ? (
                <>
                  <Clock className="h-3 w-3 text-black animate-pulse" />
                  <span className="text-black font-bold">Kończy się!</span>
                </>
              ) : (
                <>
                  <TrendingUp className="h-3 w-3 text-black" />
                  <span className="text-black font-bold">Wyróżniona</span>
                </>
              )}
            </div>
          ) : (
            /* Type identification badge when no main statuses are active */
            <div
              className="absolute left-4 top-4 z-20 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all"
              style={{
                background: "#A68E4E",
                color: "#000000",
                boxShadow: "0 2px 12px rgba(166,142,78,0.5)",
                border: "1px solid rgba(166,142,78,0.8)",
              }}
            >
              {!hasBidding && hasBuyNow ? (
                <>
                  <Tag className="h-3 w-3 text-black" />
                  <span className="text-black font-bold">Tylko Kup Teraz</span>
                </>
              ) : hasBidding && !hasBuyNow ? (
                <>
                  <Gavel className="h-3 w-3 text-black" />
                  <span className="text-black font-bold">Tylko Licytacja</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3 text-black" />
                  <span className="text-black font-bold">Pełna Aukcja</span>
                </>
              )}
            </div>
          )}

          {/* Like button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLiked(!isLiked);
                }}
                className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 backdrop-blur-md border border-white/10 transition-all hover:scale-110 hover:bg-black/70 active:scale-95 cursor-pointer"
              >
                <Heart
                  className={`h-4 w-4 transition-all duration-300 ${isLiked ? "fill-red-500 text-red-500 scale-110" : "text-white/70 hover:text-white"}`}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-[#020a13] border border-[#A68E4E]/50 text-[#A68E4E] text-xs">
              {isLiked ? "Usuń tę aukcję z obserwowanych" : "Zapisz tę aukcję do obserwowanych"}
            </TooltipContent>
          </Tooltip>

          {/* Image section */}
          <div
            className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-gray-900 to-black"
          >
            <AuctionImage
              src={imgSrc}
              alt={title}
              className={`w-full h-full ${imageObjectClass} duration-700 ease-in-out origin-center`}
              onError={handleImageError}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
          </div>

          {/* Content section */}
          <div
            className="flex flex-1 flex-col gap-2 px-6 pb-6 pt-4 bg-transparent backdrop-blur-2xl relative overflow-hidden"
            style={{
              backgroundImage: CONTENT_BACKGROUND,
              backgroundColor: "rgba(15, 23, 42, 0.88)",
              backgroundBlendMode: "normal",
            }}
          >
            {/* Views Counter - Top Right */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute right-4 top-4 flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm z-10 transition-all hover:bg-white/10 group/views cursor-help">
                  <Eye className="w-3.5 h-3.5 text-white/50 group-hover/views:text-gold transition-colors" />
                  <span className="text-[11px] font-medium text-white/60 tracking-tight">
                    {viewsCount.toLocaleString()}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-[#020a13] border border-[#A68E4E]/50 text-[#A68E4E] text-xs">
                Liczba wyświetleń tej aukcji
              </TooltipContent>
            </Tooltip>

            {/* Gold guide line under photo */}
            <div className="-mt-4 mb-3" style={GOLD_LINE_BASE_STYLE} />

            {/* Ring number badge above title */}
            <div className="flex mt-2">
              {ringBadge ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="font-mono text-[11px] tracking-wider text-[#A68E4E] rounded-xl border border-[#A68E4E]/30 bg-[#A68E4E]/10 px-3 py-1 uppercase font-semibold cursor-help">
                      {ringBadge}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-[#020a13] border border-[#A68E4E]/50 text-[#A68E4E] text-xs">
                    Oficjalny numer obrączki rodowodowej ptaka
                  </TooltipContent>
                </Tooltip>
              ) : (
                <span className="font-mono text-[11px] tracking-wider text-transparent rounded-xl border border-transparent px-3 py-1 uppercase font-semibold invisible">
                  PLACEHOLDER
                </span>
              )}
            </div>

            {/* Title */}
            <h3
              className="font-display text-xl font-bold text-white leading-tight tracking-tight line-clamp-2"
            >
              {displayTitle}
            </h3>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {specBadges.map((badge) => (
                <span
                  key={`${id}-${badge}`}
                  className="text-[10px] uppercase tracking-wider text-white/60 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1"
                >
                  {badge}
                </span>
              ))}
            </div>

            {/* Gold guide line above timer */}
            <div style={GOLD_LINE_BASE_STYLE} />

            {/* Timer */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.15em] text-white/50 font-medium">
                Pozostało czasu
              </p>
              <div className="w-full">
                <CardTimer
                  endTime={endTime}
                  className="w-full gap-2"
                  endingSoon={timeMeta.endingSoon}
                />
              </div>
            </div>

            {/* Gold guide line above price */}
            <div style={GOLD_LINE_BASE_STYLE} />

            {/* Price and bids */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] mb-1.5 font-medium flex items-center gap-1.5 text-[#A68E4E]">
                  {hasBidding ? (
                    <>
                      <Gavel className="w-3 h-3 opacity-80" />
                      <span>Aktualna cena</span>
                    </>
                  ) : (
                    <>
                      <Tag className="w-3 h-3 opacity-80" />
                      <span>Cena Kup Teraz</span>
                    </>
                  )}
                </p>
                <p className="font-display text-2xl font-bold drop-shadow-lg text-[#A68E4E]">
                  {formatNumber(hasBidding ? currentBid : buyNowPrice)}
                </p>
                {hasBidding && hasBuyNow && (
                  <p className="text-[9px] text-white/40 mt-1">
                    Kup Teraz:{" "}
                    <span className="text-white/60">
                      {formatNumber(buyNowPrice)}
                    </span>
                  </p>
                )}
              </div>
              {hasBidding && (
                <div className="text-right">
                  <p className="text-xs text-white/50">
                    <span className="font-semibold text-white/70">
                      {bidsCount}
                    </span>{" "}
                    {bidsCount === 1 ? "oferta" : "ofert"}
                  </p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="mt-auto flex flex-col gap-2">
              {hasBuyNow && hasBidding ? (
                <div className="flex gap-2">
                  <Link
                    to={`/auctions/${id}?mode=buy-now`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1"
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          className="w-full h-11 text-sm font-semibold shadow-lg hover:shadow-gold/30 transition-all rounded-xl gold-button text-zinc-950 hover:bg-gold/90 border-0"
                          style={{
                            backgroundImage:
                              "linear-gradient(135deg, rgba(166,142,78,0.9), rgba(166,142,78,0.8))",
                            color: "#0f0f0f",
                          }}
                        >
                          Kup Teraz
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="bg-[#020a13] border border-[#A68E4E]/50 text-[#A68E4E] text-xs">
                        Kup natychmiast bez czekania na koniec licytacji
                      </TooltipContent>
                    </Tooltip>
                  </Link>
                  <Link
                    to={`/auctions/${id}#bid`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1"
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="graphite"
                          className="w-full h-11 text-sm font-semibold rounded-xl"
                        >
                          <Gavel className="h-4 w-4 mr-1.5" /> Licytuj
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="bg-[#020a13] border border-[#A68E4E]/50 text-[#A68E4E] text-xs">
                        Złóż ofertę przebicia ceny w tej aukcji
                      </TooltipContent>
                    </Tooltip>
                  </Link>
                </div>
              ) : hasBuyNow ? (
                <Link
                  to={`/auctions/${id}?mode=buy-now`}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="w-full h-11 text-sm font-semibold shadow-lg hover:shadow-gold/30 transition-all rounded-xl gold-button text-zinc-950 hover:bg-gold/90 border-0"
                        style={{
                          backgroundImage:
                            "linear-gradient(135deg, rgba(166,142,78,0.9), rgba(166,142,78,0.8))",
                          color: "#0f0f0f",
                        }}
                      >
                        Kup Teraz — {formatNumber(buyNowPrice)}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-[#020a13] border border-[#A68E4E]/50 text-[#A68E4E] text-xs">
                      Szybki zakup bez rywalizacji w licytacji
                    </TooltipContent>
                  </Tooltip>
                </Link>
              ) : hasBidding ? (
                <Link
                  to={`/auctions/${id}#bid`}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="w-full h-11 text-sm font-semibold rounded-xl gold-button text-zinc-950 hover:bg-gold/90 border-0"
                        style={{
                          backgroundImage:
                            "linear-gradient(135deg, rgba(166,142,78,0.9), rgba(166,142,78,0.8))",
                          color: "#0f0f0f",
                        }}
                      >
                        <Gavel className="h-4 w-4 mr-2" /> Licytuj Teraz
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-[#020a13] border border-[#A68E4E]/50 text-[#A68E4E] text-xs">
                      Otwórz kartę licytacji tej aukcji
                    </TooltipContent>
                  </Tooltip>
                </Link>
              ) : (
                <Link
                  to={`/auctions/${id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    className="w-full h-12 text-sm font-semibold rounded-xl gold-button text-zinc-950 hover:bg-gold/90 border-0"
                    style={{
                      backgroundImage:
                        "linear-gradient(135deg, rgba(166,142,78,0.9), rgba(166,142,78,0.8))",
                      color: "#0f0f0f",
                    }}
                  >
                    Zobacz Szczegóły
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.article>
    );
  },
);

export default UnifiedAuctionCard;
