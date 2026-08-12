/**
 * ChampionCard z zaawansowanymi efektami hover
 * - Shader zniekształcenia obrazu przy interakcji
 * - 3D tilt effect
 * - Liquid distortion na hover
 */
import { useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent, CSSProperties } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, FileText, Sparkles } from "lucide-react";
import type { Champion } from "@/hooks/useChampions";
import "./ChampionCard.css";

const CONTENT_BACKGROUND =
  "radial-gradient(circle at top, rgba(66, 192, 206, 0.18), transparent 55%), linear-gradient(185deg, rgba(2, 10, 19, 0.96) 0%, rgba(6, 35, 46, 0.93) 45%, rgba(9, 61, 77, 0.9) 100%)";

const GOLD_LINE_BASE_STYLE: CSSProperties = {
  height: "4px",
  width: "100%",
  borderRadius: "999px",
  background:
    "linear-gradient(90deg, transparent 0%, rgba(166,142,78,0.2) 8%, rgba(166,142,78,0.95) 50%, rgba(166,142,78,0.2) 92%, transparent 100%)",
  clipPath: "polygon(0% 50%, 7% 0%, 93% 0%, 100% 50%, 93% 100%, 7% 100%)",
  boxShadow: "0 0 22px rgba(166, 142, 78, 0.35)",
  pointerEvents: "none",
};

interface ChampionCardProps {
  champion: Champion;
  index: number;
  onSelect?: (champion: Champion) => void;
  onViewPedigree?: (pedigreeUrl: string) => void;
  variants?: any;
}

export const ChampionCard = ({
  champion,
  index,
  onSelect,
  onViewPedigree,
  variants,
}: ChampionCardProps) => {
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
      `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.15) 0%, transparent 50%)`,
  );

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    const innerCard = cardRef.current.querySelector(
      ".champion-card-inner",
    ) as HTMLElement;
    if (innerCard) {
      innerCard.style.transition = "transform 0.1s ease-out";
      innerCard.style.transform = `rotateX(${-y * 20}deg) rotateY(${x * 20}deg)`;
    }

    cardRef.current.style.setProperty("--mouse-x", `${(x + 0.5) * 100}%`);
    cardRef.current.style.setProperty("--mouse-y", `${(y + 0.5) * 100}%`);

    mouseX.set(x);
    mouseY.set(y);
    setIsHovered(true);

    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: 1 - (e.clientY - rect.top) / rect.height,
    });
  };

  const handleMouseLeave = () => {
    const innerCard = cardRef.current?.querySelector(
      ".champion-card-inner",
    ) as HTMLElement;
    if (innerCard) {
      innerCard.style.transition = "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)";
      innerCard.style.transform = "rotateX(0deg) rotateY(0deg)";
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
      window.open(champion.pedigree, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <motion.div
      ref={cardRef}
      className="relative cursor-pointer group"
      style={{ perspective: "2000px" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      onClick={() => onSelect?.(champion)}
    >
      <motion.div
        className="champion-card-inner relative rounded-2xl overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.6)] transition-all duration-300 bg-[#010509]"
        style={{
          transformStyle: "preserve-3d",
          border: "2px solid rgba(166,142,78,0.7)",
          boxShadow:
            "0 0 12px rgba(166,142,78,0.25), 0 0 30px rgba(166,142,78,0.1), inset 0 0 0 1px rgba(166,142,78,0.08), 0 24px 60px rgba(0,0,0,0.6)",
        }}
      >
        {/* Dynamic light reflection */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: lightBackground,
            opacity: isHovered ? 1 : 0,
          }}
        />

        {/* Glow border on hover */}
        {/* Glow border on hover - Disabled for performance */}
        {/* <motion.div
           className="absolute inset-0 rounded-2xl pointer-events-none z-20"
           initial={{ opacity: 0 }}
           animate={{
             opacity: isHovered ? 1 : 0,
             boxShadow: isHovered
               ? "0 0 30px rgba(150, 150, 200, 0.3), inset 0 0 20px rgba(150, 150, 200, 0.1)"
               : "none",
           }}
           transition={{ duration: 0.3 }}
         /> */}

        {/* Obraz z efektami hover */}
        <div
          className="relative aspect-[4/3] overflow-hidden bg-transparent"
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none z-10" />
          <div
            className="absolute inset-0 z-20 bg-transparent select-none"
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          />
          {/* Obrazek championa */}
          {champion.images?.[0] ? (
            <motion.img
              src={champion.images[0]}
              alt={champion.name}
              loading="lazy"
              decoding="async"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
              className="w-full h-full object-contain object-top will-change-transform select-none pointer-events-none"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                if (!img.dataset.fallback) {
                  img.dataset.fallback = "1";
                  img.src = "/back.png";
                } else {
                  img.style.display = "none";
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-900/20">
              {/* Placeholder */}
            </div>
          )}

          {/* Scanline effect - Disabled for performance */}
          {/* <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 0.15 : 0 }}
          >
            <div className="absolute inset-0 gallery-scanline-pattern" />
          </motion.div> */}
        </div>

        {/* Content - numer gołębia i przycisk rodowodu */}
        <div
          className="relative p-6 gallery-card-content backdrop-blur-2xl overflow-hidden"
          style={{
            backgroundImage: CONTENT_BACKGROUND,
            backgroundBlendMode: "normal",
          }}
        >
          {/* Gold guide line under photo like in auction card */}
          <div className="-mt-4 mb-4" style={GOLD_LINE_BASE_STYLE} />

          {/* Numer obrączki */}
          <motion.h3 className="text-xl font-bold font-display text-white text-center group-hover:text-gold transition-all duration-300 mb-4 gallery-card-title drop-shadow-lg">
            {champion.ringNumber || champion.records[0] || champion.name}
          </motion.h3>

          <div className="mb-4" style={GOLD_LINE_BASE_STYLE} />

          {/* Przycisk rodowodu */}
          {champion.pedigree && (
            <div className="flex justify-center">
              <button
                onClick={handlePedigreeOpen}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 gold-button text-zinc-950 border-0 hover:bg-gold/90"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, rgba(166,142,78,0.9), rgba(166,142,78,0.8))",
                  color: "#0f0f0f",
                }}
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
