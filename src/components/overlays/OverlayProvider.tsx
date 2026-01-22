import React from 'react';
import { NotificationQueue } from './NotificationQueue';
import { useModalStore } from '@/stores/modalStore';
import { Modal } from './Modal';

/**
 * OverlayProvider - Root provider for the entire overlay system
 * Wraps the application and provides:
 * - NotificationQueue for displaying notifications
 * - Modal rendering based on modal store
 * - Global z-index management
 */
export const OverlayProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { activeModal } = useModalStore();

  return (
    <>
      {children}
      
      {/* Global Overlay System */}
      <NotificationQueue />

      {/* Active Modal Renderer */}
      {activeModal && (
        <Modal.Root
          isOpen={!!activeModal}
          onClose={() => {
            if (activeModal.onClose) {
              activeModal.onClose();
            }
          }}
          context={activeModal.context}
          size={activeModal.size}
          isClosable={activeModal.isClosable}
          preventClose={activeModal.preventClose}
        >
          {/* Modal content is passed via children in activeModal */}
          {activeModal.children}
        </Modal.Root>
      )}
    </>
  );
};
