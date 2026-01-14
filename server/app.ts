import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { 
  globalLimiter, 
  authLimiter, 
  biddingLimiter, 
  uploadLimiter 
} from './middleware/rateLimiter.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import auctionRoutes from './routes/auctions.js';
import userRoutes from './routes/users.js';
import uploadRoutes from './routes/upload.js';
import messageRoutes from './routes/messages.js';
import adminRoutes from './routes/admin.js';
import notificationRoutes from './routes/notifications.js';
import reviewRoutes from './routes/reviews.js';
import searchRoutes from './routes/search.js';
import paymentRoutes, { stripeWebhookHandler } from './routes/payments.js';
import webhooks from './routes/webhooks.js';
import { testCSRFEndpoint } from './routes/testCSRF.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';
import { validateCSRFToken, setCSRFToken } from './middleware/csrf.js';
import { validatedEnv } from './lib/env.js';
import AuctionCronService from './services/AuctionCronService.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedOrigins = [
  validatedEnv.CLIENT_URL,
  'https://champion-pigeon-web.onrender.com',
  'https://champion-pigeon-auctions.vercel.app',
  'https://palkamtm.pl',
  'https://www.palkamtm.pl',
  ...(validatedEnv.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [])
].filter(Boolean);

const isAllowedOrigin = (origin?: string) => {
  if (!origin) return false;
  if (allowedOrigins.includes(origin)) return true;
  // Allow any *.onrender.com frontend hitting the api
  if (/^https?:\/\/([a-z0-9-]+\.)*onrender\.com$/i.test(origin)) return true;
  return false;
};

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "blob:",
        "https://*.supabase.co",
        "https://accounts.google.com",
        "https://www.google.com",
        "https://www.gstatic.com",
        "https://js.stripe.com"
      ],
      scriptSrcElem: [
        "'self'",
        "blob:",
        "https://*.supabase.co",
        "https://accounts.google.com",
        "https://www.google.com",
        "https://www.gstatic.com",
        "https://js.stripe.com"
      ],
      workerSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://*.supabase.co"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://fonts.gstatic.com"
      ],
      styleSrcElem: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://fonts.gstatic.com"
      ],
      connectSrc: [
        "'self'",
        `ws://${new URL(validatedEnv.CLIENT_URL).host}`,
        `wss://${new URL(validatedEnv.CLIENT_URL).host}`,
        'https://champion-pigeon-api.onrender.com',
        "https://*.supabase.co",
        "wss://*.supabase.co",
        "https://accounts.google.com",
        "https://www.google.com",
        "https://fonts.googleapis.com",
        "https://fonts.gstatic.com",
        "https://api.stripe.com",
        "https://js.stripe.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "blob:",
        "https://*.supabase.co"
      ],
      frameSrc: [
        "'self'",
        "https://www.youtube.com",
        "https://www.youtube-nocookie.com",
        "https://maps.google.com",
        "https://www.google.com",
        "https://accounts.google.com",
        "https://js.stripe.com"
      ],
      fontSrc: [
        "'self'",
        "data:",
        "https:",
        "https://fonts.gstatic.com",
        "https://fonts.googleapis.com"
      ],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
}));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // In development, allow localhost origins
    if (validatedEnv.NODE_ENV === 'development') {
      const localhostRegex = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/;
      if (localhostRegex.test(origin)) {
        return callback(null, true);
      }
    }
    
    // Check against allowed origins
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    
    // Log blocked origins for security monitoring
    console.warn(`CORS blocked origin: ${origin} from IP: ${origin}`);
    return callback(new Error('CORS policy: origin not allowed'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-CSRF-Token',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: [
    'X-CSRF-Token',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset'
  ],
  maxAge: validatedEnv.CORS_MAX_AGE
}));

// Stripe webhook wymaga raw body – rejestrujemy osobny handler przed json parserem
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const { stripeWebhookHandler } = await import('./routes/payments.js');
    return stripeWebhookHandler(req, res);
  } catch (error) {
    console.error('Stripe webhook handler error:', error);
    return res.status(500).send('Internal server error');
  }
});

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.set('trust proxy', 1); // Fix X-Forwarded-For warning
app.use(globalLimiter);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Endpoint CSRF token
app.get('/api/csrf-token', (req, res) => {
  const token = setCSRFToken(req, res);
  res.json({ csrfToken: token });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/auctions', validateCSRFToken, auctionRoutes);
app.use('/api/users', authMiddleware, validateCSRFToken, userRoutes);
app.use('/api/upload', uploadLimiter, authMiddleware, uploadRoutes);
app.use('/api/messages', authMiddleware, validateCSRFToken, messageRoutes);
app.use('/api/admin', authMiddleware, validateCSRFToken, adminRoutes);
app.use('/api/notifications', authMiddleware, validateCSRFToken, notificationRoutes);
app.use('/api/reviews', validateCSRFToken, reviewRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/payments', authMiddleware, validateCSRFToken, paymentRoutes);
app.use('/api/webhooks', webhooks);

// Test CSRF endpoint
app.post('/api/test-csrf', validateCSRFToken, testCSRFEndpoint);
app.get('/api/test-csrf', testCSRFEndpoint);

app.get('/api/breeder-meetings', async (req: Request, res: Response) => {
  try {
    const meetingsPath = path.join(__dirname, 'data/meetings.json');
    const meetingsData = await fs.promises.readFile(meetingsPath, 'utf-8');
    const meetings = JSON.parse(meetingsData);
    res.json(meetings.meetings);
  } catch (error) {
    console.error('Error reading meetings data:', error);
    res.status(500).json({ error: 'Failed to load meetings data' });
  }
});

app.use(notFound);
app.use(errorHandler);

const auctionCronService = AuctionCronService.getInstance();
auctionCronService.start();

export { allowedOrigins };
export default app;
