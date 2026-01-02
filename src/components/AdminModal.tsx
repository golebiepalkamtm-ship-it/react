import React from 'react';
import { motion } from 'framer-motion';
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
    <GlassModal
      open={open}
      onClose={onClose}
      title="Panel administratora"
      description="Centrum dowodzenia: użytkownicy, aukcje i treści"
      variant="hero"
      containerClassName="max-w-6xl"
      contentClassName="px-2 pb-2 md:px-4 md:pb-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: -10 }}
        transition={{ duration: 0.2 }}
        className=""
      >
        <AdminPage />
      </motion.div>
    </GlassModal>
  );
};

export default AdminModal;
