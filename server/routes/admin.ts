import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const ADMIN_ROLE_CACHE_TTL_MS = 60_000;
const adminRoleCache = new Map<string, { role: string | null; expiresAt: number }>();

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

    const cached = adminRoleCache.get(user.id);
    if (cached && cached.expiresAt > Date.now()) {
      if (cached.role !== 'ADMIN') return res.status(403).json({ error: 'Admin access required' });
      return next();
    }

    const url = `${info.supabaseUrl}/rest/v1/users?id=eq.${user.id}&select=role`;
    const r = await fetch(url, { headers: info.headers });
    if (!r.ok) return res.status(403).json({ error: 'Unable to verify admin role' });
    const body = await r.json();
    const role = body?.[0]?.role;
    adminRoleCache.set(user.id, { role: typeof role === 'string' ? role : null, expiresAt: Date.now() + ADMIN_ROLE_CACHE_TTL_MS });
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

    const url = `${info.supabaseUrl}/rest/v1/users?select=*&order=created_at.desc&limit=${perPage}&offset=${offset}`;
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

// Admin: reset a user's password (Supabase admin)
router.post('/users/:id/reset-password', ensureAdmin, async (req, res) => {
  try {
    const info = getServiceHeaders();
    if (!info) return res.status(501).json({ error: 'Service key not configured' });
    const id = req.params.id;
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password is required' });

    const authUrl = `${info.supabaseUrl}/auth/v1/admin/users/${id}`;
    const r = await fetch(authUrl, {
      method: 'PUT',
      headers: { ...info.headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (!r.ok) {
      const txt = await r.text();
      console.error('Failed to reset password', r.status, txt);
      return res.status(r.status).json({ error: 'Failed to reset password' });
    }

    const updated = await r.json();
    res.json({ user: updated });
  } catch (err) {
    console.error('reset-password error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Simple stats: auctions count (from local data) and users count (via Supabase if configured)
router.get('/stats', ensureAdmin, async (req, res) => {
  try {
    const info = getServiceHeaders();
    if (!info) return res.status(501).json({ error: 'Service key not configured' });

    const now = new Date();
    const supabaseCount = async (url: string): Promise<number | null> => {
      const r = await fetch(url, { method: 'HEAD', headers: { ...info.headers, Prefer: 'count=exact' } }).catch(() => null);
      if (!r || !r.ok) return null;
      const contentRange = r.headers.get('content-range') || r.headers.get('Content-Range');
      if (!contentRange) return null;
      const total = contentRange.split('/')[1];
      const parsed = total ? Number(total) : NaN;
      return Number.isFinite(parsed) ? parsed : null;
    };

    const supabaseGetJson = async <T,>(url: string): Promise<T | null> => {
      const r = await fetch(url, { headers: { ...info.headers, 'Content-Type': 'application/json' } }).catch(() => null);
      if (!r || !r.ok) return null;
      const text = await r.text().catch(() => '');
      if (!text) return null;
      try {
        return JSON.parse(text) as T;
      } catch {
        return null;
      }
    };

    const usersTotal = await supabaseCount(`${info.supabaseUrl}/rest/v1/users?select=id`);
    const usersBlocked = await supabaseCount(`${info.supabaseUrl}/rest/v1/users?select=id&is_blocked=eq.true`);
    const usersBanned = await supabaseCount(`${info.supabaseUrl}/rest/v1/users?select=id&is_banned=eq.true`);
    const usersRegistered = await supabaseCount(`${info.supabaseUrl}/rest/v1/users?select=id&role=eq.USER_REGISTERED`);
    const usersEmailVerified = await supabaseCount(`${info.supabaseUrl}/rest/v1/users?select=id&role=eq.USER_EMAIL_VERIFIED`);
    const usersFullVerified = await supabaseCount(`${info.supabaseUrl}/rest/v1/users?select=id&role=eq.USER_FULL_VERIFIED`);
    const usersAdmins = await supabaseCount(`${info.supabaseUrl}/rest/v1/users?select=id&role=eq.ADMIN`);

    const computeAuctionsStatsFromLocalJson = async () => {
      const auctionsDataPath = path.join(__dirname, '..', 'data', 'auctions.json');
      const raw = await fs.promises.readFile(auctionsDataPath, 'utf8');
      const parsed = safeJsonParse<any>(raw, { auctions: [] });
      const auctions = Array.isArray(parsed?.auctions) ? parsed.auctions : [];

      const ended = [] as any[];
      const active = [] as any[];
      const cancelled = [] as any[];

      for (const a of auctions) {
        const endTime = a?.endTime ? new Date(String(a.endTime)) : null;
        const statusRaw = String(a?.status || '').toLowerCase();
        const derivedStatus =
          statusRaw === 'cancelled'
            ? 'cancelled'
            : statusRaw === 'ended'
              ? 'ended'
              : statusRaw === 'active'
                ? endTime && endTime.getTime() <= now.getTime()
                  ? 'ended'
                  : 'active'
                : endTime && endTime.getTime() <= now.getTime()
                  ? 'ended'
                  : 'active';

        if (derivedStatus === 'active') active.push(a);
        else if (derivedStatus === 'cancelled') cancelled.push(a);
        else ended.push(a);
      }

      const activeWithTimeLeft = active
        .map((a) => {
          const endMs = a?.endTime ? new Date(String(a.endTime)).getTime() : NaN;
          const createdMs = a?.createdAt ? new Date(String(a.createdAt)).getTime() : NaN;
          const secondsLeft = Number.isFinite(endMs) ? Math.max(0, Math.floor((endMs - now.getTime()) / 1000)) : null;
          const runningSeconds = Number.isFinite(createdMs) ? Math.max(0, Math.floor((now.getTime() - createdMs) / 1000)) : null;
          const plannedSeconds =
            Number.isFinite(endMs) && Number.isFinite(createdMs) ? Math.max(0, Math.floor((endMs - createdMs) / 1000)) : null;
          return {
            id: String(a?.id || ''),
            title: String(a?.title || ''),
            currentPrice: a?.currentPrice != null ? Number(a.currentPrice) : null,
            endTime: a?.endTime ? String(a.endTime) : null,
            secondsLeft,
            runningSeconds,
            plannedSeconds,
          };
        })
        .sort((x, y) => (x.secondsLeft ?? Number.MAX_SAFE_INTEGER) - (y.secondsLeft ?? Number.MAX_SAFE_INTEGER));

      const endedSales = ended
        .map((a) => {
          const endMs = a?.endTime ? new Date(String(a.endTime)).getTime() : NaN;
          const amount = a?.currentPrice != null ? Number(a.currentPrice) : null;
          const bidsCount = Array.isArray(a?.bids) ? a.bids.length : Number(a?._count?.bids ?? 0) || 0;
          const reserveMet = a?.reserveMet != null ? Boolean(a.reserveMet) : true;
          const sold = Boolean(bidsCount > 0 && reserveMet && amount != null && Number.isFinite(amount) && amount > 0);
          return {
            id: String(a?.id || ''),
            title: String(a?.title || ''),
            amount: amount != null && Number.isFinite(amount) ? amount : null,
            endTime: a?.endTime ? String(a.endTime) : null,
            endedAtMs: Number.isFinite(endMs) ? endMs : null,
            sold,
          };
        })
        .filter((x) => x.sold)
        .sort((a, b) => (b.endedAtMs ?? 0) - (a.endedAtMs ?? 0));

      const soldAmounts = endedSales.map((s) => s.amount!).filter((n) => Number.isFinite(n));
      const soldTotalAmount = soldAmounts.reduce((acc, v) => acc + v, 0);
      const soldAvgAmount = soldAmounts.length ? soldTotalAmount / soldAmounts.length : null;
      const soldMinAmount = soldAmounts.length ? Math.min(...soldAmounts) : null;
      const soldMaxAmount = soldAmounts.length ? Math.max(...soldAmounts) : null;

      const avgSecondsLeft =
        activeWithTimeLeft.length && activeWithTimeLeft.some((a) => a.secondsLeft != null)
          ? Math.round(
              activeWithTimeLeft
                .map((a) => a.secondsLeft)
                .filter((n): n is number => n != null)
                .reduce((acc, v) => acc + v, 0) / activeWithTimeLeft.filter((a) => a.secondsLeft != null).length
            )
          : null;

      const avgRunningSeconds =
        activeWithTimeLeft.length && activeWithTimeLeft.some((a) => a.runningSeconds != null)
          ? Math.round(
              activeWithTimeLeft
                .map((a) => a.runningSeconds)
                .filter((n): n is number => n != null)
                .reduce((acc, v) => acc + v, 0) / activeWithTimeLeft.filter((a) => a.runningSeconds != null).length
            )
          : null;

      const avgPlannedSeconds =
        activeWithTimeLeft.length && activeWithTimeLeft.some((a) => a.plannedSeconds != null)
          ? Math.round(
              activeWithTimeLeft
                .map((a) => a.plannedSeconds)
                .filter((n): n is number => n != null)
                .reduce((acc, v) => acc + v, 0) / activeWithTimeLeft.filter((a) => a.plannedSeconds != null).length
            )
          : null;

      return {
        source: 'local',
        total: auctions.length,
        active: active.length,
        ended: ended.length,
        cancelled: cancelled.length,
        activeTime: {
          averageSecondsLeft: avgSecondsLeft,
          averageRunningSeconds: avgRunningSeconds,
          averagePlannedSeconds: avgPlannedSeconds,
        },
        sales: {
          soldCount: soldAmounts.length,
          totalAmount: Number.isFinite(soldTotalAmount) ? soldTotalAmount : null,
          averageAmount: soldAvgAmount,
          minAmount: soldMinAmount,
          maxAmount: soldMaxAmount,
        },
        endingSoon: activeWithTimeLeft.slice(0, 10),
        recentSales: endedSales.slice(0, 10).map((s) => ({ id: s.id, title: s.title, amount: s.amount, endTime: s.endTime })),
      };
    };

    const computeAuctionsStatsFromSupabase = async () => {
      const total = await supabaseCount(`${info.supabaseUrl}/rest/v1/auctions?select=id`);
      if (total == null) return null;

      const openCount = await supabaseCount(`${info.supabaseUrl}/rest/v1/auctions?select=id&status=eq.open`);
      const closedCount = await supabaseCount(`${info.supabaseUrl}/rest/v1/auctions?select=id&status=eq.closed`);
      const cancelledCount = await supabaseCount(`${info.supabaseUrl}/rest/v1/auctions?select=id&status=eq.cancelled`);

      const openRows = await supabaseGetJson<any[]>(
        `${info.supabaseUrl}/rest/v1/auctions?select=id,title,current_price,ends_at,starts_at,created_at,reserve_met&status=eq.open&order=ends_at.asc&limit=30`
      );
      const endingSoon =
        Array.isArray(openRows) && openRows.length
          ? openRows.map((r) => {
              const endMs = r?.ends_at ? new Date(String(r.ends_at)).getTime() : NaN;
              const startMs = r?.starts_at ? new Date(String(r.starts_at)).getTime() : r?.created_at ? new Date(String(r.created_at)).getTime() : NaN;
              const secondsLeft = Number.isFinite(endMs) ? Math.max(0, Math.floor((endMs - now.getTime()) / 1000)) : null;
              const runningSeconds = Number.isFinite(startMs) ? Math.max(0, Math.floor((now.getTime() - startMs) / 1000)) : null;
              const plannedSeconds =
                Number.isFinite(endMs) && Number.isFinite(startMs) ? Math.max(0, Math.floor((endMs - startMs) / 1000)) : null;
              return {
                id: String(r?.id || ''),
                title: String(r?.title || ''),
                currentPrice: r?.current_price != null ? Number(r.current_price) : null,
                endTime: r?.ends_at ? String(r.ends_at) : null,
                secondsLeft,
                runningSeconds,
                plannedSeconds,
              };
            })
          : [];

      const avgSecondsLeft =
        endingSoon.length && endingSoon.some((a) => a.secondsLeft != null)
          ? Math.round(
              endingSoon
                .map((a) => a.secondsLeft)
                .filter((n): n is number => n != null)
                .reduce((acc, v) => acc + v, 0) / endingSoon.filter((a) => a.secondsLeft != null).length
            )
          : null;

      const avgRunningSeconds =
        endingSoon.length && endingSoon.some((a) => a.runningSeconds != null)
          ? Math.round(
              endingSoon
                .map((a) => a.runningSeconds)
                .filter((n): n is number => n != null)
                .reduce((acc, v) => acc + v, 0) / endingSoon.filter((a) => a.runningSeconds != null).length
            )
          : null;

      const avgPlannedSeconds =
        endingSoon.length && endingSoon.some((a) => a.plannedSeconds != null)
          ? Math.round(
              endingSoon
                .map((a) => a.plannedSeconds)
                .filter((n): n is number => n != null)
                .reduce((acc, v) => acc + v, 0) / endingSoon.filter((a) => a.plannedSeconds != null).length
            )
          : null;

      const closedRows = await supabaseGetJson<any[]>(
        `${info.supabaseUrl}/rest/v1/auctions?select=id,title,current_price,ends_at,reserve_met,status&status=eq.closed&order=ends_at.desc&limit=50`
      );

      const soldRows = Array.isArray(closedRows)
        ? closedRows
            .map((r) => {
              const amount = r?.current_price != null ? Number(r.current_price) : null;
              const reserveMet = r?.reserve_met != null ? Boolean(r.reserve_met) : true;
              const sold = Boolean(reserveMet && amount != null && Number.isFinite(amount) && amount > 0);
              return {
                id: String(r?.id || ''),
                title: String(r?.title || ''),
                amount: amount != null && Number.isFinite(amount) ? amount : null,
                endTime: r?.ends_at ? String(r.ends_at) : null,
                sold,
              };
            })
            .filter((x) => x.sold)
        : [];

      const soldAmounts = soldRows.map((s) => s.amount!).filter((n) => Number.isFinite(n));
      const soldTotalAmount = soldAmounts.reduce((acc, v) => acc + v, 0);
      const soldAvgAmount = soldAmounts.length ? soldTotalAmount / soldAmounts.length : null;
      const soldMinAmount = soldAmounts.length ? Math.min(...soldAmounts) : null;
      const soldMaxAmount = soldAmounts.length ? Math.max(...soldAmounts) : null;

      return {
        source: 'supabase',
        total,
        active: openCount,
        ended: closedCount,
        cancelled: cancelledCount,
        activeTime: {
          averageSecondsLeft: avgSecondsLeft,
          averageRunningSeconds: avgRunningSeconds,
          averagePlannedSeconds: avgPlannedSeconds,
        },
        sales: {
          soldCount: soldAmounts.length,
          totalAmount: Number.isFinite(soldTotalAmount) ? soldTotalAmount : null,
          averageAmount: soldAvgAmount,
          minAmount: soldMinAmount,
          maxAmount: soldMaxAmount,
        },
        endingSoon: endingSoon.slice(0, 10),
        recentSales: soldRows.slice(0, 10).map((s) => ({ id: s.id, title: s.title, amount: s.amount, endTime: s.endTime })),
      };
    };

    let auctionsStats: any = null;
    const fromSupabase = await computeAuctionsStatsFromSupabase().catch(() => null);
    if (fromSupabase) {
      auctionsStats = fromSupabase;
    } else {
      auctionsStats = await computeAuctionsStatsFromLocalJson().catch(() => ({
        source: 'local',
        total: null,
        active: null,
        ended: null,
        cancelled: null,
        activeTime: { averageSecondsLeft: null, averageRunningSeconds: null, averagePlannedSeconds: null },
        sales: { soldCount: null, totalAmount: null, averageAmount: null, minAmount: null, maxAmount: null },
        endingSoon: [],
        recentSales: [],
      }));
    }

    res.json({
      generatedAt: now.toISOString(),
      users: {
        total: usersTotal,
        blocked: usersBlocked,
        banned: usersBanned,
        byRole: {
          USER_REGISTERED: usersRegistered,
          USER_EMAIL_VERIFIED: usersEmailVerified,
          USER_FULL_VERIFIED: usersFullVerified,
          ADMIN: usersAdmins,
        },
      },
      auctions: auctionsStats,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: list auctions from local JSON
router.get('/auctions', ensureAdmin, async (req, res) => {
  try {
    const auctionsPath = path.join(__dirname, '..', 'data', 'auctions.json');
    const raw = await fs.promises.readFile(auctionsPath, 'utf8');
    const parsed = JSON.parse(raw);
    const auctions = Array.isArray(parsed.auctions) ? parsed.auctions : [];
    res.json({ auctions });
  } catch (err) {
    console.error('Failed to read auctions for admin', err);
    res.status(500).json({ error: 'Failed to read auctions' });
  }
});

// Admin: update auction by id (full replace or patch fields)
router.put('/auctions/:id', ensureAdmin, async (req, res) => {
  try {
    const auctionsPath = path.join(__dirname, '..', 'data', 'auctions.json');
    const raw = await fs.promises.readFile(auctionsPath, 'utf8');
    const parsed = JSON.parse(raw);
    const auctions = Array.isArray(parsed.auctions) ? parsed.auctions : [];
    const id = req.params.id;
    const idx = auctions.findIndex((a: any) => String(a.id) === String(id));
    if (idx === -1) return res.status(404).json({ error: 'Auction not found' });

    // Merge fields
    const updated = { ...auctions[idx], ...req.body, updatedAt: new Date().toISOString() };
    auctions[idx] = updated;
    await fs.promises.writeFile(auctionsPath, JSON.stringify({ auctions }, null, 2));
    res.json({ auction: updated });
  } catch (err) {
    console.error('Failed to update auction', err);
    res.status(500).json({ error: 'Failed to update auction' });
  }
});

// Admin: delete auction by id
router.delete('/auctions/:id', ensureAdmin, async (req, res) => {
  try {
    const auctionsPath = path.join(__dirname, '..', 'data', 'auctions.json');
    const raw = await fs.promises.readFile(auctionsPath, 'utf8');
    const parsed = JSON.parse(raw);
    const auctions = Array.isArray(parsed.auctions) ? parsed.auctions : [];
    const id = req.params.id;
    const idx = auctions.findIndex((a: any) => String(a.id) === String(id));
    if (idx === -1) return res.status(404).json({ error: 'Auction not found' });
    const deleted = auctions.splice(idx, 1)[0];
    await fs.promises.writeFile(auctionsPath, JSON.stringify({ auctions }, null, 2));
    res.json({ deleted });
  } catch (err) {
    console.error('Failed to delete auction', err);
    res.status(500).json({ error: 'Failed to delete auction' });
  }
});

function safeJsonParse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function isSafeFileName(name: string): boolean {
  if (!name) return false;
  if (name.includes('..')) return false;
  if (name.includes('/') || name.includes('\\')) return false;
  return true;
}

function decodeDataUrl(dataUrl: string): { buffer: Buffer; ext: string; mime: string } | null {
  const m = String(dataUrl || '').match(/^data:([^;]+);base64,(.+)$/);
  if (!m) return null;
  const mime = m[1];
  const b64 = m[2];
  const buffer = Buffer.from(b64, 'base64');
  const ext =
    mime === 'image/jpeg'
      ? 'jpg'
      : mime === 'image/png'
        ? 'png'
        : mime === 'image/webp'
          ? 'webp'
          : mime === 'application/pdf'
            ? 'pdf'
            : 'bin';
  return { buffer, ext, mime };
}

function resolvePathCandidates(candidates: string[]): string {
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return p;
    } catch {
      // ignore
    }
  }
  return candidates[0];
}

function resolveRepoPublicDir(): string {
  const cwd = process.cwd();
  return resolvePathCandidates([
    path.resolve(cwd, 'public'),
    path.resolve(cwd, '..', 'public'),
    path.resolve(__dirname, '..', '..', 'public'),
  ]);
}

function resolveServerDataDir(): string {
  const cwd = process.cwd();
  return resolvePathCandidates([
    path.resolve(cwd, 'data'),
    path.resolve(cwd, 'server', 'data'),
    path.resolve(__dirname, '..', 'data'),
  ]);
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.promises.readFile(filePath, 'utf8');
    return safeJsonParse<T>(raw, fallback);
  } catch {
    return fallback;
  }
}

async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function champManifestPath(): string {
  return path.join(resolveRepoPublicDir(), 'champions', 'manifest.json');
}

function champDir(id: string | number): string {
  return path.join(resolveRepoPublicDir(), 'champions', String(id));
}

type ChampionManifest = { champions: { id: number; image: string; pedigree?: string }[]; lastUpdated?: string };

router.get('/champions', ensureAdmin, async (_req, res) => {
  try {
    const manifest = await readJsonFile<ChampionManifest>(champManifestPath(), { champions: [], lastUpdated: undefined });
    const items = Array.isArray(manifest.champions) ? manifest.champions : [];
    const champions = await Promise.all(
      items.map(async (it) => {
        const id = Number(it.id);
        const base = champDir(id);
        const dataPath = path.join(base, 'data.json');
        const data = await readJsonFile<any>(dataPath, null as any);

        const galleryPath = path.join(base, 'gallery');
        const pedigreePath = path.join(base, 'pedigree');
        const galleryFiles = fs.existsSync(galleryPath) ? await fs.promises.readdir(galleryPath) : [];
        const pedigreeFiles = fs.existsSync(pedigreePath) ? await fs.promises.readdir(pedigreePath) : [];

        return {
          id: String(id),
          manifest: it,
          data,
          galleryFiles: galleryFiles.filter(isSafeFileName),
          pedigreeFiles: pedigreeFiles.filter(isSafeFileName),
        };
      })
    );
    res.json({ champions, lastUpdated: manifest.lastUpdated || null });
  } catch (err) {
    console.error('Admin champions list error', err);
    res.status(500).json({ error: 'Failed to load champions' });
  }
});

router.post('/champions', ensureAdmin, async (req, res) => {
  try {
    const { id, data, primaryImage, pedigree, galleryImages, pedigreeFiles } = req.body || {};
    const manifest = await readJsonFile<ChampionManifest>(champManifestPath(), { champions: [], lastUpdated: undefined });
    const items = Array.isArray(manifest.champions) ? manifest.champions : [];

    const parsedId = id != null ? Number(id) : Math.max(0, ...items.map((c) => Number(c.id) || 0)) + 1;
    if (!Number.isFinite(parsedId) || parsedId <= 0) return res.status(400).json({ error: 'Invalid champion id' });
    if (items.some((c) => Number(c.id) === parsedId)) return res.status(409).json({ error: 'Champion id already exists' });

    const base = champDir(parsedId);
    await fs.promises.mkdir(path.join(base, 'gallery'), { recursive: true });
    await fs.promises.mkdir(path.join(base, 'pedigree'), { recursive: true });

    const addedGallery: string[] = [];
    const addedPedigree: string[] = [];

    const saveFile = async (targetDir: string, file: any): Promise<string | null> => {
      const fileName = String(file?.fileName || '');
      const dataUrl = String(file?.dataUrl || '');
      if (!isSafeFileName(fileName)) return null;
      const decoded = decodeDataUrl(dataUrl);
      if (!decoded) return null;
      await fs.promises.writeFile(path.join(targetDir, fileName), decoded.buffer);
      return fileName;
    };

    let primaryName: string | null = null;
    if (primaryImage) {
      primaryName = await saveFile(path.join(base, 'gallery'), primaryImage);
    }
    if (!primaryName && Array.isArray(galleryImages) && galleryImages.length) {
      for (const f of galleryImages) {
        const saved = await saveFile(path.join(base, 'gallery'), f);
        if (saved) {
          addedGallery.push(saved);
          if (!primaryName) primaryName = saved;
        }
      }
    }
    if (primaryName) addedGallery.unshift(primaryName);

    let pedigreeName: string | null = null;
    if (pedigree) {
      pedigreeName = await saveFile(path.join(base, 'pedigree'), pedigree);
    }
    if (!pedigreeName && Array.isArray(pedigreeFiles) && pedigreeFiles.length) {
      for (const f of pedigreeFiles) {
        const saved = await saveFile(path.join(base, 'pedigree'), f);
        if (saved) {
          addedPedigree.push(saved);
          if (!pedigreeName) pedigreeName = saved;
        }
      }
    }
    if (pedigreeName) addedPedigree.unshift(pedigreeName);

    if (!primaryName) return res.status(400).json({ error: 'Primary image is required' });

    if (data && typeof data === 'object') {
      await writeJsonFile(path.join(base, 'data.json'), data);
    }

    const newItem = { id: parsedId, image: primaryName, ...(pedigreeName ? { pedigree: pedigreeName } : {}) };
    items.push(newItem);
    items.sort((a, b) => Number(a.id) - Number(b.id));
    manifest.champions = items;
    manifest.lastUpdated = new Date().toISOString().slice(0, 10);
    await writeJsonFile(champManifestPath(), manifest);

    res.status(201).json({ champion: { id: String(parsedId), manifest: newItem, data: data || null } });
  } catch (err) {
    console.error('Admin champion create error', err);
    res.status(500).json({ error: 'Failed to create champion' });
  }
});

router.put('/champions/:id', ensureAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) return res.status(400).json({ error: 'Invalid champion id' });

    const { data, setPrimaryImage, setPedigree, addGalleryImages, addPedigreeFiles, deleteGalleryImages, deletePedigreeFiles } = req.body || {};

    const manifest = await readJsonFile<ChampionManifest>(champManifestPath(), { champions: [], lastUpdated: undefined });
    const items = Array.isArray(manifest.champions) ? manifest.champions : [];
    const idx = items.findIndex((c) => Number(c.id) === id);
    if (idx === -1) return res.status(404).json({ error: 'Champion not found' });

    const base = champDir(id);
    await fs.promises.mkdir(path.join(base, 'gallery'), { recursive: true });
    await fs.promises.mkdir(path.join(base, 'pedigree'), { recursive: true });

    const saveFile = async (targetDir: string, file: any): Promise<string | null> => {
      const fileName = String(file?.fileName || '');
      const dataUrl = String(file?.dataUrl || '');
      if (!isSafeFileName(fileName)) return null;
      const decoded = decodeDataUrl(dataUrl);
      if (!decoded) return null;
      await fs.promises.writeFile(path.join(targetDir, fileName), decoded.buffer);
      return fileName;
    };

    if (Array.isArray(addGalleryImages)) {
      for (const f of addGalleryImages) {
        await saveFile(path.join(base, 'gallery'), f);
      }
    }
    if (Array.isArray(addPedigreeFiles)) {
      for (const f of addPedigreeFiles) {
        await saveFile(path.join(base, 'pedigree'), f);
      }
    }

    if (Array.isArray(deleteGalleryImages)) {
      for (const name of deleteGalleryImages.map(String).filter(isSafeFileName)) {
        await fs.promises.rm(path.join(base, 'gallery', name), { force: true });
      }
    }
    if (Array.isArray(deletePedigreeFiles)) {
      for (const name of deletePedigreeFiles.map(String).filter(isSafeFileName)) {
        await fs.promises.rm(path.join(base, 'pedigree', name), { force: true });
      }
    }

    const current = items[idx];
    const next = { ...current };

    if (setPrimaryImage != null) {
      const name = String(setPrimaryImage);
      if (!isSafeFileName(name)) return res.status(400).json({ error: 'Invalid primary image name' });
      next.image = name;
    }
    if (setPedigree != null) {
      const name = String(setPedigree);
      if (!isSafeFileName(name)) return res.status(400).json({ error: 'Invalid pedigree name' });
      next.pedigree = name;
    }

    if (data && typeof data === 'object') {
      await writeJsonFile(path.join(base, 'data.json'), data);
    }

    items[idx] = next;
    manifest.champions = items;
    manifest.lastUpdated = new Date().toISOString().slice(0, 10);
    await writeJsonFile(champManifestPath(), manifest);

    res.json({ champion: { id: String(id), manifest: next } });
  } catch (err) {
    console.error('Admin champion update error', err);
    res.status(500).json({ error: 'Failed to update champion' });
  }
});

router.delete('/champions/:id', ensureAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) return res.status(400).json({ error: 'Invalid champion id' });

    const manifest = await readJsonFile<ChampionManifest>(champManifestPath(), { champions: [], lastUpdated: undefined });
    const items = Array.isArray(manifest.champions) ? manifest.champions : [];
    const idx = items.findIndex((c) => Number(c.id) === id);
    if (idx === -1) return res.status(404).json({ error: 'Champion not found' });
    const deleted = items.splice(idx, 1)[0];
    manifest.champions = items;
    manifest.lastUpdated = new Date().toISOString().slice(0, 10);
    await writeJsonFile(champManifestPath(), manifest);

    await fs.promises.rm(champDir(id), { recursive: true, force: true });

    res.json({ deleted });
  } catch (err) {
    console.error('Admin champion delete error', err);
    res.status(500).json({ error: 'Failed to delete champion' });
  }
});

type MeetingsJson = { meetings: any[] };
type ReferencesJson = any[];

function meetingFolderName(name: string): string {
  return String(name || '')
    .replace(/[\\/]/g, '-')
    .replace(/\.\./g, '')
    .trim();
}

router.get('/meetings', ensureAdmin, async (_req, res) => {
  try {
    const info = getServiceHeaders();
    if (!info) return res.status(501).json({ error: 'Service key not configured' });
    const url = `${info.supabaseUrl}/rest/v1/meetings?select=*&order=date.desc`;
    const r = await fetch(url, { headers: info.headers });
    if (!r.ok) return res.status(r.status).json({ error: 'Failed to fetch meetings' });
    const rows = await r.json();
    res.json({ meetings: Array.isArray(rows) ? rows : [] });
  } catch (err) {
    console.error('Admin meetings list error', err);
    res.status(500).json({ error: 'Failed to load meetings' });
  }
});

router.post('/meetings', ensureAdmin, async (req, res) => {
  try {
    const { name, location, date, description, images } = req.body || {};
    const title = String(name || '').trim();
    if (!title) return res.status(400).json({ error: 'Name is required' });

    const info = getServiceHeaders();
    if (!info) return res.status(501).json({ error: 'Service key not configured' });

    const meetingId = randomUUID();
    const folderName = meetingFolderName(title);
    const folderFs = path.join(resolveRepoPublicDir(), 'meetings-with-breeders', folderName);
    await fs.promises.mkdir(folderFs, { recursive: true });

    const savedPaths: string[] = [];
    if (Array.isArray(images)) {
      for (const f of images) {
        const fileName = String(f?.fileName || '');
        const dataUrl = String(f?.dataUrl || '');
        if (!isSafeFileName(fileName)) continue;
        const decoded = decodeDataUrl(dataUrl);
        if (!decoded) continue;
        await fs.promises.writeFile(path.join(folderFs, fileName), decoded.buffer);
        savedPaths.push(`/meetings-with-breeders/${folderName}/${fileName}`);
      }
    }

    const body = {
      id: meetingId,
      name: title,
      location: location != null ? String(location) : null,
      date: date != null ? String(date) : null,
      description: description != null ? String(description) : null,
      images: savedPaths,
      created_at: new Date().toISOString(),
    };

    const r = await fetch(`${info.supabaseUrl}/rest/v1/meetings`, {
      method: 'POST',
      headers: { ...info.headers, 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const txt = await r.text().catch(() => '');
      console.error('Supabase insert meeting failed', r.status, txt);
      return res.status(r.status).json({ error: 'Failed to create meeting' });
    }
    const inserted = await r.json();
    res.status(201).json({ meeting: inserted?.[0] ?? body });
  } catch (err) {
    console.error('Admin meeting create error', err);
    res.status(500).json({ error: 'Failed to create meeting' });
  }
});

router.put('/meetings/:id', ensureAdmin, async (req, res) => {
  try {
    const id = String(req.params.id || '');
    const { name, location, date, description, addImages, deleteImages } = req.body || {};
    const info = getServiceHeaders();
    if (!info) return res.status(501).json({ error: 'Service key not configured' });

    const fetchUrl = `${info.supabaseUrl}/rest/v1/meetings?id=eq.${encodeURIComponent(id)}&select=*`;
    const fetchRes = await fetch(fetchUrl, { headers: info.headers });
    if (!fetchRes.ok) return res.status(fetchRes.status).json({ error: 'Failed to fetch meeting' });
    const rows = await fetchRes.json();
    const current = rows?.[0] || {};
    if (!current || !current.id) return res.status(404).json({ error: 'Meeting not found' });

    const next: any = { ...current };
    if (name != null) next.name = String(name).trim() || next.name;
    if (location != null) next.location = String(location);
    if (date != null) next.date = String(date);
    if (description != null) next.description = String(description);

    const folderName = meetingFolderName(String(next.name || current.name || ''));
    const folderFs = path.join(resolveRepoPublicDir(), 'meetings-with-breeders', folderName);
    await fs.promises.mkdir(folderFs, { recursive: true });

    const imagesArr: string[] = Array.isArray(next.images) ? next.images.slice() : [];

    if (Array.isArray(deleteImages)) {
      for (const p of deleteImages.map(String)) {
        const file = p.split('/').pop() || '';
        if (!isSafeFileName(file)) continue;
        const fsPath = path.join(folderFs, file);
        await fs.promises.rm(fsPath, { force: true });
        const i = imagesArr.indexOf(p);
        if (i !== -1) imagesArr.splice(i, 1);
      }
    }

    if (Array.isArray(addImages)) {
      for (const f of addImages) {
        const fileName = String(f?.fileName || '');
        const dataUrl = String(f?.dataUrl || '');
        if (!isSafeFileName(fileName)) continue;
        const decoded = decodeDataUrl(dataUrl);
        if (!decoded) continue;
        await fs.promises.writeFile(path.join(folderFs, fileName), decoded.buffer);
        imagesArr.unshift(`/meetings-with-breeders/${folderName}/${fileName}`);
      }
    }

    next.images = imagesArr;

    const patchRes = await fetch(`${info.supabaseUrl}/rest/v1/meetings?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { ...info.headers, 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify(next),
    });
    if (!patchRes.ok) {
      const txt = await patchRes.text().catch(() => '');
      console.error('Supabase update meeting failed', patchRes.status, txt);
      return res.status(patchRes.status).json({ error: 'Failed to update meeting' });
    }
    const updated = await patchRes.json();
    res.json({ meeting: updated?.[0] ?? next });
  } catch (err) {
    console.error('Admin meeting update error', err);
    res.status(500).json({ error: 'Failed to update meeting' });
  }
});

router.delete('/meetings/:id', ensureAdmin, async (req, res) => {
  try {
    const id = String(req.params.id || '');
    const info = getServiceHeaders();
    if (!info) return res.status(501).json({ error: 'Service key not configured' });

    const fetchUrl = `${info.supabaseUrl}/rest/v1/meetings?id=eq.${encodeURIComponent(id)}&select=name`;
    const fetchRes = await fetch(fetchUrl, { headers: info.headers });
    const rows = fetchRes.ok ? await fetchRes.json() : [];
    const existing = rows?.[0] || null;

    const r = await fetch(`${info.supabaseUrl}/rest/v1/meetings?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { ...info.headers, Prefer: 'return=representation' },
    });
    if (!r.ok) return res.status(r.status).json({ error: 'Failed to delete meeting' });
    const deletedRows = await r.json();
    const deleted = deletedRows?.[0] ?? existing ?? { id };

    const name = String(deleted?.name || '');
    if (name) {
      const folderFs = path.join(resolveRepoPublicDir(), 'meetings-with-breeders', meetingFolderName(name));
      await fs.promises.rm(folderFs, { recursive: true, force: true });
    }

    res.json({ deleted });
  } catch (err) {
    console.error('Admin meeting delete error', err);
    res.status(500).json({ error: 'Failed to delete meeting' });
  }
});

router.get('/references', ensureAdmin, async (_req, res) => {
  try {
    const info = getServiceHeaders();
    if (!info) return res.status(501).json({ error: 'Service key not configured' });
    const url = `${info.supabaseUrl}/rest/v1/references?select=*&order=created_at.desc`;
    const r = await fetch(url, { headers: info.headers });
    if (!r.ok) return res.status(r.status).json({ error: 'Failed to fetch references' });
    const rows = await r.json();
    res.json({ references: Array.isArray(rows) ? rows : [] });
  } catch (err) {
    console.error('Admin references list error', err);
    res.status(500).json({ error: 'Failed to load references' });
  }
});

router.post('/references', ensureAdmin, async (req, res) => {
  try {
    const info = getServiceHeaders();
    if (!info) return res.status(501).json({ error: 'Service key not configured' });
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const ref = { id: randomUUID(), ...body, created_at: new Date().toISOString() };
    const r = await fetch(`${info.supabaseUrl}/rest/v1/references`, {
      method: 'POST',
      headers: { ...info.headers, 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify(ref),
    });
    if (!r.ok) {
      const txt = await r.text().catch(() => '');
      console.error('Supabase insert reference failed', r.status, txt);
      return res.status(r.status).json({ error: 'Failed to create reference' });
    }
    const inserted = await r.json();
    res.status(201).json({ reference: inserted?.[0] ?? ref });
  } catch (err) {
    console.error('Admin reference create error', err);
    res.status(500).json({ error: 'Failed to create reference' });
  }
});

router.put('/references/:id', ensureAdmin, async (req, res) => {
  try {
    const id = String(req.params.id || '');
    const info = getServiceHeaders();
    if (!info) return res.status(501).json({ error: 'Service key not configured' });
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const payload = { ...body, updated_at: new Date().toISOString() };
    const r = await fetch(`${info.supabaseUrl}/rest/v1/references?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { ...info.headers, 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify(payload),
    });
    if (!r.ok) return res.status(r.status).json({ error: 'Failed to update reference' });
    const updated = await r.json();
    res.json({ reference: updated?.[0] ?? { id, ...payload } });
  } catch (err) {
    console.error('Admin reference update error', err);
    res.status(500).json({ error: 'Failed to update reference' });
  }
});

router.delete('/references/:id', ensureAdmin, async (req, res) => {
  try {
    const id = String(req.params.id || '');
    const info = getServiceHeaders();
    if (!info) return res.status(501).json({ error: 'Service key not configured' });
    const r = await fetch(`${info.supabaseUrl}/rest/v1/references?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { ...info.headers, Prefer: 'return=representation' },
    });
    if (!r.ok) return res.status(r.status).json({ error: 'Failed to delete reference' });
    const deletedRows = await r.json();
    res.json({ deleted: deletedRows?.[0] ?? { id } });
  } catch (err) {
    console.error('Admin reference delete error', err);
    res.status(500).json({ error: 'Failed to delete reference' });
  }
});

export default router;
