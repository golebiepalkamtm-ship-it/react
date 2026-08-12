import { apiClient } from "./api";

export interface PaymentHistoryItem {
  id: string;
  amount: number;
  type: string;
  status: string;
  provider: string | null;
  createdAt: string;
  auctionId: string;
  auctionTitle: string | null;
}

export interface PaymentSessionInfo {
  type: string;
  status: string;
  amount: number;
  auctionId: string;
  auctionTitle: string;
  sessionStatus: string | null;
}

export const paymentService = {
  async createStripeCheckout(
    auctionId: string,
    token: string | null,
    successUrl?: string,
    cancelUrl?: string,
  ): Promise<{ url: string; paymentId: string }> {
    if (!token) throw new Error("Wymagane logowanie");
    return apiClient.post<{ url: string; paymentId: string }>(
      "/payments/stripe/checkout",
      { auctionId, successUrl, cancelUrl },
      token,
    );
  },

  async createListingFeeCheckout(
    auctionId: string,
    token: string | null,
    successUrl?: string,
    cancelUrl?: string,
  ): Promise<{ url: string; paymentId: string } | { free: true }> {
    if (!token) throw new Error("Wymagane logowanie");
    return apiClient.post<{ url: string; paymentId: string } | { free: true }>(
      "/payments/stripe/listing-fee",
      { auctionId, successUrl, cancelUrl },
      token,
    );
  },

  async createCommissionCheckout(
    auctionId: string,
    token: string | null,
    successUrl?: string,
    cancelUrl?: string,
  ): Promise<{ url: string; paymentId: string }> {
    if (!token) throw new Error("Wymagane logowanie");
    return apiClient.post<{ url: string; paymentId: string }>(
      "/payments/stripe/commission",
      { auctionId, successUrl, cancelUrl },
      token,
    );
  },

  async getPaymentHistory(
    token: string | null,
    page = 1,
    limit = 20,
  ): Promise<{ payments: PaymentHistoryItem[]; total: number; page: number; pages: number }> {
    if (!token) throw new Error("Wymagane logowanie");
    return apiClient.getWithToken(
      "/payments/history",
      { page: String(page), limit: String(limit) },
      token,
    );
  },

  async getSessionInfo(
    sessionId: string,
    token: string | null,
  ): Promise<PaymentSessionInfo> {
    if (!token) throw new Error("Wymagane logowanie");
    return apiClient.getWithToken<PaymentSessionInfo>(
      `/payments/session/${sessionId}`,
      undefined,
      token,
    );
  },

  async createSetupSession(token: string | null): Promise<{ url: string }> {
    if (!token) throw new Error("Wymagane logowanie");
    return apiClient.post<{ url: string }>("/payments/stripe/setup-session", {}, token);
  },
};

export default paymentService;
