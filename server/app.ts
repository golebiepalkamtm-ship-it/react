import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import auctionRoutes from './routes/auctions.js';
import userRoutes from './routes/users.js';
import uploadRoutes from './routes/upload.js';
import messageRoutes from './routes/messages.js';
import adminRoutes from './routes/admin.js';
import twilioRoutes from './routes/twilio.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';
import { cspMiddleware } from './middleware/csp.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security & middleware
app.use(helmet());
app.use(cspMiddleware);
// Trust proxy (Render/Heroku/etc)
app.set('trust proxy', 1);

// Allow requests from configured client URL, plus any local dev host used by the developer.
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:3000',
  'http://localhost:10000',
  'https://champion-pigeon-auctions.vercel.app',
  'https://champion-pigeon-web.onrender.com',
  'https://palkamtm.pl',
  'https://www.palkamtm.pl'
];
app.use(cors({ 
  origin: (origin, callback) => {
    // allow requests with no origin (e.g. curl, mobile)
    if (!origin) return callback(null, true);
    // In development, allow any origin to simplify local testing
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
    return callback(new Error('CORS policy: origin not allowed'), false);
  },
  credentials: true 
}));
app.use(express.json({ limit: '10mb' }));
// Parse urlencoded bodies (Twilio sends application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));
app.use(rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: 100 
}));

// Serve static files from public directory
function resolveRepoPublicDir(): string {
  const cwd = process.cwd();
  const candidates = [
    path.resolve(cwd, 'public'),
    path.resolve(cwd, '..', 'public'),
    path.resolve(__dirname, 'public'),
    path.resolve(__dirname, '..', 'public'),
    path.resolve(__dirname, '..', '..', 'public'),
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return p;
    } catch {
      // ignore
    }
  }
  return candidates[0];
}

app.use(express.static(resolveRepoPublicDir()));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const getWebhookSecret = () => process.env.WEBHOOK_SECRET || process.env.SUPABASE_DB_WEBHOOK_SECRET || '';

const getSupabaseAdminConfig = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return { supabaseUrl, serviceKey };
};

