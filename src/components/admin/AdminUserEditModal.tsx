import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserData } from "@/types/admin";

interface AdminUserEditModalProps {
  user: UserData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  onChange: (user: UserData) => void;
}

export const AdminUserEditModal: React.FC<AdminUserEditModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
  onChange,
}) => {
  if (!user) return null;

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
            className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/20 p-6 rounded-2xl w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-gold" />
                Edytuj Użytkownika
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
                  Email
                </label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                  value={user.email}
                  onChange={(e) => onChange({ ...user, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Nick
                </label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                  value={user.username || ""}
                  onChange={(e) =>
                    onChange({ ...user, username: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Imię
                  </label>
                  <input
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                    value={user.first_name || ""}
                    onChange={(e) =>
                      onChange({ ...user, first_name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Nazwisko
                  </label>
                  <input
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                    value={user.last_name || ""}
                    onChange={(e) =>
                      onChange({ ...user, last_name: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Nowe hasło (opcjonalnie)
                </label>
                <input
                  type="password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                  value={user.password || ""}
                  onChange={(e) =>
                    onChange({ ...user, password: e.target.value })
                  }
                  placeholder="Pozostaw puste aby nie zmieniać"
                  autoComplete="new-password"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 py-2">
                <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-white/20 bg-transparent text-gold focus:ring-gold/20"
                    checked={user.isBlocked || false}
                    onChange={(e) =>
                      onChange({ ...user, isBlocked: e.target.checked })
                    }
                  />
                  <span className="text-sm text-white/90">Zablokowany</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-white/20 bg-transparent text-red-500 focus:ring-red-500/20"
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                  value={user.role}
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
                  className="border-white/20"
                >
                  Anuluj
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-gold to-gold-dark text-navy"
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
