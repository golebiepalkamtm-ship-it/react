import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { FeedbackToast } from './FeedbackToast';
import { FeedbackModal, FeedbackModalProps } from './FeedbackModal';

type FeedbackTone = 'success' | 'error' | 'info';

interface ToastConfig {
  id: string;
  tone: FeedbackTone;
  title: string;
  message?: string;
  duration?: number;
}

interface FeedbackContextValue {
  pushToast: (toast: Omit<ToastConfig, 'id'>) => void;
  openModal: (modal: Omit<FeedbackModalProps, 'onClose' | 'isOpen'>) => void;
  closeModal: () => void;
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastConfig[]>([]);
  const [modal, setModal] = useState<Omit<FeedbackModalProps, 'onClose' | 'isOpen'> | null>(null);

  const pushToast = useCallback((toast: Omit<ToastConfig, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), toast.duration ?? 3500);
  }, []);

  const openModal = useCallback((m: Omit<FeedbackModalProps, 'onClose' | 'isOpen'>) => setModal(m), []);
  const closeModal = useCallback(() => setModal(null), []);

  const value = useMemo(() => ({ pushToast, openModal, closeModal }), [pushToast, openModal, closeModal]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      {/* Toast stack */}
      <div className="fixed inset-x-4 bottom-4 z-[1100] flex flex-col gap-3 sm:inset-x-auto sm:right-6 max-w-sm">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <FeedbackToast key={toast.id} tone={toast.tone} title={toast.title} message={toast.message} />
          ))}
        </AnimatePresence>
      </div>

      {/* Global modal */}
      <AnimatePresence>
        {modal && (
          <FeedbackModal
            isOpen
            onClose={closeModal}
            tone={modal.tone}
            title={modal.title}
            message={modal.message}
            actions={modal.actions}
            showProgress={modal.showProgress}
            progress={modal.progress}
          />
        )}
      </AnimatePresence>
    </FeedbackContext.Provider>
  );
};

export const useFeedback = (): FeedbackContextValue => {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error('useFeedback must be used within FeedbackProvider');
  return ctx;
};
