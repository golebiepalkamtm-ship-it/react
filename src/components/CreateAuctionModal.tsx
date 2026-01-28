import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Package, Pill, Home } from 'lucide-react';
import { UnifiedModal } from '@/components/ui/UnifiedModal';
import CreateAuctionForm from '@/components/CreateAuctionForm';

interface CreateAuctionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  children?: ReactNode;
}

export const CreateAuctionModal = ({
  isOpen,
  onClose,
  onSuccess,
  children
}: CreateAuctionModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [category, setCategory] = useState<'pigeons' | 'supplements' | 'accessories'>('pigeons');

  const categories = [
    { 
      id: 'pigeons', 
      label: 'Gołębie', 
      icon: Package, 
      description: 'Aukcje gołębi hodowlanych',
      color: 'from-blue-500 to-cyan-600'
    },
    { 
      id: 'supplements', 
      label: 'Suplementy', 
      icon: Pill, 
      description: 'Karmy i witaminy',
      color: 'from-green-500 to-emerald-600'
    },
    { 
      id: 'accessories', 
      label: 'Akcesoria', 
      icon: Home, 
      description: 'Sprzęt hodowlany',
      color: 'from-purple-500 to-pink-600'
    }
  ];

  const handleCategorySelect = (cat: typeof category) => {
    setCategory(cat);
    setCurrentStep(2);
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const renderContent = () => {
    if (currentStep === 1) {
      return (
        <motion.div
          key="category-selection"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <motion.button
                  key={cat.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCategorySelect(cat.id as typeof category)}
                  className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all text-left group"
                >
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${cat.color} w-fit mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{cat.label}</h3>
                  <p className="text-sm text-white/60">{cat.description}</p>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        key="auction-form"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        className="p-3"
      >
        <CreateAuctionForm
          initialCategory={category}
          onCancel={onClose}
          onSuccess={() => {
            onSuccess();
            onClose();
          }}
        />
      </motion.div>
    );
  };

  return (
    <UnifiedModal
      isOpen={isOpen}
      onClose={onClose}
      type="default"
      title={currentStep === 1 ? 'Wybierz kategorię' : 'Nowa aukcja'}
      showCloseButton={true}
      closeOnBackdrop={true}
      closeOnEscape={true}
      size={currentStep === 1 ? "xl" : "xl"}
      draggable={true}
      bodyScrollable={false}
      cancelButton={currentStep === 2 ? {
        text: 'Wróć',
        onClick: handleBack
      } : undefined}
    >
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
    </UnifiedModal>
  );
};