const supabaseJson = async <T,>(url: string, init: RequestInit & { headers?: Record<string, string> }) => {
  const response = await fetch(url, init);
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Supabase request failed (${response.status}): ${text}`);
  }
  if (response.status === 204) return undefined as T;
  const text = await response.text().catch(() => '');
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
};

app.post('/api/webhooks/auction-closed', async (req: Request, res: Response) => {
  try {
    const secret = getWebhookSecret();
    if (secret) {
      const provided = String(req.headers['x-webhook-secret'] || '');
      if (provided !== secret) return res.status(401).json({ error: 'Unauthorized' });
    }

    const record = req.body?.record ?? req.body?.new_record ?? req.body?.new ?? req.body?.data?.record ?? req.body;
    const oldRecord = req.body?.old_record ?? req.body?.old ?? req.body?.data?.old_record ?? null;

    const newStatus = String(record?.status || '');
    const oldStatus = oldRecord?.status != null ? String(oldRecord.status) : null;
    if (newStatus !== 'closed' || oldStatus === 'closed') {
      return res.json({ ok: true, ignored: true });
    }

    const auctionId = String(record?.id || '');
    if (!auctionId) return res.status(400).json({ error: 'Missing auction id' });

    const admin = getSupabaseAdminConfig();
    if (!admin) return res.status(500).json({ error: 'Supabase not configured on server' });

    const headers = {
      apikey: admin.serviceKey,
      Authorization: `Bearer ${admin.serviceKey}`,
      'Content-Type': 'application/json',
    };

    const auctionRows = await supabaseJson<any[]>(
      `${admin.supabaseUrl}/rest/v1/auctions?id=eq.${encodeURIComponent(auctionId)}&select=id,owner_id,title,current_price,ends_at,status`,
      { method: 'GET', headers }
    );
    const auction = auctionRows?.[0];
    if (!auction) return res.status(404).json({ error: 'Auction not found' });

    const bestBidRows = await supabaseJson<any[]>(
      `${admin.supabaseUrl}/rest/v1/bids?auction_id=eq.${encodeURIComponent(auctionId)}&select=bidder_id,amount,created_at&order=amount.desc,created_at.asc&limit=1`,
      { method: 'GET', headers }
    ).catch(() => []);
    const bestBid = bestBidRows?.[0] || null;

    const sellerId = String(auction.owner_id || '');
    const winnerId = bestBid?.bidder_id ? String(bestBid.bidder_id) : null;
    const winningAmount = bestBid?.amount != null ? Number(bestBid.amount) : null;

    const io = (req.app as any).get?.('io');
    if (io) {
      io.to(`auction-${auctionId}`).emit('auction-closed', { auctionId, sellerId, winnerId, winningAmount });
      if (sellerId) io.to(`user-${sellerId}`).emit('auction-closed', { auctionId, sellerId, winnerId, winningAmount });
      if (winnerId) io.to(`user-${winnerId}`).emit('auction-won', { auctionId, sellerId, winnerId, winningAmount });
    }

    return res.json({ ok: true, auctionId, sellerId, winnerId, winningAmount });
  } catch (error) {
    console.error('auction-closed webhook error', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/upload', authMiddleware, uploadRoutes);
app.use('/api/messages', authMiddleware, messageRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);
// Twilio inbound webhook (no auth middleware)
app.use('/api/twilio', twilioRoutes);

// Breeder meetings endpoint (Supabase REST with JSON fallback)
app.get('/api/breeder-meetings', async (req: Request, res: Response) => {
  try {
    const allMeetings: any[] = [];
    
    // 1. Try to fetch from Supabase
    const admin = getSupabaseAdminConfig();
    if (admin) {
      const headers = {
        apikey: admin.serviceKey,
        Authorization: `Bearer ${admin.serviceKey}`,
        'Content-Type': 'application/json',
      };
      const rows = await supabaseJson<any[]>(
        `${admin.supabaseUrl}/rest/v1/meetings?select=*`,
        { method: 'GET', headers }
      ).catch((err) => {
        console.error('Supabase fetch error:', err);
        return [];
      });
      if (Array.isArray(rows)) {
        allMeetings.push(...rows);
      }
    }

    // 2. Always fetch from file system (static meetings)
    try {
      const publicDir = resolveRepoPublicDir();
      const baseDir = path.join(publicDir, 'meetings-with-breeders');
      const dirents = await fs.promises.readdir(baseDir, { withFileTypes: true }).catch(() => []);
      
      for (const d of dirents) {
        if (!d.isDirectory()) continue;
        const folderName = d.name;
        const folderFs = path.join(baseDir, folderName);
        const files = await fs.promises.readdir(folderFs).catch(() => []);
        const images = files
          .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
          .map((f) => `/meetings-with-breeders/${folderName}/${f}`);
        
        if (images.length === 0) continue;
        
        // Check if this meeting already exists in DB results (by name fuzzy match or ID)
        // Ideally we assume static ones are unique or legacy. 
        // We'll add them with a distinct ID prefix.
        const staticId = `static-${encodeURIComponent(folderName)}`;
        
        // Optional: Avoid duplicates if name matches? 
        // For now, let's just append. The frontend handles display.
        
        allMeetings.push({
          id: staticId,
          name: folderName,
          location: null, // Static folders don't have metadata easily accessible unless we parse something
          date: null,
          description: null,
          images,
          isStatic: true 
        });
      }
    } catch (fsError) {
      console.warn('File system scan failed:', fsError);
    }

    return res.json(allMeetings);
  } catch (error) {
    console.error('Error reading meetings data:', error);
    res.status(500).json({ error: 'Failed to load meetings data' });
  }
});

// Allow users to submit breeder meetings with images (JSON upload with data URLs)
app.post('/api/breeder-meetings', authMiddleware, async (req: Request, res: Response) => {
  try {
    const title = String(req.body?.title || '').trim();
    const description = req.body?.description != null ? String(req.body.description) : null;
    const location = req.body?.location != null ? String(req.body.location) : null;
    const date = req.body?.date != null ? String(req.body.date) : null;
    const images = Array.isArray(req.body?.images) ? req.body.images : [];

    if (!title) return res.status(400).json({ error: 'Tytuł spotkania jest wymagany' });

    const userId = (req as any).user?.id ?? null;
    if (!userId) return res.status(401).json({ error: 'Musisz być zalogowany' });

    const adminForVerification = getSupabaseAdminConfig();
    let role: string | null = (req as any).user?.role ?? null;
    let phone: string | null = null;
    let name: string | null = null;

    if (adminForVerification) {
      const headers = {
        apikey: adminForVerification.serviceKey,
        Authorization: `Bearer ${adminForVerification.serviceKey}`,
        'Content-Type': 'application/json',
      };
      const rows = await supabaseJson<any[]>(
        `${adminForVerification.supabaseUrl}/rest/v1/users?id=eq.${encodeURIComponent(userId)}&select=id,phone,name,role`,
        { method: 'GET', headers }
      ).catch(() => []);
      const profile = Array.isArray(rows) ? rows[0] ?? null : null;
      if (profile) {
        role = profile.role ?? role;
        phone = profile.phone ?? null;
        name = profile.name ?? null;
      }
    }

    const missingFields: string[] = [];
    if (adminForVerification) {
      if (!phone) missingFields.push('Numer telefonu');
      if (!name) missingFields.push('Imię i nazwisko');
    }
    if (role !== 'USER_FULL_VERIFIED') missingFields.push('Pełna weryfikacja konta');
    if (missingFields.length > 0) {
      return res.status(403).json({
        error: 'Wymagana pełna weryfikacja konta',
        missingFields,
      });
    }

    const meetingFolderName = (name: string) =>
      String(name || '').replace(/[\\/]/g, '-').replace(/\.\./g, '').trim();

    const decodeDataUrl = (dataUrl: string) => {
      const m = String(dataUrl || '').match(/^data:([^;]+);base64,(.+)$/);
      if (!m) return null as any;
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
              : 'bin';
      return { buffer, ext, mime };
    };

    const isSafeFileName = (name: string) => {
      if (!name) return false;
      if (name.includes('..')) return false;
      if (name.includes('/') || name.includes('\\')) return false;
      return true;
    };

    const folderName = meetingFolderName(title);
    const folderFs = path.join(resolveRepoPublicDir(), 'meetings-with-breeders', folderName);
    await fs.promises.mkdir(folderFs, { recursive: true });

    const savedPaths: string[] = [];
    for (const f of images) {
      const fileName = String(f?.fileName || '');
      const dataUrl = String(f?.dataUrl || '');
      if (!isSafeFileName(fileName)) continue;
      const decoded = decodeDataUrl(dataUrl);
      if (!decoded) continue;
      await fs.promises.writeFile(path.join(folderFs, fileName), decoded.buffer);
      savedPaths.push(`/meetings-with-breeders/${folderName}/${fileName}`);
    }

    const admin = getSupabaseAdminConfig();
    if (admin) {
      const headers = {
        apikey: admin.serviceKey,
        Authorization: `Bearer ${admin.serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      };
      const body = {
        id: crypto.randomUUID(),
        name: title,
        location,
        date,
        description,
        images: savedPaths,
        created_at: new Date().toISOString(),
        author_id: (req as any).user?.id ?? null,
      };
      const r = await supabaseJson<any[]>(
        `${admin.supabaseUrl}/rest/v1/meetings`,
        { method: 'POST', headers, body: JSON.stringify(body) as any },
      ).catch((e) => {
        throw e;
      });
      const created = Array.isArray(r) ? r[0] : body;
      return res.status(201).json(created);
    }

    const meetingsPath = path.join(__dirname, 'data/meetings.json');
    const raw = await fs.promises.readFile(meetingsPath, 'utf-8').catch(() => JSON.stringify({ meetings: [] }));
    const parsed = JSON.parse(raw);
    const nextMeeting = {
      id: crypto.randomUUID(),
      name: title,
      location,
      date,
      description,
      images: savedPaths,
    };
    const nextList = Array.isArray(parsed.meetings) ? [nextMeeting, ...parsed.meetings] : [nextMeeting];
    await fs.promises.writeFile(meetingsPath, JSON.stringify({ meetings: nextList }, null, 2), 'utf-8');
    return res.status(201).json(nextMeeting);
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({ error: 'Nie udało się zapisać spotkania' });
  }
});

// References endpoint (Supabase REST with JSON fallback)
app.get('/api/references', async (req: Request, res: Response) => {
  try {
    const admin = getSupabaseAdminConfig();
    if (admin) {
      const headers = {
        apikey: admin.serviceKey,
        Authorization: `Bearer ${admin.serviceKey}`,
        'Content-Type': 'application/json',
      };
      const rows = await supabaseJson<any[]>(
        `${admin.supabaseUrl}/rest/v1/references?select=*`,
        { method: 'GET', headers }
      ).catch(() => []);
      return res.json(rows || []);
    }
    const referencesPath = path.join(__dirname, 'data', 'references.json');
    const raw = fs.readFileSync(referencesPath, 'utf-8');
    const references = JSON.parse(raw);
    res.json(references);
  } catch (error) {
    console.error('Error reading references data:', error);
    res.status(500).json({ error: 'Failed to load references data' });
  }
});

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
