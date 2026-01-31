import { useState, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Package, Pill, Home } from 'lucide-react';
import { UnifiedModal } from '@/components/ui/UnifiedModal';
import CreateAuctionForm, { type FormControls } from '@/components/CreateAuctionForm';

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
  const [formStep, setFormStep] = useState({ step: 1, total: 1 });
  const formControlsRef = useRef<FormControls | null>(null);
  const isPigeonCategory = category === 'pigeons';

  const handleClose = () => {
    setCurrentStep(1);
    setCategory('pigeons');
    setFormStep({ step: 1, total: 1 });
    onClose();
  };

  const categories = [
    { 
      id: 'pigeons', 
      label: 'Gołębie', 
      icon: Package, 
      description: 'Aukcje gołębi hodowlanych',
      color: 'from-blue-600 to-blue-500'
    },
    { 
      id: 'supplements', 
      label: 'Suplementy', 
      icon: Pill, 
      description: 'Karmy i witaminy',
      color: 'from-green-600 to-green-500'
    },
    { 
      id: 'accessories', 
      label: 'Akcesoria', 
      icon: Home, 
      description: 'Sprzęt hodowlany',
      color: 'from-purple-600 to-purple-500'
    }
  ];

  const handleCategorySelect = (cat: typeof category) => {
    setCategory(cat);
    setCurrentStep(2); // zawsze przechodzimy do formularza
    setFormStep({ step: 1, total: cat === 'pigeons' ? 3 : 2 });
  };

  const renderContent = () => {
    if (currentStep === 1) {
      return (
        <motion.div
          key="category-selection"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="p-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <motion.button
                  key={cat.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCategorySelect(cat.id as typeof category)}
                  className="p-5 rounded-xl bg-gray-800/80 border border-white/10 hover:border-white/20 hover:bg-gray-800 transition-all text-left group text-white"
                >
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${cat.color} w-fit mb-4`}>
                    <Icon className="w-12 h-12 text-white" />
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
          key={category}
          initialCategory={category}
          controlsRef={formControlsRef}
          onStepChange={(step, total) => setFormStep({ step, total })}
          onCancel={handleClose}
          onSuccess={() => {
            onSuccess();
            handleClose();
          }}
        />
      </motion.div>
    );
  };

  return (
    <UnifiedModal
      isOpen={isOpen}
      onClose={handleClose}
      type="default"
      title={currentStep === 1 ? 'Wybierz kategorię' : 'Nowa aukcja'}
      showCloseButton={true}
      closeOnBackdrop={false}
      closeOnEscape={true}
      size={currentStep === 1 ? "lg" : isPigeonCategory ? "xl" : "lg"}
      draggable={true}
      bodyScrollable={false}
      hideGradient
      backdropClassName="bg-transparent"
      containerClassName="bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 border border-white/10 text-white shadow-2xl shadow-black/50"
      cancelButton={currentStep === 2 ? {
        text: 'Cofnij',
        onClick: () => {
          if (formStep.step > 1) {
            formControlsRef.current?.goBack();
          } else {
            setCurrentStep(1); // wróć do wyboru kategorii
          }
        }
      } : undefined}
      confirmButton={currentStep === 2 ? {
        text: formStep.step < formStep.total ? 'Dalej' : 'Zapisz',
        onClick: () => {
          formControlsRef.current?.submit();
        }
      } : undefined}
    >
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
    </UnifiedModal>
  );
};
