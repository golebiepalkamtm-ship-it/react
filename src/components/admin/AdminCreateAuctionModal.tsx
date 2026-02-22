import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel, X, ChevronLeft } from 'lucide-react';
import UnifiedAuctionForm from '@/components/UnifiedAuctionForm';
import AuctionCategorySelector from '@/components/AuctionCategorySelector';

interface AdminCreateAuctionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const AdminCreateAuctionModal: React.FC<AdminCreateAuctionModalProps> = ({
    isOpen,
    onClose,
    onSuccess
}) => {
    const [selectedCategory, setSelectedCategory] = useState<'pigeons' | 'supplements' | 'accessories' | null>(null);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-gradient-to-br from-[#0A0F1C] to-[#0A0F1C]/90 border border-[#A68E4E]/20 p-6 rounded-2xl w-full max-w-2xl shadow-2xl my-8"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Gavel className="w-5 h-5 text-[#A68E4E]" />
                                Nowa Aukcja (Admin)
                            </h3>
                            <motion.button onClick={onClose} whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}>
                                <X className="w-5 h-5 text-white/60 hover:text-white" />
                            </motion.button>
                        </div>

                        <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                            {!selectedCategory ? (
                                <AuctionCategorySelector
                                    onSelectCategory={setSelectedCategory}
                                    onCancel={onClose}
                                />
                            ) : (
                                <div className="space-y-4">
                                    <button onClick={() => setSelectedCategory(null)} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                                        <ChevronLeft className="w-4 h-4" /> Powrót do wyboru kategorii
                                    </button>
                                    <UnifiedAuctionForm
                                        category={selectedCategory}
                                        onSuccess={() => {
                                            onSuccess();
                                            onClose();
                                        }}
                                        onCancel={onClose}
                                    />
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
