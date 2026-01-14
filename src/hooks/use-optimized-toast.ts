import * as React from "react";
import { CheckCircle, AlertCircle, TriangleAlert, Info } from "lucide-react";
import { toast } from "sonner";

interface ToastOptions {
  message: string;
  duration?: number;
}

export const useOptimizedToast = () => {
  const success = ({ message, duration = 3000 }: ToastOptions) => {
    toast.success(message, {
      duration,
      action: {
        label: "Zamknij",
        onClick: () => toast.dismiss(),
      },
    });
  };

  const error = ({ message, duration = 5000 }: ToastOptions) => {
    toast.error(message, {
      duration,
      action: {
        label: "Zamknij",
        onClick: () => toast.dismiss(),
      },
    });
  };

  const warning = ({ message, duration = 4000 }: ToastOptions) => {
    toast.warning(message, {
      duration,
      action: {
        label: "Zamknij",
        onClick: () => toast.dismiss(),
      },
    });
  };

  const info = ({ message, duration = 3000 }: ToastOptions) => {
    toast.info(message, {
      duration,
      action: {
        label: "Zamknij",
        onClick: () => toast.dismiss(),
      },
    });
  };

  return {
    success,
    error,
    warning,
    info,
  };
};

export default useOptimizedToast;
