import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel, X } from 'lucide-react';
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

    if (typeof document === "undefined") return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-[999999] flex items-center justify-center p-2 sm:p-4 md:p-6"
                    data-lenis-prevent="true"
                    data-lenis-prevent-touch="true"
                >
                    <motion.div
                        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    <motion.div
                        className="relative bg-[#0c1427] border-2 border-[#A68E4E]/70 p-4 md:p-6 rounded-2xl md:rounded-3xl w-full max-w-6xl md:max-w-7xl max-h-[80vh] flex flex-col shadow-[0_0_80px_rgba(166,142,78,0.35)] z-10 text-white"
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        onClick={(e) => e.stopPropagation()}
                        data-lenis-prevent="true"
                        data-lenis-prevent-touch="true"
                    >
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#A68E4E]/40 shrink-0">
                            <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#A68E4E]/30 to-amber-600/20 border border-[#A68E4E]/50">
                                    <Gavel className="w-4 h-4 text-gold" />
                                </div>
                                <span>Nowa Aukcja (Admin)</span>
                            </h3>
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-2.5 py-1 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 hover:bg-red-500/35 transition-all flex items-center gap-1 text-xs font-bold shrink-0 cursor-pointer"
                            >
                                <X className="w-4 h-4 text-red-200" />
                                <span>Zamknij</span>
                            </button>
                        </div>

                        <div
                            className="flex-1 overflow-y-auto pr-2 custom-scrollbar overscroll-contain space-y-4"
                            data-lenis-prevent="true"
                            data-lenis-prevent-touch="true"
                        >
                            <div className={!selectedCategory ? "block" : "hidden"}>
                                <AuctionCategorySelector
                                    onSelectCategory={setSelectedCategory}
                                    onCancel={onClose}
                                />
                            </div>

                            <div className={selectedCategory ? "block space-y-4" : "hidden"}>
                                <UnifiedAuctionForm
                                    category={selectedCategory || "pigeons"}
                                    onSuccess={() => {
                                        onSuccess();
                                        onClose();
                                    }}
                                    onCancel={() => setSelectedCategory(null)}
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default AdminCreateAuctionModal;
