import { useContext } from "react";
import { FeedbackContext } from "@/components/ui/feedback/FeedbackProvider";

interface ToastOptions {
  message: string;
  duration?: number;
}

type ToastArg = string | ToastOptions;

export const useOptimizedToast = () => {
  const feedback = useContext(FeedbackContext);

  const showModal = (tone: 'success' | 'error' | 'info', arg: ToastArg) => {
    const message = typeof arg === "string" ? arg : arg?.message || "";
    if (feedback?.openModal) {
      feedback.openModal({
        tone,
        title: tone === 'success' ? 'Sukces' : tone === 'error' ? 'Uwaga' : 'Informacja',
        message,
        actions: [{ label: 'OK', onClick: feedback.closeModal }]
      });
    } else {
      console.log(`[Toast ${tone}]:`, message);
    }
  };

  const success = (arg: ToastArg) => showModal("success", arg);
  const error = (arg: ToastArg) => showModal("error", arg);
  const warning = (arg: ToastArg) => showModal("error", arg);
  const info = (arg: ToastArg) => showModal("info", arg);

  return {
    success,
    error,
    warning,
    info,
    showSuccess: success,
    showError: error,
    showWarning: warning,
    showInfo: info,
  };
};

export default useOptimizedToast;

