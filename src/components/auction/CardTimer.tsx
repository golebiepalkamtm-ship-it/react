import React, { useEffect, useState, useMemo } from 'react';
import { useServerTime } from '@/providers/TimeProvider';
import { calculateTimeLeft, type TimeLeftDetails } from '@/utils/auction';

interface CardTimerProps {
  endTime?: string;
  className?: string;
  endingSoon?: boolean;
}

export const CardTimer: React.FC<CardTimerProps> = ({ endTime, className, endingSoon }) => {
  const { offset } = useServerTime();
  const [timeLeft, setTimeLeft] = useState<TimeLeftDetails | null>(null);

  useEffect(() => {
    if (!endTime) return;

    const update = () => {
      const result = calculateTimeLeft(endTime, offset);
      setTimeLeft(result);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endTime, offset]);

  const timeMeta = useMemo(() => {
    if (!timeLeft || timeLeft.isExpired) {
      return {
        days: "00",
        hours: "00",
        minutes: "00",
        seconds: "00",
        isEnded: true,
      };
    }

    return {
      days: timeLeft.days.toString().padStart(2, "0"),
      hours: timeLeft.hours.toString().padStart(2, "0"),
      minutes: timeLeft.minutes.toString().padStart(2, "0"),
      seconds: timeLeft.seconds.toString().padStart(2, "0"),
      isEnded: false,
    };
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
