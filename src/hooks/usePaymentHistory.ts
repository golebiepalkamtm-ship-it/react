import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { paymentService, type PaymentHistoryItem } from "@/services/paymentService";

export function usePaymentHistory() {
  const { session } = useAuth();
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!session?.access_token) {
      setPayments([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await paymentService.getPaymentHistory(session.access_token);
      setPayments(data.payments);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się pobrać płatności");
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const pendingCommissions = payments.filter(
    (p) => p.type === "COMMISSION" && p.status === "INITIATED",
  );

  return { payments, pendingCommissions, loading, error, refresh };
}
