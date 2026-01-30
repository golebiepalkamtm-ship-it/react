import React from 'react';
import AdminPage from '@/pages/Admin';
import { useAuth } from '@/contexts/AuthContext';
import { UnifiedModal } from '@/components/ui/UnifiedModal';

interface Props {
  open: boolean;
  onClose: () => void;
}

const AdminModal: React.FC<Props> = ({ open, onClose }) => {
  const { profile } = useAuth();

  if (!profile || profile.role !== 'ADMIN') return null;

  return (
    <UnifiedModal
      isOpen={open}
      onClose={onClose}
      title="Panel administratora"
      message="Zarządzaj użytkownikami, aukcjami i statystykami"
      size="xl"
      draggable
      bodyScrollable
    >
      <div className="max-h-[70vh] overflow-y-auto space-y-4 pr-1">
        <AdminPage />
      </div>
    </UnifiedModal>
  );
};

export default AdminModal;
