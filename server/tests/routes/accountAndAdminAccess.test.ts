import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const authAdmin = vi.hoisted(() => ({ deleteUser: vi.fn() }));

vi.mock('../../lib/db.js', () => ({
  prisma: {
    auction: { count: vi.fn() },
    bid: { count: vi.fn() },
    user: { delete: vi.fn(), findUnique: vi.fn() },
    metric: { findMany: vi.fn() },
  },
  supabase: { auth: { admin: authAdmin } },
}));

import { prisma } from '../../lib/db.js';
import app from '../../app.js';
import { validatedEnv } from '../../lib/env.js';

const USER_ID = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';
const db = prisma as any;

const tokenFor = (claims: Record<string, unknown>) =>
  jwt.sign({ sub: USER_ID, ...claims }, validatedEnv.JWT_SECRET, {
    expiresIn: '1h',
  });

const deleteAccount = () =>
  request(app)
    .delete('/api/auth/account')
    .set('Authorization', `Bearer ${tokenFor({ role: 'USER_FULL_VERIFIED' })}`);

describe('DELETE /api/auth/account', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.auction.count.mockResolvedValue(0);
    db.bid.count.mockResolvedValue(0);
    db.user.delete.mockResolvedValue({});
    authAdmin.deleteUser.mockResolvedValue({ error: null });
  });

  it('removes the profile and the login account', async () => {
    const res = await deleteAccount();

    expect(res.status).toBe(200);
    expect(res.body.authAccountRemoved).toBe(true);
    expect(db.user.delete).toHaveBeenCalledWith({ where: { id: USER_ID } });
    expect(authAdmin.deleteUser).toHaveBeenCalledWith(USER_ID);
  });

  it('reports honestly when the login account could not be removed', async () => {
    authAdmin.deleteUser.mockResolvedValue({ error: { message: 'boom' } });

    const res = await deleteAccount();

    expect(res.status).toBe(200);
    expect(res.body.authAccountRemoved).toBe(false);
  });

  it('refuses while the user still has a bid in a running auction', async () => {
    db.bid.count.mockResolvedValue(1);

    const res = await deleteAccount();

    expect(res.status).toBe(400);
    expect(db.user.delete).not.toHaveBeenCalled();
    expect(authAdmin.deleteUser).not.toHaveBeenCalled();
  });

  it('refuses while a finished auction is waiting for payment', async () => {
    // first count: active auctions as seller, second: auctions awaiting payment
    db.auction.count.mockResolvedValueOnce(0).mockResolvedValueOnce(1);

    const res = await deleteAccount();

    expect(res.status).toBe(400);
    expect(db.user.delete).not.toHaveBeenCalled();
  });
});

describe('admin access', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is decided by the role in the database, not by the e-mail address', async () => {
    db.user.findUnique.mockResolvedValue({ role: 'USER_FULL_VERIFIED' });

    const res = await request(app)
      .get('/api/admin/metrics')
      .set(
        'Authorization',
        `Bearer ${tokenFor({ role: 'ADMIN', email: 'superadmin@palkamtm.pl' })}`,
      );

    expect(res.status).toBe(403);
  });

  it('lets a database ADMIN through', async () => {
    db.user.findUnique.mockResolvedValue({ role: 'ADMIN' });
    db.metric.findMany.mockResolvedValue([]);

    const res = await request(app)
      .get('/api/admin/metrics')
      .set('Authorization', `Bearer ${tokenFor({ role: 'ADMIN' })}`);

    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });
});
