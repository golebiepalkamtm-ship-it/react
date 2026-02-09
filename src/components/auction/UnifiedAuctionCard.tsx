import { useEffect, useMemo, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Gavel, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
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

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;

      card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
      card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);

      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        scale: 1.02,
        duration: 0.5,
        ease: "power2.out",
        overwrite: "auto"
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 0.8,
        ease: "elastic.out(1, 0.5)",
        overwrite: "auto"
      });
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    if (!endTime) return undefined;

    const intervalId = window.setInterval(() => {
      setReferenceNow((previous) => previous + 1000);
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [endTime, nowMs]);

  const timeMeta = useMemo(() => {
    if (!endTime || referenceNow === 0) {
      return { days: "00", hours: "00", minutes: "00", seconds: "00", ended: false, endingSoon: false };
    }
    const end = new Date(endTime).getTime();
    const diff = Math.max(end - referenceNow, 0);
    const days = Math.floor(diff / 86400000).toString().padStart(2, "0");
    const hours = Math.floor((diff % 86400000) / 3600000).toString().padStart(2, "0");
    const minutes = Math.floor((diff % 3600000) / 60000).toString().padStart(2, "0");
    const seconds = Math.floor((diff % 60000) / 1000).toString().padStart(2, "0");
    return {
      days,
      hours,
      minutes,
      seconds,
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
    return title.length > 20 ? `${title.slice(0, 20)}…` : title;
  }, [title]);

  const imgSrc = useMemo(() => {
    const trimmed = (image || "").trim();
    if (!trimmed) return AUCTION_PLACEHOLDER_SRC;
    return trimmed.includes("placeholder") ? AUCTION_PLACEHOLDER_SRC : trimmed;
  }, [image]);

  const imageObjectClass = useMemo(() => {
    return imageFit === "contain" ? "object-contain bg-black" : "object-cover";
  }, [imageFit]);

  return (
    <div className="h-full" style={{ perspective: "1000px" }}>
      <article
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
        className={`group relative mx-auto flex h-[620px] w-full min-w-0 flex-col overflow-hidden rounded-[24px] border backdrop-blur-2xl transition-all duration-500 premium-card ${timeMeta.endingSoon
            ? "border-red-500/40 bg-gradient-to-br from-[#2a1a1a] to-[#1a0f08]/80 shadow-2xl"
            : highlight || featured
              ? "border-gold/40 bg-gradient-to-br from-[#3d2a1a] via-[#1a1a0f] to-[#0f0f08] shadow-2xl"
              : "border-white/10 bg-gradient-to-br from-[#1a1a1f] to-[#0f0f14]"
          }`}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="h-full w-full flex flex-col">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 transition-all hover:scale-110 active:scale-95"
          >
            <Heart
              className={`h-5 w-5 transition-all duration-300 ${isLiked ? "fill-red-500 text-red-500" : "text-white/70 hover:text-white"}`}
            />
          </button>

          <div className="relative w-full aspect-square overflow-hidden bg-black">
            <img
              src={imgSrc}
              alt={title}
              loading="lazy"
              className={`w-full h-full ${imageObjectClass} transition-transform duration-700 group-hover:scale-110`}
              onError={(e) => {
                const t = e.currentTarget as HTMLImageElement;
                if (t.src !== AUCTION_PLACEHOLDER_SRC) t.src = AUCTION_PLACEHOLDER_SRC;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>

          <div className="flex flex-1 flex-col gap-3 px-5 pb-5 pt-4">
            <div className="flex flex-col gap-2">
              <div className="h-px w-full bg-white/5" />
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white leading-tight tracking-tight">
                {displayTitle}
              </h3>

              <div className="flex flex-wrap items-center gap-2">
                {ringBadge && (
                  <span className="font-mono text-[10px] tracking-widest text-gold rounded-full border border-gold/30 bg-gold/5 px-3 py-1 uppercase">
                    {ringBadge}
                  </span>
                )}
                <div className="flex flex-wrap items-center gap-1">
                  {specBadges.map((badge) => (
                    <span key={`${id}-${badge}`} className="text-[10px] uppercase tracking-wider text-white/50 rounded-full border border-white/5 bg-white/5 px-2 py-1">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>

              <div className="h-px w-full bg-white/5 mt-1" />

              <div className="py-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">Pozostało</p>
                <div className="flex items-center gap-3">
                  {["days", "hours", "minutes", "seconds"].map((label, idx) => (
                    <div key={label} className="flex flex-col items-center min-w-[3rem]">
                      <span className="text-xl font-bold text-white leading-none">
                        {timeMeta.ended ? "00" : (timeMeta as any)[label]}
                      </span>
                      <span className="text-[8px] uppercase tracking-widest text-white/30 mt-1">
                        {["Dni", "Godz", "Min", "Sek"][idx]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px w-full bg-white/5" />

              <div className="flex items-end justify-between py-1">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-1">Cena</p>
                  <p className="font-display text-2xl font-bold text-gold">
                    {formatNumber(currentBid)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest text-white/30">Ofert: {bidsCount}</p>
                </div>
              </div>

              <div className="mt-2 flex flex-col gap-2">
                {typeof buyNowPrice === "number" && buyNowPrice > 0 ? (
                  <div className="flex gap-2">
                    <Link to={`/auctions/${id}?mode=buy-now`} onClick={(e) => e.stopPropagation()} className="flex-1">
                      <Button variant="premiumGold" className="w-full h-11 text-xs">
                        Kup Teraz
                      </Button>
                    </Link>
                    <Link to={`/auctions/${id}#bid`} onClick={(e) => e.stopPropagation()} className="flex-1">
                      <Button variant="outline" className="w-full h-11 text-xs bg-white/5 border-white/10 hover:bg-white/10">
                        <Gavel className="h-3 w-3 mr-1" /> Licytuj
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Link to={`/auctions/${id}#bid`} onClick={(e) => e.stopPropagation()} className="w-full">
                    <Button variant="premiumGold" className="w-full h-11 text-sm">
                      <Gavel className="h-4 w-4 mr-2" /> Licytuj
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default UnifiedAuctionCard;
