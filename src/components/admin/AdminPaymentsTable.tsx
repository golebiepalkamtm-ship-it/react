import React from "react";
import type { PaymentHistoryItem } from "@/services/paymentService";

interface AdminPaymentsTableProps {
  payments: (PaymentHistoryItem & { userEmail?: string | null })[];
  loading?: boolean;
}

export const AdminPaymentsTable: React.FC<AdminPaymentsTableProps> = ({
  payments,
  loading,
}) => {
  const formatPln = (n: number) =>
    `${n.toLocaleString("pl-PL", { minimumFractionDigits: 2 })} PLN`;

  if (loading) {
    return <p className="text-[#A68E4E]/60 text-sm">Ładowanie płatności...</p>;
  }

  if (payments.length === 0) {
    return <p className="text-[#A68E4E]/60 text-sm">Brak transakcji.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#A68E4E]/20">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#A68E4E]/20 bg-[#A68E4E]/5">
            <th className="text-left py-3 px-4 text-[#A68E4E]">Data</th>
            <th className="text-left py-3 px-4 text-[#A68E4E]">Użytkownik</th>
            <th className="text-left py-3 px-4 text-[#A68E4E]">Aukcja</th>
            <th className="text-left py-3 px-4 text-[#A68E4E]">Typ</th>
            <th className="text-left py-3 px-4 text-[#A68E4E]">Status</th>
            <th className="text-right py-3 px-4 text-[#A68E4E]">Kwota</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr
              key={p.id}
              className="border-b border-[#A68E4E]/10 hover:bg-[#A68E4E]/5"
            >
              <td className="py-3 px-4 text-white/80">
                {new Date(p.createdAt).toLocaleString("pl-PL")}
              </td>
              <td className="py-3 px-4 text-white/80">
                {p.userEmail ?? "—"}
              </td>
              <td className="py-3 px-4 text-white">{p.auctionTitle ?? "—"}</td>
              <td className="py-3 px-4 text-[#A68E4E]">{p.type}</td>
              <td className="py-3 px-4 text-white/80">{p.status}</td>
              <td className="py-3 px-4 text-right text-white font-medium">
                {formatPln(p.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
