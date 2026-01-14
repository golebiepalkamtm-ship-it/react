import UnifiedModal, { type ModalType } from '@/components/ui/UnifiedModal';

type MessageType = ModalType;

interface AuthMessageModalProps {
  isOpen: boolean;
  type?: MessageType;
  title: string;
  message: string;
  buttonText?: string;
  onConfirm: () => void;
}

const AuthMessageModal: React.FC<AuthMessageModalProps> = ({
  isOpen,
  type = 'success',
  title,
  message,
  buttonText = 'OK',
  onConfirm,
}) => {
  return (
    <UnifiedModal
      isOpen={isOpen}
      onClose={onConfirm}
      type={type}
      title={title}
      message={message}
      showCloseButton={false}
      closeOnBackdrop={false}
      closeOnEscape={true}
      confirmButton={{
        text: buttonText,
        onClick: onConfirm,
      }}
    />
  );
};

export default AuthMessageModal;

export { AuthMessageModal };
export type { MessageType, AuthMessageModalProps };
