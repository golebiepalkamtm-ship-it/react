import { Link, useNavigate } from "react-router-dom";
import { Clock, Gavel, Eye, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LuxuryAuctionTimer } from "@/components/auction/LuxuryAuctionTimer";

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

  const parsedEnd = endTime ? new Date(endTime) : undefined;
  const now = new Date();
  const isEnded = status === 'ended' || (parsedEnd ? parsedEnd.getTime() <= now.getTime() : false);
  const isArchived = isEnded && parsedEnd ? now.getTime() - parsedEnd.getTime() > 3600 * 1000 : false;
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
      className="group relative flex gap-4 rounded-2xl border border-white/15 bg-black/70 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] backdrop-blur-xl transition hover:border-gold/30 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
    >
      {isEnded && (
        <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full bg-red-500/90 text-white text-xs font-semibold uppercase tracking-wide flex items-center gap-1 shadow-lg shadow-red-500/30">
          <Clock className="h-3.5 w-3.5" />
          Aukcja zakończona
        </div>
      )}
      {(typeof watchCount === "number" || typeof viewsCount === "number") && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          {typeof watchCount === "number" && (
            <div className="px-2.5 py-1 rounded-full bg-white/15 text-white text-xs font-semibold flex items-center gap-1 border border-white/20 shadow">
              <Heart className="h-3.5 w-3.5 text-pink-400" />
              {watchCount}
            </div>
          )}
          {typeof viewsCount === "number" && (
            <div className="px-2.5 py-1 rounded-full bg-white/15 text-white text-xs font-semibold flex items-center gap-1 border border-white/20 shadow">
              <Eye className="h-3.5 w-3.5 text-blue-300" />
              {viewsCount}
            </div>
          )}
        </div>
      )}

      <div className="relative h-28 w-36 overflow-hidden rounded-xl bg-black/40 border border-white/10 shrink-0">
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
          } transition duration-300 group-hover:scale-[1.02]`}
        />
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground leading-snug">
              {title}
            </h3>
            {ringNumber && (
              <p className="text-sm text-muted-foreground">{ringNumber}</p>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex flex-col gap-1 rounded-xl border border-white/15 px-2 py-1.5 bg-black/60">
              <LuxuryAuctionTimer endTime={endTime} />
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-4 w-4 text-gold" />
                <span>
                  {new Date(endTime).toLocaleString("pl-PL", { dateStyle: "medium", timeStyle: "short" })}
                </span>
              </div>
            </div>
            {typeof watchCount === "number" && (
              <div className="flex items-center gap-1 rounded-full border border-white/10 px-2 py-1">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span>{watchCount}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Aktualna oferta
            </p>
            <p className="font-display text-2xl font-bold text-foreground">
              {currentBid.toLocaleString("pl-PL")} zł
            </p>
          </div>
          <Link
            to={`/auctions/${id}#bid`}
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="gold"
              className="bg-gradient-to-r from-gold to-gold-light text-navy shadow-[0_0_20px_rgba(212,175,55,0.35)] transition hover:shadow-[0_0_28px_rgba(212,175,55,0.5)]"
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
