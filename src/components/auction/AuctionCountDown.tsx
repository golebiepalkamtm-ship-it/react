import React, { memo } from "react";
import { usePreciseAuctionTimer } from "@/hooks/useAuctions";

interface AuctionCountDownProps {
  endTime?: string | undefined;
}

export const AuctionCountDown: React.FC<AuctionCountDownProps> = memo(
  ({ endTime }) => {
    const { days, hours, minutes, seconds, centiseconds } =
      usePreciseAuctionTimer(endTime);

    const isUrgent =
      days === "00" &&
      hours === "00" &&
      minutes === "00" &&
      !centiseconds.includes("ended") &&
      !seconds.includes("end");

    return (
      <div
        className={`flex items-center gap-2 font-mono font-bold ${isUrgent ? "text-red-500 animate-[pulse_1s_ease-in-out_infinite] scale-105 transition-transform" : "text-white"}`}
      >
        <div className="flex flex-col items-center">
          <span className="text-2xl sm:text-3xl">{days}</span>
          <span className="text-[8px] tracking-[0.2em] opacity-40">DNI</span>
        </div>
        <span
          className={`text-xl sm:text-2xl opacity-30 -mt-4 ${isUrgent ? "text-red-500" : ""}`}
        >
          :
        </span>
        <div className="flex flex-col items-center">
          <span className="text-2xl sm:text-3xl">{hours}</span>
          <span className="text-[8px] tracking-[0.2em] opacity-40">GODZ</span>
        </div>
        <span
          className={`text-xl sm:text-2xl opacity-30 -mt-4 ${isUrgent ? "text-red-500" : ""}`}
        >
          :
        </span>
        <div className="flex flex-col items-center">
          <span className="text-2xl sm:text-3xl">{minutes}</span>
          <span className="text-[8px] tracking-[0.2em] opacity-40">MIN</span>
        </div>
        <span
          className={`text-xl sm:text-2xl opacity-30 -mt-4 ${isUrgent ? "text-red-500" : ""}`}
        >
          :
        </span>
        <div
          className={`flex flex-col items-center ${isUrgent ? "text-red-500" : "text-[#A68E4E]"}`}
        >
          <span className="text-2xl sm:text-3xl">{seconds}</span>
          <span className="text-[8px] tracking-[0.2em] opacity-40">SEK</span>
        </div>
        <span
          className={`text-xl sm:text-2xl opacity-30 -mt-4 ${isUrgent ? "text-red-500" : ""}`}
        >
          :
        </span>
        <div
          className={`flex flex-col items-center ${isUrgent ? "text-red-500/80" : "text-[#A68E4E]/80"}`}
        >
          <span className="text-2xl sm:text-3xl">{centiseconds}</span>
          <span className="text-[8px] tracking-[0.2em] opacity-40">SET</span>
        </div>
      </div>
    );
  },
);
