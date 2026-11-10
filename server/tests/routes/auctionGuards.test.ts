import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

vi.mock('../../lib/db.js', () => ({
  prisma: {
    auction: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
  supabase: null,
}));

import { prisma } from '../../lib/db.js';
import app from '../../app.js';
import { validatedEnv } from '../../lib/env.js';
import { toPublicBid } from '../../services/AuctionService.js';

const AUCTION_ID = '3f2b8c1e-5d4a-4e6f-9a7b-1c2d3e4f5a6b';
const SELLER_ID = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';
const OTHER_ID = 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e';

const tokenFor = (userId: string, role = 'USER_FULL_VERIFIED') =>
  jwt.sign({ sub: userId, role }, validatedEnv.JWT_SECRET, { expiresIn: '1h' });

const auctionRow = (overrides: Record<string, unknown> = {}) => ({
  id: AUCTION_ID,
  title: 'Champion 2024',
  description: 'Opis',
  startingPrice: 100,
  currentPrice: 100,
  buyNowPrice: null,
  reservePrice: 500,
  endTime: new Date(Date.now() + 86_400_000),
  status: 'ACTIVE',
  reserveMet: false,
  category: 'PIGEONS',
  location: 'Lubań',
  sellerId: SELLER_ID,
  winnerId: null,
  seller: { id: SELLER_ID, username: 'hodowca' },
  images: [],
  videos: [],
  documents: [],
  bids: [],
  payments: [],
  _count: { bids: 0, watchlist: 0 },
  ...overrides,
});

const db = prisma as any;

describe('DELETE /api/auctions/:id (seller)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('refuses to delete an auction that has bids', async () => {
    db.auction.findUnique.mockResolvedValue(auctionRow({ _count: { bids: 2 } }));

    const res = await request(app)
      .delete(`/api/auctions/${AUCTION_ID}`)
      .set('Authorization', `Bearer ${tokenFor(SELLER_ID)}`);

    expect(res.status).toBe(409);
    expect(res.body.code).toBe('AUCTION_NOT_DELETABLE');
    expect(db.auction.delete).not.toHaveBeenCalled();
    expect(db.auction.update).not.toHaveBeenCalled();
  });

  it('refuses to delete a sold auction', async () => {
    db.auction.findUnique.mockResolvedValue(
      auctionRow({ status: 'ENDED_WAITING_PAYMENT', winnerId: OTHER_ID }),
    );

    const res = await request(app)
      .delete(`/api/auctions/${AUCTION_ID}`)
      .set('Authorization', `Bearer ${tokenFor(SELLER_ID)}`);

    expect(res.status).toBe(409);
    expect(db.auction.delete).not.toHaveBeenCalled();
  });

  it('deletes an auction nobody has bid on', async () => {
    db.auction.findUnique.mockResolvedValue(auctionRow());
    db.auction.delete.mockResolvedValue({});

    const res = await request(app)
      .delete(`/api/auctions/${AUCTION_ID}`)
      .set('Authorization', `Bearer ${tokenFor(SELLER_ID)}`);

    expect(res.status).toBe(200);
    expect(db.auction.delete).toHaveBeenCalledWith({ where: { id: AUCTION_ID } });
  });

  it('cancels instead of deleting when a fee was paid, so the payment record survives', async () => {
    db.auction.findUnique.mockResolvedValue(
      auctionRow({ payments: [{ id: 'payment-1' }] }),
    );
    db.auction.update.mockResolvedValue({});

    const res = await request(app)
      .delete(`/api/auctions/${AUCTION_ID}`)
      .set('Authorization', `Bearer ${tokenFor(SELLER_ID)}`);

    expect(res.status).toBe(200);
    expect(db.auction.delete).not.toHaveBeenCalled();
    expect(db.auction.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: AUCTION_ID },
        data: expect.objectContaining({ status: 'CANCELLED' }),
      }),
    );
  });

  it('rejects someone who is not the seller', async () => {
    db.auction.findUnique.mockResolvedValue(auctionRow());

    const res = await request(app)
      .delete(`/api/auctions/${AUCTION_ID}`)
      .set('Authorization', `Bearer ${tokenFor(OTHER_ID)}`);

    expect(res.status).toBe(403);
    expect(db.auction.delete).not.toHaveBeenCalled();
  });
});

