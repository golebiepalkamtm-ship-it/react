import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import authRoutes from './routes/auth';
import auctionRoutes from './routes/auctions';
import userRoutes from './routes/users';
import uploadRoutes from './routes/upload';
import messageRoutes from './routes/messages';
import adminRoutes from './routes/admin';
import { errorHandler, notFound } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';

const app = express();

// Security & middleware
app.use(helmet());
// Allow requests from configured client URL, plus any local dev host used by the developer.
const allowedOrigins = [process.env.CLIENT_URL || 'http://localhost:5173', 'http://169.254.253.118:8080'];
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
app.use(rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: 100 
}));

// Serve static files from public directory
app.use(express.static(path.join(process.cwd(), 'public')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/upload', authMiddleware, uploadRoutes);
app.use('/api/messages', authMiddleware, messageRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);

// Breeder meetings endpoint
app.get('/api/breeder-meetings', (req: Request, res: Response) => {
  try {
    const meetingsPath = path.join(process.cwd(), 'server/data/meetings.json');
    const meetingsData = fs.readFileSync(meetingsPath, 'utf-8');
    const meetings = JSON.parse(meetingsData);
    res.json(meetings.meetings);
  } catch (error) {
    console.error('Error reading meetings data:', error);
    res.status(500).json({ error: 'Failed to load meetings data' });
  }
});

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;