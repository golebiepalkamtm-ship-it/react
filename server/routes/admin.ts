import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Helper to get supabase service headers
function getServiceHeaders() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return {
    supabaseUrl,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  };
}

// Middleware: ensure authenticated user is admin (reads role from users table via PostgREST)
async function ensureAdmin(req: any, res: any, next: any) {
  try {
    const info = getServiceHeaders();
    if (!info) return res.status(501).json({ error: 'Admin API requires SUPABASE_SERVICE_ROLE_KEY to be set on the server' });

    const user = req.user;
    if (!user || !user.id) return res.status(401).json({ error: 'Unauthenticated' });

    const url = `${info.supabaseUrl}/rest/v1/users?id=eq.${user.id}&select=role`;
    const r = await fetch(url, { headers: info.headers });
    if (!r.ok) return res.status(403).json({ error: 'Unable to verify admin role' });
    const body = await r.json();
    const role = body?.[0]?.role;
    if (role !== 'ADMIN') return res.status(403).json({ error: 'Admin access required' });
    next();
  } catch (err) {
    console.error('ensureAdmin error', err);
    res.status(500).json({ error: 'Server error' });
  }
}

// Admin status
router.get('/status', ensureAdmin, (req, res) => {
  res.status(200).json({ message: 'Admin API online' });
});

// List users (proxied to Supabase PostgREST)
router.get('/users', ensureAdmin, async (req, res) => {
  try {
    const info = getServiceHeaders();
    if (!info) return res.status(501).json({ error: 'Service key not configured' });

    const page = parseInt((req.query.page as string) || '1', 10);
    const perPage = parseInt((req.query.per_page as string) || (req.query.perPage as string) || '100', 10);
    const offset = (page - 1) * perPage;

    const url = `${info.supabaseUrl}/rest/v1/users?select=*&order=createdAt.desc&limit=${perPage}&offset=${offset}`;
    const r = await fetch(url, { headers: { ...info.headers, Prefer: 'return=representation' } });
    if (!r.ok) return res.status(r.status).json({ error: 'Failed to fetch users' });
    const users = await r.json();
    res.json({ users, page, perPage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user (role or profile fields)
router.put('/users/:id', ensureAdmin, async (req, res) => {
  try {
    const info = getServiceHeaders();
    if (!info) return res.status(501).json({ error: 'Service key not configured' });
    const id = req.params.id;
    const body = req.body;
    const url = `${info.supabaseUrl}/rest/v1/users?id=eq.${id}`;
    const r = await fetch(url, {
      method: 'PATCH',
      headers: { ...info.headers, 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify(body),
    });
    if (!r.ok) return res.status(r.status).json({ error: 'Failed to update user' });
    const updated = await r.json();
    res.json({ user: updated?.[0] ?? null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user (auth record + profile)
router.delete('/users/:id', ensureAdmin, async (req, res) => {
  try {
    const info = getServiceHeaders();
    if (!info) return res.status(501).json({ error: 'Service key not configured' });
    const id = req.params.id;

    // delete auth user
    const authUrl = `${info.supabaseUrl}/auth/v1/admin/users/${id}`;
    const authRes = await fetch(authUrl, { method: 'DELETE', headers: info.headers });

    // delete profile row if exists
    const url = `${info.supabaseUrl}/rest/v1/users?id=eq.${id}`;
    const r = await fetch(url, { method: 'DELETE', headers: { ...info.headers, Prefer: 'return=representation' } });

    if (!authRes.ok) {
      console.warn('Auth delete failed', authRes.status);
    }

    if (!r.ok) return res.status(r.status).json({ error: 'Failed to delete user profile' });
    const deleted = await r.json();
    res.json({ deleted: deleted?.[0] ?? null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Simple stats: auctions count (from local data) and users count (via Supabase if configured)
router.get('/stats', ensureAdmin, async (req, res) => {
  try {
    const auctionsDataPath = path.join(__dirname, '..', 'data', 'auctions.json');
    let auctionsCount = null;
    try {
      const raw = await fs.promises.readFile(auctionsDataPath, 'utf8');
      const parsed = JSON.parse(raw);
      auctionsCount = Array.isArray(parsed.auctions) ? parsed.auctions.length : null;
    } catch (e) {
      auctionsCount = null;
    }

    const info = getServiceHeaders();
    let usersCount = null;
    if (info) {
      const url = `${info.supabaseUrl}/rest/v1/users?select=id`;
      const r = await fetch(url, { headers: info.headers });
      if (r.ok) {
        const users = await r.json();
        usersCount = Array.isArray(users) ? users.length : null;
      }
    }

    res.json({ auctionsCount, usersCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
