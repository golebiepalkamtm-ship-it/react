import { useFeedback } from "@/components/ui/feedback/FeedbackProvider";

interface ToastOptions {
  message: string;
  duration?: number;
}

export const useOptimizedToast = () => {
  const { openModal, closeModal } = useFeedback();

  const showModal = (tone: 'success' | 'error' | 'info', message: string) => {
    openModal({
      tone,
      title: tone === 'success' ? 'Sukces' : tone === 'error' ? 'Błąd' : 'Informacja',
      message,
      actions: [{ label: 'OK', onClick: closeModal }]
    });
  };

  const success = ({ message }: ToastOptions) => showModal("success", message);
  const error = ({ message }: ToastOptions) => showModal("error", message);
  const warning = ({ message }: ToastOptions) => showModal("error", message);
  const info = ({ message }: ToastOptions) => showModal("info", message);

  return {
    success,
    error,
    warning,
    info,
  };
};

export default useOptimizedToast;
