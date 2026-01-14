import { Link } from "react-router-dom";
import { Clock, Gavel, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cardMicro } from "@/components/motion";
import { ChampionCardEffect } from "@/components/effects/ChampionCardEffect";
import { MagneticButton } from "@/components/effects/MagneticButton";

interface AuctionCardProps {
  id: string;
  name: string;
  image: string;
  currentBid: number;
  timeLeft: string;
  ringNumber?: string;
  featured?: boolean;
  imageFit?: 'cover' | 'contain';
}

const AuctionCard = ({
  id,
  name,
  image,
  currentBid,
  timeLeft,
  ringNumber,
  featured = false,
  imageFit = 'cover',
}: AuctionCardProps) => {
  return (
    <ChampionCardEffect
      className={`group relative mx-auto w-full max-w-[360px]`}
      glowColor="rgba(212, 175, 55, 0.5)"
    >
      <div className="rounded-2xl overflow-hidden gold-border glass-card transition-all duration-500 shadow-glow border-gold/30">
      {/* Featured Badge */}
      {featured && (
        <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-gradient-to-r from-gold to-gold-light text-navy text-xs font-semibold uppercase tracking-wide flex items-center gap-1">
          <Trophy className="w-3 h-3" />
          Wyróżnione
        </div>
      )}

      {/* Image Container */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={image}
          alt={name}
          loading="lazy"
          decoding="async"
          className={`w-full h-full ${imageFit === 'contain' ? 'object-contain p-3 bg-black/15' : 'object-cover'} transition-[filter] duration-300 group-hover:brightness-[1.03]`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent" />
        
        {/* Time Badge */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-xl border border-white/25 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-foreground text-sm font-medium">
            {timeLeft}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-display text-xl text-foreground font-semibold mb-1">
              {name}
            </h3>
            <p className="text-muted-foreground text-sm">{ringNumber}</p>
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
          <Link to={`/auctions/${id}`}>
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
