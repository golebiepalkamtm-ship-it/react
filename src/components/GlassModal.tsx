import React from 'react';
import { X } from 'lucide-react';

interface GlassModalProps {
  open: boolean;
  onClose: () => void;
  headerImage?: string | null;
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

const GlassModal: React.FC<GlassModalProps> = ({ open, onClose, headerImage, title, description, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-3xl mx-auto">
        <div className="bg-black/60 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
          {headerImage && (
            <div className="relative">
              <img src={headerImage} alt={title || 'header'} className="w-full h-48 object-cover" />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-black bg-opacity-40 text-white">
                {title && <h3 className="text-2xl font-bold">{title}</h3>}
                {description && <p className="text-sm opacity-90">{description}</p>}
              </div>
              <button aria-label="Zamknij" onClick={onClose} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {!headerImage && (
            <div className="p-4 flex justify-end">
              <button aria-label="Zamknij" onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default GlassModal;
