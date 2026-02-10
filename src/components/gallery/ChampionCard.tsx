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
}

export const ChampionCard = ({ champion, index, onSelect, onViewPedigree }: ChampionCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  
  // Motion values dla 3D tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Spring animation dla smooth tilt
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), {
    stiffness: 150,
    damping: 20,
  });
  
  // Light position dla shine effect
  const lightX = useTransform(mouseX, [-0.5, 0.5], [0, 100]);
  const lightY = useTransform(mouseY, [-0.5, 0.5], [0, 100]);
  
  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    mouseX.set(x);
    mouseY.set(y);
    
    // Normalizuj dla shadera (0-1)
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: 1 - (e.clientY - rect.top) / rect.height, // Odwróć Y dla WebGL
    });
  };
  
  const handleMouseLeave = () => {
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
      className="relative cursor-pointer group gallery-card-perspective"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelect?.(champion)}
    >
      <motion.div
        className="relative rounded-2xl overflow-hidden glass-card gold-border shadow-glow border border-zinc-800 group-hover:border-zinc-600 transition-colors duration-500"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ scale: { duration: 0.2 } }}
      >
        {/* Dynamic light reflection */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: useTransform(
              [lightX, lightY],
              ([x, y]) =>
                `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.15) 0%, transparent 50%)`
            ),
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
              layoutId={`champion-image-${champion.id}`}
              src={champion.images[0]}
              alt={champion.name}
              className="w-full h-full object-contain object-top filter brightness-110 contrast-105"
              onError={(e) => {
                // Fallback do gradientu jeśli obraz nie załaduje się
                (e.target as HTMLImageElement).style.display = 'none';
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
      </motion.div>
    </motion.div>
  );
};

export default ChampionCard;
