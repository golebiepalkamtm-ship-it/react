/**
 * ChampionCard z zaawansowanymi efektami hover
 * - Shader zniekształcenia obrazu przy interakcji
 * - 3D tilt effect
 * - Liquid distortion na hover
 */
import { useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, FileText } from 'lucide-react';
import type { Champion } from '@/hooks/useChampions';
import './ChampionCard.css';


interface ChampionCardProps {
  champion: Champion;
  index: number;
  onSelect?: (champion: Champion) => void;
  onViewPedigree?: (pedigreeUrl: string) => void;
  variants?: any;
}

export const ChampionCard = ({ champion, index, onSelect, onViewPedigree, variants }: ChampionCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  
  // Motion values dla 3D tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Direct transform dla instant parallax (bez spring)
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-15, 15]);
  
  // Light position dla shine effect
  const lightX = useTransform(mouseX, [-0.5, 0.5], [0, 100]);
  const lightY = useTransform(mouseY, [-0.5, 0.5], [0, 100]);
  
  const lightBackground = useTransform(
    [lightX, lightY],
    ([x, y]) =>
      `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.15) 0%, transparent 50%)`
  );
  
  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    // Direct CSS transforms - bez Framer Motion
    const innerCard = cardRef.current.querySelector('.champion-card-inner') as HTMLElement;
    if (innerCard) {
      innerCard.style.transform = `rotateX(${-y * 25}deg) rotateY(${x * 25}deg)`;
    }
    
    mouseX.set(x);
    mouseY.set(y);
    setIsHovered(true);
    
    // Normalizuj dla shadera (0-1)
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: 1 - (e.clientY - rect.top) / rect.height, // Odwróć Y dla WebGL
    });
  };
  
  const handleMouseLeave = () => {
    // Reset CSS transform
    const innerCard = cardRef.current?.querySelector('.champion-card-inner') as HTMLElement;
    if (innerCard) {
      innerCard.style.transform = 'rotateX(0deg) rotateY(0deg)';
    }
    
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
    setMousePos({ x: 0.5, y: 0.5 });
  };
  
  const handlePedigreeOpen = (e: ReactMouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!champion.pedigree) return;

    if (onViewPedigree) {
      onViewPedigree(champion.pedigree);
    } else {
      window.open(champion.pedigree, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <motion.div
      ref={cardRef}
      className="relative cursor-pointer group"
      style={{ perspective: '2000px' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      onClick={() => onSelect?.(champion)}
    >
      <div
        className="champion-card-inner relative rounded-2xl overflow-hidden glass-card gold-border shadow-glow border-[2px] border-white transition-colors duration-500 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black/96 shadow-[0_14px_32px_rgba(0,0,0,0.6),0_0_32px_rgba(255,255,255,0.28),inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-2px_8px_rgba(0,0,0,0.45)]"
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s ease-out',
        }}
      >
        {/* Jedna widoczna ramka wokół całej karty */}

        {/* Dynamic light reflection */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: lightBackground,
            opacity: isHovered ? 1 : 0,
          }}
        />
        
        {/* Glow border on hover */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none z-20"
          initial={{ opacity: 0 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            boxShadow: isHovered
              ? '0 0 30px rgba(150, 150, 200, 0.3), inset 0 0 20px rgba(150, 150, 200, 0.1)'
              : 'none',
          }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Obraz z efektami hover */}
        <div className="relative aspect-[4/3] overflow-hidden bg-zinc-950">
          {/* Obrazek championa */}
          {champion.images?.[0] ? (
            <motion.img
              src={champion.images[0]}
              alt={champion.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-contain object-top filter brightness-110 contrast-105 will-change-transform"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                if (!img.dataset.fallback) {
                  img.dataset.fallback = '1';
                  img.src = '/back.png';
                } else {
                  img.style.display = 'none';
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950">
              {/* Placeholder */}
            </div>
          )}
          
          {/* Fallback gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-gold/20 -z-10" />
          
          {/* Bezpośrednio eksponujemy obraz bez dodatkowej winiety, żeby był jaśniejszy */}
          
          {/* Scanline effect */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 0.15 : 0 }}
          >
            <div className="absolute inset-0 gallery-scanline-pattern" />
          </motion.div>
          
        </div>
        
        {/* Content - numer gołębia i przycisk rodowodu */}
        <div className="relative p-3 bg-card gallery-card-content">
          {/* Numer obrączki */}
          <motion.h3
            className="text-base font-bold font-display text-foreground text-center group-hover:text-gold transition-all duration-300 mb-2 gallery-card-title"
          >
            {champion.ringNumber || champion.records[0] || champion.name}
          </motion.h3>
          
          {/* Przycisk rodowodu */}
          {champion.pedigree && (
            <div className="flex justify-center">
              <button
                onClick={handlePedigreeOpen}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 hover:bg-gold/20 border border-gold/30 rounded-full text-gold text-xs font-medium transition-all duration-300"
              >
                <FileText className="w-4 h-4" />
                <span>Rodowód</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChampionCard;
