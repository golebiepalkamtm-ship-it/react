import { useToast } from '@/components/ui/ToastProvider';
import { useModal } from '@/components/ui/ModalProvider';

export const useUI = () => {
  const toast = useToast();
  const modal = useModal();

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
    closeAllModals: modal.closeAllModals,
    isModalOpen: modal.isModalOpen,
  };
};
