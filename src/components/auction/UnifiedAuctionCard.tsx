import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Gavel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

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
  location,
  watchCount: _watchCount = 0,
  viewsCount: _viewsCount = 0,
  bidsCount = 0,
  featured = false,
  imageFit = "cover",
  highlight = false,
  nowMs,
  onToggleWatch,
}: UnifiedAuctionCardProps & { onToggleWatch?: () => void }) => {
  const navigate = useNavigate();
  const [referenceNow, setReferenceNow] = useState(() =>
    typeof nowMs === "number" ? nowMs : Date.now(),
  );

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
    const days = Math.floor(diff / 86400000)
      .toString()
      .padStart(2, "0");
    const hours = Math.floor((diff % 86400000) / 3600000)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((diff % 3600000) / 60000)
      .toString()
      .padStart(2, "0");
    const seconds = Math.floor((diff % 60000) / 1000)
      .toString()
      .padStart(2, "0");
    return {
      days,
      hours,
      minutes,
      seconds,
      ended: diff === 0,
      endingSoon: diff > 0 && diff < 3600000,
    };
  }, [endTime, referenceNow]);

  const genderDisplay = useMemo(() => {
    if (!gender) {
      return { label: "Płeć nieznana", symbol: "•", className: "bg-white/15 text-white/80 border-white/20" };
    }
    if (gender === "female") {
      return { label: "Samica", symbol: "♀", className: "bg-[#ffb5eb]/25 text-[#ffd9f6] border-[#ffb5eb]/60" };
    }
    if (gender === "male") {
      return { label: "Samiec", symbol: "♂", className: "bg-[#8fd1ff]/25 text-[#cde7ff] border-[#8fd1ff]/60" };
    }
    return { label: gender, symbol: "•", className: "bg-white/15 text-white/80 border-white/20" };
  }, [gender]);

  const ringBadge = ringNumber;
  const specBadges = useMemo(() => {
    const badges: string[] = [];
    if (gender) badges.push(gender === "female" ? "Samica" : gender === "male" ? "Samiec" : gender);
    if (color) badges.push(color);
    if (category) badges.push(category);
    return badges.slice(0, 3);
  }, [gender, color, category]);

  const displayTitle = useMemo(() => {
    if (!title) return "—";
    return title.length > 20 ? `${title.slice(0, 20)}…` : title;
  }, [title]);

  return (
    <div className="h-full">
      <motion.article
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
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className={`group glass-card relative mx-auto flex h-[620px] w-[320px] flex-col overflow-hidden rounded-[24px] border backdrop-blur-2xl transition-all duration-500 perspective-1000 ${
          timeMeta.endingSoon
            ? "border-[#ff8c92]/60 bg-gradient-to-br from-[#1d060c]/70 via-[#2d0a11]/60 to-[#160308]/70 shadow-[0_25px_70px_rgba(255,91,97,0.35)] hover:border-red-500/80 hover:shadow-glow-red"
            : highlight || featured
              ? "border-white/25 bg-gradient-to-br from-white/15 via-white/5 to-white/10 shadow-[0_35px_80px_rgba(15,18,34,0.65)] hover:border-primary/50 hover:shadow-glow-sm"
              : "border-white/15 bg-white/5 shadow-[0_25px_70px_rgba(6,11,23,0.65)] hover:border-primary/50 hover:shadow-glow-sm"
        }`}
      >
      <div className="flex flex-1 flex-col gap-3 px-4 pb-4 pt-14 sm:px-5 sm:pb-5">
        <div className="flex flex-col gap-2 pt-2">
          <div className="h-px w-full bg-gold/25" aria-hidden="true" />
          <h3 className="font-display text-xl sm:text-2xl font-semibold text-white leading-tight truncate">
            {displayTitle}
          </h3>
          {ringBadge && (
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] tracking-[0.18em] text-gold/90 rounded-xl border border-gold/30 bg-white/5 px-3 py-1 shadow-[0_8px_20px_rgba(255,224,132,0.18)]">
                {ringBadge}
              </span>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-1 text-sm">
            {specBadges.length > 0 && (
              <div className="flex flex-wrap items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-white/70">
                {specBadges.map((badge) => (
                  <span key={`${id}-${badge}`} className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                    {badge}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="h-px w-full bg-gold/25" aria-hidden="true" />
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#ffbe55]">Koniec aukcji</p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-white sm:gap-4">
              {["days", "hours", "minutes", "seconds"].map((label, idx) => (
                <div key={label} className="flex flex-col items-center">
                  <span className="text-2xl font-bold sm:text-3xl">
                    {timeMeta.ended ? "00" : (timeMeta as any)[label]}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-white/55">
                    {["DNI", "GODZ", "MIN", "SEK"][idx]}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="h-px w-full bg-white/10" aria-hidden="true" />
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1 min-w-[55%]">
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/60">Aktualna cena</p>
              <p className="font-display text-2xl font-bold text-[#ffe084] sm:text-3xl">
                {formatNumber(currentBid)}
              </p>
            </div>
            <div className="flex-1 min-w-[35%] text-right text-[10px] uppercase tracking-[0.3em] text-white/55 space-y-1">
              <p className="text-white/70">Ofert: {bidsCount}</p>
              {typeof startingPrice === "number" && <p>Start: {formatNumber(startingPrice)}</p>}
            </div>
          </div>
          <div className="mt-2 flex flex-col gap-3">
            {typeof buyNowPrice === "number" && buyNowPrice > 0 ? (
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to={`/auctions/${id}?mode=buy-now`}
                  onClick={(event) => event.stopPropagation()}
                  className="flex-1"
                >
                  <div className="h-full">
                    <Button
                      type="button"
                      variant="premium"
                      size="lg"
                      className="w-full gap-2 border border-gold/40 shadow-[0_12px_35px_rgba(255,224,132,0.35)] hover:shadow-[0_18px_45px_rgba(255,224,132,0.55)] neon-border"
                    >
                      Kup teraz {formatNumber(buyNowPrice)}
                    </Button>
                  </div>
                </Link>
                <Link
                  to={`/auctions/${id}#bid`}
                  onClick={(event) => event.stopPropagation()}
                  className="flex-1"
                >
                  <div className="h-full">
                    <Button
                      type="button"
                      variant="gold"
                      size="lg"
                      className="w-full gap-2 shadow-[0_18px_50px_rgba(245,166,61,0.45)] hover:shadow-[0_24px_65px_rgba(245,166,61,0.6)] neon-border"
                    >
                      <Gavel className="h-4 w-4" />
                      Licytuj
                    </Button>
                  </div>
                </Link>
              </div>
            ) : (
              <Link
                to={`/auctions/${id}#bid`}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="h-full">
                  <Button
                    type="button"
                    variant="gold"
                    size="lg"
                    className="w-full gap-2 shadow-[0_18px_50px_rgba(245,166,61,0.45)] hover:shadow-[0_24px_65px_rgba(245,166,61,0.6)] neon-border"
                  >
                    <Gavel className="h-4 w-4" />
                    Licytuj
                  </Button>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.article>
    </div>
  );
};

export default UnifiedAuctionCard;
