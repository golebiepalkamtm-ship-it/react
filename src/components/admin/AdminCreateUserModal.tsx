import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserData } from "@/types/admin";

interface AdminCreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  user: Partial<UserData>;
  onChange: (user: Partial<UserData>) => void;
}

export const AdminCreateUserModal: React.FC<AdminCreateUserModalProps> = ({
  isOpen,
  onClose,
  onSave,
  user,
  onChange,
}) => {
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-gradient-to-br from-[#0A0F1C] to-[#0A0F1C]/90 border border-[#A68E4E]/20 p-6 rounded-2xl w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#A68E4E]" />
                Nowy Użytkownik
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
                  Email *
                </label>
                <input
                  type="email"
                  required
                  className="w-full bg-[#A68E4E]/5 border border-[#A68E4E]/10 rounded-xl p-3 text-white focus:border-[#A68E4E]/50 focus:ring-2 focus:ring-[#A68E4E]/20 outline-none transition-all"
                  value={user.email || ""}
                  onChange={(e) => onChange({ ...user, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Hasło *
                </label>
                <input
                  type="password"
                  required
                  className="w-full bg-[#A68E4E]/5 border border-[#A68E4E]/10 rounded-xl p-3 text-white focus:border-[#A68E4E]/50 focus:ring-2 focus:ring-[#A68E4E]/20 outline-none transition-all"
                  value={user.password || ""}
                  onChange={(e) =>
                    onChange({ ...user, password: e.target.value })
                  }
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Nick (Username) *
                </label>
                <input
                  required
                  className="w-full bg-[#A68E4E]/5 border border-[#A68E4E]/10 rounded-xl p-3 text-white focus:border-[#A68E4E]/50 focus:ring-2 focus:ring-[#A68E4E]/20 outline-none transition-all"
                  value={user.username || ""}
                  onChange={(e) =>
                    onChange({ ...user, username: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Imię *
                  </label>
                  <input
                    required
                    className="w-full bg-[#A68E4E]/5 border border-[#A68E4E]/10 rounded-xl p-3 text-white focus:border-[#A68E4E]/50 focus:ring-2 focus:ring-[#A68E4E]/20 outline-none transition-all"
                    value={user.first_name || ""}
                    onChange={(e) =>
                      onChange({ ...user, first_name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Nazwisko *
                  </label>
                  <input
                    required
                    className="w-full bg-[#A68E4E]/5 border border-[#A68E4E]/10 rounded-xl p-3 text-white focus:border-[#A68E4E]/50 focus:ring-2 focus:ring-[#A68E4E]/20 outline-none transition-all"
                    value={user.last_name || ""}
                    onChange={(e) =>
                      onChange({ ...user, last_name: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Numer telefonu *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+48 000 000 000"
                  className="w-full bg-[#A68E4E]/5 border border-[#A68E4E]/10 rounded-xl p-3 text-white focus:border-[#A68E4E]/50 focus:ring-2 focus:ring-[#A68E4E]/20 outline-none transition-all"
                  value={user.phone || ""}
                  onChange={(e) => onChange({ ...user, phone: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 py-2">
                <label className="flex items-center gap-3 p-3 bg-[#A68E4E]/5 rounded-xl cursor-pointer hover:bg-[#A68E4E]/10 transition-colors">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-[#A68E4E]/20 bg-transparent text-[#A68E4E] focus:ring-[#A68E4E]/20"
                    checked={user.isBlocked || false}
                    onChange={(e) =>
                      onChange({ ...user, isBlocked: e.target.checked })
                    }
                  />
                  <span className="text-sm text-white/90">Zablokowany</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-[#A68E4E]/5 rounded-xl cursor-pointer hover:bg-[#A68E4E]/10 transition-colors">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-[#A68E4E]/20 bg-transparent text-red-500 focus:ring-red-500/20"
                    checked={user.isBanned || false}
                    onChange={(e) =>
                      onChange({ ...user, isBanned: e.target.checked })
                    }
                  />
                  <span className="text-sm text-white/90">Zbanowany</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Rola
                </label>
                <select
                  className="w-full bg-[#A68E4E]/5 border border-[#A68E4E]/10 rounded-xl p-3 text-white focus:border-[#A68E4E]/50 focus:ring-2 focus:ring-[#A68E4E]/20 outline-none transition-all"
                  value={user.role || "USER_REGISTERED"}
                  onChange={(e) => onChange({ ...user, role: e.target.value })}
                >
                  <option value="USER_REGISTERED">Zarejestrowany</option>
                  <option value="USER_EMAIL_VERIFIED">
                    Zweryfikowany Email
                  </option>
                  <option value="USER_FULL_VERIFIED">
                    W pełni zweryfikowany
                  </option>
                  <option value="ADMIN">Administrator</option>
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
                  <Plus className="w-4 h-4 mr-2" /> Utwórz
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
