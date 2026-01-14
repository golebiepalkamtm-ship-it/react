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
    <GlassModal open={open} onClose={onClose}>
      <div className="mb-4">
        <h2 className="font-display text-2xl font-bold text-foreground">Panel administratora</h2>
        <p className="text-sm text-muted-foreground">Zarządzaj użytkownikami i statystykami</p>
      </div>
      <div className="max-h-[60vh] overflow-y-auto">
        <AdminPage />
      </div>
    </GlassModal>
  );
};

export default AdminModal;
