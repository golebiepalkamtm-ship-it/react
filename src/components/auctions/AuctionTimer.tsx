import { useState, useEffect, useCallback } from "react";
import { Clock } from "lucide-react";

export interface AuctionTimerProps {
  endTime: Date;
  compact?: boolean;
}

export const AuctionTimer = ({ endTime, compact = false }: AuctionTimerProps) => {
  const calculateTimeLeft = useCallback(() => {
    const difference = endTime.getTime() - new Date().getTime();
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true, isUrgent: false };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    const isUrgent = days === 0 && hours < 1;

    return { days, hours, minutes, seconds, isExpired: false, isUrgent };
  }, [endTime]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  if (timeLeft.isExpired) {
    return (
      <div className={`flex items-center gap-1.5 text-destructive ${compact ? "text-xs" : "text-sm"}`}>
        <Clock className={compact ? "w-3 h-3" : "w-4 h-4"} />
        <span className="font-medium">Zakończona</span>
      </div>
    );
  }

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 ${timeLeft.isUrgent ? "text-destructive animate-pulse" : "text-muted-foreground"}`}>
        <Clock className="w-3 h-3" />
        <span className="font-mono text-xs font-medium">
          {timeLeft.days > 0 && `${timeLeft.days}d `}
          {formatNumber(timeLeft.hours)}:{formatNumber(timeLeft.minutes)}:{formatNumber(timeLeft.seconds)}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${timeLeft.isUrgent ? "text-destructive" : "text-foreground"}`}>
      <div className="flex gap-1 font-mono">
        {timeLeft.days > 0 && (
          <>
            <TimeBlock value={formatNumber(timeLeft.days)} label="dni" isUrgent={timeLeft.isUrgent} />
            <span className="text-muted-foreground">:</span>
          </>
        )}
        <TimeBlock value={formatNumber(timeLeft.hours)} label="godz" isUrgent={timeLeft.isUrgent} />
        <span className="text-muted-foreground">:</span>
        <TimeBlock value={formatNumber(timeLeft.minutes)} label="min" isUrgent={timeLeft.isUrgent} />
        <span className="text-muted-foreground">:</span>
        <TimeBlock value={formatNumber(timeLeft.seconds)} label="sek" isUrgent={timeLeft.isUrgent} />
      </div>
    </div>
  );
};

const TimeBlock = ({ value, label, isUrgent }: { value: string; label: string; isUrgent: boolean }) => (
  <div className="flex flex-col items-center">
    <span className={`text-sm font-bold ${isUrgent ? "text-destructive" : "text-white"}`}>
      {value}
    </span>
    <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{label}</span>
  </div>
);
