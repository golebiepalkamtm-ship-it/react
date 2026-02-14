import { useEffect, useMemo, useState, useRef, memo } from "react";
import type { CSSProperties } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Gavel, Heart, Clock, TrendingUp } from "lucide-react";
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
  image?: string;
  currentBid?: number;
  startingPrice?: number;
  buyNowPrice?: number;
  endTime?: string;
  ringNumber?: string;
  gender?: string;
  color?: string;
  category?: string;
  location?: string;
  watchCount?: number;
  viewsCount?: number;
  bidsCount?: number;
  featured?: boolean;
  imageFit?: "cover" | "contain";
  highlight?: boolean;
  nowMs?: number;
};

const formatNumber = (value?: number, suffix = "zł") => {
  if (typeof value !== "number") return "—";
  return `${value.toLocaleString("pl-PL")} ${suffix}`.trim();
};

export const UnifiedAuctionCard = ({
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

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [80, 0, -80]);
  const scale = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    [0.9, 1, 1, 0.9],
  );

  // Enhanced 3D effect - constant depth based on mouse position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const z = useSpring(useTransform(mouseY, [-0.5, 0.5], [25, -25]), {
    stiffness: 400,
    damping: 30,
  });

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), {
    stiffness: 400,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), {
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

  // GSAP animations on mount
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    // Initial animation matching PressArticleCard
    gsap.fromTo(
      card,
      {
        opacity: 0,
        y: 100,
        rotateX: 10,
        scale: 0.9,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        clearProps: "all", // Important: clear GSAP styles after animation to let Framer Motion take over
      },
    );

    return () => {};
  }, []);

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
  const hasBidding =
    typeof startingPrice === "number" && startingPrice !== null;

  const ringBadge = isPigeon ? ringNumber : null;

  const specBadges = useMemo(() => {
    const badges: string[] = [];
    if (isPigeon && gender) {
      const g = gender.toLowerCase();
      badges.push(g === "female" ? "Samica" : g === "male" ? "Samiec" : gender);
    }
    if (isPigeon && color) badges.push(color);
    if (category) badges.push(category);
    return badges.slice(0, 3);
  }, [gender, color, category, isPigeon]);

  const displayTitle = useMemo(() => {
    if (!title) return "—";
    return title.length > 40 ? `${title.slice(0, 40)}…` : title;
  }, [title]);

  const imgSrc = useMemo(() => {
    const trimmed = (image || "").trim();
    if (!trimmed) return AUCTION_PLACEHOLDER_SRC;
    return trimmed.includes("placeholder") ? AUCTION_PLACEHOLDER_SRC : trimmed;
  }, [image]);

  const imageObjectClass = useMemo(() => {
    return imageFit === "contain" ? "object-contain bg-black" : "object-cover";
  }, [imageFit]);

  // Dynamic card styling based on status
  const cardStyles = useMemo(() => {
    if (timeMeta.ended) {
      return {
        gradient:
          "radial-gradient(circle at top, rgba(255,255,255,0.08) 0%, transparent 35%), linear-gradient(165deg, #000000 0%, #030308 55%, #080b12 100%)",
        border: "transparent",
        glow: "none",
      };
    }
    if (timeMeta.endingSoon) {
      return {
        gradient:
          "radial-gradient(circle at top, rgba(255,125,125,0.06) 0%, transparent 35%), linear-gradient(165deg, #000000 0%, #080103 55%, #150205 100%)",
        border: "transparent",
        glow: "none",
      };
    }
    if (featured || highlight) {
      return {
        gradient:
          "radial-gradient(circle at top, rgba(100,150,255,0.06) 0%, transparent 35%), linear-gradient(165deg, #000000 0%, #01050e 55%, #020a16 100%)",
        border: "transparent",
        glow: "none",
      };
    }
    return {
      gradient:
        "radial-gradient(circle at top, rgba(64,195,210,0.06) 0%, transparent 35%), linear-gradient(165deg, #000000 0%, #01060a 55%, #021216 100%)",
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
      className="auction-card-shell group relative mx-auto flex h-auto min-h-[580px] w-full flex-col overflow-hidden rounded-2xl border cursor-pointer"
      style={{
        transformStyle: "preserve-3d",
        z,
        opacity,
        y,
        scale,
        rotateX,
        rotateY,
        backgroundImage: cardStyles.gradient,
        borderColor: cardStyles.border,
        borderWidth: "2px",
        boxShadow: cardStyles.glow,
      }}
      whileHover={{}}
      onMouseEnter={() => setIsHovered(true)}
    >
      {/* Inner container for 3D parallax effect */}
      <div
        className="auction-card-inner relative h-full w-full"
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Decorative gold lines */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold/50 to-transparent pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold/50 to-transparent pointer-events-none rounded-full" />
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-gold/50 to-transparent pointer-events-none rounded-full" />
        <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-gold/50 to-transparent pointer-events-none rounded-full" />

        {/* Status badge */}
        {(timeMeta.endingSoon || featured || timeMeta.ended) && (
          <div className="absolute left-4 top-4 z-20 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md border transition-all">
            {timeMeta.ended ? (
              <div className="flex mt-2">
                <span className="font-mono text-[11px] tracking-wider text-gold rounded-xl border border-gold/30 bg-gold/10 px-3 py-1 uppercase font-semibold">
                  {ringBadge}
                </span>
              </div>
            ) : timeMeta.endingSoon ? (
              <>
                <Clock className="h-3 w-3 text-red-400 animate-pulse" />
                <span className="text-red-200 bg-red-950/60 border-red-500/40 px-2 py-0.5 rounded-full">
                  Kończy się!
                </span>
              </>
            ) : featured ? (
              <>
                <TrendingUp className="h-3 w-3 text-gold" />
                <span className="text-gold bg-gold/10 border-gold/40 px-2 py-0.5 rounded-full">
                  Wyróżniona
                </span>
              </>
            ) : null}
          </div>
        )}

        {/* Like button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 backdrop-blur-md border border-white/10 transition-all hover:scale-110 hover:bg-black/70 active:scale-95"
        >
          <Heart
            className={`h-4 w-4 transition-all duration-300 ${isLiked ? "fill-red-500 text-red-500 scale-110" : "text-white/70 hover:text-white"}`}
          />
        </button>

        {/* Image section */}
        <div
          className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-gray-900 to-black"
          style={{ transformStyle: "preserve-3d" }}
        >
          <AuctionImage
            src={imgSrc}
            alt={title}
            className={`w-full h-full ${imageObjectClass} transition-all duration-700`}
            style={{
              transform: "scale(1) translateZ(0px)",
            }}
            onError={(e) => {
              const t = e.currentTarget as HTMLImageElement;
              if (t.src !== AUCTION_PLACEHOLDER_SRC)
                t.src = AUCTION_PLACEHOLDER_SRC;
            }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
        </div>

        {/* Content section */}
        <div className="flex flex-1 flex-col gap-2 px-6 pb-6 pt-4 bg-transparent backdrop-blur-sm">
          {/* Gold guide line under photo */}
          <div className="-mt-4 mb-3" style={GOLD_LINE_BASE_STYLE} />

          {/* Ring number badge above title */}
          {ringBadge && (
            <div className="flex mt-2">
              <span className="font-mono text-[11px] tracking-wider text-gold rounded-xl border border-gold/30 bg-gold/10 px-3 py-1 uppercase font-semibold">
                {ringBadge}
              </span>
            </div>
          )}

          {/* Title */}
          <h3
            className="font-display text-xl font-bold text-white leading-tight tracking-tight line-clamp-2"
            style={{ transform: "translateZ(30px)" }}
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
              <p className="text-[10px] uppercase tracking-[0.15em] text-white/50 mb-1.5 font-medium">
                Aktualna cena
              </p>
              <p className="font-display text-2xl font-bold text-gold drop-shadow-lg">
                {formatNumber(currentBid)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/50">
                <span className="font-semibold text-white/70">{bidsCount}</span>{" "}
                {bidsCount === 1 ? "oferta" : "ofert"}
              </p>
            </div>
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
                  <Button
                    variant="premiumGold"
                    className="w-full h-11 text-sm font-semibold shadow-lg hover:shadow-gold/30 transition-all rounded-xl"
                  >
                    Kup Teraz
                  </Button>
                </Link>
                <Link
                  to={`/auctions/${id}#bid`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1"
                >
                  <Button
                    variant="graphite"
                    className="w-full h-11 text-sm font-semibold rounded-xl"
                  >
                    <Gavel className="h-4 w-4 mr-1.5" /> Licytuj
                  </Button>
                </Link>
              </div>
            ) : hasBuyNow ? (
              <Link
                to={`/auctions/${id}?mode=buy-now`}
                onClick={(e) => e.stopPropagation()}
                className="w-full"
              >
                <Button
                  variant="premiumGold"
                  className="w-full h-12 text-sm font-semibold shadow-lg hover:shadow-gold/30 transition-all rounded-xl"
                >
                  Kup Teraz
                </Button>
              </Link>
            ) : hasBidding ? (
              <Link
                to={`/auctions/${id}#bid`}
                onClick={(e) => e.stopPropagation()}
                className="w-full"
              >
                <Button
                  variant="graphite"
                  className="w-full h-12 text-sm font-semibold rounded-xl"
                >
                  <Gavel className="h-4 w-4 mr-2" /> Licytuj Teraz
                </Button>
              </Link>
            ) : (
              <Link
                to={`/auctions/${id}`}
                onClick={(e) => e.stopPropagation()}
                className="w-full"
              >
                <Button
                  variant="outline"
                  className="w-full h-12 text-sm font-semibold bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30 transition-all rounded-xl"
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
};

export default UnifiedAuctionCard;
