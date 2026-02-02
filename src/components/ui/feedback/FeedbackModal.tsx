import React from 'react';
import { UnifiedModal } from '@/components/ui/UnifiedModal';

export type FeedbackTone = 'success' | 'error' | 'info';

export interface FeedbackModalProps {
  isOpen: boolean;
  tone: FeedbackTone;
  title: string;
  message?: string;
  showProgress?: boolean;
  progress?: number;
  actions?: Array<{ label: string; onClick: () => void; variant?: 'primary' | 'ghost' }>;
  onClose: () => void;
}

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
  const typeMap: Record<FeedbackTone, 'success' | 'error' | 'info'> = {
    success: 'success',
    error: 'error',
    info: 'info'
  };

  // Map actions
  const confirmAction = actions.find(a => a.variant !== 'ghost') || actions[0];
  const cancelAction = actions.find(a => a.variant === 'ghost') || (actions.length > 1 ? actions[1] : undefined);
  
  // If confirmAction is same as cancelAction (only 1 action), don't duplicate.
  const finalConfirm = confirmAction;
  const finalCancel = cancelAction === confirmAction ? undefined : cancelAction;

  return (
    <UnifiedModal
      isOpen={isOpen}
      onClose={onClose}
      type={typeMap[tone]}
      title={title}
      message={message}
      confirmButton={finalConfirm ? {
        text: finalConfirm.label,
        onClick: finalConfirm.onClick
      } : undefined}
      cancelButton={finalCancel ? {
        text: finalCancel.label,
        onClick: finalCancel.onClick
      } : undefined}
    >
      {showProgress && (
          <div className="mt-4 space-y-2">
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gold via-gold-light to-white transition-all duration-300"
                style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
              />
            </div>
            <p className="text-xs text-white/60 text-right">{Math.round(progress)}%</p>
          </div>
      )}
    </UnifiedModal>
  );
};
