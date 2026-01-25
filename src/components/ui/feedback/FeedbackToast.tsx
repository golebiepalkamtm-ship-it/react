import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

type FeedbackTone = 'success' | 'error' | 'info';

interface FeedbackToastProps {
  tone: FeedbackTone;
  title: string;
  message?: string;
}

const toneStyles: Record<FeedbackTone, { bg: string; border: string; icon: React.ReactNode }> = {
  success: {
    bg: 'bg-emerald-500/15 backdrop-blur-xl',
    border: 'border-emerald-400/40',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-300" />,
  },
  error: {
    bg: 'bg-rose-500/15 backdrop-blur-xl',
    border: 'border-rose-400/40',
    icon: <AlertTriangle className="w-5 h-5 text-rose-300 animate-[wiggle_0.4s_ease-in-out]" />,
  },
  info: {
    bg: 'bg-sky-500/15 backdrop-blur-xl',
    border: 'border-sky-400/40',
    icon: <Info className="w-5 h-5 text-sky-300 animate-pulse" />,
  },
};

export const FeedbackToast: React.FC<FeedbackToastProps> = ({ tone, title, message }) => {
  const style = toneStyles[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.97 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`pointer-events-auto rounded-2xl border shadow-lg shadow-black/30 px-4 py-3 flex gap-3 ${style.bg} ${style.border}`}
      role="status"
      aria-live="polite"
    >
      <div className="mt-0.5">{style.icon}</div>
      <div className="flex-1 text-sm text-foreground">
        <p className="font-semibold leading-tight">{title}</p>
        {message && <p className="text-muted-foreground leading-tight mt-1">{message}</p>}
      </div>
    </motion.div>
  );
};
