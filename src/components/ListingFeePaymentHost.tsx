import { useEffect, useState } from "react";
import PaymentModal from "@/components/PaymentModal";

/** Listens for listing-fee-required events from useAuctionForm */
export function ListingFeePaymentHost() {
  const [auctionId, setAuctionId] = useState<string | null>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      const id = (event as CustomEvent<{ auctionId: string }>).detail?.auctionId;
      if (id) setAuctionId(id);
    };
    window.addEventListener("listing-fee-required", handler);
    return () => window.removeEventListener("listing-fee-required", handler);
  }, []);

  if (!auctionId) return null;

  return (
    <PaymentModal
      open
      onClose={() => setAuctionId(null)}
      auctionId={auctionId}
      type="LISTING_FEE"
    />
  );
}
