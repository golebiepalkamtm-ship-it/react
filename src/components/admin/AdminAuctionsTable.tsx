import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Gavel, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuctionData } from '@/types/admin';

interface AdminAuctionsTableProps {
    auctions: AuctionData[];
    onEdit: (auction: AuctionData) => void;
    onAction: (auctionId: string, action: 'end' | 'delete') => void;
    onAdd: () => void;
}

export const AdminAuctionsTable: React.FC<AdminAuctionsTableProps> = ({
    auctions,
    onEdit,
    onAction,
    onAdd
}) => {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-white/60 text-sm">Znaleziono {auctions.length} aukcji</p>
                <Button
                    onClick={onAdd}
                    className="bg-gradient-to-r from-gold to-gold-dark text-navy hover:from-gold-light hover:to-gold gap-2 shadow-lg shadow-gold/20"
                >
                    <Plus className="w-4 h-4" /> Dodaj Aukcję
                </Button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10 bg-white/5">
                            <th className="text-left py-4 px-6 text-sm font-medium text-white/70">Tytuł</th>
                            <th className="text-left py-4 px-6 text-sm font-medium text-white/70">Sprzedawca</th>
                            <th className="text-right py-4 px-6 text-sm font-medium text-white/70">Cena</th>
                            <th className="text-center py-4 px-6 text-sm font-medium text-white/70">Status</th>
                            <th className="text-right py-4 px-6 text-sm font-medium text-white/70">Akcje</th>
                        </tr>
                    </thead>
                    <tbody>
                        {auctions.map((auction, index) => (
                            <motion.tr
                                key={auction.id}
                                className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.02 }}
                            >
                                <td className="py-4 px-6">
                                    <span className="text-sm text-white">{auction.title}</span>
                                </td>
                                <td className="py-4 px-6 text-sm text-white/60">
                                    {auction.seller?.first_name} {auction.seller?.last_name}
                                </td>
                                <td className="py-4 px-6 text-right text-gold font-bold">
                                    {auction.currentPrice?.toLocaleString('pl-PL')} zł
                                </td>
                                <td className="py-4 px-6 text-center">
                                    <span className={`text-xs px-3 py-1 rounded-full ${auction.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/60'}`}>
                                        {auction.status === 'ACTIVE' ? 'Aktywna' : 'Zakończona'}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/20 transition-colors" onClick={() => onEdit(auction)}>
                                            <Edit className="w-4 h-4 text-blue-400" />
                                        </button>
                                        {auction.status === 'ACTIVE' && (
                                            <button className="p-2 rounded-lg bg-white/5 hover:bg-orange-500/20 transition-colors" onClick={() => onAction(auction.id, 'end')}>
                                                <Gavel className="w-4 h-4 text-orange-400" />
                                            </button>
                                        )}
                                        <button className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 transition-colors" onClick={() => onAction(auction.id, 'delete')}>
                                            <Trash2 className="w-4 h-4 text-red-400" />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
