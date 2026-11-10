import { describe, it, expect } from 'vitest';
import {
  isReserveMet,
  sellerDeleteBlockReason,
  shiftEndTimeToActivation,
  splitSaleAmount,
} from '../utils/auctionRules.js';
import { isAccountSuspended } from '../utils/accountStatus.js';

describe('isReserveMet', () => {
  it('treats an auction without a reserve price as met', () => {
    expect(isReserveMet(null, 100)).toBe(true);
    expect(isReserveMet(undefined, null)).toBe(true);
    expect(isReserveMet(0, 50)).toBe(true);
  });

  it('requires the highest bid to reach the reserve', () => {
    expect(isReserveMet(500, 499.99)).toBe(false);
    expect(isReserveMet(500, 500)).toBe(true);
    expect(isReserveMet(500, 750)).toBe(true);
  });

  it('is not met when there is a reserve but no bid', () => {
    expect(isReserveMet(500, null)).toBe(false);
    expect(isReserveMet(500, undefined)).toBe(false);
  });

  it('accepts Decimal-like values and numeric strings', () => {
    const decimal = (value: string) => ({ toString: () => value });
    expect(isReserveMet(decimal('500.00'), decimal('500.00'))).toBe(true);
    expect(isReserveMet('500', '120')).toBe(false);
  });
});

describe('sellerDeleteBlockReason', () => {
  it('allows removing an auction nobody has bid on', () => {
    expect(sellerDeleteBlockReason({ status: 'ACTIVE', winnerId: null, bidsCount: 0 })).toBeNull();
    expect(sellerDeleteBlockReason({ status: 'WAITING_FOR_FEE', winnerId: null, bidsCount: 0 })).toBeNull();
    expect(sellerDeleteBlockReason({ status: 'ENDED', winnerId: null, bidsCount: 0 })).toBeNull();
  });

  it('blocks removal once there are bids', () => {
    expect(sellerDeleteBlockReason({ status: 'ACTIVE', winnerId: null, bidsCount: 1 })).toMatch(/oferty/);
  });

  it('blocks removal of a sold auction, whatever its bid count', () => {
    expect(sellerDeleteBlockReason({ status: 'ENDED', winnerId: 'buyer-1', bidsCount: 0 })).toMatch(/sprzedażą/);
    expect(sellerDeleteBlockReason({ status: 'ENDED_WAITING_PAYMENT', winnerId: null, bidsCount: 3 })).toMatch(/sprzedażą/);
    expect(sellerDeleteBlockReason({ status: 'completed', winnerId: null, bidsCount: 0 })).toMatch(/sprzedażą/);
  });
});

describe('splitSaleAmount', () => {
  it('takes the commission out of the sale price, so the two parts add up to it', () => {
    expect(splitSaleAmount(1000, 0.1)).toEqual({ commission: 100, sellerPayout: 900 });

    const odd = splitSaleAmount(1234.56, 0.1);
    expect(odd).toEqual({ commission: 123.46, sellerPayout: 1111.1 });
    expect(odd.commission + odd.sellerPayout).toBeCloseTo(1234.56, 2);
  });

  it('pays the seller everything when there is no commission', () => {
    expect(splitSaleAmount(500, 0)).toEqual({ commission: 0, sellerPayout: 500 });
    expect(splitSaleAmount(500, -0.2)).toEqual({ commission: 0, sellerPayout: 500 });
    expect(splitSaleAmount(500, Number.NaN)).toEqual({ commission: 0, sellerPayout: 500 });
  });

  it('never takes more than the sale price', () => {
    expect(splitSaleAmount(500, 3)).toEqual({ commission: 500, sellerPayout: 0 });
  });
});

describe('shiftEndTimeToActivation', () => {
  it('keeps the chosen duration, counted from activation', () => {
    const createdAt = new Date('2026-11-01T10:00:00Z');
    const endTime = new Date('2026-11-08T10:00:00Z'); // 7 days
    const paidAt = new Date('2026-11-03T15:30:00Z');

    expect(shiftEndTimeToActivation(createdAt, endTime, paidAt)).toEqual(
      new Date('2026-11-10T15:30:00Z'),
    );
  });

  it('gives a late payer a full auction instead of an already finished one', () => {
    const createdAt = new Date('2026-11-01T10:00:00Z');
    const endTime = new Date('2026-11-02T10:00:00Z'); // 1 day, long past
    const paidAt = new Date('2026-11-09T10:00:00Z');

    const shifted = shiftEndTimeToActivation(createdAt, endTime, paidAt);
    expect(shifted!.getTime()).toBeGreaterThan(paidAt.getTime());
  });

  it('leaves the end time alone when it cannot work out a duration', () => {
    const endTime = new Date('2026-11-08T10:00:00Z');
    expect(shiftEndTimeToActivation(null, endTime)).toBe(endTime);
    expect(shiftEndTimeToActivation(new Date('2026-11-09T10:00:00Z'), endTime)).toBe(endTime);
    expect(shiftEndTimeToActivation(new Date(), null)).toBeNull();
  });
});

describe('isAccountSuspended', () => {
  const now = new Date('2026-11-10T12:00:00Z').getTime();

  it('is false for a normal account', () => {
    expect(isAccountSuspended({ isBanned: false, isBlocked: false }, now)).toBe(false);
    expect(isAccountSuspended(null, now)).toBe(false);
  });

  it('is true for a ban or block without an expiry date', () => {
    expect(isAccountSuspended({ isBanned: true }, now)).toBe(true);
    expect(isAccountSuspended({ isBlocked: true, blockedUntil: null }, now)).toBe(true);
  });

  it('respects the expiry date', () => {
    expect(isAccountSuspended({ isBlocked: true, blockedUntil: '2026-11-11T00:00:00Z' }, now)).toBe(true);
    expect(isAccountSuspended({ isBlocked: true, blockedUntil: '2026-11-09T00:00:00Z' }, now)).toBe(false);
    expect(isAccountSuspended({ isBanned: true, bannedUntil: new Date('2026-11-09T00:00:00Z') }, now)).toBe(false);
  });

  it('ignores an expiry date when the flag itself is off', () => {
    expect(isAccountSuspended({ isBanned: false, bannedUntil: '2027-01-01T00:00:00Z' }, now)).toBe(false);
  });
});
