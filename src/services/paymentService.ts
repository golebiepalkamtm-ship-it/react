import { apiClient } from "./api";

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
  ): Promise<{ url: string; paymentId: string }> {
    if (!token) throw new Error("Wymagane logowanie");
    return apiClient.post<{ url: string; paymentId: string }>(
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
};

export default paymentService;
