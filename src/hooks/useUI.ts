import { useToast } from '@/components/ui/ToastProvider';
import { useModal, useModalStore } from '@/stores/modalStore';

export const useUI = () => {
  const toast = useToast();
  const modal = useModal();

  const closeActiveModal = () => {
    const current = useModalStore.getState().activeModal;
    if (current) {
      modal.closeModal(current.id);
    }
  };

  const isModalOpen = () => !!useModalStore.getState().activeModal;

  return {
    // Toast methods
    toast: toast.toast,
    success: toast.success,
    error: toast.error,
    warning: toast.warning,
    info: toast.info,
    dismissToast: toast.dismiss,
    dismissAllToasts: toast.dismissAll,
    
    // Modal methods
    openModal: modal.openModal,
    closeModal: modal.closeModal,
    modal: modal.modal,
    setLoading: modal.setLoading,
    setSuccess: modal.setSuccess,
    updateState: modal.updateState,
    updateProgress: modal.updateProgress,
    getModalContext: useModalStore.getState().getModalContext,
    closeActiveModal,
    isModalOpen,
  };
};
