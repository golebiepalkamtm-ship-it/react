import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type ModalType = "default" | "success" | "error" | "warning" | "info";

interface UnifiedModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: ModalType;
  title?: string;
  message?: string;
  icon?: LucideIcon;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  confirmButton?: {
    text: string;
    onClick: () => void;
    variant?:
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | "link";
    disabled?: boolean;
  };
  cancelButton?: {
    text: string;
    onClick: () => void;
    disabled?: boolean;
  };
  children?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  draggable?: boolean;
  bodyScrollable?: boolean;
  containerClassName?: string;
  backdropClassName?: string;
  hideGradient?: boolean;
}

const typeConfig = {
  default: {
    icon: null,
    gradient: "from-[#A68E4E]/15 to-[#A68E4E]/5",
    iconBg: "from-[#A68E4E] to-[#8e7a42]",
    iconShadow: "shadow-[#A68E4E]/30",
    buttonGradient:
      "from-[#A68E4E] to-[#8e7a42] hover:from-[#A68E4E]/90 hover:to-[#8e7a42]",
    buttonShadow: "shadow-[#A68E4E]/25",
  },
  success: {
    icon: CheckCircle2,
    gradient: "from-green-500/10 to-emerald-500/5",
    iconBg: "from-green-400 to-emerald-600",
    iconShadow: "shadow-green-500/30",
    buttonGradient:
      "from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700",
    buttonShadow: "shadow-green-500/25",
  },
  error: {
    icon: XCircle,
    gradient: "from-red-500/10 to-rose-500/5",
    iconBg: "from-red-400 to-rose-600",
    iconShadow: "shadow-red-500/30",
    buttonGradient:
      "from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700",
    buttonShadow: "shadow-red-500/25",
  },
  warning: {
    icon: AlertTriangle,
    gradient: "from-[#A68E4E]/10 to-[#A68E4E]/5",
    iconBg: "from-[#A68E4E] to-[#8e7a42]",
    iconShadow: "shadow-[#A68E4E]/30",
    buttonGradient:
      "from-[#A68E4E] to-[#8e7a42] hover:from-[#A68E4E]/90 hover:to-[#8e7a42]",
    buttonShadow: "shadow-[#A68E4E]/25",
  },
  info: {
    icon: Info,
    gradient: "from-blue-500/10 to-cyan-500/5",
    iconBg: "from-blue-400 to-cyan-600",
    iconShadow: "shadow-blue-500/30",
    buttonGradient:
      "from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700",
    buttonShadow: "shadow-blue-500/25",
  },
};

const sizeConfig = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-5xl md:max-w-6xl max-h-[80vh]",
  "2xl": "max-w-6xl md:max-w-7xl max-h-[80vh]",
  full: "max-w-full md:max-w-7xl mx-0 md:mx-4 h-full md:h-auto",
};

