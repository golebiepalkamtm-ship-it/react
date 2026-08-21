import React, { useState, useMemo } from "react";
import {
  CreditCard,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  Search,
  TrendingUp,
  Banknote,
} from "lucide-react";
import { motion } from "framer-motion";
import type { PaymentHistoryItem } from "@/services/paymentService";

interface AdminPaymentsTableProps {
  payments: (PaymentHistoryItem & { userEmail?: string | null })[];
  loading?: boolean;
  onStatusChange?: (paymentId: string, status: string) => void;
}

type SortField = "createdAt" | "amount" | "status" | "type";
type SortDir = "asc" | "desc";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  SUCCEEDED: {
    label: "Zapłacono",
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/25",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  COMPLETED: {
    label: "Zapłacono",
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/25",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  PAID: {
    label: "Zapłacono",
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/25",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  INITIATED: {
    label: "Rozpoczęto",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/25",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  PENDING: {
    label: "Oczekuje",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/25",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  FAILED: {
    label: "Błąd",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/25",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
  CANCELLED: {
    label: "Anulowano",
    color: "text-white/40",
    bg: "bg-white/5 border-white/10",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
  REFUNDED: {
    label: "Zwrócono",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/25",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
};

const TYPE_LABELS: Record<string, string> = {
  LISTING_FEE: "Opłata wystawienia",
  COMMISSION: "Prowizja",
  DEPOSIT: "Kaucja",
  REFUND: "Zwrot",
};

const formatPln = (n: number) =>
  `${n.toLocaleString("pl-PL", { minimumFractionDigits: 2 })} PLN`;

export const AdminPaymentsTable: React.FC<AdminPaymentsTableProps> = ({
  payments,
  loading,
  onStatusChange,
}) => {
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterType, setFilterType] = useState("ALL");
  const [search, setSearch] = useState("");

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-30" />;
    return sortDir === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-[#A68E4E]" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-[#A68E4E]" />
    );
  };

  const filtered = useMemo(() => {
    let list = [...payments];
    if (filterStatus !== "ALL") list = list.filter((p) => p.status === filterStatus);
    if (filterType !== "ALL") list = list.filter((p) => p.type === filterType);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.userEmail?.toLowerCase().includes(q) ||
          p.auctionTitle?.toLowerCase().includes(q) ||
          p.id?.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      let va: number | string, vb: number | string;
      if (sortField === "createdAt") {
        va = new Date(a.createdAt).getTime();
        vb = new Date(b.createdAt).getTime();
      } else if (sortField === "amount") {
        va = a.amount;
        vb = b.amount;
      } else {
        va = (a as any)[sortField] ?? "";
        vb = (b as any)[sortField] ?? "";
      }
      return sortDir === "asc"
        ? va < vb ? -1 : va > vb ? 1 : 0
        : va > vb ? -1 : va < vb ? 1 : 0;
    });
    return list;
  }, [payments, filterStatus, filterType, search, sortField, sortDir]);

  const totalAmount = useMemo(
    () =>
      filtered
        .filter((p) => ["PAID", "COMPLETED", "SUCCEEDED"].includes(p.status))
        .reduce((s, p) => s + p.amount, 0),
    [filtered]
  );

  // ── CSV export ─────────────────────────────────────────────
  const exportCSV = () => {
    const header = "Data,Użytkownik,Aukcja,Typ,Status,Kwota\n";
    const rows = filtered
      .map(
        (p) =>
          `"${new Date(p.createdAt).toLocaleString("pl-PL")}","${p.userEmail ?? ""}","${p.auctionTitle ?? ""}","${
            TYPE_LABELS[p.type] ?? p.type
          }","${p.status}","${p.amount}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `platnosci-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const allStatuses = ["ALL", ...Array.from(new Set(payments.map((p) => p.status)))];
  const allTypes = ["ALL", ...Array.from(new Set(payments.map((p) => p.type)))];

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-14 rounded-xl bg-[#A68E4E]/5 animate-pulse"
            style={{ opacity: 1 - i * 0.15 }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Wszystkich transakcji",
            value: payments.length,
            icon: <CreditCard className="w-4 h-4" />,
            color: "text-[#A68E4E]",
          },
          {
            label: "Wpływy (filtered)",
            value: formatPln(totalAmount),
            icon: <Banknote className="w-4 h-4" />,
            color: "text-green-400",
          },
          {
            label: "Oczekujące",
            value: payments.filter((p) => p.status === "PENDING").length,
            icon: <Clock className="w-4 h-4" />,
            color: "text-amber-400",
          },
          {
            label: "Nieudane",
            value: payments.filter((p) => p.status === "FAILED").length,
            icon: <XCircle className="w-4 h-4" />,
            color: "text-red-400",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="p-4 rounded-xl bg-[#0A0F1C]/50 border border-[#A68E4E]/15 flex flex-col gap-1"
          >
            <div className={`flex items-center gap-1.5 ${card.color} text-xs`}>
              {card.icon}
              {card.label}
            </div>
            <p className="text-white font-semibold text-lg">{card.value}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Szukaj użytkownika, aukcji…"
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-[#A68E4E]/20 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#A68E4E]/50"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-xl bg-white/5 border border-[#A68E4E]/20 text-white text-sm focus:outline-none"
        >
          {allStatuses.map((s) => (
            <option key={s} value={s} className="bg-[#0A0F1C]">
              {s === "ALL" ? "Wszystkie statusy" : STATUS_CONFIG[s]?.label ?? s}
            </option>
          ))}
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 rounded-xl bg-white/5 border border-[#A68E4E]/20 text-white text-sm focus:outline-none"
        >
          {allTypes.map((t) => (
            <option key={t} value={t} className="bg-[#0A0F1C]">
              {t === "ALL" ? "Wszystkie typy" : TYPE_LABELS[t] ?? t}
            </option>
          ))}
        </select>

        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#A68E4E]/30 text-[#A68E4E] hover:bg-[#A68E4E]/10 text-sm transition-colors"
        >
          <Download className="w-4 h-4" />
          CSV
        </button>
      </div>

      {/* ── Table ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-white/30">
          <CreditCard className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm">Brak transakcji spełniających kryteria</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#A68E4E]/20">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#A68E4E]/20 bg-[#A68E4E]/5">
                <th
                  className="text-left py-3 px-4 text-[#A68E4E] font-medium cursor-pointer hover:text-[#A68E4E]/80"
                  onClick={() => toggleSort("createdAt")}
                >
                  <span className="flex items-center gap-1.5">
                    Data <SortIcon field="createdAt" />
                  </span>
                </th>
                <th className="text-left py-3 px-4 text-[#A68E4E] font-medium">Użytkownik</th>
                <th className="text-left py-3 px-4 text-[#A68E4E] font-medium">Aukcja</th>
                <th
                  className="text-left py-3 px-4 text-[#A68E4E] font-medium cursor-pointer hover:text-[#A68E4E]/80"
                  onClick={() => toggleSort("type")}
                >
                  <span className="flex items-center gap-1.5">
                    Typ <SortIcon field="type" />
                  </span>
                </th>
                <th
                  className="text-left py-3 px-4 text-[#A68E4E] font-medium cursor-pointer hover:text-[#A68E4E]/80"
                  onClick={() => toggleSort("status")}
                >
                  <span className="flex items-center gap-1.5">
                    Status <SortIcon field="status" />
                  </span>
                </th>
                <th
                  className="text-right py-3 px-4 text-[#A68E4E] font-medium cursor-pointer hover:text-[#A68E4E]/80"
                  onClick={() => toggleSort("amount")}
                >
                  <span className="flex items-center justify-end gap-1.5">
                    Kwota <SortIcon field="amount" />
                  </span>
                </th>
                <th className="text-right py-3 px-4 text-[#A68E4E] font-medium">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const sc = STATUS_CONFIG[p.status] ?? {
                  label: p.status,
                  color: "text-white/60",
                  bg: "bg-white/5 border-white/10",
                  icon: null,
                };
                return (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-[#A68E4E]/10 hover:bg-[#A68E4E]/5 transition-colors"
                  >
                    <td className="py-3 px-4 text-white/70 text-xs whitespace-nowrap">
                      {new Date(p.createdAt).toLocaleString("pl-PL")}
                    </td>
                    <td className="py-3 px-4 text-white/80 text-xs max-w-[160px] truncate">
                      {p.userEmail ?? "—"}
                    </td>
                    <td className="py-3 px-4 text-white text-xs max-w-[180px] truncate">
                      {p.auctionTitle ?? "—"}
                    </td>
                    <td className="py-3 px-4 text-[#A68E4E]/80 text-xs">
                      {TYPE_LABELS[p.type] ?? p.type}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${sc.color} ${sc.bg}`}
                      >
                        {sc.icon}
                        {sc.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-white font-semibold whitespace-nowrap">
                      {formatPln(p.amount)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {onStatusChange && (
                        <select
                          className="bg-black/50 border border-[#A68E4E]/30 text-white/80 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#A68E4E]"
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              if (window.confirm(`Czy na pewno chcesz zmienić status tej transakcji na: ${e.target.value}?`)) {
                                onStatusChange(p.id, e.target.value);
                              }
                            }
                          }}
                        >
                          <option value="" disabled>Zmień status</option>
                          <option value="SUCCEEDED">Sukces (Opłacono)</option>
                          <option value="PENDING">Oczekuje</option>
                          <option value="CANCELLED">Anulowano</option>
                          <option value="FAILED">Błąd</option>
                        </select>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>

          <div className="px-4 py-3 border-t border-[#A68E4E]/10 flex items-center justify-between text-xs text-white/40">
            <span>{filtered.length} z {payments.length} transakcji</span>
            <span>Suma: <span className="text-green-400 font-medium">{formatPln(totalAmount)}</span></span>
          </div>
        </div>
      )}
    </div>
  );
};
