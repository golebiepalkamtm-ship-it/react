import React from 'react';
import { usePreciseAuctionTimer } from '@/hooks/useAuctions';

interface AuctionCountDownProps {
  endTime?: string;
}

export const AuctionCountDown: React.FC<AuctionCountDownProps> = ({ endTime }) => {
  const { days, hours, minutes, seconds, centiseconds } = usePreciseAuctionTimer(endTime);

  return (
    <div className="flex items-center gap-2 text-white font-mono font-bold">
      <div className="flex flex-col items-center">
        <span className="text-2xl sm:text-3xl">{days}</span>
        <span className="text-[8px] tracking-[0.2em] opacity-40">DNI</span>
      </div>
      <span className="text-xl sm:text-2xl opacity-30 -mt-4">:</span>
      <div className="flex flex-col items-center">
        <span className="text-2xl sm:text-3xl">{hours}</span>
        <span className="text-[8px] tracking-[0.2em] opacity-40">GODZ</span>
      </div>
      <span className="text-xl sm:text-2xl opacity-30 -mt-4">:</span>
      <div className="flex flex-col items-center">
        <span className="text-2xl sm:text-3xl">{minutes}</span>
        <span className="text-[8px] tracking-[0.2em] opacity-40">MIN</span>
      </div>
      <span className="text-xl sm:text-2xl opacity-30 -mt-4">:</span>
      <div className="flex flex-col items-center text-primary">
        <span className="text-2xl sm:text-3xl">{seconds}</span>
        <span className="text-[8px] tracking-[0.2em] opacity-40">SEK</span>
      </div>
      <span className="text-xl sm:text-2xl opacity-30 -mt-4">:</span>
      <div className="flex flex-col items-center text-primary/80">
        <span className="text-2xl sm:text-3xl">{centiseconds}</span>
        <span className="text-[8px] tracking-[0.2em] opacity-40">SET</span>
      </div>
    </div>
  );
};
