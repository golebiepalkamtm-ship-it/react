/**
 * ProgressBar — Luxury Vertical Navigator
 * 
 * Refined with:
 * - Thinner, more elegant track
 * - Dot pulse with prismatic glow
 * - Smooth spring transitions
 */

import { motion } from "framer-motion";

interface ProgressBarProps {
  years: number[];
  activeIndex: number;
}

const ProgressBar = ({ years, activeIndex }: ProgressBarProps) => {
  const progressPercent = ((activeIndex + 1) / years.length) * 100;

  return (
    <div className="fixed left-4 md:left-8 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-center gap-2">
      {/* Track */}
      <div className="relative w-[2px] h-72 xl:h-80 rounded-full bg-border/30 overflow-hidden">
        {/* Active fill */}
        <motion.div
          className="absolute top-0 left-0 w-full progress-glow rounded-full"
          animate={{ height: `${progressPercent}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
        />

        {/* Year markers */}
        {years.map((year, index) => {
          const position = (index / (years.length - 1)) * 100;
          const isActive = index === activeIndex;
          const isPast = index < activeIndex;

          return (
            <motion.div
              key={year}
              className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3"
              style={{ top: `${position}%` }}
            >
              {/* Dot */}
              <motion.div
                className={`rounded-full transition-all duration-500 ${
                  isActive
                    ? "w-2.5 h-2.5 bg-primary"
                    : isPast
                    ? "w-1.5 h-1.5 bg-primary/40"
                    : "w-1 h-1 bg-muted-foreground/20"
                }`}
                animate={
                  isActive
                    ? {
                        scale: [1, 1.4, 1],
                        boxShadow: [
                          "0 0 0px hsl(var(--primary) / 0)",
                          "0 0 20px hsl(var(--primary) / 0.6)",
                          "0 0 0px hsl(var(--primary) / 0)",
                        ],
                      }
                    : {}
                }
                transition={{ duration: 2, repeat: isActive ? Infinity : 0, ease: "easeInOut" }}
              />

              {/* Year label */}
              <motion.span
                className={`font-display text-[10px] tracking-[0.15em] whitespace-nowrap transition-all duration-500 ${
                  isActive
                    ? "text-primary opacity-100"
                    : isPast
                    ? "text-muted-foreground/50 opacity-60"
                    : "text-muted-foreground/20 opacity-30"
                }`}
                animate={isActive ? { x: [0, 3, 0] } : { x: 0 }}
                transition={{ duration: 3, repeat: isActive ? Infinity : 0, ease: "easeInOut" }}
              >
                {year}
              </motion.span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar;