import express, { type Application, Request, Response, NextFunction } from 'express';
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
import metricsRoutes from './routes/metrics.js';
import proxyRoutes from './routes/proxy.js';
import { testCSRFEndpoint } from './routes/testCSRF.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';
import { cspMiddleware } from './middleware/csp.js';
import { validateCSRFToken, setCSRFToken } from './middleware/csrf.js';
import { validatedEnv } from './lib/env.js';
import { getCorsOptions, getAllowedOrigins } from './lib/originUtils.js';
import AuctionCronService from './services/AuctionCronService.js';

const hasBodyProperty = (value: unknown): value is { body: unknown } => {
  return typeof value === 'object' && value !== null && 'body' in value;
};

const app: Application = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const corsOptions = {
  ...getCorsOptions(),
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
  maxAge: validatedEnv.CORS_MAX_AGE,
  optionsSuccessStatus: 200
};

app.use(helmet());
app.use(cspMiddleware);

// Explicit preflight handler for health so tests get 200 (and CORS headers when allowed)
app.options('/api/health', cors(corsOptions), (req, res) => {
  return res.status(200).send('OK');
});

app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    return stripeWebhookHandler(req, res);
  } catch (error) {
    console.error('Stripe webhook handler error:', error);
    return res.status(500).json({ error: 'Webhook handler error' });
  }
});

app.use(express.json({ limit: '10mb' }));
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && hasBodyProperty(err)) {
    console.error('Malformed JSON payload:', err);
    return res.status(400).json({ error: 'Malformed JSON payload' });
  }
  next(err);
});
app.use(cookieParser());
app.set('trust proxy', 1); // Fix X-Forwarded-For warning
app.use(globalLimiter);

app.use(express.static(path.join(__dirname, '../public'), {
  setHeaders: (res, path) => {
    // No-cache for sourcemaps in production
    if (validatedEnv.NODE_ENV === 'production' && path.endsWith('.map')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api', (req, res) => {
  res.json({
    status: 'OK',
    name: 'champion-pigeon-api',
    timestamp: new Date().toISOString(),
    health: '/api/health'
  });
});

// Endpoint CSRF token
app.get('/api/csrf-token', (req, res) => {
  const token = setCSRFToken(req, res);
  res.json({ csrfToken: token });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/auctions', validateCSRFToken, auctionRoutes);
app.use('/api/users', authMiddleware, validateCSRFToken, userRoutes);
// Run CSRF + upload-specific validations before authentication so errors like
// missing X-Requested-With return 403 (expected by security tests).
app.use('/api/upload', uploadLimiter, validateCSRFToken, authMiddleware, uploadRoutes);
app.use('/api/messages', authMiddleware, validateCSRFToken, messageRoutes);
app.use('/api/admin', authMiddleware, validateCSRFToken, adminRoutes);
app.use('/api/notifications', authMiddleware, validateCSRFToken, notificationRoutes);
app.use('/api/reviews', validateCSRFToken, reviewRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/payments', authMiddleware, validateCSRFToken, paymentRoutes);
app.use('/api/webhooks', webhooks);
app.use('/api/metrics', metricsRoutes);
app.use('/api/proxy', proxyRoutes);

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

export { getAllowedOrigins as allowedOrigins };
export default app;
