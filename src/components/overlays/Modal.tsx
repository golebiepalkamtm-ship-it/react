import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useModalStore, type ModalState, type ModalContext } from '@/stores/modalStore';
import { Button } from '@/components/ui/button';

// ============================================================================
// CONTEXT CONFIGURATION - Context colors (auction = gold, admin = sky-blue)
// ============================================================================

const contextConfig: Record<ModalContext, {
  accent: string;
  accentLight: string;
  gradient: string;
  gradientHover: string;
  shadow: string;
  backdrop: string;
  border: string;
  button: string;
  progressBar: string;
}> = {
  auction: {
    accent: '#D4AF37',
    accentLight: '#F59E0B',
    gradient: 'from-amber-500/10 to-yellow-500/5',
    gradientHover: 'from-amber-500/20 to-yellow-500/10',
    shadow: 'shadow-amber-500/20',
    backdrop: 'bg-black/60 backdrop-blur-md',
    border: 'border-amber-200/30 dark:border-amber-800/30',
    button: 'from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700',
    progressBar: 'bg-gradient-to-r from-amber-400 to-yellow-500',
  },
  admin: {
    accent: '#0EA5E9',
    accentLight: '#06B6D4',
    gradient: 'from-sky-500/10 to-cyan-500/5',
    gradientHover: 'from-sky-500/20 to-cyan-500/10',
    shadow: 'shadow-sky-500/20',
    backdrop: 'bg-black/60 backdrop-blur-md',
    border: 'border-sky-200/30 dark:border-sky-800/30',
    button: 'from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700',
    progressBar: 'bg-gradient-to-r from-sky-400 to-cyan-500',
  },
  user: {
    accent: '#10B981',
    accentLight: '#34D399',
    gradient: 'from-green-500/10 to-emerald-500/5',
    gradientHover: 'from-green-500/20 to-emerald-500/10',
    shadow: 'shadow-green-500/20',
    backdrop: 'bg-black/60 backdrop-blur-md',
    border: 'border-green-200/30 dark:border-green-800/30',
    button: 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
    progressBar: 'bg-gradient-to-r from-green-400 to-emerald-500',
  },
  system: {
    accent: '#8B5CF6',
    accentLight: '#A78BFA',
    gradient: 'from-purple-500/10 to-violet-500/5',
    gradientHover: 'from-purple-500/20 to-violet-500/10',
    shadow: 'shadow-purple-500/20',
    backdrop: 'bg-black/60 backdrop-blur-md',
    border: 'border-purple-200/30 dark:border-purple-800/30',
    button: 'from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700',
    progressBar: 'bg-gradient-to-r from-purple-400 to-violet-500',
  },
};

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.92, y: -20 },
};

const sizeConfig = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-6xl mx-4',
};

// ============================================================================
// MODAL CONTEXT & PROVIDER
// ============================================================================

interface ModalContextType {
  modalId: string;
  context: ModalContext;
  state: ModalState;
  isClosable: boolean;
  preventClose: boolean;
  onClose: () => void;
  config: typeof contextConfig.auction;
  size: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  progressPercent?: number;
  loadingMessage?: string;
  successMessage?: string;
}

const ModalContext = React.createContext<ModalContextType | null>(null);

const useModalContext = () => {
  const ctx = React.useContext(ModalContext);
  if (!ctx) {
    throw new Error('Modal components must be used within Modal.Root');
  }
  return ctx;
};

// ============================================================================
// MODAL.ROOT - Main modal wrapper with state machine
// ============================================================================

interface ModalRootProps {
  isOpen: boolean;
  onClose: () => void;
  context?: ModalContext;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  isClosable?: boolean;
  preventClose?: boolean;
  children: React.ReactNode;
}

