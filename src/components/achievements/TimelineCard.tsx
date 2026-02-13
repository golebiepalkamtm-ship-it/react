/**
 * TimelineCard — Awwwards-Level Cinematic Card Reveal
 * 
 * Ultra-premium reveal system featuring:
 * - Morphing clip-path geometric reveal (diamond → full card)
 * - 3D perspective flip with spring physics
 * - Holographic refraction light sweep
 * - Staggered kinetic content cascade
 * - Magnetic tilt-on-hover with parallax layers
 * - Particle burst accent on full reveal
 * - Liquid gold border animation
 * - Achievement items with wave reveal pattern
 */

import { motion, useScroll, useTransform, useSpring, useMotionValue, useInView } from "framer-motion";
import { useRef, useCallback, useState, useEffect } from "react";
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
  const innerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-100px" });
  const [hasRevealed, setHasRevealed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Magnetic tilt values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateXSpring = useSpring(mouseY, { stiffness: 150, damping: 20 });
  const rotateYSpring = useSpring(mouseX, { stiffness: 150, damping: 20 });

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });

  // Spring physics for organic scroll-linked motion
  const springConfig = { stiffness: 50, damping: 22, restDelta: 0.001 };
  
  const y = useSpring(
    useTransform(scrollYProgress, [0, 0.5, 1], [120, 0, -80]),
    springConfig
  );
  const cardOpacity = useTransform(scrollYProgress, [0, 0.12, 0.85, 1], [0, 1, 1, 0]);

  useEffect(() => {
    if (isInView && !hasRevealed) {
      const timer = setTimeout(() => setHasRevealed(true), 200);
      return () => clearTimeout(timer);
    }
  }, [isInView, hasRevealed]);

  const isEven = index % 2 === 0;

  // Magnetic hover handler
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!innerRef.current) return;
    const rect = innerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxTilt = 8;
    
    mouseX.set(((e.clientX - centerX) / (rect.width / 2)) * maxTilt);
    mouseY.set(-((e.clientY - centerY) / (rect.height / 2)) * maxTilt);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  }, [mouseX, mouseY]);

  // Parse rank from achievement text
  const getRank = (text: string): "gold" | "silver" | "bronze" | null => {
    const lower = text.toLowerCase();
    if (lower.includes("mistrz") && !lower.includes("wicemistrz") && !lower.includes("v-ce")) return "gold";
    if (lower.includes("wicemistrz") || lower.includes("v-ce mistrz")) return "silver";
    if (lower.includes("przodownik") || lower.includes("miejsce")) return "bronze";
    return null;
  };

  // Stagger revealing variants for content
  const contentReveal = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.4,
      },
    },
  };

  const itemReveal = {
    hidden: { 
      opacity: 0, 
      x: isEven ? -30 : 30, 
    },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <div
      ref={cardRef}
      className="timeline-card-wrapper relative mb-32 md:mb-44"
    >
      <motion.div
        style={{ y, opacity: cardOpacity }}
        className="w-full"
      >
      <div className={`flex items-center gap-8 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
        
        {/* ==========================================
         * YEAR — Cinematic reveal with counter effect
         * ========================================== */}
        <motion.div
          className="hidden md:block absolute inset-0 -z-10 overflow-hidden pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isInView ? 1 : 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Giant Year Number with clip-path reveal */}
          <motion.span
            className={`year-ghost absolute text-[8rem] lg:text-[12rem] font-display font-black leading-none select-none
              ${isEven ? 'left-8' : 'right-8'} top-1/2 -translate-y-1/2`}
            initial={{ 
              opacity: 0,
              clipPath: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)",
            }}
            animate={isInView ? { 
              opacity: 1,
              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            } : {}}
            transition={{ 
              duration: 1.4, 
              delay: 0.1,
              ease: [0.16, 1, 0.3, 1],
              clipPath: { duration: 1.2, ease: [0.65, 0, 0.35, 1] },
            }}
            style={{
              color: 'transparent',
              WebkitTextStroke: '2px rgba(212, 175, 55, 0.25)',
              textShadow: '0 0 80px rgba(212, 175, 55, 0.15)',
            }}
          >
            {event.year}
          </motion.span>
        </motion.div>

        {/* ==========================================
         * MAIN CARD — 3D Perspective + Clip-path reveal
         * ========================================== */}
        <motion.div
          ref={innerRef}
          className={`awwwards-card relative w-full md:w-[62%] lg:w-[58%] z-10
            ${isEven ? 'md:ml-auto' : 'md:mr-auto'}`}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          style={{
            perspective: 1200,
          }}
        >
          {/* Card with 3D tilt */}
          <motion.div
            className="awwwards-card-inner relative rounded-2xl overflow-hidden"
            style={{
              rotateX: rotateXSpring,
              rotateY: rotateYSpring,
              transformStyle: "preserve-3d",
            }}
            // Clip-path morphing reveal — diamond to rectangle
            initial={{ 
              clipPath: isEven
                ? "polygon(0% 50%, 50% 0%, 100% 50%, 50% 100%)"
                : "circle(0% at 50% 50%)",
              opacity: 0,
              scale: 0.92,
            }}
            animate={isInView ? { 
              clipPath: isEven 
                ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"
                : "circle(75% at 50% 50%)",
              opacity: 1,
              scale: 1,
            } : {}}
            transition={{ 
              duration: 1.2, 
              delay: 0.15,
              ease: [0.16, 1, 0.3, 1],
              clipPath: { duration: 1.0, ease: [0.65, 0, 0.35, 1] },
            }}
          >
            {/* Card body */}
            <div className="awwwards-card-body p-8 md:p-10">
              {/* ---- Animated liquid gold border ---- */}
              <div className="absolute inset-0 rounded-2xl pointer-events-none" 
                style={{ padding: '1px' }}>
                <motion.div 
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: `conic-gradient(from ${isHovered ? '0deg' : '180deg'}, 
                      transparent 0%, 
                      rgba(212, 175, 55, 0.6) 10%, 
                      transparent 20%, 
                      rgba(212, 175, 55, 0.3) 40%, 
                      transparent 60%, 
                      rgba(212, 175, 55, 0.6) 80%, 
                      transparent 100%)`,
                    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                    padding: '1.5px',
                  }}
                  animate={{
                    rotate: isHovered ? 360 : 0,
                  }}
                  transition={{
                    duration: isHovered ? 3 : 0,
                    repeat: isHovered ? Infinity : 0,
                    ease: "linear",
                  }}
                />
              </div>

              {/* ---- Holographic light sweep ---- */}
              <motion.div
                className="absolute inset-0 pointer-events-none z-20"
                initial={{ x: "-120%", opacity: 0 }}
                animate={hasRevealed ? { 
                  x: ["-120%", "120%"],
                  opacity: [0, 0.6, 0],
                } : {}}
                transition={{ 
                  duration: 1.2, 
                  delay: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <div className="w-1/3 h-full"
                  style={{
                    background: 'linear-gradient(105deg, transparent 30%, rgba(212, 175, 55, 0.15) 45%, rgba(255, 255, 255, 0.1) 50%, rgba(212, 175, 55, 0.15) 55%, transparent 70%)',
                  }}
                />
              </motion.div>

              {/* ---- Breathing ambient glow ---- */}
              <motion.div
                className="absolute -top-20 left-1/2 -translate-x-1/2 w-[180%] h-40 pointer-events-none z-0"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(212, 175, 55, 0.12) 0%, transparent 70%)',
                }}
                animate={isActive ? {
                  opacity: [0.3, 0.7, 0.3],
                  scaleX: [0.9, 1.1, 0.9],
                } : { opacity: 0.15 }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* ========================
               * CONTENT — Staggered reveal
               * ======================== */}
              <motion.div
                className="relative z-10"
                variants={contentReveal}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
              >
                {/* Mobile Year */}
                <motion.div 
                  className="md:hidden mb-5"
                  variants={itemReveal}
                >
                  <span className="font-display text-5xl font-bold text-yellow-400 drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]">
                    {event.year}
                  </span>
                </motion.div>

                {/* Year badge — desktop */}
                <motion.div
                  className="hidden md:inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full border border-yellow-400/40 bg-yellow-400/10 text-yellow-400 font-bold text-sm tracking-widest"
                  variants={itemReveal}
                  style={{
                    boxShadow: '0 0 20px rgba(212, 175, 55, 0.2), inset 0 0 20px rgba(212, 175, 55, 0.05)',
                  }}
                >
                  <motion.span
                    animate={isActive ? { 
                      textShadow: [
                        "0 0 5px rgba(212,175,55,0)", 
                        "0 0 15px rgba(212,175,55,0.8)", 
                        "0 0 5px rgba(212,175,55,0)"
                      ],
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {event.year}
                  </motion.span>
                </motion.div>

                {/* Title with split-letter reveal */}
                <motion.h3
                  className="font-display text-2xl md:text-3xl font-bold mb-4 overflow-hidden"
                  variants={itemReveal}
                >
                  <span className="inline-block">
                    {event.title.split("").map((char, i) => (
                      <motion.span
                        key={i}
                        className="inline-block text-yellow-400"
                        initial={{ y: "100%", opacity: 0, rotateX: 90 }}
                        animate={isInView ? { y: "0%", opacity: 1, rotateX: 0 } : {}}
                        transition={{
                          duration: 0.6,
                          delay: 0.5 + i * 0.025,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        style={{
                          textShadow: '0 0 20px rgba(212, 175, 55, 0.4)',
                        }}
                      >
                        {char === " " ? "\u00A0" : char}
                      </motion.span>
                    ))}
                  </span>
                </motion.h3>

                {/* Highlight badge with count-up effect */}
                {event.highlight && (
                  <motion.div
                    className="mb-5 flex items-center gap-3"
                    variants={itemReveal}
                  >
                    <motion.div
                      className="h-[2px] bg-gradient-to-r from-yellow-400/80 to-transparent flex-1"
                      initial={{ scaleX: 0 }}
                      animate={isInView ? { scaleX: 1 } : {}}
                      transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      style={{ transformOrigin: isEven ? "left" : "right" }}
                    />
                    <span className="text-xs text-yellow-400/90 tracking-[0.25em] uppercase font-black whitespace-nowrap">
                      {event.highlight}
                    </span>
                    <motion.div
                      className="h-[2px] bg-gradient-to-l from-yellow-400/80 to-transparent flex-1"
                      initial={{ scaleX: 0 }}
                      animate={isInView ? { scaleX: 1 } : {}}
                      transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      style={{ transformOrigin: isEven ? "right" : "left" }}
                    />
                  </motion.div>
                )}

                {/* ========================
                 * ACHIEVEMENTS — Wave reveal
                 * ======================== */}
                <ul className="space-y-2 text-sm">
                  {event.achievements.map((achievement, i) => {
                    const rank = getRank(achievement);
                    return (
                      <motion.li
                        key={i}
                        className="achievement-item-awwwards flex items-start gap-2.5 group relative"
                        initial={{ 
                          opacity: 0, 
                          x: isEven ? -30 : 30,
                          y: 10,
                        }}
                        animate={isInView ? { 
                          opacity: 1, 
                          x: 0,
                          y: 0,
                        } : {}}
                        transition={{
                          duration: 0.55,
                          delay: 0.7 + i * 0.045,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        whileHover={{
                          x: isEven ? 8 : -8,
                          transition: { duration: 0.25, ease: "easeOut" },
                        }}
                      >
                        {/* Achievement rank glow bar */}
                        <motion.div
                          className="absolute left-0 top-0 bottom-0 w-[2px] rounded-full"
                          style={{
                            background: rank === "gold" 
                              ? "linear-gradient(180deg, rgba(212,175,55,0.8), rgba(212,175,55,0))"
                              : rank === "silver"
                              ? "linear-gradient(180deg, rgba(192,197,206,0.8), rgba(192,197,206,0))"
                              : rank === "bronze"
                              ? "linear-gradient(180deg, rgba(205,127,50,0.8), rgba(205,127,50,0))"
                              : "linear-gradient(180deg, rgba(255,255,255,0.1), transparent)",
                            transformOrigin: "top",
                          }}
                          initial={{ scaleY: 0 }}
                          animate={isInView ? { scaleY: 1 } : {}}
                          transition={{ duration: 0.4, delay: 0.8 + i * 0.045 }}
                        />
                        
                        <div className="pl-3 flex items-start gap-2.5">
                          <MedalBadge rank={rank} index={i} />
                          <span className="text-gray-300 font-medium group-hover:text-yellow-200 transition-colors duration-300 leading-relaxed">
                            {achievement}
                          </span>
                        </div>
                      </motion.li>
                    );
                  })}
                </ul>
              </motion.div>

              {/* ---- Bottom animated draw line ---- */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-[1px] overflow-hidden"
              >
                <motion.div
                  className="h-full w-full"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.6), rgba(212,175,55,0.8), rgba(212,175,55,0.6), transparent)",
                  }}
                  initial={{ x: "-100%" }}
                  animate={isInView ? { x: "0%" } : {}}
                  transition={{ duration: 1.2, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
              </motion.div>

              {/* ---- Top accent line ---- */}
              <motion.div
                className="absolute top-0 left-0 right-0 h-[1px] overflow-hidden"
              >
                <motion.div
                  className="h-full w-full"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)",
                  }}
                  initial={{ scaleX: 0 }}
                  animate={isInView ? { scaleX: 1 } : {}}
                  transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* ==========================================
         * CONNECTION LINE — Animated draw-on
         * ========================================== */}
        <div
          className={`hidden md:block absolute top-1/2 -translate-y-1/2 w-24 h-[1px]
            ${isEven ? 'right-[62%] lg:right-[58%]' : 'left-[62%] lg:left-[58%]'}`}
        >
          <motion.div
            className="h-full relative"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ 
              transformOrigin: isEven ? "right" : "left",
            }}
          >
            {/* Line */}
            <div className="absolute inset-0"
              style={{
                background: `linear-gradient(${isEven ? '270deg' : '90deg'}, 
                  rgba(212,175,55,0.6), rgba(212,175,55,0.1), transparent)`,
              }}
            />
            {/* Animated dot traveling along line */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
              style={{
                background: 'rgba(212,175,55,0.8)',
                boxShadow: '0 0 10px rgba(212,175,55,0.6)',
              }}
              initial={{ left: isEven ? "100%" : "0%" }}
              animate={isInView ? { 
                left: isEven ? "0%" : "100%",
                opacity: [1, 1, 0],
              } : {}}
              transition={{ 
                duration: 0.8, 
                delay: 0.6, 
                ease: [0.16, 1, 0.3, 1],
              }}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  </div>
  );
};

export default TimelineCard;