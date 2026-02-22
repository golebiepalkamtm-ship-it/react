import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gavel, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuctionData } from "@/types/admin";

interface AdminAuctionEditModalProps {
  auction: AuctionData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  onChange: (auction: AuctionData) => void;
}

export const AdminAuctionEditModal: React.FC<AdminAuctionEditModalProps> = ({
  auction,
  isOpen,
  onClose,
  onSave,
  onChange,
}) => {
  if (!auction) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-gradient-to-br from-[#0A0F1C] to-[#0A0F1C]/90 border border-[#A68E4E]/20 p-6 rounded-2xl w-full max-w-lg shadow-2xl"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Gavel className="w-5 h-5 text-[#A68E4E]" />
                Edytuj Aukcję
              </h3>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5 text-white/60 hover:text-white" />
              </motion.button>
            </div>
            <form onSubmit={onSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Tytuł
                </label>
                <input
                  className="w-full bg-[#A68E4E]/5 border border-[#A68E4E]/10 rounded-xl p-3 text-white focus:border-[#A68E4E]/50 focus:ring-2 focus:ring-[#A68E4E]/20 outline-none transition-all"
                  value={auction.title}
                  onChange={(e) =>
                    onChange({ ...auction, title: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Opis
                </label>
                <textarea
                  className="w-full bg-[#A68E4E]/5 border border-[#A68E4E]/10 rounded-xl p-3 text-white h-20 focus:border-[#A68E4E]/50 focus:ring-2 focus:ring-[#A68E4E]/20 outline-none transition-all resize-none"
                  value={auction.description || ""}
                  onChange={(e) =>
                    onChange({ ...auction, description: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Cena Startowa
                  </label>
                  <input
                    type="number"
                    className="w-full bg-[#A68E4E]/5 border border-[#A68E4E]/10 rounded-xl p-3 text-white focus:border-[#A68E4E]/50 focus:ring-2 focus:ring-[#A68E4E]/20 outline-none transition-all"
                    value={auction.startingPrice || 0}
                    onChange={(e) =>
                      onChange({
                        ...auction,
                        startingPrice: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Kup Teraz
                  </label>
                  <input
                    type="number"
                    className="w-full bg-[#A68E4E]/5 border border-[#A68E4E]/10 rounded-xl p-3 text-white focus:border-[#A68E4E]/50 focus:ring-2 focus:ring-[#A68E4E]/20 outline-none transition-all"
                    value={auction.buyNowPrice || 0}
                    onChange={(e) =>
                      onChange({
                        ...auction,
                        buyNowPrice: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Status
                </label>
                <select
                  className="w-full bg-[#A68E4E]/5 border border-[#A68E4E]/10 rounded-xl p-3 text-white focus:border-[#A68E4E]/50 focus:ring-2 focus:ring-[#A68E4E]/20 outline-none transition-all"
                  value={auction.status}
                  onChange={(e) =>
                    onChange({ ...auction, status: e.target.value })
                  }
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="ENDED">ENDED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Czas zakończenia
                </label>
                <input
                  type="datetime-local"
                  className="w-full bg-[#A68E4E]/5 border border-[#A68E4E]/10 rounded-xl p-3 text-white focus:border-[#A68E4E]/50 focus:ring-2 focus:ring-[#A68E4E]/20 outline-none transition-all"
                  value={(() => {
                    if (!auction.endTime) return "";
                    const date = new Date(auction.endTime);
                    if (isNaN(date.getTime())) return "";
                    const pad = (num: number) => String(num).padStart(2, "0");
                    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
                  })()}
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    if (!isNaN(date.getTime())) {
                      onChange({ ...auction, endTime: date.toISOString() });
                    }
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Minimalne postąpienie
                  </label>
                  <input
                    type="number"
                    className="w-full bg-[#A68E4E]/5 border border-[#A68E4E]/10 rounded-xl p-3 text-white focus:border-[#A68E4E]/50 focus:ring-2 focus:ring-[#A68E4E]/20 outline-none transition-all"
                    value={auction.minBidIncrement || 0}
                    onChange={(e) =>
                      onChange({
                        ...auction,
                        minBidIncrement: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Kategoria
                  </label>
                  <select
                    className="w-full bg-[#A68E4E]/5 border border-[#A68E4E]/10 rounded-xl p-3 text-white focus:border-[#A68E4E]/50 focus:ring-2 focus:ring-[#A68E4E]/20 outline-none transition-all"
                    value={auction.category || "PIGEONS"}
                    onChange={(e) =>
                      onChange({ ...auction, category: e.target.value })
                    }
                  >
                    <option value="PIGEONS">Gołębie</option>
                    <option value="ACCESSORIES">Akcesoria</option>
                    <option value="SUPPLEMENTS">Suplementy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Płeć
                </label>
                <select
                  className="w-full bg-[#A68E4E]/5 border border-[#A68E4E]/10 rounded-xl p-3 text-white focus:border-[#A68E4E]/50 focus:ring-2 focus:ring-[#A68E4E]/20 outline-none transition-all"
                  value={auction.sex || "MALE"}
                  onChange={(e) =>
                    onChange({ ...auction, sex: e.target.value })
                  }
                >
                  <option value="MALE">SAMIEC</option>
                  <option value="FEMALE">SAMICA</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="border-[#A68E4E]/20 text-[#A68E4E] hover:bg-[#A68E4E]/10"
                >
                  Anuluj
                </Button>
                <Button
                  type="submit"
                  className="bg-[#A68E4E] text-[#0A0F1C] hover:bg-[#A68E4E]/90"
                >
                  <Save className="w-4 h-4 mr-2" /> Zapisz
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
