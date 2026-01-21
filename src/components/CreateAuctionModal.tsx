import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Plus, Bird, Eye, Camera, Sparkles, ChevronLeft } from 'lucide-react';
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

  const steps = [
    { step: 1, label: 'Szczegóły aukcji', icon: Eye },
    { step: 2, label: 'Media', icon: Camera },
  ];

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const validateForm = () => {
    return true;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-6xl mx-4 bg-black/90 rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(212,175,55,0.12),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(96,165,250,0.2),transparent_28%)] pointer-events-none" />

            <div className="relative z-10 p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-gold to-gold-dark shadow-lg shadow-gold/30">
                    <Bird className="w-6 h-6 text-navy" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Utwórz nową aukcję</h2>
                    <p className="text-sm text-white/60">Wypełnij formularz, aby wystawić przedmiot na aukcję</p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex items-center gap-4 mb-8 p-4 rounded-2xl bg-white/5 border border-white/10">
                {steps.map((step) => (
                  <div key={step.step} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      currentStep === step.step 
                        ? 'bg-gradient-to-br from-gold to-gold-dark text-navy shadow-lg shadow-gold/40' 
                        : currentStep > step.step 
                          ? 'bg-green-500 text-white' 
                          : 'bg-white/10 text-white/50'
                    }`}>
                      {currentStep > step.step ? <Check className="w-4 h-4" /> : step.step}
                    </div>
                    <span className={`text-sm font-medium ${currentStep === step.step ? 'text-gold' : 'text-white/50'}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="auction-form"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="space-y-6"
                  >
                    <CreateAuctionForm
                      initialCategory={category as 'pigeons' | 'supplements' | 'accessories' | ''}
                      onCancel={onClose}
                      onSuccess={() => {
                        onSuccess();
                        onClose();
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


const Check = ({ className }: { className?: string }) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
};
