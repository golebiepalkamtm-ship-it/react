import React from 'react';
import { UnifiedModal } from '@/components/ui/UnifiedModal';
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
    <UnifiedModal
      isOpen={isOpen}
      onClose={onClose}
      title="Dodaj spotkanie z hodowcą"
      type="default"
      size="xl"
      showCloseButton
      closeOnBackdrop
      closeOnEscape
      draggable
      bodyScrollable
    >
      <div className="p-1">
        <AddBreederMeetingForm
          onSuccess={handleSuccess}
          onCancel={onClose}
        />
      </div>
    </UnifiedModal>
  );
};

export default AddBreederMeetingModal;
