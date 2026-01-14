import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';

interface LuxuryAuctionTimerProps {
  endTime: string;
  className?: string;
  onEnd?: () => void;
}

export const LuxuryAuctionTimer: React.FC<LuxuryAuctionTimerProps> = ({ 
  endTime, 
  className = '',
  onEnd
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
  
  const [isNearEnd, setIsNearEnd] = useState(false);
  const [isVeryNearEnd, setIsVeryNearEnd] = useState(false);
  
  useEffect(() => {
    const calculateTimeLeft = () => {
      const end = new Date(endTime).getTime();
      const now = Date.now();
      const diff = end - now;
      
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
        onEnd?.();
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft({ days, hours, minutes, seconds, total: diff });
      
      // Ustaw flagi dla różnych stanów odliczania
      setIsNearEnd(diff < 1000 * 60 * 60); // mniej niż godzina
      setIsVeryNearEnd(diff < 1000 * 60 * 5); // mniej niż 5 minut
    };
    
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(timer);
  }, [endTime, onEnd]);
  
  // Warianty animacji dla cyfr
  const digitVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
  };
  
  // Określ klasę koloru na podstawie pozostałego czasu
  const getColorClass = () => {
    if (isVeryNearEnd) return 'text-red-500';
    if (isNearEnd) return 'text-amber-500';
    return 'text-gold';
  };
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <motion.div 
        animate={isVeryNearEnd ? {
          scale: [1, 1.2, 1],
          transition: { repeat: Infinity, duration: 1 }
        } : {}}
      >
        <Clock className={`w-5 h-5 ${getColorClass()}`} />
      </motion.div>
      
      <div className="flex items-center">
        {timeLeft.total > 0 ? (
          <>
            {timeLeft.days > 0 && (
              <div className="flex items-center">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={timeLeft.days}
                    variants={digitVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className={`font-mono font-bold ${getColorClass()}`}
                  >
                    {timeLeft.days}
                  </motion.span>
                </AnimatePresence>
                <span className="text-muted-foreground mx-1">d</span>
              </div>
            )}
            
            <div className="flex items-center">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={timeLeft.hours}
                  variants={digitVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className={`font-mono font-bold ${getColorClass()}`}
                >
                  {timeLeft.hours.toString().padStart(2, '0')}
                </motion.span>
              </AnimatePresence>
              <span className="text-muted-foreground mx-1">h</span>
            </div>
            
            <div className="flex items-center">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={timeLeft.minutes}
                  variants={digitVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className={`font-mono font-bold ${getColorClass()}`}
                >
                  {timeLeft.minutes.toString().padStart(2, '0')}
                </motion.span>
              </AnimatePresence>
              <span className="text-muted-foreground mx-1">m</span>
            </div>
            
            {(isNearEnd || timeLeft.days === 0) && (
              <div className="flex items-center">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={timeLeft.seconds}
                    variants={digitVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className={`font-mono font-bold ${getColorClass()}`}
                  >
                    {timeLeft.seconds.toString().padStart(2, '0')}
                  </motion.span>
                </AnimatePresence>
                <span className="text-muted-foreground mx-1">s</span>
              </div>
            )}
          </>
        ) : (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-medium text-red-500"
          >
            Zakończona
          </motion.span>
        )}
      </div>
    </div>
  );
};

export default LuxuryAuctionTimer;
