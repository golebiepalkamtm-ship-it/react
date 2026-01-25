import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export type FeedbackTone = 'success' | 'error' | 'info';

export interface FeedbackModalProps {
  isOpen: boolean;
  tone: FeedbackTone;
  title: string;
  message?: string;
  showProgress?: boolean;
  progress?: number; // 0-100
  actions?: Array<{ label: string; onClick: () => void; variant?: 'primary' | 'ghost' }>;
  onClose: () => void;
}

const toneTokens: Record<FeedbackTone, { ring: string; icon: React.ReactNode; glow: string }> = {
  success: {
    ring: 'border-emerald-400/60 bg-emerald-500/10',
    icon: <CheckCircle2 className="w-6 h-6 text-emerald-300" />,
    glow: 'shadow-[0_0_40px_rgba(16,185,129,0.35)]',
  },
  error: {
    ring: 'border-rose-400/60 bg-rose-500/10',
    icon: <AlertTriangle className="w-6 h-6 text-rose-300" />,
    glow: 'shadow-[0_0_40px_rgba(244,63,94,0.35)]',
  },
  info: {
    ring: 'border-sky-400/60 bg-sky-500/10',
    icon: <Info className="w-6 h-6 text-sky-300" />,
    glow: 'shadow-[0_0_40px_rgba(56,189,248,0.35)]',
  },
};

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  tone,
  title,
  message,
  actions = [],
  showProgress,
  progress = 0,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      lastFocusRef.current = document.activeElement as HTMLElement | null;
      dialogRef.current?.focus();
    } else {
      lastFocusRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;
  const toneStyle = toneTokens[tone];

  return (
    <div
      className="fixed inset-0 z-[1200] grid place-items-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <motion.div
        ref={dialogRef}
        tabIndex={-1}
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="relative w-full max-w-lg rounded-3xl bg-[#0b1024]/90 border border-white/10 backdrop-blur-2xl p-6 shadow-2xl shadow-black/40"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/05 via-transparent to-white/05 pointer-events-none" />
        <div className="relative flex items-start gap-4">
          <div className={`mt-1 p-2 rounded-2xl border ${toneStyle.ring} ${toneStyle.glow}`}>
            {toneStyle.icon}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-display text-xl text-white">{title}</h2>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-white transition-colors rounded-full px-2"
                aria-label="Zamknij modal"
              >
                ✕
              </button>
            </div>
            {message && <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>}
            {showProgress && (
              <div className="mt-2">
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gold via-gold-light to-white transition-all"
                    style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
                    aria-label="Postęp"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{Math.round(progress)}%</p>
              </div>
            )}
          </div>
        </div>

        {actions.length > 0 && (
          <div className="relative mt-6 flex flex-wrap gap-2 justify-end">
            {actions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                className={
                  action.variant === 'ghost'
                    ? 'px-4 py-2 rounded-xl border border-white/15 text-muted-foreground hover:text-white hover:border-white/30 transition-colors'
                    : 'px-4 py-2 rounded-xl bg-gradient-to-r from-gold to-gold-light text-navy font-semibold shadow-lg shadow-gold/30 hover:opacity-90 transition'
                }
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
