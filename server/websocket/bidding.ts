import { Server, Socket } from 'socket.io';
import { z } from 'zod';
import logger from '../lib/logger.js';
import { bidRateLimiterInstance as bidRateLimiter } from '../middleware/rateLimiter.js';
import { verifyJWTTokenWithRole } from '../utils/tokenVerifier.js';
import { validatedEnv } from '../lib/env.js';
import { wsTicketService } from '../services/WebSocketTicketService.js';
import { auctionService } from '../services/AuctionService.js';
import { isAllowedOrigin } from '../lib/originUtils.js';

// UUID v4 validation regex
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// WebSocket validation schemas
const wsBidSchema = z.object({
  auctionId: z.string().regex(uuidRegex, 'Invalid auction ID format'),
  amount: z.number()
    .positive('Amount must be positive')
    .finite('Amount must be a valid number')
    .min(0.01, 'Minimum bid is 0.01')
    .max(1000000, 'Maximum bid is 1,000,000'),
  isProxy: z.boolean().optional(),
  maxBid: z.number()
    .positive('Max bid must be positive')
    .finite('Max bid must be a valid number')
    .min(0.01, 'Minimum bid is 0.01')
    .max(1000000, 'Maximum bid is 1,000,000')
    .optional(),
}).refine((data) => {
  if (data.isProxy && (!data.maxBid || data.maxBid <= data.amount)) {
    return false;
  }
  return true;
}, {
  message: 'Max bid must be greater than amount for proxy bidding',
  path: ['maxBid']
});


export const setupWebSocketEvents = (io: Server) => {
  io.use(async (socket, next) => {
    try {
      // CRITICAL SECURITY #1: Strict Origin/CSRF Protection
      const origin = (socket.handshake.headers.origin || socket.handshake.headers.referer || '') as string;
      if (!isAllowedOrigin(origin)) {
        logger.warn(`WebSocket connection rejected - invalid origin: ${origin}`, {
          ip: socket.handshake.address,
          headers: socket.handshake.headers
        });
        return next(new Error('Origin not allowed'));
      }

      // CRITICAL SECURITY #2: Ticket-Based Authentication (CSWSH Prevention)
      // Preferred method: Single-use ticket from authenticated HTTP endpoint
      const ticket = socket.handshake.auth.ticket || socket.handshake.query.ticket;
      
      if (ticket) {
        // Ticket-based authentication (recommended)
        try {
          const ticketData = wsTicketService.validateAndConsumeTicket(ticket as string);
          
          if (!ticketData) {
            logger.warn('WebSocket connection rejected - invalid ticket', {
              ip: socket.handshake.address
            });
            return next(new Error('Invalid or expired ticket'));
          }

          socket.data.userId = ticketData.userId;
          socket.data.user = {
            id: ticketData.userId,
            email: ticketData.email,
            role: ticketData.role
          };
          
          logger.info(`WebSocket authenticated via ticket: ${ticketData.userId}`);
          return next();
        } catch (error) {
          logger.error('Ticket validation error:', error);
          return next(new Error(error instanceof Error ? error.message : 'Ticket validation failed'));
        }
      }

      // Fallback: JWT Token authentication (legacy support)
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('No authentication credentials provided'));
      }

      // Verify SUPABASE_URL before proceeding
      if (!validatedEnv.SUPABASE_URL) {
        return next(new Error('Supabase not configured on server'));
      }

      // Use shared token verifier with throttling
      const clientIP = socket.handshake.address || 'unknown';
      const rateLimitKey = `ws_connect:${clientIP}`;
      
      try {
        const verificationResult = await verifyJWTTokenWithRole(token, rateLimitKey);
        
        socket.data.userId = verificationResult.userId;
        socket.data.user = {
          id: verificationResult.userId,
          email: verificationResult.email,
          role: verificationResult.role
        };
        
        logger.info(`WebSocket authenticated via JWT: ${verificationResult.userId}`);
        next();
      } catch (error) {
        if (error instanceof Error && error.message === 'Rate limit exceeded') {
          return next(new Error('Connection rate limit exceeded'));
        }
        return next(new Error('Invalid or expired token'));
      }
    } catch (error) {
      logger.error('WebSocket auth error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`User connected: ${socket.data.userId}`);

    socket.on('join-auction', (auctionId: string) => {
      socket.join(`auction-${auctionId}`);
      logger.info(`User ${socket.data.userId} joined auction ${auctionId}`);
    });

    socket.on('leave-auction', (auctionId: string) => {
      socket.leave(`auction-${auctionId}`);
      logger.info(`User ${socket.data.userId} left auction ${auctionId}`);
    });

    socket.on('place-bid', async (data: { auctionId: string; amount: number; isProxy?: boolean; maxBid?: number }) => {
      try {
        // Validate input data
        const validationResult = wsBidSchema.safeParse(data);
        if (!validationResult.success) {
          return socket.emit('bid-error', { 
            message: 'Invalid bid data',
            details: validationResult.error.errors.map(e => e.message)
          });
        }

        const { auctionId, amount, isProxy, maxBid } = validationResult.data;
        const userId = socket.data.userId;
        const role = socket.data.user?.role;

        if (!userId) {
          return socket.emit('bid-error', { message: 'Unauthorized' });
        }

        if (role !== 'USER_FULL_VERIFIED' && role !== 'ADMIN') {
          return socket.emit('bid-error', { message: 'Account not fully verified' });
        }

        // Rate limiting
        const rateLimitKey = `${userId}:${auctionId}`;
        if (!bidRateLimiter.isAllowed(rateLimitKey)) {
          return socket.emit('bid-error', {
            message: 'Too many bids. Please wait before placing another bid.'
          });
        }

        // Delegacja do zunifikowanej metody AuctionService.placeBid
        // Cała logika walidacji, transakcji, locking i cache jest tam
        const result = await auctionService.placeBid(
          auctionId,
          userId,
          amount,
          Boolean(isProxy),
          maxBid || null
        );

        logger.info(`Bid placed via WS: ${amount} by ${userId} on auction ${auctionId}`);

        // Sukces - Socket.IO event już został wysłany przez AuctionService
        // Nie trzeba duplikować emit('bid-placed') tutaj

      } catch (error: any) {
        logger.error('WS Bid error:', error);
        socket.emit('bid-error', {
          message: error.message || 'Failed to place bid.'
        });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.data.userId}`);
    });
  });
};
