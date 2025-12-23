import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
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
app.use(cors({ 
  origin: process.env.CLIENT_URL || 'http://localhost:5173', 
  credentials: true 
}));
app.use(express.json({ limit: '10mb' }));
app.use(rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: 100 
}));

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

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;