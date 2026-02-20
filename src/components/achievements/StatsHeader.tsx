/**
 * StatsHeader — Luxury Stats Display
 * 
 * Premium card layout with:
 * - Animated counting with spring physics
 * - Medal-colored icons with breathing glow
 * - Holographic shimmer sweep
 * - Center-out stagger reveal
 */

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Trophy, Medal, Award } from "lucide-react";
import { useEffect, useRef } from "react";

interface StatsHeaderProps {
  mistrz: number;
  wicemistrz: number;
  przodownik: number;
}

const StatsHeader = ({ mistrz, wicemistrz, przodownik }: StatsHeaderProps) => {
  const stats = [
    {
      label: "Mistrz",
      value: mistrz,
      icon: Trophy,
      gradient: "from-[hsl(43,90%,55%)] to-[hsl(35,80%,40%)]",
      glow: "hsl(var(--medal-gold) / 0.3)",
      borderGlow: "hsl(var(--medal-gold) / 0.2)",
    },
    {
      label: "Wicemistrz",
      value: wicemistrz,
      icon: Medal,
      gradient: "from-[hsl(220,10%,75%)] to-[hsl(220,5%,55%)]",
      glow: "hsl(var(--medal-silver) / 0.25)",
      borderGlow: "hsl(var(--medal-silver) / 0.15)",
    },
    {
      label: "Przodownik",
      value: przodownik,
      icon: Award,
      gradient: "from-[hsl(25,70%,50%)] to-[hsl(20,60%,35%)]",
      glow: "hsl(var(--medal-bronze) / 0.25)",
      borderGlow: "hsl(var(--medal-bronze) / 0.15)",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.6,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.85, rotateX: -10 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 18,
      },
    },
  };

  return (
    <motion.div
      className="flex flex-wrap justify-center gap-4 md:gap-6 mb-16"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          className="stat-card glass-card relative flex items-center gap-4 px-6 py-4 md:px-8 md:py-5"
          variants={cardVariants}
          whileHover={{
            scale: 1.04,
            "--glow-intensity": 0.8,
            transition: { type: "spring", stiffness: 400, damping: 25 },
          } as any}
          style={{
            boxShadow: `0 0 30px ${stat.glow}`,
          }}
        >
          {/* Holographic shimmer */}
          <div className="holographic-shimmer" />

          {/* Icon */}
          <motion.div
            className="relative"
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.03, 1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              delay: index * 0.8,
              ease: "easeInOut",
            }}
          >
            <stat.icon
              className={`w-7 h-7 md:w-9 md:h-9 bg-gradient-to-br ${stat.gradient} bg-clip-text`}
              style={{ color: `hsl(var(--medal-${stat.label === "Mistrz" ? "gold" : stat.label === "Wicemistrz" ? "silver" : "bronze"}))` }}
            />
          </motion.div>

          {/* Counter */}
          <div className="flex flex-col">
            <AnimatedCounter value={stat.value} delay={0.8 + index * 0.15} />
            <motion.span
              className="text-[10px] md:text-xs text-muted-foreground font-medium tracking-[0.2em] uppercase"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.4,
                delay: 1.2 + index * 0.15,
                ease: [0.33, 1, 0.68, 1],
              }}
            >
              {stat.label}
            </motion.span>
          </div>

          {/* Shimmer sweep */}
          <motion.div
            className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
            initial={{ x: "-100%" }}
            animate={{ x: "300%" }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: 3 + index * 0.6,
              repeatDelay: 5,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <div className="w-1/4 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  );
};

/** Animated counter that counts up from 0 */
const AnimatedCounter = ({ value, delay }: { value: number; delay: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const displayRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 2,
      delay,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [value, delay, count]);

  useEffect(() => {
    const unsubscribe = rounded.on("change", (v) => {
      if (displayRef.current) {
        displayRef.current.textContent = String(v);
      }
    });
    return unsubscribe;
  }, [rounded]);

  return (
    <motion.span
      ref={displayRef}
      className="text-2xl md:text-3xl font-bold text-gold tabular-nums"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.6,
        delay,
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
    >
      0
    </motion.span>
  );
};

export default StatsHeader;