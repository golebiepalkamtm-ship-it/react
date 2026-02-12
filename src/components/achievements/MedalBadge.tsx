/**
 * MedalBadge — Micro-component for achievement rank indicators
 * 
 * Gold (Mistrz), Silver (Wicemistrz), Bronze (Przodownik)
 * Spring-animated entrance with rank-specific glow
 */

import { motion } from "framer-motion";

interface MedalBadgeProps {
  rank: "gold" | "silver" | "bronze" | null;
  index: number;
}

const MedalBadge = ({ rank, index }: MedalBadgeProps) => {
  if (!rank) {
    return (
      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-muted-foreground/30 flex-shrink-0" />
    );
  }

  const config = {
    gold: {
      className: "medal-gold",
      symbol: "★",
      label: "Mistrz",
    },
    silver: {
      className: "medal-silver",
      symbol: "◆",
      label: "Wicemistrz",
    },
    bronze: {
      className: "medal-bronze",
      symbol: "●",
      label: "Przodownik",
    },
  };

  const { className, symbol } = config[rank];

  return (
    <motion.span
      className={`${className} mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0`}
      initial={{ scale: 0, rotate: -180 }}
      whileInView={{ scale: 1, rotate: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.03 + 0.1,
        type: "spring",
        stiffness: 400,
        damping: 15,
      }}
      viewport={{ once: true }}
    >
      {symbol}
    </motion.span>
  );
};

export default MedalBadge;