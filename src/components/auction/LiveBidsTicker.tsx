import React from "react";
import { motion } from "framer-motion";
import { Gavel, Clock } from "lucide-react";

export type LiveBid = {
  id: string;
  bidderName: string; // e.g. "K***a"
  amount: number;
  timeAgo: string; // e.g. "1 min temu"
  ringNumber: string;
};

const MOCK_BIDS: LiveBid[] = [
  { id: "1", bidderName: "A***k", amount: 1200, timeAgo: "1 min temu", ringNumber: "PL-0214-22-113" },
  { id: "2", bidderName: "M***j", amount: 3500, timeAgo: "3 min temu", ringNumber: "DV-0123-23-441" },
  { id: "3", bidderName: "P***r", amount: 800, timeAgo: "5 min temu", ringNumber: "PL-044-23-998" },
  { id: "4", bidderName: "T***s", amount: 1550, timeAgo: "8 min temu", ringNumber: "BE-23-4155123" },
  { id: "5", bidderName: "K***i", amount: 4200, timeAgo: "12 min temu", ringNumber: "PL-011-20-412" },
];

export const LiveBidsTicker = ({ bids = MOCK_BIDS }: { bids?: LiveBid[] }) => {
  // We duplicate the array to create a seamless loop effect
  const displayBids = [...bids, ...bids];

  return (
    <div className="w-full bg-[#020a13] border-y border-[#A68E4E]/30 overflow-hidden relative flex items-center h-12 shadow-[0_0_15px_rgba(0,0,0,0.8)] z-20">
      {/* Gradient fades on edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#020a13] to-transparent z-10 pointer-events-none" />
      
      {/* Live Badge */}
      <div className="absolute left-4 z-20 flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.3)]">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-[10px] uppercase tracking-widest font-bold text-red-500">Live Bids</span>
      </div>

      {/* Marquee Content */}
      <div className="flex flex-1 overflow-hidden ml-32">
        <motion.div
          className="flex whitespace-nowrap items-center gap-8"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            ease: "linear",
            duration: 30, // Adjust speed based on content length
            repeat: Infinity,
          }}
        >
          {displayBids.map((bid, i) => (
            <div key={`${bid.id}-${i}`} className="flex items-center gap-3">
              <span className="text-white/60 font-mono text-xs">{bid.timeAgo}</span>
              <span className="text-gold font-bold text-sm tracking-wider">{bid.ringNumber}</span>
              <span className="text-white/80 font-medium text-sm">{bid.bidderName}</span>
              <div className="flex items-center gap-1 bg-[#A68E4E]/10 px-2.5 py-0.5 rounded text-[#A68E4E] border border-[#A68E4E]/30">
                <Gavel className="w-3 h-3" />
                <span className="font-bold text-sm">{bid.amount.toLocaleString("pl-PL")} zł</span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#020a13] to-transparent z-10 pointer-events-none" />
    </div>
  );
};

export default LiveBidsTicker;
