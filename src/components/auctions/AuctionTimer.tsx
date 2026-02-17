import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { calculateTimeLeft, type TimeLeftDetails } from "@/utils/auction";

export interface AuctionTimerProps {
  endTime: Date;
  compact?: boolean;
}

export const AuctionTimer = ({ endTime, compact = false }: AuctionTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeftDetails | null>(() => calculateTimeLeft(endTime));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  if (!timeLeft || timeLeft.isExpired) {
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
