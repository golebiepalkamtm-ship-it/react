import { Link } from "react-router-dom";
import { Clock, Gavel, Eye } from "lucide-react";
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
  imageFit?: "cover" | "contain";
}

export const AuctionListItem = ({
  id,
  title,
  image,
  currentBid,
  endTime,
  ringNumber,
  watchCount,
  imageFit = "cover",
}: AuctionListItemProps) => {
  return (
    <div className="group relative flex gap-4 rounded-2xl border border-white/15 bg-black/70 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] backdrop-blur-xl transition hover:border-gold/30 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)]">
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
          <Link to={`/auctions/${id}`}>
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
