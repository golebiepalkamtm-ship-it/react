/**
 * Pure auction business rules shared by the routes, the bidding service and the
 * closing cron. No I/O here, so the rules can be unit-tested directly.
 */

type Numeric = number | string | { toString(): string } | null | undefined;

const toFiniteNumber = (value: Numeric): number | null => {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * Whether the highest bid satisfies the seller's reserve price.
 * An auction without a reserve price is always considered met.
 */
export function isReserveMet(reservePrice: Numeric, highestBid: Numeric): boolean {
  const reserve = toFiniteNumber(reservePrice);
  if (reserve === null || reserve <= 0) return true;
  const bid = toFiniteNumber(highestBid);
  return bid !== null && bid >= reserve;
}

/**
 * Why a seller may not remove their own auction, or null when removal is allowed.
 * Once someone has bid or bought, the auction is a commitment to the buyer and
 * its bids and payments are records that must survive.
 */
export function sellerDeleteBlockReason(auction: {
  status?: string | null;
  winnerId?: string | null;
  bidsCount: number;
}): string | null {
  const status = String(auction.status ?? "").toUpperCase();
  if (
    auction.winnerId ||
    status === "ENDED_WAITING_PAYMENT" ||
    status === "COMPLETED"
  ) {
    return "Nie można usunąć aukcji, która zakończyła się sprzedażą.";
  }
  if (auction.bidsCount > 0) {
    return "Nie można usunąć aukcji, w której złożono już oferty. Skontaktuj się z administratorem.";
  }
  return null;
}

/**
 * Splits a sale price into the service commission and what the seller receives.
 * The buyer always pays exactly the sale price; the commission is the seller's
 * cost and comes out of the payout.
 */
export function splitSaleAmount(
  salePrice: number,
  commissionRate: number,
): { commission: number; sellerPayout: number } {
  const rate =
    Number.isFinite(commissionRate) && commissionRate > 0
      ? Math.min(commissionRate, 1)
      : 0;
  const commission = Math.round(salePrice * rate * 100) / 100;
  const sellerPayout = Math.round((salePrice - commission) * 100) / 100;
  return { commission, sellerPayout };
}

/**
 * End time for an auction that becomes active only now (listing fee just paid):
 * the duration the seller chose starts counting from activation, not from the
 * moment the draft was saved.
 */
export function shiftEndTimeToActivation(
  createdAt: Date | null | undefined,
  endTime: Date | null | undefined,
  now: Date = new Date(),
): Date | null {
  if (!endTime) return null;
  if (!createdAt) return endTime;
  const duration = endTime.getTime() - createdAt.getTime();
  if (!Number.isFinite(duration) || duration <= 0) return endTime;
  return new Date(now.getTime() + duration);
}
