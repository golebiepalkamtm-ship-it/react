import React from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import CreateAuctionForm from './CreateAuctionForm';

type CreateAuctionModalProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
};

const CreateAuctionModal: React.FC<CreateAuctionModalProps> = ({ open, onOpenChange, onSuccess }) => {
  const handleSuccess = () => {
    onSuccess?.();
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-7xl translate-y-[-60%] bg-hero-gradient rounded-2xl p-3 md:p-4 border border-white/20 shadow-2xl max-h-[calc(100vh-3rem)] overflow-hidden">
        <DialogHeader className="flex items-center justify-center mb-4">
          <DialogTitle className="text-2xl font-bold text-white">
            Dodaj nową aukcję
          </DialogTitle>
        </DialogHeader>

        <div className="p-2 md:p-3">
          <CreateAuctionForm onSuccess={handleSuccess} onCancel={() => onOpenChange?.(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAuctionModal;
