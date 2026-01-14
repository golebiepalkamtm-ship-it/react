import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import AddBreederMeetingForm from '@/components/breeder-meetings/AddBreederMeetingForm';

interface AddBreederMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddBreederMeetingModal: React.FC<AddBreederMeetingModalProps> = ({ 
  isOpen, 
  onClose,
  onSuccess 
}) => {
  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute inset-0 z-50 flex items-start justify-center p-4 md:p-8 min-h-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ top: window.scrollY }}
        >
          {/* Backdrop - kliknięcie zamyka modal */}
          <motion.div
            className="absolute inset-0"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <AddBreederMeetingForm 
              onSuccess={handleSuccess}
              onCancel={onClose}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddBreederMeetingModal;
