import { motion } from "framer-motion";

interface ProgressBarProps {
  years: number[];
  activeIndex: number;
}

const ProgressBar = ({ years, activeIndex }: ProgressBarProps) => {
  const progressPercent = ((activeIndex + 1) / years.length) * 100;
  
  return (
    <div className="fixed left-4 md:left-8 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col items-center gap-2">
      {/* Progress Track */}
      <div className="relative w-1 h-64 lg:h-80 rounded-full bg-muted/30 overflow-hidden">
        {/* Active Progress */}
        <motion.div 
          className="absolute top-0 left-0 w-full progress-glow rounded-full"
          style={{ height: `${progressPercent}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />
        
        {/* Year Markers */}
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
                className={`w-3 h-3 rounded-full border-2 transition-all duration-300
                  ${isActive 
                    ? 'bg-black border-black glow-black animate-pulse-glow' 
                    : isPast 
                      ? 'bg-black/50 border-black/50' 
                      : 'bg-muted border-muted-foreground/30'
                  }`}
                animate={isActive ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
              />
              
              {/* Year Label */}
              <motion.span 
                className={`font-display text-xs tracking-wider whitespace-nowrap transition-all duration-300
                  ${isActive 
                    ? 'text-black glow-text opacity-100' 
                    : isPast 
                      ? 'text-muted-foreground opacity-70' 
                      : 'text-muted-foreground/50 opacity-50'
                  }`}
                animate={isActive ? { x: [0, 4, 0] } : { x: 0 }}
                transition={{ duration: 2, repeat: Infinity }}
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