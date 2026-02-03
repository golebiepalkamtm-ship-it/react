import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence, Variants } from 'framer-motion';
import { Clock, Gavel, Trophy, Eye, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { MagneticButton } from '@/components/effects/MagneticButton';
import { ChampionCardEffect } from '@/components/effects/ChampionCardEffect';
import { LuxuryAuctionTimer } from '@/components/auction/LuxuryAuctionTimer';

const AUCTION_PLACEHOLDER_SRC = '/placeholder.svg';

interface LuxuryAuctionCardProps {
  id: string;
  title: string;
  image: string;
  currentBid: number;
  endTime: string;
  ringNumber?: string;
  watchCount?: number;
  viewsCount?: number;
  featured?: boolean;
  imageFit?: 'cover' | 'contain';
}

export const LuxuryAuctionCard: React.FC<LuxuryAuctionCardProps> = ({
  id,
  title,
  image,
  currentBid,
  endTime,
  ringNumber,
  watchCount = 0,
  viewsCount = 0,
  featured = false,
  imageFit = 'contain',
}) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const endTimestamp = useMemo(() => new Date(endTime).getTime(), [endTime]);
  const isEnded = Number.isFinite(endTimestamp) && endTimestamp <= now;
  const isFinalCall =
    Number.isFinite(endTimestamp) && endTimestamp - now < 24 * 60 * 60 * 1000 && endTimestamp > now;
  const statusLabel = isEnded ? 'Zakończona' : isFinalCall ? 'Final Call' : 'Live';
  const statusTone = isEnded ? 'bg-red-500/90 text-white' : isFinalCall ? 'bg-gold/90 text-navy' : 'bg-emerald-500/80 text-navy';
  const statusIcon = isEnded ? <Clock className="w-3.5 h-3.5" /> : isFinalCall ? <Gavel className="w-3.5 h-3.5" /> : <Trophy className="w-3.5 h-3.5" />;

  // Referencje i stan
  const cardRef = useRef<HTMLDivElement>(null);

  // Wartości motion dla efektu 3D
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Transformacje dla efektu 3D - wzmocnione
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), {
    stiffness: 150,
    damping: 20
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), {
    stiffness: 150,
    damping: 20
  });

  // Obsługa ruchu myszy dla efektu 3D
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    mouseX.set(x);
    mouseY.set(y);
  };

  // Warianty animacji dla elementów karty
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    },
    hover: { 
      scale: 1.03,
      transition: { duration: 0.3 }
    },
    tap: { 
      scale: 0.98,
      transition: { duration: 0.2 }
    }
  };

  // Warianty animacji dla elementów wewnętrznych
  const contentVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <ChampionCardEffect
      className="relative w-full h-full"
      glowColor="rgba(212, 175, 55, 0.3)"
    >
    <motion.div
      ref={cardRef}
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/auctions/${id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/auctions/${id}`);
        }
      }}
      className={`group/auction overflow-hidden rounded-[28px] border h-full min-h-[560px] flex flex-col transition-all duration-300 ${
        featured 
          ? 'border-gold/40 shadow-[0_35px_90px_rgba(7,6,27,0.65)]'
          : 'border-white/10 shadow-[0_25px_75px_rgba(4,5,18,0.65)]'
      } bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-2xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={cardVariants}
      whileHover="hover"
      whileTap="tap"
    >
      {/* Efekt gradientu na krawędziach - wzmocnione oświetlenie */}
      <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-gold/25 via-transparent to-gold/15 opacity-0 group-hover/auction:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <motion.div 
        className="absolute inset-0 rounded-[28px] opacity-0 pointer-events-none"
        animate={{ 
          opacity: isHovered ? 0.6 : 0,
          background: `radial-gradient(
            circle at ${useTransform(mouseX, [-0.5, 0.5], [0, 100])}% ${useTransform(mouseY, [-0.5, 0.5], [0, 100])}%, 
            rgba(212, 175, 55, 0.4) 0%, 
            transparent 60%
          )`
        }}
        transition={{ duration: 0.2 }}
      />

      {/* Badge wyróżnionej aukcji */}
      <AnimatePresence>
        {featured && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-full bg-gradient-to-r from-gold to-gold-light text-navy text-[11px] font-semibold uppercase tracking-[0.3em] flex items-center gap-1.5 shadow-[0_15px_35px_rgba(212,175,55,0.35)]"
          >
            <Trophy className="w-3 h-3" />
            Wyróżnione
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`absolute top-4 right-4 z-20 flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${statusTone} shadow-lg`}
      >
        {statusIcon}
        {statusLabel}
      </motion.div>

      {/* Kontener zdjęcia */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-b-[40px] rounded-t-[28px]">
        <motion.img
          src={image || AUCTION_PLACEHOLDER_SRC}
          alt={title}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = AUCTION_PLACEHOLDER_SRC;
          }}
          className={`w-full h-full ${imageFit === 'contain' ? 'object-contain p-6 bg-black/15' : 'object-cover'} transition-all duration-700`}
          loading="lazy"
          style={{ 
            scale: isHovered ? 1.05 : 1,
            filter: isHovered ? 'brightness(1.1)' : 'brightness(1)'
          }}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy/35 via-transparent to-transparent" />
        
      </div>

      {/* Zawartość karty */}
      <motion.div 
        className="p-6 flex-1 flex flex-col gap-5"
        variants={contentVariants}
      >
        <motion.div className="flex flex-col gap-4" variants={itemVariants}>
          <div className="min-w-0 space-y-2">
            <h3
              className="font-display text-[1.7rem] leading-snug text-foreground font-semibold break-words line-clamp-2 text-balance tracking-tight"
              title={title}
            >
              {title}
            </h3>
            <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">
              {ringNumber || "Numer weryfikowany"}
            </p>
          </div>
          
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-xl flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/60">
              <span>Countdown</span>
              <Clock className="h-4 w-4 text-gold" />
            </div>
            <LuxuryAuctionTimer endTime={endTime} />
            <p className="text-xs text-muted-foreground">
              {new Date(endTime).toLocaleString('pl-PL', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
        </motion.div>

        <motion.div className="grid gap-4 md:grid-cols-3" variants={itemVariants}>
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Obserwujących</p>
            <div className="mt-1 flex items-center gap-2 text-white">
              <Heart className="h-4 w-4 text-pink-400" />
              <span className="text-lg font-semibold">{watchCount ?? 0}</span>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Wyświetlenia</p>
            <div className="mt-1 flex items-center gap-2 text-white">
              <Eye className="h-4 w-4 text-sky-300" />
              <span className="text-lg font-semibold">{viewsCount ?? 0}</span>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Status</p>
            <div className="mt-1 flex items-center gap-2 text-white">
              {statusIcon}
              <span className="text-lg font-semibold">{statusLabel}</span>
            </div>
          </div>
        </motion.div>

        {/* Aktualna oferta i przycisk */}
        <motion.div 
          className="flex flex-col gap-4 border-t border-white/10 pt-4 mt-auto lg:flex-row lg:items-center lg:justify-between"
          variants={itemVariants}
        >
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-[0.35em] mb-1">
              Aktualna oferta
            </p>
            <p className="font-display text-3xl text-foreground font-bold">
              {currentBid.toLocaleString('pl-PL')} zł
            </p>
          </div>
          
          <Link
            to={`/auctions/${id}#bid`}
            onClick={(e) => e.stopPropagation()}
            className="w-full lg:w-auto"
            aria-label={`Przejdź do licytacji aukcji ${title}`}
          >
            <MagneticButton strength={0.3}>
              <Button 
                variant="gold" 
                size="lg" 
                className={`w-full justify-center rounded-2xl bg-gradient-to-r from-gold to-gold-light text-navy shadow-[0_15px_40px_rgba(212,175,55,0.45)] transition-all ${
                  isFinalCall ? "animate-pulse" : ""
                }`}
              >
                <Gavel className="w-4 h-4 mr-2" />
                Licytuj
              </Button>
            </MagneticButton>
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
    </ChampionCardEffect>
  );
};

export default LuxuryAuctionCard;
