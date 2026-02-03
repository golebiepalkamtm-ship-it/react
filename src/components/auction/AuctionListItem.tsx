import { Link, useNavigate } from "react-router-dom";
import { Clock, Gavel, Eye, Heart, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LuxuryAuctionTimer } from "@/components/auction/LuxuryAuctionTimer";
import { useMemo } from "react";

const AUCTION_PLACEHOLDER_SRC = "/placeholder.svg";

interface AuctionListItemProps {
  id: string;
  title: string;
  image: string;
  currentBid: number;
  endTime: string;
  ringNumber?: string;
  watchCount?: number;
  viewsCount?: number;
  imageFit?: "cover" | "contain";
  status?: 'active' | 'ended' | 'cancelled';
}

export const AuctionListItem = ({
  id,
  title,
  image,
  currentBid,
  endTime,
  ringNumber,
  watchCount = 0,
  viewsCount = 0,
  imageFit = "cover",
  status,
}: AuctionListItemProps) => {
  const navigate = useNavigate();

  const handleNavigate = () => navigate(`/auctions/${id}`);

  const now = new Date();
  const endTimestamp = useMemo(() => {
    if (!endTime) return null;
    const parsed = new Date(endTime);
    return Number.isNaN(parsed.getTime()) ? null : parsed.getTime();
  }, [endTime]);
  const isEnded = status === 'ended' || (endTimestamp ? endTimestamp <= now.getTime() : false);
  const isFinalCall =
    !isEnded &&
    endTimestamp !== null &&
    endTimestamp - now.getTime() < 24 * 60 * 60 * 1000 &&
    endTimestamp > now.getTime();
  const statusTone = isEnded
    ? "bg-red-500/80 text-white"
    : isFinalCall
      ? "bg-gold/90 text-navy"
      : "bg-emerald-400/90 text-navy";
  const statusText = isEnded ? "Zakończona" : isFinalCall ? "Final Call" : "Live";
  const statusIcon = isEnded ? (
    <Clock className="h-3.5 w-3.5" />
  ) : isFinalCall ? (
    <Flame className="h-3.5 w-3.5" />
  ) : (
    <Gavel className="h-3.5 w-3.5" />
  );
  const isArchived = isEnded && endTimestamp ? now.getTime() - endTimestamp > 3600 * 1000 : false;
  if (isArchived) return null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleNavigate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleNavigate();
        }
      }}
      className="group relative flex gap-5 rounded-[26px] border border-white/10 bg-white/[0.05] p-4 md:p-5 shadow-[0_15px_60px_rgba(3,4,12,0.5)] backdrop-blur-2xl transition hover:border-gold/40 hover:shadow-[0_20px_70px_rgba(212,175,55,0.25)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
    >
      <div className={`absolute top-3 left-3 z-10 flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${statusTone}`}>
        {statusIcon}
        {statusText}
      </div>
      {(typeof watchCount === "number" || typeof viewsCount === "number") && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          {typeof watchCount === "number" && (
            <div className="px-2.5 py-1 rounded-full border border-white/15 bg-white/10 text-white text-xs font-semibold flex items-center gap-1 shadow">
              <Heart className="h-3.5 w-3.5 text-pink-400" />
              {watchCount}
            </div>
          )}
          {typeof viewsCount === "number" && (
            <div className="px-2.5 py-1 rounded-full border border-white/15 bg-white/10 text-white text-xs font-semibold flex items-center gap-1 shadow">
              <Eye className="h-3.5 w-3.5 text-blue-300" />
              {viewsCount}
            </div>
          )}
        </div>
      )}

      <div className="relative h-28 w-36 overflow-hidden rounded-2xl bg-black/40 border border-white/10 shrink-0 md:h-32 md:w-44">
        <img
          src={image || AUCTION_PLACEHOLDER_SRC}
          alt={title}
          onError={(e) => {
            e.currentTarget.src = AUCTION_PLACEHOLDER_SRC;
          }}
          loading="lazy"
          decoding="async"
          className={`h-full w-full ${
            imageFit === "contain" ? "object-contain p-2" : "object-cover"
          } transition duration-500 group-hover:scale-105`}
        />
      </div>

      <div className="flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-display text-xl font-semibold text-foreground leading-snug">
              {title}
            </h3>
            {ringNumber && (
              <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
                {ringNumber}
              </p>
            )}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-muted-foreground min-w-[180px]">
            <LuxuryAuctionTimer endTime={endTime} />
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-4 w-4 text-gold" />
              <span>
                {new Date(endTime).toLocaleString("pl-PL", { dateStyle: "medium", timeStyle: "short" })}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-3 text-sm text-white/70 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2">
            <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
              Licytujących
            </p>
            <p className="text-lg text-white">{Math.max(watchCount, 0)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2">
            <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
              Wyświetlenia
            </p>
            <p className="text-lg text-white">{viewsCount}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2">
            <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
              Status
            </p>
            <p className="text-lg text-white">{statusText}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
              Aktualna oferta
            </p>
            <p className="font-display text-2xl font-bold text-foreground">
              {currentBid.toLocaleString("pl-PL")} zł
            </p>
          </div>
          <Link
            to={`/auctions/${id}#bid`}
            onClick={(e) => e.stopPropagation()}
            className="w-full md:w-auto"
          >
            <Button
              variant="gold"
              className={`w-full bg-gradient-to-r from-gold to-gold-light text-navy shadow-[0_10px_25px_rgba(212,175,55,0.35)] transition hover:shadow-[0_15px_30px_rgba(212,175,55,0.45)] ${
                isFinalCall ? "animate-pulse" : ""
              }`}
            >
              <Gavel className="mr-2 h-4 w-4" />
              Licytuj
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuctionListItem;
