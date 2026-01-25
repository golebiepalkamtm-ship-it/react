import { useFeedback } from "@/components/ui/feedback/FeedbackProvider";

interface ToastOptions {
  message: string;
  duration?: number;
}

export const useOptimizedToast = () => {
  const { pushToast } = useFeedback();

  const success = ({ message }: ToastOptions) => pushToast({ tone: "success", title: message });
  const error = ({ message }: ToastOptions) => pushToast({ tone: "error", title: message });
  const warning = ({ message }: ToastOptions) => pushToast({ tone: "error", title: message });
  const info = ({ message }: ToastOptions) => pushToast({ tone: "info", title: message });

  return {
    success,
    error,
    warning,
    info,
  };
};

export default useOptimizedToast;
