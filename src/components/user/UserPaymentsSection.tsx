import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePaymentHistory } from "@/hooks/usePaymentHistory";
import { useAuth } from "@/contexts/AuthContext";
import PaymentModal from "@/components/PaymentModal";

export function UserPaymentsSection() {
  const { session } = useAuth();
  const { payments, pendingCommissions, loading, error, refresh } =
    usePaymentHistory();
  const [commissionAuctionId, setCommissionAuctionId] = useState<string | null>(
    null,
  );

  const formatPln = (amount: number) =>
    `${amount.toLocaleString("pl-PL", { minimumFractionDigits: 2 })} PLN`;

  return (
    <div className="space-y-6">
      {pendingCommissions.length > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
          <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            Oczekujące prowizje
          </h3>
          <ul className="space-y-2">
            {pendingCommissions.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-2 text-sm text-white/90"
              >
                <span>
                  {p.auctionTitle ?? "Aukcja"} — {formatPln(p.amount)}
                </span>
                <Button
                  size="sm"
                  className="bg-gold text-navy"
                  onClick={() => setCommissionAuctionId(p.auctionId)}
                >
                  Opłać
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-2xl border border-[#A68E4E]/20 p-6 backdrop-blur-xl">
        <h3 className="font-display text-xl font-semibold text-white mb-4 flex items-center gap-3">
          <CreditCard className="w-6 h-6 text-gold" />
          Historia płatności
        </h3>

        {loading && (
          <div className="flex items-center gap-2 text-white/60">
            <Loader2 className="w-4 h-4 animate-spin" /> Ładowanie...
          </div>
        )}
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {!loading && !error && payments.length === 0 && (
          <p className="text-white/60 text-sm">Brak płatności.</p>
        )}
        <ul className="space-y-2 max-h-[320px] overflow-y-auto">
          {payments.map((p) => (
            <li
              key={p.id}
              className="flex justify-between gap-4 text-sm border-b border-white/10 py-2"
            >
              <div>
                <p className="text-white font-medium">
                  {p.auctionTitle ?? p.type}
                </p>
                <p className="text-white/50 text-xs">
                  {p.type} · {p.status} ·{" "}
                  {new Date(p.createdAt).toLocaleDateString("pl-PL")}
                </p>
              </div>
              <span className="text-gold font-semibold whitespace-nowrap">
                {formatPln(p.amount)}
              </span>
            </li>
          ))}
        </ul>
        <Button
          variant="outline"
          size="sm"
          className="mt-4 border-gold/30"
          onClick={() => refresh()}
        >
          Odśwież
        </Button>
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
