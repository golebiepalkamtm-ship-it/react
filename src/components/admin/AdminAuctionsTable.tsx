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
        <p className="text-[#A68E4E]/60 text-sm">
          Znaleziono {auctions.length} aukcji
        </p>
        <Button
          onClick={onAdd}
          className="bg-[#A68E4E] text-[#0A0F1C] hover:bg-[#A68E4E]/90 gap-2 shadow-lg shadow-[#A68E4E]/20"
        >
          <Plus className="w-4 h-4" /> Dodaj Aukcję
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#A68E4E]/20">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#A68E4E]/20 bg-[#A68E4E]/5">
              <th className="text-left py-4 px-6 text-sm font-medium text-[#A68E4E]">
                Tytuł
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-[#A68E4E]">
                Sprzedawca
              </th>
              <th className="text-right py-4 px-6 text-sm font-medium text-[#A68E4E]">
                Cena
              </th>
              <th className="text-center py-4 px-6 text-sm font-medium text-[#A68E4E]">
                Status
              </th>
              <th className="text-right py-4 px-6 text-sm font-medium text-[#A68E4E]">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody>
            {auctions.map((auction, index) => (
              <motion.tr
                key={auction.id}
                className="border-b border-[#A68E4E]/10 hover:bg-[#A68E4E]/5 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <td className="py-4 px-6">
                  <span className="text-sm text-white">{auction.title}</span>
                </td>
                <td className="py-4 px-6 text-sm text-[#A68E4E]/80">
                  {auction.seller?.first_name} {auction.seller?.last_name}
                </td>
                <td className="py-4 px-6 text-right text-[#A68E4E] font-bold">
                  {auction.currentPrice?.toLocaleString("pl-PL")} zł
                </td>
                <td className="py-4 px-6 text-center">
                  <span
                    className={`text-xs px-3 py-1 rounded-full ${auction.status === "ACTIVE" ? "bg-[#A68E4E]/20 text-[#A68E4E]" : "bg-[#A68E4E]/5 text-[#A68E4E]/50"}`}
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
