import { Link, useNavigate } from "react-router-dom";
import { Clock, Gavel, Trophy, Heart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cardMicro } from "@/components/motion";
import { ChampionCardEffect } from "@/components/effects/ChampionCardEffect";
import { MagneticButton } from "@/components/effects/MagneticButton";

const AUCTION_PLACEHOLDER_SRC = "/placeholder.svg";

interface AuctionCardProps {
  id: string;
  title: string;
  image: string;
  currentBid: number;
  timeLeft: string;
  ringNumber?: string;
  featured?: boolean;
  imageFit?: 'cover' | 'contain';
  endTime?: string;
  status?: 'active' | 'ended' | 'cancelled';
  watchCount?: number;
  viewsCount?: number;
  onToggleWatch?: () => void;
}

const AuctionCard = ({
  id,
  title,
  image,
  currentBid,
  timeLeft,
  ringNumber,
  featured = false,
  imageFit = 'contain',
  endTime,
  status,
  watchCount = 0,
  viewsCount = 0,
  onToggleWatch,
}: AuctionCardProps) => {
  const navigate = useNavigate();

  const endDate = endTime ? new Date(endTime) : undefined;
  const now = new Date();
  const isEnded = status === 'ended' || (endDate ? endDate.getTime() <= now.getTime() : false);
  const isArchived = isEnded && endDate ? now.getTime() - endDate.getTime() > 3600 * 1000 : false;
  if (isArchived) return null;

  const handleCardClick = () => {
    navigate(`/auctions/${id}`);
  };

  return (
    <ChampionCardEffect
      className={`group relative mx-auto w-full max-w-[360px]`}
      glowColor="rgba(212, 175, 55, 0.5)"
    >
      <div
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleCardClick();
          }
        }}
        className="rounded-2xl overflow-hidden gold-border glass-card transition-all duration-500 shadow-glow border-gold/30 bg-white/10 backdrop-blur-xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
      >
      {/* Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {featured && (
          <div className="px-3 py-1 rounded-full bg-gradient-to-r from-gold to-gold-light text-navy text-xs font-semibold uppercase tracking-wide flex items-center gap-1">
            <Trophy className="w-3 h-3" />
            Wyróżnione
          </div>
        )}
        {isEnded && (
          <div className="px-3 py-1 rounded-full bg-red-500/90 text-white text-xs font-semibold uppercase tracking-wide flex items-center gap-1 shadow-lg shadow-red-500/30">
            <Clock className="w-3 h-3" />
            Aukcja zakończona
          </div>
        )}
      </div>
      {/* Counters */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <div 
          className="px-2.5 py-1 rounded-full bg-white/15 text-white text-xs font-semibold flex items-center gap-1 border border-white/20 shadow cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onToggleWatch?.();
          }}
        >
          <Heart className="w-3.5 h-3.5 text-pink-400" />
          {watchCount ?? 0}
        </div>
        <div className="px-2.5 py-1 rounded-full bg-white/15 text-white text-xs font-semibold flex items-center gap-1 border border-white/20 shadow">
          <Eye className="w-3.5 h-3.5 text-blue-300" />
          {viewsCount ?? 0}
        </div>
      </div>

      {/* Image Container */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={image || AUCTION_PLACEHOLDER_SRC}
          alt={title}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.currentTarget.src = AUCTION_PLACEHOLDER_SRC;
          }}
          className={`w-full h-full ${imageFit === 'contain' ? 'object-contain p-3 bg-black/15' : 'object-cover'} transition-[filter] duration-300 group-hover:brightness-[1.03]`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/40 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="min-w-0">
            <h3
              className="font-display text-[1.35rem] leading-snug text-foreground font-semibold mb-1 break-words line-clamp-2 text-balance tracking-tight"
              title={title}
            >
              {title}
            </h3>
            <p className="text-muted-foreground text-sm truncate mb-2">{ringNumber}</p>
            
            {/* Time Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-xl border border-white/25 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] w-fit">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-foreground text-sm font-medium">
                {timeLeft}
              </span>
            </div>
          </div>
        </div>

        {/* Current Bid */}
        <div className="flex items-end justify-between pt-4 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Aktualna oferta
            </p>
            <p className="font-display text-2xl text-foreground font-bold">
              {currentBid.toLocaleString('pl-PL')} zł
            </p>
          </div>
          <Link
            to={`/auctions/${id}#bid`}
            onClick={(event) => event.stopPropagation()}
          >
            <MagneticButton strength={0.3}>
              <Button variant="gold" size="default" className="group-hover:shadow-gold hover:shadow-[0_0_30px_rgba(212,175,55,0.6)]">
                <Gavel className="w-4 h-4 mr-2" />
                Licytuj
              </Button>
            </MagneticButton>
          </Link>
        </div>
      </div>
      </div>
    </ChampionCardEffect>
  );
};

export default AuctionCard;
