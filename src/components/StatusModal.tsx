import React from 'react';
import GlassModal from '@/components/GlassModal';
import { Button } from '@/components/ui/button';

interface StatusModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  name?: string | null;
  confirmLabel?: string;
  onConfirm?: () => void;
}

const StatusModal: React.FC<StatusModalProps> = ({ open, onClose, title, description, name, confirmLabel, onConfirm }) => {
  return (
    <GlassModal open={open} onClose={onClose} title={title} description={description || ''}>
      <div className="text-center space-y-2">
        <div className="font-display text-2xl md:text-3xl font-bold text-foreground">
          {name ? `Witaj, ${name}` : 'Witaj'}
        </div>
        {description ? <div className="text-muted-foreground">{description}</div> : null}
        {confirmLabel && onConfirm ? (
          <div className="mt-4">
            <Button variant="heroGold" onClick={onConfirm}>{confirmLabel}</Button>
          </div>
        ) : null}
      </div>
    </GlassModal>
  );
};

export default StatusModal;
