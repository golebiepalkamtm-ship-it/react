import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

// payments.ts creates its Stripe client at import time, so the key and the
// module mock have to exist before anything is imported.
const stripeMocks = vi.hoisted(() => {
  process.env.STRIPE_SECRET_KEY = 'sk_test_dummy';
  return {
    sessionsCreate: vi.fn(),
    accountsRetrieve: vi.fn(),
  };
});

vi.mock('stripe', () => ({
  default: class StripeMock {
    checkout = {
      sessions: { create: stripeMocks.sessionsCreate, retrieve: vi.fn() },
    };
    accounts = { retrieve: stripeMocks.accountsRetrieve };
    customers = { create: vi.fn() };
    webhooks = { constructEvent: vi.fn() };
  },
}));

vi.mock('../../lib/db.js', () => ({
  prisma: {
    auction: { findUnique: vi.fn(), update: vi.fn() },
    payment: {
      create: vi.fn(),
      update: vi.fn(),
      findFirst: vi.fn(),
      updateMany: vi.fn(),
    },
    user: { findUnique: vi.fn() },
  },
  supabase: null,
}));

import { prisma } from '../../lib/db.js';
import app from '../../app.js';
import { validatedEnv } from '../../lib/env.js';

const AUCTION_ID = '3f2b8c1e-5d4a-4e6f-9a7b-1c2d3e4f5a6b';
const SELLER_ID = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';
const BUYER_ID = 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e';

const db = prisma as any;

const buyerToken = jwt.sign(
  { sub: BUYER_ID, role: 'USER_FULL_VERIFIED' },
  validatedEnv.JWT_SECRET,
  { expiresIn: '1h' },
);

const wonAuction = (sellerOverrides: Record<string, unknown> = {}) => ({
  id: AUCTION_ID,
  title: 'Champion 2024',
  status: 'ENDED_WAITING_PAYMENT',
  currentPrice: 1000,
  buyNowPrice: null,
  endTime: new Date(Date.now() - 3_600_000),
  sellerId: SELLER_ID,
  winnerId: BUYER_ID,
  payments: [],
  seller: {
    id: SELLER_ID,
    role: 'USER_FULL_VERIFIED',
    payoutMethod: 'IBAN',
    payoutIban: 'PL61109010140000071219812874',
    payoutPhone: null,
    phone: null,
    stripeConnectId: null,
    ...sellerOverrides,
  },
});

const checkout = () =>
  request(app)
    .post('/api/payments/stripe/checkout')
    .set('Authorization', `Bearer ${buyerToken}`)
    .send({ auctionId: AUCTION_ID });

describe('POST /api/payments/stripe/checkout — who pays the commission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.payment.findFirst.mockResolvedValue(null);
    db.payment.create.mockResolvedValue({ id: 'payment-1' });
    db.payment.update.mockResolvedValue({});
    stripeMocks.sessionsCreate.mockResolvedValue({
      id: 'cs_test_1',
      url: 'https://checkout.stripe.test/cs_test_1',
    });
  });

  it('charges the buyer exactly the sale price', async () => {
    db.auction.findUnique.mockResolvedValue(wonAuction());

    const res = await checkout();

    expect(res.status).toBe(200);
    expect(db.payment.create.mock.calls[0][0].data.amount).toBe(1000);

    const session = stripeMocks.sessionsCreate.mock.calls[0][0];
    expect(session.line_items).toHaveLength(1);
    expect(session.line_items[0].price_data.unit_amount).toBe(100_000);
  });

  it('records the commission as coming out of the seller\'s payout', async () => {
    db.auction.findUnique.mockResolvedValue(wonAuction());

    await checkout();

    const session = stripeMocks.sessionsCreate.mock.calls[0][0];
    expect(session.metadata).toMatchObject({
      baseAmount: '1000',
      commissionAmount: '100',
      sellerPayout: '900',
    });
    expect(session.payment_intent_data.metadata).toMatchObject({
      commissionAmount: '100',
      sellerPayout: '900',
    });
    // Without a connected Stripe account the platform collects everything and pays out by hand
    expect(session.payment_intent_data.application_fee_amount).toBeUndefined();
    expect(session.payment_intent_data.transfer_data).toBeUndefined();
  });

  it('lets Stripe keep the commission when the seller has a connected account', async () => {
    db.auction.findUnique.mockResolvedValue(
      wonAuction({ stripeConnectId: 'acct_123' }),
    );
    stripeMocks.accountsRetrieve.mockResolvedValue({ charges_enabled: true });

    await checkout();

    const session = stripeMocks.sessionsCreate.mock.calls[0][0];
    expect(session.line_items[0].price_data.unit_amount).toBe(100_000);
    expect(session.payment_intent_data.application_fee_amount).toBe(10_000);
    expect(session.payment_intent_data.transfer_data).toEqual({
      destination: 'acct_123',
    });
  });

  it('does not take the commission twice from a seller who already paid it separately', async () => {
    db.auction.findUnique.mockResolvedValue(
      wonAuction({ stripeConnectId: 'acct_123' }),
    );
    stripeMocks.accountsRetrieve.mockResolvedValue({ charges_enabled: true });
    db.payment.findFirst.mockResolvedValue({ id: 'old-commission' });

    await checkout();

    const session = stripeMocks.sessionsCreate.mock.calls[0][0];
    expect(session.metadata).toMatchObject({
      commissionAmount: '0',
      sellerPayout: '1000',
    });
    expect(session.payment_intent_data.application_fee_amount).toBeUndefined();
  });
});

describe('POST /api/payments/stripe/commission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('no longer opens a separate commission payment', async () => {
    const res = await request(app)
      .post('/api/payments/stripe/commission')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ auctionId: AUCTION_ID });

    expect(res.status).toBe(410);
    expect(res.body.code).toBe('COMMISSION_DEDUCTED_FROM_PAYOUT');
    expect(stripeMocks.sessionsCreate).not.toHaveBeenCalled();
  });
});
