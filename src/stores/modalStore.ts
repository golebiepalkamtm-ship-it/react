import { create } from 'zustand/vanilla';
import { devtools } from 'zustand/middleware';

export type ModalState = 'closed' | 'entering' | 'active' | 'loading_internal' | 'success_feedback' | 'exiting';
export type ModalContext = 'auction' | 'admin' | 'user' | 'system';

export interface ModalConfig {
  id: string;
  state: ModalState;
  context: ModalContext;
  title: string;
  isClosable?: boolean;
  preventClose?: boolean; // Prevents close during loading
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children?: React.ReactNode;
  onClose?: () => void;
  onSuccess?: (data?: any) => void;
  loadingMessage?: string;
  successMessage?: string;
  progressPercent?: number; // 0-100 for loading state
}

interface ModalStore {
  activeModal: ModalConfig | null;
  // Modal operations
  openModal: (config: Omit<ModalConfig, 'id' | 'state'>) => string;
  closeModal: (id: string) => void;
  updateState: (id: string, state: ModalState) => void;
  setLoading: (id: string, isLoading: boolean, message?: string) => void;
  setSuccess: (id: string, message?: string, data?: any) => void;
  updateProgress: (id: string, percent: number) => void;
  getModalContext: () => ModalContext | null;
}

/**
 * ModalStore - Single active modal with state machine
 * Only ONE modal can be displayed at a time
 * States: closed -> entering -> active -> [loading_internal -> success_feedback] -> exiting -> closed
 */
export const useModalStore = create<ModalStore>()(
  devtools(
    (set, get) => {
      const generateId = () => `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      return {
        activeModal: null,

        openModal: (config) => {
          const id = generateId();

          set({
            activeModal: {
              id,
              state: 'entering',
              context: config.context,
              title: config.title,
              isClosable: config.isClosable ?? true,
              preventClose: config.preventClose ?? false,
              size: config.size ?? 'md',
              children: config.children,
              onClose: config.onClose,
              onSuccess: config.onSuccess,
              loadingMessage: config.loadingMessage,
              successMessage: config.successMessage,
              progressPercent: 0,
            },
          });

          // Auto-transition from entering to active after 300ms
          setTimeout(() => {
            const current = get().activeModal;
            if (current && current.id === id && current.state === 'entering') {
              set((state) => ({
                activeModal: state.activeModal
                  ? { ...state.activeModal, state: 'active' }
                  : null,
              }));
            }
          }, 300);

          return id;
        },

        closeModal: (id) => {
          const current = get().activeModal;
          if (current && current.id === id) {
            // Prevent close if modal is loading
            if (current.preventClose || current.state === 'loading_internal') {
              return;
            }

            // Transition to exiting state
            set((state) => ({
              activeModal: state.activeModal
                ? { ...state.activeModal, state: 'exiting' }
                : null,
            }));

            // After animation, clear modal
            setTimeout(() => {
              const currentModal = get().activeModal;
              if (currentModal && currentModal.id === id) {
                const onClose = currentModal.onClose;
                set({ activeModal: null });
                onClose?.();
              }
            }, 300);
          }
        },

        updateState: (id, newState) => {
          set((state) => ({
            activeModal: state.activeModal && state.activeModal.id === id
              ? { ...state.activeModal, state: newState }
              : state.activeModal,
          }));
        },

        setLoading: (id, isLoading, message) => {
          set((state) => {
            if (!state.activeModal || state.activeModal.id !== id) return state;
            return {
              activeModal: {
                ...state.activeModal,
                state: isLoading ? 'loading_internal' : 'active',
                loadingMessage: message,
                preventClose: isLoading,
                progressPercent: isLoading ? 0 : 100,
              },
            };
          });
        },

        setSuccess: (id, message, data) => {
          set((state) => {
            if (!state.activeModal || state.activeModal.id !== id) return state;
            const config = {
              ...state.activeModal,
              state: 'success_feedback' as ModalState,
              successMessage: message,
              preventClose: false,
            };

            // Auto-close after 1.5 seconds
            setTimeout(() => {
              get().closeModal(id);
              state.activeModal?.onSuccess?.(data);
            }, 1500);

            return { activeModal: config };
          });
        },

        updateProgress: (id, percent) => {
          set((state) => ({
            activeModal: state.activeModal && state.activeModal.id === id
              ? { ...state.activeModal, progressPercent: Math.min(100, Math.max(0, percent)) }
              : state.activeModal,
          }));
        },

        getModalContext: () => {
          return get().activeModal?.context ?? null;
        },
      };
    },
    { name: 'ModalStore' }
  )
);

/**
 * Hook for accessing modal store
 * Usage: const { openModal, closeModal } = useModal();
 */
export const useModal = () => {
  return useModalStore((state) => ({
    modal: state.activeModal,
    openModal: state.openModal,
    closeModal: state.closeModal,
    updateState: state.updateState,
    setLoading: state.setLoading,
    setSuccess: state.setSuccess,
    updateProgress: state.updateProgress,
  }));
};
