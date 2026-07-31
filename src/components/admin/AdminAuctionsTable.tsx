import React from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Gavel, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuctionData } from "@/types/admin";

interface AdminAuctionsTableProps {
  auctions: AuctionData[];
  onEdit: (auction: AuctionData) => void;
  onAction: (auctionId: string, action: "end" | "delete") => void;
  onAdd: () => void;
}

export const AdminAuctionsTable: React.FC<AdminAuctionsTableProps> = ({
  auctions,
  onEdit,
  onAction,
  onAdd,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-zinc-300 text-sm font-medium">
          Znaleziono <span className="text-[#A68E4E] font-bold">{auctions.length}</span> aukcji
        </p>
        <Button
          onClick={onAdd}
          className="bg-[#A68E4E] text-[#0A0F1C] hover:bg-gold font-bold gap-2 shadow-lg shadow-[#A68E4E]/30"
        >
          <Plus className="w-4 h-4" /> Dodaj Aukcję
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#A68E4E]/40 bg-[#060a17]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#A68E4E]/30 bg-[#0d162b]">
              <th className="text-left py-4 px-6 text-sm font-bold text-[#A68E4E] uppercase tracking-wider">
                Tytuł
              </th>
              <th className="text-left py-4 px-6 text-sm font-bold text-[#A68E4E] uppercase tracking-wider">
                Sprzedawca
              </th>
              <th className="text-right py-4 px-6 text-sm font-bold text-[#A68E4E] uppercase tracking-wider">
                Cena
              </th>
              <th className="text-center py-4 px-6 text-sm font-bold text-[#A68E4E] uppercase tracking-wider">
                Status
              </th>
              <th className="text-right py-4 px-6 text-sm font-bold text-[#A68E4E] uppercase tracking-wider">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody>
            {auctions.map((auction, index) => (
              <motion.tr
                key={auction.id}
                className="border-b border-[#A68E4E]/15 hover:bg-[#A68E4E]/10 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <td className="py-4 px-6">
                  <span className="text-sm font-semibold text-white">{auction.title}</span>
                </td>
                <td className="py-4 px-6 text-sm font-medium text-zinc-200">
                  {auction.seller?.first_name} {auction.seller?.last_name}
                </td>
                <td className="py-4 px-6 text-right text-gold font-bold text-base">
                  {auction.currentPrice?.toLocaleString("pl-PL")} zł
                </td>
                <td className="py-4 px-6 text-center">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${auction.status === "ACTIVE" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-zinc-800 text-zinc-400 border border-zinc-700"}`}
                  >
                    {auction.status === "ACTIVE" ? "Aktywna" : "Zakończona"}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="p-2 rounded-lg bg-[#A68E4E]/5 hover:bg-[#A68E4E]/20 transition-colors"
                      onClick={() => onEdit(auction)}
                      title="Edytuj dane aukcji"
                    >
                      <Edit className="w-4 h-4 text-[#A68E4E]" />
                    </button>
                    {auction.status === "ACTIVE" && (
                      <button
                        className="p-2 rounded-lg bg-[#A68E4E]/5 hover:bg-[#A68E4E]/20 transition-colors"
                        onClick={() => onAction(auction.id, "end")}
                        title="Zakończ aukcję przed czasem"
                      >
                        <Gavel className="w-4 h-4 text-[#A68E4E]" />
                      </button>
                    )}
                    <button
                      className="p-2 rounded-lg bg-[#A68E4E]/5 hover:bg-red-500/20 transition-colors"
                      onClick={() => onAction(auction.id, "delete")}
                      title="Usuń aukcję trwale"
                    >
                      <Trash2 className="w-4 h-4 text-[#A68E4E] hover:text-red-400 transition-colors" />
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
