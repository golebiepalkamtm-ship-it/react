import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface Modal {
  id: string;
  type: 'default' | 'form' | 'confirm' | 'media';
  title: string;
  content: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  preventClose?: boolean;
}

interface ModalContextType {
  openModal: (config: Omit<Modal, 'id'>) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  isModalOpen: (id: string) => boolean;
}

const ModalContext = createContext<ModalContextType | null>(null);

const sizeConfig = {
  sm: 'max-w-md',
  md: 'max-w-lg', 
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-7xl mx-4'
};

const ModalComponent = ({ 
  modal, 
  onClose 
}: { 
  modal: Modal; 
  onClose: (id: string) => void;
}) => {
  const size = modal.size ?? 'md';
  const closable = modal.closable ?? true;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closable && !modal.preventClose) {
        onClose(modal.id);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [modal.id, onClose, closable, modal.preventClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => closable && !modal.preventClose && onClose(modal.id)}
      />
      
      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ 
          type: 'spring', 
          damping: 25, 
          stiffness: 400,
          duration: 0.2
        }}
        className={`relative w-full ${sizeConfig[size]} bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {modal.title}
          </h2>
          {closable && !modal.preventClose && (
            <button
              onClick={() => onClose(modal.id)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Content */}
        <div className="max-h-[80vh] overflow-y-auto">
          {modal.content}
        </div>
      </motion.div>
    </motion.div>
  );
};

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modals, setModals] = useState<Modal[]>([]);

  const openModal = useCallback((config: Omit<Modal, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newModal = { ...config, id };
    
    setModals(prev => [...prev, newModal]);
    return id;
  }, []);

  const closeModal = useCallback((id: string) => {
    setModals(prev => prev.filter(modal => modal.id !== id));
  }, []);

  const closeAllModals = useCallback(() => {
    setModals([]);
  }, []);

  const isModalOpen = useCallback((id: string) => {
    return modals.some(modal => modal.id === id);
  }, [modals]);

  return (
    <ModalContext.Provider value={{ openModal, closeModal, closeAllModals, isModalOpen }}>
      {children}
      {createPortal(
        <div className="modal-root">
          <AnimatePresence>
            {modals.map((modal) => (
              <ModalComponent
                key={modal.id}
                modal={modal}
                onClose={closeModal}
              />
            ))}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
