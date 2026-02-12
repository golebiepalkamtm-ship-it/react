/**
 * TimelineCard — Ultra-Luxury Edition
 * 
 * Holographic glass card with:
 * - 3D spring parallax on scroll
 * - Prismatic light leak on hover
 * - Medal badge system (gold/silver/bronze)
 * - Staggered achievement reveals with kinetic typography
 * - Animated draw-line at bottom
 */

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";
import MedalBadge from "./MedalBadge";

interface TimelineEvent {
  year: number;
  title: string;
  achievements: string[];
  highlight?: string;
}

interface TimelineCardProps {
  event: TimelineEvent;
  index: number;
  isActive: boolean;
}

const TimelineCard = ({ event, index, isActive }: TimelineCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });

  // Spring physics — low stiffness for weighted, organic motion
  const springConfig = { stiffness: 60, damping: 20, restDelta: 0.001 };
  
  const y = useSpring(
    useTransform(scrollYProgress, [0, 0.5, 1], [100, 0, -100]),
    springConfig
  );
  const scale = useSpring(
    useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.88, 1, 1, 0.92]),
    springConfig
  );
  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.5, 1], [8, 0, -8]),
    springConfig
  );
  const cardOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);

  const isEven = index % 2 === 0;

  // Parse rank from achievement text
  const getRank = (text: string): "gold" | "silver" | "bronze" | null => {
    const lower = text.toLowerCase();
    if (lower.includes("mistrz") && !lower.includes("wicemistrz") && !lower.includes("v-ce")) return "gold";
    if (lower.includes("wicemistrz") || lower.includes("v-ce mistrz")) return "silver";
    if (lower.includes("przodownik") || lower.includes("miejsce")) return "bronze";
    return null;
  };

  return (
    <motion.div
      ref={cardRef}
      style={{ y, scale, rotateX, opacity: cardOpacity }}
      className="tunnel-card relative mb-28 md:mb-40"
    >
      <div className={`flex items-center gap-8 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
        
        {/* Year Ghost — Parallax layer */}
        <motion.div
          className="hidden md:block absolute inset-0 -z-10 overflow-hidden pointer-events-none mouse-parallax"
          data-depth="0.3"
          initial={{ opacity: 0 }}
          animate={{ opacity: isActive ? 1 : 0.6 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span
            className={`year-ghost absolute text-[8rem] lg:text-[12rem] font-display font-black leading-none
              ${isEven ? 'left-8' : 'right-8'} top-1/2 -translate-y-1/2 opacity-100 text-yellow-500/80 drop-shadow-[0_0_60px_rgba(255,215,0,0.6)]`}
            style={{
              WebkitTextStroke: '3px rgba(255, 215, 0, 0.8)',
              filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.5))'
            }}
          >
            {event.year}
          </span>
        </motion.div>

        {/* Content Card — Luxury Glass */}
        <motion.div
          className={`glass-card p-8 md:p-10 w-full md:w-[60%] lg:w-[55%] relative z-10
            ${isEven ? 'md:ml-auto' : 'md:mr-auto'}`}
          whileHover={{
            scale: 1.015,
            "--glow-intensity": 1,
          } as any}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
          }}
        >
          {/* Holographic shimmer overlay */}
          <div className="holographic-shimmer" />

          {/* Front light — breathing glow */}
          <motion.div
            className="card-front-light absolute -top-24 left-1/2 -translate-x-1/2 w-[200%] h-48 pointer-events-none"
            animate={{
              opacity: isActive ? [0.4, 0.7, 0.4] : 0.2,
              scale: isActive ? [1, 1.05, 1] : 1,
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Mobile Year */}
          <div className="md:hidden mb-5">
            <span className="font-display text-5xl font-bold text-yellow-400 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
              {event.year}
            </span>
          </div>

          {/* Year badge — desktop */}
          <motion.div
            className="hidden md:inline-flex luxury-badge mb-5 border-yellow-400 bg-yellow-400/20 text-yellow-400 font-bold shadow-[0_0_15px_rgba(255,215,0,0.4)]"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
          >
            {event.year}
          </motion.div>

          <motion.h3
            className="font-display text-2xl md:text-3xl font-bold mb-6 text-yellow-400 drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]"
            {...{
              transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
              viewport: { once: true, margin: "-50px" },
            }}
          >
            {event.title}
          </motion.h3>

          {/* Highlight count */}
          {event.highlight && (
            <motion.p
              className="text-xs text-yellow-400 tracking-widest uppercase mb-5 font-black drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {event.highlight}
            </motion.p>
          )}

          {/* Luxury divider */}
          <motion.div
            className="luxury-divider mb-5 bg-yellow-400 h-[2px] shadow-[0_0_15px_rgba(255,215,0,0.5)]"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            style={{ transformOrigin: isEven ? "left" : "right" }}
          />

          {/* Achievements — staggered kinetic reveal */}
          <ul className="space-y-2 text-sm">
            {event.achievements.map((achievement, i) => {
              const rank = getRank(achievement);
              return (
                <motion.li
                  key={i}
                  className="achievement-item flex items-start gap-2.5 group"
                  initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.03,
                    ease: [0.33, 1, 0.68, 1],
                  }}
                  viewport={{ once: true, margin: "-20px" }}
                >
                  <MedalBadge rank={rank} index={i} />
                  <span className="text-gray-300 font-medium group-hover:text-yellow-200 transition-colors duration-300">
                    {achievement}
                  </span>
                </motion.li>
              );
            })}
          </ul>

          {/* Bottom draw line */}
          <motion.div
            className="absolute bottom-0 left-0 h-[1px]"
            style={{
              background: `linear-gradient(90deg, hsl(var(--glow-primary)), hsl(var(--glow-secondary)), transparent)`,
            }}
            initial={{ width: "0%", opacity: 0 }}
            whileInView={{ width: "100%", opacity: 1 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
          />
        </motion.div>

        {/* Connection line (desktop) */}
        <div
          className={`hidden md:block absolute top-1/2 -translate-y-1/2 w-20 h-[1px]
            ${isEven ? 'right-[60%] lg:right-[55%]' : 'left-[60%] lg:left-[55%]'}`}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(${isEven ? '270deg' : '90deg'}, hsl(var(--glow-primary) / 0.6), transparent)`,
              transformOrigin: isEven ? "right" : "left",
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default TimelineCard;