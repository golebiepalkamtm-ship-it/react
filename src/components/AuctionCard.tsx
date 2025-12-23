import { Link } from "react-router-dom";
import { Clock, Gavel, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuctionCardProps {
  id: string;
  name: string;
  image: string;
  currentBid: number;
  timeLeft: string;
  raceWins?: number;
  bloodline: string;
  featured?: boolean;
}

const AuctionCard = ({
  id,
  name,
  image,
  currentBid,
  timeLeft,
  raceWins,
  bloodline,
  featured = false,
}: AuctionCardProps) => {
  return (
    <div
      className={`group relative rounded-2xl overflow-hidden bg-card border transition-all duration-500 hover-lift ${
        featured
          ? "border-gold/50 shadow-gold"
          : "border-border hover:border-gold/30"
      }`}
    >
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
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent" />
        
        {/* Time Badge */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy/80 backdrop-blur-sm border border-gold/20">
          <Clock className="w-4 h-4 text-gold" />
          <span className="text-primary-foreground text-sm font-medium">
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
            <p className="text-muted-foreground text-sm">{bloodline}</p>
          </div>
          {raceWins && (
            <div className="flex items-center gap-1 text-gold">
              <Trophy className="w-4 h-4" />
              <span className="text-sm font-semibold">{raceWins} wygranych</span>
            </div>
          )}
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
            <Button variant="gold" size="default" className="group-hover:shadow-gold">
              <Gavel className="w-4 h-4 mr-2" />
              Licytuj
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuctionCard;
