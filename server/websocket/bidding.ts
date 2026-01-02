import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import logger from '../lib/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

// Lazily initialize Prisma client; if Prisma client hasn't been generated
// (or fails to initialize) we fallback to a lightweight mock so the dev
// server can run. Run `npx prisma generate` to enable full DB functionality.
let prisma: any = null;
Promise.all([
  import('@prisma/client'),
  import('@prisma/adapter-pg')
])
    .then(([mod, adapterMod]) => {
    try {
      const PrismaPg = adapterMod.PrismaPg;
      const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
      prisma = new mod.PrismaClient({ adapter });
    } catch (err) {
      logger.warn('Prisma client failed to initialize:', err);
      prisma = null;
    }
  })
  .catch((err) => {
    logger.warn('Could not import @prisma/client or adapter. DB operations will be disabled:', err);
    prisma = null;
  });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUCTIONS_PATH = path.join(__dirname, '..', 'data', 'auctions.json');

function getSupabaseAdminConfig(): { supabaseUrl: string; serviceKey: string } | null {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return { supabaseUrl, serviceKey };
}

async function supabaseJson<T>(url: string, init: RequestInit & { headers?: Record<string, string> }) {
  const response = await fetch(url, init);
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Supabase request failed (${response.status}): ${text}`);
  }
  if (response.status === 204) return undefined as T;
  const text = await response.text().catch(() => '');
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

function getJwtSecret(): string | null {
  return process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET || null;
}

function verifySupabaseJwt(token: string) {
  const secret = getJwtSecret();
  if (!secret) return null;
  const payload = jwt.verify(token, secret) as any;
  const id = String(payload?.sub || payload?.user_id || payload?.id || '');
  if (!id) return null;
  return { id, raw: payload };
}

function formatRpcErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  const m = raw.match(/Supabase request failed \(\d+\):\s*(.*)$/s);
  const body = (m?.[1] || raw).trim();
  try {
    const parsed = JSON.parse(body);
    const message = parsed?.message || parsed?.error || parsed?.hint || parsed?.details;
    return message ? String(message) : 'Bid rejected';
  } catch {
    const cleaned = body.replace(/^\{[\s\S]*\}$/s, 'Bid rejected');
    return cleaned || 'Bid rejected';
  }
}

function loadAuctionsData(): any[] {
  try {
    const raw = fs.readFileSync(AUCTIONS_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.auctions) ? parsed.auctions : [];
  } catch (err) {
    logger.warn('Could not load auctions.json for websocket bidding:', err);
    return [];
  }
}

function saveAuctionsData(auctions: any[]) {
  fs.writeFileSync(AUCTIONS_PATH, JSON.stringify({ auctions }, null, 2));
}

function getNamePartsFromUser(user: any): { firstName: string; lastName: string } {
  const raw = String(
    user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.name ||
      user?.email ||
      ''
  ).trim();
  if (!raw) return { firstName: 'Użytkownik', lastName: '' };
  const parts = raw.split(/\s+/).filter(Boolean);
  const firstName = parts[0] || 'Użytkownik';
  const lastName = parts.slice(1).join(' ');
  return { firstName, lastName };
}

export const setupWebSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: { 
      origin: process.env.CLIENT_URL || 'http://localhost:5173', 
      credentials: true 
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('No token provided'));
      }

      const local = verifySupabaseJwt(token);
      if (local) {
        socket.data.userId = local.id;
        socket.data.user = { id: local.id, ...local.raw };
        return next();
      }

      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const apiKey = supabaseServiceKey || supabaseAnonKey;
      if (!supabaseUrl || !apiKey) {
        return next(new Error('Supabase not configured on server'));
      }

      const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: apiKey,
        },
      });

      if (!response.ok) {
        return next(new Error('Invalid or expired token'));
      }

      const user = await response.json();
      socket.data.userId = user.id;
      socket.data.user = user;
      next();
    } catch (error) {
      logger.error('WebSocket auth error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.data.userId}`);
    socket.join(`user-${socket.data.userId}`);

    socket.on('join-auction', (auctionId: string) => {
      socket.join(`auction-${auctionId}`);
      logger.info(`User ${socket.data.userId} joined auction ${auctionId}`);
    });

    socket.on('leave-auction', (auctionId: string) => {
      socket.leave(`auction-${auctionId}`);
      logger.info(`User ${socket.data.userId} left auction ${auctionId}`);
    });

    // Heartbeat
    socket.on('ping', () => {
      socket.emit('pong');
    });

    // Bidding is now handled via HTTP POST /api/auctions/:id/bids
    // This ensures atomic transactions via Supabase RPC and proper validation.
    // The WebSocket server acts as a broadcaster for 'bid-placed' events emitted by the HTTP handler.

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.data.userId}`);
    });
  });

  return io;
};