export const UnifiedModal: React.FC<UnifiedModalProps> = ({
  isOpen,
  onClose,
  type = "default",
  title,
  message,
  icon,
  showCloseButton = true,
  closeOnBackdrop = false,
  closeOnEscape = false,
  confirmButton,
  cancelButton,
  children,
  size = "md",
  draggable = false,
  bodyScrollable = false,
  containerClassName = "",
  backdropClassName = "",
  hideGradient = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const config = typeConfig[type];
  const Icon = icon || config.icon;
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const modalPos = useRef({ x: 0, y: 0 });
  const previousBodyOverflow = useRef<string | null>(null);

  // Lenis scroll integration — removed as scroll functionality was removed

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && closeOnEscape && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      if (typeof document !== "undefined") {
        previousBodyOverflow.current = document.body.style.overflow;
        document.body.style.overflow = "hidden";
      }
      // Block Lenis smooth scrolling while modal is open - removed
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      if (
        typeof document !== "undefined" &&
        previousBodyOverflow.current !== null
      ) {
        document.body.style.overflow = previousBodyOverflow.current;
      }
      // Resume Lenis smooth scrolling when modal closes - removed
    };
  }, [isOpen, closeOnEscape, onClose]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (draggable && window.innerWidth >= 768 && modalRef.current) {
      isDragging.current = true;
      startPos.current = {
        x: e.clientX - modalPos.current.x,
        y: e.clientY - modalPos.current.y,
      };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging.current && modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect();
      const boundX = Math.max(window.innerWidth, rect.width) * 2;
      const boundY = Math.max(window.innerHeight, rect.height) * 2;

      let newX = e.clientX - startPos.current.x;
      let newY = e.clientY - startPos.current.y;

      newX = Math.max(-boundX, Math.min(boundX, newX));
      newY = Math.max(-boundY, Math.min(boundY, newY));

      modalPos.current = { x: newX, y: newY };
      modalRef.current.style.transform = `translate(${modalPos.current.x}px, ${modalPos.current.y}px)`;
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalPos.current = { x: 0, y: 0 };
      modalRef.current.style.transform = "translate(0px, 0px)";
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (typeof window === "undefined" || typeof document === "undefined")
      return;

    // Focus trap & Escape key
    const previousFocus = document.activeElement as HTMLElement | null;
    const modalEl = modalRef.current;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && modalEl) {
        const focusable = modalEl.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Initial focus on first interactive element or modal
    const focusTimer = setTimeout(() => {
      if (modalEl) {
        const focusable = modalEl.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length > 0) {
          focusable[0].focus();
        }
      }
    }, 50);

    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    if (typeof window === "undefined" || typeof document === "undefined")
      return;
    if (draggable && window.innerWidth >= 768) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [draggable, isOpen]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 md:p-8 overflow-y-auto"
          data-lenis-prevent="true"
          data-lenis-prevent-touch="true"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={`absolute inset-0 bg-black/90 backdrop-blur-xl ${backdropClassName}`}
            onClick={closeOnBackdrop ? onClose : undefined}
          />

          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "unified-modal-title" : undefined}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
              duration: 0.3,
            }}
            className={`relative w-full ${sizeConfig[size]} bg-[#0c1427] rounded-2xl md:rounded-3xl shadow-[0_0_80px_rgba(166,142,78,0.35)] border-2 border-[#A68E4E]/70 overflow-hidden flex flex-col ${containerClassName} my-auto z-10`}
            data-lenis-prevent="true"
            data-lenis-prevent-touch="true"
            style={{
              cursor:
                draggable && window.innerWidth >= 768 ? "move" : "default",
            }}
            onMouseDown={(e) => {
              if (window.innerWidth >= 768 && draggable) {
                const target = e.target as HTMLElement;
                const interactive = target.closest(
                  'input,textarea,button,select,label,[role="button"],a',
                );
                if (!interactive) {
                  handleMouseDown(e);
                }
              }
            }}
          >
            {!hideGradient && (
              <div
                className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-50 pointer-events-none rounded-2xl`}
              />
            )}

            <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-[#A68E4E]/40 bg-[#070e1e]/95 backdrop-blur-md modal-header">
              <div className="flex items-center gap-4">
                {Icon && (
                  <div
                    className={`p-2.5 rounded-xl bg-gradient-to-br ${config.iconBg} shadow-lg ${config.iconShadow}`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  {title && (
                    <h2 id="unified-modal-title" className="text-lg md:text-xl font-display font-extrabold text-white leading-tight tracking-tight">
                      {title}
                    </h2>
                  )}
                  {message && (
                    <p className="text-xs text-zinc-300 font-medium mt-0.5">{message}</p>
                  )}
                </div>
              </div>

              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl bg-red-500/25 border border-red-500/50 text-red-200 hover:bg-red-500/40 transition-all flex items-center gap-1.5 text-xs font-bold shrink-0 shadow-md shadow-red-950/40"
                  aria-label="Zamknij"
                >
                  <X className="w-4 h-4 text-red-200" />
                  <span className="hidden sm:inline">Zamknij</span>
                </button>
              )}
            </div>

            <div className="relative z-10 flex-1 overflow-hidden">
              <div className="w-full mx-auto px-6 pt-0 pb-4">{children}</div>
            </div>

            {(confirmButton || cancelButton) && (
              <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 px-6 py-3 border-t border-white/5 w-full">
                {cancelButton && (
                  <Button
                    variant="ghost"
                    onClick={cancelButton.onClick}
                    disabled={cancelButton.disabled}
                    data-testid="modal-cancel"
                    className="h-12 w-full sm:flex-1 rounded-xl text-base font-semibold bg-black/40 text-white border border-white/10 hover:bg-black/60 hover:text-white hover:border-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cancelButton.text}
                  </Button>
                )}
                {confirmButton && (
                  <Button
                    onClick={confirmButton.onClick}
                    disabled={confirmButton.disabled}
                    data-testid="modal-confirm"
                    variant={confirmButton.variant || "default"}
                    className={`h-12 w-full sm:flex-1 rounded-xl text-base font-semibold bg-gradient-to-r ${config.buttonGradient} text-white border-0 shadow-lg ${config.buttonShadow} hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed`}
                  >
                    {confirmButton.text}
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
