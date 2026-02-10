import { useEffect, useMemo, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Gavel, Heart, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { gsap } from "@/lib/gsapConfig";

const AUCTION_PLACEHOLDER_SRC = "/placeholder.svg";

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
  imageFit = "cover",
  highlight = false,
  nowMs,
}: UnifiedAuctionCardProps) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [referenceNow, setReferenceNow] = useState(() =>
    typeof nowMs === "number" ? nowMs : Date.now(),
  );

  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  // Subtle 3D effect with reduced rotation
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), { stiffness: 200, damping: 25 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), { stiffness: 200, damping: 25 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
    card.style.setProperty('--mouse-x', `${(x + 0.5) * 100}%`);
    card.style.setProperty('--mouse-y', `${(y + 0.5) * 100}%`);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // GSAP animations on mount
  useEffect(() => {
    const card = cardRef.current;
    const glow = glowRef.current;

    if (!card) return;

    // Initial animation
    gsap.fromTo(
      card,
      { 
        opacity: 0, 
        y: 30,
        scale: 0.95
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: "power2.out",
      }
    );

    // Glow effect on hover
    const handleMouseEnter = () => {
      if (glow) {
        gsap.to(glow, {
          opacity: 0.6,
          duration: 0.4,
          ease: "power2.out",
        });
      }
    };

    const handleMouseLeaveGsap = () => {
      if (glow) {
        gsap.to(glow, {
          opacity: 0,
          duration: 0.4,
          ease: "power2.out",
        });
      }
    };

    card.addEventListener("mouseenter", handleMouseEnter);
    card.addEventListener("mouseleave", handleMouseLeaveGsap);

    return () => {
      card.removeEventListener("mouseenter", handleMouseEnter);
      card.removeEventListener("mouseleave", handleMouseLeaveGsap);
    };
  }, []);

  useEffect(() => {
    if (!endTime) return undefined;

    const intervalId = window.setInterval(() => {
      setReferenceNow((previous) => previous + 10);
    }, 10);
    return () => window.clearInterval(intervalId);
  }, [endTime, nowMs]);

  const timeMeta = useMemo(() => {
    if (!endTime || referenceNow === 0) {
      return { days: "00", hours: "00", minutes: "00", seconds: "00", centiseconds: "00", ended: false, endingSoon: false };
    }
    const end = new Date(endTime).getTime();
    const diff = Math.max(end - referenceNow, 0);
    const days = Math.floor(diff / 86400000).toString().padStart(2, "0");
    const hours = Math.floor((diff % 86400000) / 3600000).toString().padStart(2, "0");
    const minutes = Math.floor((diff % 3600000) / 60000).toString().padStart(2, "0");
    const seconds = Math.floor((diff % 60000) / 1000).toString().padStart(2, "0");
    const centiseconds = Math.floor((diff % 1000) / 10).toString().padStart(2, "0");
    return {
      days,
      hours,
      minutes,
      seconds,
      centiseconds,
      ended: diff === 0,
      endingSoon: diff > 0 && diff < 3600000,
    };
  }, [endTime, referenceNow]);

  const isPigeon = useMemo(() => {
    const cat = (category || "").toUpperCase();
    return !cat.includes("SUPPLEMENT") && !cat.includes("ACCESSOR");
  }, [category]);

  const ringBadge = isPigeon ? ringNumber : null;

  const specBadges = useMemo(() => {
    const badges: string[] = [];
    if (isPigeon && gender) badges.push(gender === "female" ? "Samica" : gender === "male" ? "Samiec" : gender);
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
        gradient: "from-gray-900 via-gray-800 to-gray-900",
        border: "border-gray-600/40",
        glow: "shadow-gray-500/10",
      };
    }
    if (timeMeta.endingSoon) {
      return {
        gradient: "from-[#1a0a0a] via-[#3d1a1a] to-[#1a0a0a]",
        border: "border-red-500/60",
        glow: "shadow-red-500/30 shadow-2xl",
      };
    }
    if (featured || highlight) {
      return {
        gradient: "from-[#0f1729] via-[#1a2847] to-[#0f1729]",
        border: "border-gold/60",
        glow: "shadow-gold/30 shadow-2xl",
      };
    }
    return {
      gradient: "from-[#0B1D3A] via-[#0C3B52] to-[#0B1D3A]",
      border: "border-gold/30",
      glow: "shadow-gold/10",
    };
  }, [timeMeta.ended, timeMeta.endingSoon, featured, highlight]);

  return (
    <div className="h-full w-full" style={{ perspective: "1200px" }}>
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
        className={`group relative mx-auto flex h-auto min-h-[580px] w-full flex-col overflow-hidden rounded-2xl border-2 backdrop-blur-xl transition-all duration-500 cursor-pointer ${cardStyles.border} ${cardStyles.glow} bg-gradient-to-br ${cardStyles.gradient}`}
        style={{ 
          transformStyle: "preserve-3d",
          rotateX, 
          rotateY,
        }}
        whileHover={{ scale: 1.015 }}
        transition={{ scale: { duration: 0.3, ease: "easeOut" } }}
      >
        {/* Decorative gold lines */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold/50 to-transparent pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold/50 to-transparent pointer-events-none rounded-full" />
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-gold/50 to-transparent pointer-events-none rounded-full" />
        <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-gold/50 to-transparent pointer-events-none rounded-full" />
        
        {/* Subtle top border accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold/50 to-transparent pointer-events-none" />
        
        {/* Status badge */}
        {(timeMeta.endingSoon || featured || timeMeta.ended) && (
          <div className="absolute left-4 top-4 z-20 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md border transition-all">
            {timeMeta.ended ? (
              <>
                <div className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                <span className="text-gray-300 bg-gray-900/60 border-gray-600/40 px-2 py-0.5 rounded-full">Zakończona</span>
              </>
            ) : timeMeta.endingSoon ? (
              <>
                <Clock className="h-3 w-3 text-red-400 animate-pulse" />
                <span className="text-red-200 bg-red-950/60 border-red-500/40 px-2 py-0.5 rounded-full">Kończy się!</span>
              </>
            ) : featured ? (
              <>
                <TrendingUp className="h-3 w-3 text-gold" />
                <span className="text-gold bg-gold/10 border-gold/40 px-2 py-0.5 rounded-full">Wyróżniona</span>
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
        <div className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-gray-900 to-black">
          <img
            ref={imageRef}
            src={imgSrc}
            alt={title}
            loading="lazy"
            className={`w-full h-full ${imageObjectClass} transition-all duration-700`}
            onError={(e) => {
              const t = e.currentTarget as HTMLImageElement;
              if (t.src !== AUCTION_PLACEHOLDER_SRC) t.src = AUCTION_PLACEHOLDER_SRC;
            }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
          
          {/* Hover glow effect */}
          <div 
            ref={glowRef}
            className="absolute inset-0 opacity-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(212, 175, 55, 0.15), transparent 60%)`,
            }}
          />
        </div>

        {/* Content section */}
        <div className="flex flex-1 flex-col gap-2 px-6 pb-6 pt-5">
          {/* Ring number badge above title */}
          {ringBadge && (
            <div className="flex mt-2">
              <span className="font-mono text-[11px] tracking-wider text-gold rounded-xl border border-gold/30 bg-gold/10 px-3 py-1 uppercase font-semibold">
                {ringBadge}
              </span>
            </div>
          )}
          
          {/* Title */}
          <h3 className="font-display text-xl font-bold text-white leading-tight tracking-tight line-clamp-2">
            {displayTitle}
          </h3>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {specBadges.map((badge) => (
              <span key={`${id}-${badge}`} className="text-[10px] uppercase tracking-wider text-white/60 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1">
                {badge}
              </span>
            ))}
          </div>

          {/* Divider */}
          <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-gold/30 to-transparent rounded-full" />

          {/* Timer */}
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.15em] text-white/50 font-medium">Pozostało czasu</p>
            <div className="flex items-center justify-between gap-2">
              {["days", "hours", "minutes", "seconds", "centiseconds"].map((label, idx) => (
                <div key={label} className="flex flex-col items-center flex-1 bg-white/5 rounded-xl py-2 border border-white/10">
                  <span className={`text-lg font-bold leading-none transition-colors ${timeMeta.endingSoon ? 'text-red-400' : 'text-white'}`}>
                    {timeMeta.ended ? "00" : (timeMeta as any)[label]}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-white/40 mt-1">
                    {["Dni", "Godz", "Min", "Sek", "Cs"][idx]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-gold/30 to-transparent rounded-full" />

          {/* Price and bids */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-white/50 mb-1.5 font-medium">Aktualna cena</p>
              <p className="font-display text-2xl font-bold text-gold drop-shadow-lg">
                {formatNumber(currentBid)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/50">
                <span className="font-semibold text-white/70">{bidsCount}</span> {bidsCount === 1 ? 'oferta' : 'ofert'}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-auto flex flex-col gap-2">
            {typeof buyNowPrice === "number" && buyNowPrice > 0 ? (
              <div className="flex gap-2">
                <Link to={`/auctions/${id}?mode=buy-now`} onClick={(e) => e.stopPropagation()} className="flex-1">
                  <Button variant="premiumGold" className="w-full h-11 text-sm font-semibold shadow-lg hover:shadow-gold/30 transition-all rounded-xl">
                    Kup Teraz
                  </Button>
                </Link>
                <Link to={`/auctions/${id}#bid`} onClick={(e) => e.stopPropagation()} className="flex-1">
                  <Button variant="outline" className="w-full h-11 text-sm font-semibold bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30 transition-all rounded-xl">
                    <Gavel className="h-4 w-4 mr-1.5" /> Licytuj
                  </Button>
                </Link>
              </div>
            ) : (
              <Link to={`/auctions/${id}#bid`} onClick={(e) => e.stopPropagation()} className="w-full">
                <Button variant="premiumGold" className="w-full h-12 text-sm font-semibold shadow-lg hover:shadow-gold/30 transition-all rounded-xl">
                  <Gavel className="h-4 w-4 mr-2" /> Licytuj Teraz
                </Button>
              </Link>
            )}
          </div>
        </div>
      </motion.article>
    </div>
  );
};

export default UnifiedAuctionCard;
