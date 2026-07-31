import { useState } from "react";
import {
  CreditCard,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Banknote,
  TrendingUp,
  RefreshCw,
  Zap,
  Receipt,
  ArrowUpRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { usePaymentHistory } from "@/hooks/usePaymentHistory";
import { useAuth } from "@/contexts/AuthContext";
import PaymentModal from "@/components/PaymentModal";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  COMPLETED: {
    label: "Zapłacono",
    color: "text-green-400",
    bg: "bg-green-500/10 border border-green-500/25",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  PAID: {
    label: "Zapłacono",
    color: "text-green-400",
    bg: "bg-green-500/10 border border-green-500/25",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  PENDING: {
    label: "Oczekuje",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border border-amber-500/25",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  FAILED: {
    label: "Błąd",
    color: "text-red-400",
    bg: "bg-red-500/10 border border-red-500/25",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
  CANCELLED: {
    label: "Anulowano",
    color: "text-white/40",
    bg: "bg-white/5 border border-white/10",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
};

const TYPE_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  LISTING_FEE: { label: "Opłata wystawienia", icon: <Receipt className="w-3.5 h-3.5" /> },
  COMMISSION: { label: "Prowizja", icon: <Banknote className="w-3.5 h-3.5" /> },
  DEPOSIT: { label: "Kaucja", icon: <ArrowUpRight className="w-3.5 h-3.5" /> },
  REFUND: { label: "Zwrot", icon: <RefreshCw className="w-3.5 h-3.5" /> },
};

const formatPln = (amount: number) =>
  `${amount.toLocaleString("pl-PL", { minimumFractionDigits: 2 })} PLN`;

export function UserPaymentsSection() {
  const { session } = useAuth();
  const { payments, pendingCommissions, loading, error, refresh } =
    usePaymentHistory();
  const [commissionAuctionId, setCommissionAuctionId] = useState<string | null>(null);

  const totalPaid = payments
    .filter((p) => ["PAID", "COMPLETED"].includes(p.status))
    .reduce((s, p) => s + p.amount, 0);

  const lastPayment = payments
    .filter((p) => ["PAID", "COMPLETED"].includes(p.status))
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

  return (
    <div className="space-y-5 pb-4">

      {/* ── Pending commissions alert ── */}
      <AnimatePresence>
        {pendingCommissions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-amber-900/10 p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="relative">
                <Zap className="w-5 h-5 text-amber-400" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-ping opacity-75" />
              </div>
              <h3 className="text-white font-semibold text-sm">
                Oczekujące prowizje ({pendingCommissions.length})
              </h3>
            </div>
            <ul className="space-y-2">
              {pendingCommissions.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-2"
                >
                  <div>
                    <p className="text-white/90 text-sm font-medium">
                      {p.auctionTitle ?? "Aukcja"}
                    </p>
                    <p className="text-amber-400 font-semibold text-sm">
                      {formatPln(p.amount)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setCommissionAuctionId(p.auctionId)}
                    className="bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs h-8"
                  >
                    Zapłać teraz
                  </Button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Summary cards ── */}
      {!loading && payments.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Łączne wydatki",
              value: formatPln(totalPaid),
              icon: <TrendingUp className="w-4 h-4" />,
              color: "text-[#A68E4E]",
            },
            {
              label: "Transakcji",
              value: String(payments.length),
              icon: <CreditCard className="w-4 h-4" />,
              color: "text-blue-400",
            },
            {
              label: "Ostatnia płatność",
              value: lastPayment
                ? new Date(lastPayment.createdAt).toLocaleDateString("pl-PL")
                : "—",
              icon: <Clock className="w-4 h-4" />,
              color: "text-green-400",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="p-3 rounded-xl bg-[#0A0F1C]/60 border border-[#A68E4E]/15 flex flex-col gap-1"
            >
              <div className={`flex items-center gap-1.5 ${card.color} text-xs`}>
                {card.icon}
                <span className="truncate">{card.label}</span>
              </div>
              <p className="text-white font-semibold text-sm truncate">
                {card.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── History ── */}
      <div className="rounded-2xl border border-[#A68E4E]/20 bg-[#0A0F1C]/40 backdrop-blur-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#A68E4E]/10">
          <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
            <CreditCard className="w-4 h-4 text-[#A68E4E]" />
            Historia płatności
          </h3>
          <button
            onClick={() => refresh()}
            className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-14 rounded-xl bg-[#A68E4E]/5 animate-pulse"
                style={{ opacity: 1 - i * 0.2 }}
              />
            ))}
          </div>
        )}

        {error && (
          <div className="p-5 flex items-center gap-2 text-red-400 text-sm">
            <XCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {!loading && !error && payments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 text-white/25">
            <CreditCard className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm">Brak płatności</p>
          </div>
        )}

        {!loading && !error && payments.length > 0 && (
          <ul className="divide-y divide-[#A68E4E]/8 max-h-[400px] overflow-y-auto">
            {payments.map((p, i) => {
              const sc = STATUS_CONFIG[p.status] ?? {
                label: p.status,
                color: "text-white/40",
                bg: "bg-white/5 border border-white/10",
                icon: null,
              };
              const tc = TYPE_LABELS[p.type] ?? { label: p.type, icon: <Receipt className="w-3.5 h-3.5" /> };

              return (
                <motion.li
                  key={p.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#A68E4E]/5 transition-colors"
                >
                  {/* Type icon dot */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#A68E4E]/10 flex items-center justify-center text-[#A68E4E]">
                    {tc.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {p.auctionTitle ?? tc.label}
                    </p>
                    <p className="text-white/40 text-xs mt-0.5">
                      {tc.label} · {new Date(p.createdAt).toLocaleDateString("pl-PL")}
                    </p>
                  </div>

                  {/* Status + amount */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-white font-semibold text-sm">
                      {formatPln(p.amount)}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${sc.color} ${sc.bg}`}
                    >
                      {sc.icon}
                      {sc.label}
                    </span>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>

      {commissionAuctionId && (
        <PaymentModal
          open
          onClose={() => {
            setCommissionAuctionId(null);
            refresh();
          }}
          auctionId={commissionAuctionId}
          type="COMMISSION"
        />
      )}
    </div>
  );
}
