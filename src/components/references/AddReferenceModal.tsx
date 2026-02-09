import React from "react";
import { AnimatePresence } from "framer-motion";
import { UnifiedModal } from "@/components/ui/UnifiedModal";
import { AddReferenceForm } from "@/components/references/AddReferenceForm";

interface AddReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddReferenceModal: React.FC<AddReferenceModalProps> = ({
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
        <UnifiedModal
          isOpen={isOpen}
          onClose={onClose}
          title="Dodaj referencję"
          type="default"
          showCloseButton
          closeOnBackdrop
          closeOnEscape
          size="full"
          draggable
          hideGradient
          backdropClassName="bg-transparent"
          containerClassName="bg-background border border-border shadow-2xl rounded-2xl"
        >
          <AddReferenceForm
            onSuccess={handleSuccess}
            onCancel={onClose}
          />
        </UnifiedModal>
      )}
    </AnimatePresence>
  );
};

export default AddReferenceModal;