describe('GET /api/auctions/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('hides the reserve price from anonymous visitors', async () => {
    db.auction.findUnique.mockResolvedValue(auctionRow());

    const res = await request(app).get(`/api/auctions/${AUCTION_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.reservePrice).toBeUndefined();
  });

  it('shows the reserve price to the signed-in seller', async () => {
    db.auction.findUnique.mockResolvedValue(auctionRow());

    const res = await request(app)
      .get(`/api/auctions/${AUCTION_ID}`)
      .set('Authorization', `Bearer ${tokenFor(SELLER_ID)}`);

    expect(res.status).toBe(200);
    expect(res.body.reservePrice).toBe(500);
  });

  it('treats an unusable token as an anonymous visit instead of failing', async () => {
    db.auction.findUnique.mockResolvedValue(auctionRow());

    const res = await request(app)
      .get(`/api/auctions/${AUCTION_ID}`)
      .set('Authorization', 'Bearer not-a-token');

    expect(res.status).toBe(200);
    expect(res.body.reservePrice).toBeUndefined();
  });

  it('does not show an auction awaiting its listing fee to other people', async () => {
    db.auction.findUnique.mockResolvedValue(auctionRow({ status: 'WAITING_FOR_FEE' }));

    const anonymous = await request(app).get(`/api/auctions/${AUCTION_ID}`);
    expect(anonymous.status).toBe(404);

    const stranger = await request(app)
      .get(`/api/auctions/${AUCTION_ID}`)
      .set('Authorization', `Bearer ${tokenFor(OTHER_ID)}`);
    expect(stranger.status).toBe(404);
  });

  it('shows an auction awaiting its listing fee to its seller', async () => {
    db.auction.findUnique.mockResolvedValue(auctionRow({ status: 'WAITING_FOR_FEE' }));

    const res = await request(app)
      .get(`/api/auctions/${AUCTION_ID}`)
      .set('Authorization', `Bearer ${tokenFor(SELLER_ID)}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('waiting_for_fee');
  });
});

describe('POST /api/auctions', () => {
  const body = {
    title: 'Champion 2024',
    description: 'Opis',
    startingPrice: 100,
    endTime: new Date(Date.now() + 7 * 86_400_000).toISOString(),
    category: 'PIGEONS',
    location: 'Lubań',
    images: [],
    videos: [],
    pigeon: { ringNumber: 'PL-0123-24-1234' },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    db.user.findUnique.mockResolvedValue({
      role: 'USER_FULL_VERIFIED',
      payoutMethod: 'IBAN',
      payoutIban: 'PL61109010140000071219812874',
      payoutPhone: null,
      phone: null,
      stripeCustomerId: 'cus_test',
    });
    db.auction.create.mockImplementation(async ({ data }: any) =>
      auctionRow({ status: data.status }),
    );
  });

  it('requires a signed-in user', async () => {
    const res = await request(app).post('/api/auctions').send(body);

    expect(res.status).toBe(401);
    expect(db.auction.create).not.toHaveBeenCalled();
  });

  it('saves a seller\'s auction as waiting for the listing fee', async () => {
    const res = await request(app)
      .post('/api/auctions')
      .set('Authorization', `Bearer ${tokenFor(SELLER_ID)}`)
      .send(body);

    expect(res.status).toBe(201);
    expect(res.body.listingFeeRequired).toBe(true);
    expect(db.auction.create.mock.calls[0][0].data.status).toBe('WAITING_FOR_FEE');
    expect(db.auction.create.mock.calls[0][0].data.listingFeePaid).toBe(false);
  });

  it('publishes an admin\'s auction straight away', async () => {
    const res = await request(app)
      .post('/api/auctions')
      .set('Authorization', `Bearer ${tokenFor(SELLER_ID, 'ADMIN')}`)
      .send(body);

    expect(res.status).toBe(201);
    expect(res.body.listingFeeRequired).toBe(false);
    expect(db.auction.create.mock.calls[0][0].data.status).toBe('ACTIVE');
  });
});

describe('toPublicBid (what a bid event broadcasts)', () => {
  it('never carries the proxy ceiling or the bidder\'s contact details', () => {
    const published = toPublicBid({
      id: 'bid-1',
      auctionId: AUCTION_ID,
      amount: { toString: () => '150.00' },
      createdAt: new Date('2026-11-10T12:00:00Z'),
      isProxy: true,
      maxBid: { toString: () => '5000.00' },
      bidderId: OTHER_ID,
      bidder: {
        id: OTHER_ID,
        username: 'licytujacy',
        email: 'private@example.com',
        phone: '+48123456789',
        first_name: 'Jan',
        last_name: 'Kowalski',
      },
    } as any);

    const wire = JSON.parse(JSON.stringify(published));

    expect(wire.amount).toBe(150);
    expect(wire.isProxy).toBe(true);
    expect(wire.bidder).toMatchObject({ id: OTHER_ID, username: 'licytujacy' });
    expect(JSON.stringify(wire)).not.toContain('5000');
    expect(JSON.stringify(wire)).not.toContain('private@example.com');
    expect(JSON.stringify(wire)).not.toContain('123456789');
    expect(JSON.stringify(wire)).not.toContain('Kowalski');
    expect(wire).not.toHaveProperty('maxBid');
  });

  it('falls back to a neutral name instead of the e-mail prefix', () => {
    const published = toPublicBid({
      id: 'bid-2',
      auctionId: AUCTION_ID,
      amount: 200,
      createdAt: new Date(),
      bidder: { id: OTHER_ID, username: '', email: 'jan.kowalski@example.com' },
    });

    expect(published.bidder?.username).toBe('użytkownik');
  });
});