const ModalRoot: React.FC<ModalRootProps> = ({
  isOpen,
  onClose,
  context = 'user',
  size = 'md',
  isClosable = true,
  preventClose = false,
  children,
}) => {
  const { modal } = useModalStore();
  const config = contextConfig[context];
  const modalRef = useRef<HTMLDivElement>(null);

  const currentState = modal?.state || 'closed';
  const isVisible = isOpen && modal?.state !== 'closed' && modal?.state !== 'exiting';

  // Keyboard handling (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isClosable && !preventClose && isVisible) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isVisible, isClosable, preventClose, onClose]);

  const contextValue: ModalContextType = {
    modalId: modal?.id || '',
    context,
    state: currentState,
    isClosable,
    preventClose: preventClose || modal?.preventClose || false,
    onClose,
    config,
    size,
    progressPercent: modal?.progressPercent,
    loadingMessage: modal?.loadingMessage,
    successMessage: modal?.successMessage,
  };

  return (
    <ModalContext.Provider value={contextValue}>
      <AnimatePresence mode="wait">
        {isOpen && modal && modal.state !== 'closed' && (
          <motion.div
            key={`modal-${modal.id}`}
            initial="hidden"
            animate={currentState === 'exiting' ? 'exit' : 'visible'}
            exit="exit"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 flex items-center justify-center p-4"
          >
            {/* Backdrop with dynamic opacity based on state */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: currentState === 'loading_internal' ? 0.7 : 0.6,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`absolute inset-0 ${config.backdrop}`}
              onClick={
                isClosable && !preventClose && currentState !== 'loading_internal'
                  ? onClose
                  : undefined
              }
            />

            {/* Modal Container */}
            <motion.div
              ref={modalRef}
              initial="hidden"
              animate={
                currentState === 'entering' ? 'hidden' :
                currentState === 'exiting' ? 'exit' :
                'visible'
              }
              exit="exit"
              variants={modalVariants}
              transition={{ type: 'spring', damping: 25, stiffness: 400, duration: 0.3 }}
              className={`relative w-full ${sizeConfig[size]} bg-gradient-to-br from-white/95 to-white/80 dark:from-gray-900/95 dark:to-gray-900/80 rounded-2xl shadow-2xl border ${config.border} overflow-hidden backdrop-blur-sm`}
            >
              {/* Background accent gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${config.gradient} pointer-events-none`}
              />

              {/* Content wrapper */}
              <div className="relative z-10 flex flex-col h-full max-h-[90vh]">
                {children}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalContext.Provider>
  );
};

// ============================================================================
// MODAL.HEADER - Title, icon, and close button
// ============================================================================

interface ModalHeaderProps {
  title: string;
  icon?: React.ReactNode;
  subtitle?: string;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ title, icon, subtitle }) => {
  const { isClosable, onClose, preventClose, state, config } = useModalContext();

  return (
    <div className={`flex items-center justify-between px-6 py-4 border-b ${config.border}`}>
      <div className="flex items-center gap-3 flex-1">
        {icon && (
          <div className={`p-2 rounded-lg bg-gradient-to-br ${config.gradient}`}>
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Close Button */}
      {isClosable && !preventClose && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </motion.button>
      )}
    </div>
  );
};

// ============================================================================
// MODAL.CONTENT - Body content with scrolling and progressive disclosure
// ============================================================================

interface ModalContentProps {
  children: React.ReactNode;
  className?: string;
}

const ModalContent: React.FC<ModalContentProps> = ({ children, className = '' }) => {
  const { state } = useModalContext();

  return (
    <motion.div
      animate={{ opacity: state === 'loading_internal' ? 0.5 : 1 }}
      transition={{ duration: 0.2 }}
      className={`flex-1 overflow-y-auto px-6 py-4 ${className}`}
    >
      {children}
    </motion.div>
  );
};

// ============================================================================
// MODAL.LOADING - Loading state with progress bar and message
// ============================================================================

interface ModalLoadingProps {
  message?: string;
  progressPercent?: number;
}

const ModalLoading: React.FC<ModalLoadingProps> = ({ message, progressPercent = 0 }) => {
  const { config } = useModalContext();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col items-center justify-center py-8 gap-4"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="relative w-16 h-16"
      >
        <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${config.button} opacity-20`} />
        <Loader2 className="absolute inset-2 text-gray-400 dark:text-gray-500" />
      </motion.div>

      {message && (
        <p className="text-gray-600 dark:text-gray-400 text-sm text-center max-w-xs">
          {message}
        </p>
      )}

      {/* Progress Bar */}
      {progressPercent !== undefined && progressPercent > 0 && (
        <div className="w-full max-w-xs h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
            className={`h-full ${config.progressBar}`}
          />
        </div>
      )}
    </motion.div>
  );
};

// ============================================================================
// MODAL.SUCCESS - Success feedback with checkmark
// ============================================================================

interface ModalSuccessProps {
  message?: string;
}

const ModalSuccess: React.FC<ModalSuccessProps> = ({ message }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.4, type: 'spring' }}
      className="flex flex-col items-center justify-center py-8 gap-4"
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.6, times: [0, 0.5, 1] }}
      >
        <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/30">
          <motion.div
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
          </motion.div>
        </div>
      </motion.div>

      {message && (
        <p className="text-gray-700 dark:text-gray-300 text-center font-medium">
          {message}
        </p>
      )}
    </motion.div>
  );
};

// ============================================================================
// MODAL.FOOTER - Action buttons (confirm, cancel)
// ============================================================================

interface ModalFooterProps {
  confirmButton?: {
    text: string;
    onClick: () => void | Promise<void>;
    variant?: 'default' | 'destructive';
    isLoading?: boolean;
  };
  cancelButton?: {
    text: string;
    onClick: () => void;
  };
  layout?: 'horizontal' | 'vertical';
}

const ModalFooter: React.FC<ModalFooterProps> = ({
  confirmButton,
  cancelButton,
  layout = 'horizontal',
}) => {
  const { state, config } = useModalContext();
  const isLoading = state === 'loading_internal';

  if (state === 'success_feedback') {
    return null;
  }

  return (
    <div
      className={`flex items-center gap-3 px-6 py-4 border-t ${config.border} ${
        layout === 'vertical' ? 'flex-col' : 'justify-end'
      }`}
    >
      {cancelButton && (
        <Button
          variant="outline"
          onClick={cancelButton.onClick}
          disabled={isLoading}
          className={layout === 'vertical' ? 'w-full' : ''}
        >
          {cancelButton.text}
        </Button>
      )}
      {confirmButton && (
        <Button
          onClick={confirmButton.onClick}
          disabled={isLoading}
          className={`bg-gradient-to-r ${config.button} text-white border-0 shadow-lg ${config.shadow} ${
            layout === 'vertical' ? 'w-full' : ''
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            confirmButton.text
          )}
        </Button>
      )}
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export const Modal = {
  Root: ModalRoot,
  Header: ModalHeader,
  Content: ModalContent,
  Loading: ModalLoading,
  Success: ModalSuccess,
  Footer: ModalFooter,
};

export { useModalContext };
