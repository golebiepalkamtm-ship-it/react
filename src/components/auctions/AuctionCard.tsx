import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  motion,
  type Variants,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { Gavel, Heart, Clock, Eye } from "lucide-react";
import { AuctionTimer } from "./AuctionTimer";
import { Badge } from "@/components/ui/badge";
import { AuctionImage } from "./AuctionImage";

type Auction = {
  id: string;
  name: string;
  image: string;
  ringNumber: string;
  sex: "samiec" | "samica" | string;
  year?: string | number;
  color?: string;
  currentPrice: number;
  startPrice: number;
  buyNowPrice?: number;
  bids: number;
  endTime: Date;
  achievements?: string[];
};

interface AuctionCardProps {
  auction: Auction;
  index: number;
}

export const AuctionCard = ({ auction, index }: AuctionCardProps) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [viewCount] = useState(() => Math.floor(Math.random() * 50) + 10);
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), {
    stiffness: 150,
    damping: 20,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatTitle = (title: string, maxLength: number) => {
    if (title.length <= maxLength) return title;
    return `${title.slice(0, Math.max(0, maxLength - 1))}…`;
  };

  // Staggered cascade animation variants
  const cardVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 80,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: index * 0.12,
      },
    },
  };

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      onClick={() => navigate(`/auctions/${auction.id}`)}
      className="group relative cursor-pointer h-full"
      style={{ perspective: "1000px" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="h-full w-full"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ scale: { duration: 0.2 } }}
      >
        {/* Main card container */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-amber-900 border border-[#D4AF37] transition-all duration-300 h-full w-full flex flex-col shadow-[0_0_20px_rgba(212,175,55,0.2)]">
          {/* Like button - floating action */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className="absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 backdrop-blur-md transition-colors hover:bg-black/40"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Heart
                className={`h-4 w-4 transition-all duration-300 ${
                  isLiked
                    ? "fill-red-500 text-red-500"
                    : "text-white/70 hover:text-white"
                }`}
              />
            </motion.div>
          </motion.button>

          {/* Hero image section */}
          <div className="relative w-full aspect-square overflow-hidden">
            <AuctionImage src={auction.image} alt={auction.name} />
          </div>

          {/* Golden divider */}
          <div className="h-0.5 bg-gradient-to-r from-primary to-yellow-600"></div>

          {/* Content section */}
          <div className="flex flex-col p-4 flex-grow">
            <div className="flex justify-between items-start">
              <span className="text-xs text-primary">{auction.ringNumber}</span>
              <div className="flex items-center gap-1 text-xs text-primary">
                <Eye className="h-4 w-4" />
                <span>{viewCount}</span>
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-400 mt-1 truncate">
              {formatTitle(auction.name, 25)}
            </h3>

            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {auction.sex}
              </Badge>
              {auction.color && (
                <Badge variant="outline" className="text-xs">
                  {auction.color}
                </Badge>
              )}
            </div>

            <div className="mt-4 flex-grow"></div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-black/20">
                <div>
                  <p className="text-xs text-gray-400">KONIEC ZA</p>
                  <div className="text-sm font-semibold text-white flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <AuctionTimer endTime={auction.endTime} />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 text-right">OFERTY</p>
                  <p className="text-sm font-semibold text-white text-right">
                    {auction.bids}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-baseline">
                <div>
                  <p className="text-xs text-gray-400">AKTUALNA CENA</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatPrice(auction.currentPrice)}
                  </p>
                </div>
                <p className="text-sm text-gray-400">
                  od {formatPrice(auction.startPrice)}
                </p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <motion.button
                className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-2xl flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Gavel className="h-5 w-5" />
                Licytuj
              </motion.button>
              {auction.buyNowPrice && (
                <motion.button
                  className="w-full bg-green-600 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Kup teraz
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
