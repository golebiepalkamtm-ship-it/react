import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence, Variants } from 'framer-motion';
import { Clock, Gavel, Trophy, Eye } from 'lucide-react';
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
  watchCount,
  featured = false,
  imageFit = 'cover',
}) => {
  const navigate = useNavigate();
  // Referencje i stan
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
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
      className="relative w-full max-w-sm mx-auto"
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
      className={`overflow-hidden rounded-2xl border ${
        featured 
          ? 'border-gold/40 shadow-[0_0_30px_rgba(212,175,55,0.3)]' 
          : 'border-white/15'
      } bg-white/10 backdrop-blur-xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={cardVariants}
      whileHover="hover"
      whileTap="tap"
    >
      {/* Efekt gradientu na krawędziach - wzmocnione oświetlenie */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gold/25 via-transparent to-gold/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <motion.div 
        className="absolute inset-0 rounded-2xl opacity-0 pointer-events-none"
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
            className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-gradient-to-r from-gold to-gold-light text-navy text-xs font-semibold uppercase tracking-wide flex items-center gap-1"
          >
            <Trophy className="w-3 h-3" />
            Wyróżnione
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kontener zdjęcia */}
      <div className="relative h-64 overflow-hidden">
        <motion.img
          src={image || AUCTION_PLACEHOLDER_SRC}
          alt={title}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = AUCTION_PLACEHOLDER_SRC;
          }}
          className={`w-full h-full ${imageFit === 'contain' ? 'object-contain p-3 bg-black/15' : 'object-cover'} transition-all duration-500`}
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
        className="p-6"
        variants={contentVariants}
      >
        <motion.div 
          className="flex flex-col gap-3 mb-4"
          variants={itemVariants}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-xl text-foreground font-semibold mb-1 line-clamp-2">
                {title}
              </h3>
              <p className="text-muted-foreground text-sm">{ringNumber}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex flex-col gap-1 px-3 py-2 rounded-xl bg-white/12 backdrop-blur-xl border border-white/25">
                <LuxuryAuctionTimer endTime={endTime} />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 text-gold" />
                  <span className="leading-tight">
                    {new Date(endTime).toLocaleString('pl-PL', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
              </div>
              {watchCount && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/12 backdrop-blur-xl border border-white/20">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground text-sm">{watchCount}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Aktualna oferta i przycisk */}
        <motion.div 
          className="flex items-end justify-between pt-4 border-t border-white/10"
          variants={itemVariants}
        >
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
            onClick={(e) => e.stopPropagation()}
          >
            <MagneticButton strength={0.3}>
              <Button 
                variant="gold" 
                size="default" 
                className="bg-gradient-to-r from-gold to-gold-light text-navy hover:shadow-[0_0_15px_rgba(212,175,55,0.5)]"
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
