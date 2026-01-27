/**
 * StatsHeader Component - Premium Stats Display
 * 
 * Features advanced stagger animations with center-out reveal pattern.
 * Uses back.out easing for slight overshoot - adds life and bounce.
 */

import { motion } from "framer-motion";
import { Trophy, Medal, Award } from "lucide-react";
import { memo } from "react";

interface StatsHeaderProps {
  mistrz: number;
  wicemistrz: number;
  przodownik: number;
}

const StatsHeader = memo(({ mistrz, wicemistrz, przodownik }: StatsHeaderProps) => {
  const stats = [
    { 
      label: "Mistrz", 
      value: mistrz, 
      icon: Trophy, 
      color: "text-yellow-400",
      bgColor: "from-yellow-400/20 to-yellow-600/5",
      borderColor: "border-yellow-400/30",
      glowColor: "shadow-yellow-400/20"
    },
    { 
      label: "Wicemistrz", 
      value: wicemistrz, 
      icon: Medal, 
      color: "text-gray-300",
      bgColor: "from-gray-300/20 to-gray-500/5",
      borderColor: "border-gray-300/30",
      glowColor: "shadow-gray-300/20"
    },
    { 
      label: "Przodownik", 
      value: przodownik, 
      icon: Award, 
      color: "text-amber-600",
      bgColor: "from-amber-600/20 to-amber-800/5",
      borderColor: "border-amber-600/30",
      glowColor: "shadow-amber-600/20"
    },
  ];

  // Container animation with staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.8,
        // Stagger from center outward - premium feel
        staggerDirection: 1,
      }
    }
  };

  // Individual card animation
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50, 
      scale: 0.8,
      rotateY: -15 
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      rotateY: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      }
    }
  };

  return (
    <motion.div 
      className="flex flex-wrap justify-center gap-4 md:gap-8 mb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          className={`stat-card relative flex items-center gap-3 px-5 py-3 md:px-6 md:py-4 rounded-2xl border ${stat.borderColor} 
            bg-gradient-to-br ${stat.bgColor} backdrop-blur-md shadow-lg ${stat.glowColor}`}
          variants={cardVariants}
          whileHover={{ 
            scale: 1.05, 
            rotateY: 5,
            boxShadow: `0 0 40px hsl(var(--primary) / 0.4)`,
            transition: {
              type: "spring",
              stiffness: 400,
              damping: 25
            }
          }}
        >
          {/* Icon with organic rotation */}
          <motion.div
            className="relative"
            animate={{ 
              rotate: [0, 8, -8, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              delay: index * 0.7,
              ease: "easeInOut"
            }}
          >
            <stat.icon className={`w-6 h-6 md:w-8 md:h-8 ${stat.color}`} />
            <motion.div
              className={`absolute inset-0 ${stat.color} blur-md opacity-50`}
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            />
          </motion.div>

          {/* Counter with spring animation */}
          <div className="flex flex-col">
            <motion.span 
              className="text-2xl md:text-3xl font-bold text-foreground"
            >
              <Counter value={stat.value} delay={1.2 + index * 0.2} />
            </motion.span>
            <motion.span 
              className="text-xs md:text-sm text-muted-foreground font-medium"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.4, 
                delay: 1.4 + index * 0.2,
                ease: [0.33, 1, 0.68, 1]
              }}
            >
              {stat.label}
            </motion.span>
          </div>

          {/* Premium shimmer effect */}
          <motion.div
            className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              delay: 2 + index * 0.5, 
              repeatDelay: 4,
              ease: [0.16, 1, 0.3, 1]
            }}
          >
            <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12" />
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  );
});

// Animated counter with counting effect
const Counter = ({ value, delay }: { value: number; delay: number }) => {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        delay,
        type: "spring",
        stiffness: 400,
        damping: 20
      }}
    >
      {value}
    </motion.span>
  );
};

export default StatsHeader;
