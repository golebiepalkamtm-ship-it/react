import React, { useEffect, useState, useMemo } from 'react';
import { useServerTime } from '@/providers/TimeProvider';

interface CardTimerProps {
  endTime?: string;
  className?: string;
  endingSoon?: boolean;
}

export const CardTimer: React.FC<CardTimerProps> = ({ endTime, className, endingSoon }) => {
  const { offset, isSynced } = useServerTime();
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!endTime) return;

    const update = () => {
      const end = new Date(endTime).getTime();
      // Use local time + offset to approximate server time
      const now = Date.now() + offset;
      setTimeLeft(Math.max(0, end - now));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endTime, offset]);

  const timeMeta = useMemo(() => {
    const days = Math.floor(timeLeft / 86400000).toString().padStart(2, "0");
    const hours = Math.floor((timeLeft % 86400000) / 3600000).toString().padStart(2, "0");
    const minutes = Math.floor((timeLeft % 3600000) / 60000).toString().padStart(2, "0");
    const seconds = Math.floor((timeLeft % 60000) / 1000).toString().padStart(2, "0");
    const isEnded = timeLeft <= 0;
    
    return { days, hours, minutes, seconds, isEnded };
  }, [timeLeft]);

  return (
    <div className={`flex items-center justify-between gap-2 ${className}`}>
      {["days", "hours", "minutes", "seconds"].map((label, idx) => (
        <div key={label} className="flex flex-col items-center flex-1 bg-white/5 rounded-xl py-2 border border-white/10">
          <span className={`text-lg font-bold leading-none transition-colors ${endingSoon ? 'text-red-400' : 'text-white'}`}>
            {timeMeta.isEnded ? "00" : (timeMeta as any)[label]}
          </span>
          <span className="text-[9px] uppercase tracking-wider text-white/40 mt-1">
            {["Dni", "Godz", "Min", "Sek"][idx]}
          </span>
        </div>
      ))}
    </div>
  );
};
