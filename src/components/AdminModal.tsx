import React from 'react';
import GlassModal from './GlassModal';
import AdminPage from '@/pages/Admin';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  open: boolean;
  onClose: () => void;
}

const AdminModal: React.FC<Props> = ({ open, onClose }) => {
  const { profile } = useAuth();

  if (!profile || profile.role !== 'ADMIN') return null;

  return (
    <GlassModal open={open} onClose={onClose} title="Panel administratora" description="Zarządzaj użytkownikami i statystykami">
      <div className="max-h-[60vh] overflow-y-auto">
        <AdminPage />
      </div>
    </GlassModal>
  );
};

export default AdminModal;
