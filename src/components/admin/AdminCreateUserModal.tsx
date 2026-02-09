import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserData } from '@/types/admin';

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
    onChange
}) => {
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
                        className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/20 p-6 rounded-2xl w-full max-w-md shadow-2xl"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Plus className="w-5 h-5 text-gold" />
                                Nowy Użytkownik
                            </h3>
                            <motion.button onClick={onClose} whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}>
                                <X className="w-5 h-5 text-white/60 hover:text-white" />
                            </motion.button>
                        </div>
                        <form onSubmit={onSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">Email *</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                                    value={user.email || ''}
                                    onChange={e => onChange({ ...user, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">Hasło *</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                                    value={user.password || ''}
                                    onChange={e => onChange({ ...user, password: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">Nick *</label>
                                <input
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                                    value={user.username || ''}
                                    onChange={e => onChange({ ...user, username: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">Imię</label>
                                    <input
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                                        value={user.first_name || ''}
                                        onChange={e => onChange({ ...user, first_name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">Nazwisko</label>
                                    <input
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                                        value={user.last_name || ''}
                                        onChange={e => onChange({ ...user, last_name: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">Rola</label>
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                                    value={user.role || 'USER_REGISTERED'}
                                    onChange={e => onChange({ ...user, role: e.target.value })}
                                >
                                    <option value="USER_REGISTERED">Zarejestrowany</option>
                                    <option value="USER_FULL_VERIFIED">Zweryfikowany</option>
                                    <option value="ADMIN">Administrator</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <Button type="button" variant="outline" onClick={onClose} className="border-white/20">Anuluj</Button>
                                <Button type="submit" className="bg-gradient-to-r from-gold to-gold-dark text-navy">
                                    <Plus className="w-4 h-4 mr-2" /> Utwórz
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
