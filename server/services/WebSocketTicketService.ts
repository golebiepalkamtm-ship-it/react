import { randomBytes } from 'crypto';
import { cache } from '../lib/cache.js';

/**
 * WebSocket Ticket Service
 * Implements ticket-based authentication for WebSocket connections
 * to prevent CSRF/CSWSH attacks.
 * 
 * Security Pattern:
 * 1. Client requests ticket via authenticated HTTP endpoint
 * 2. Server generates single-use short-lived ticket
 * 3. Client uses ticket in WebSocket handshake
 * 4. Server validates and consumes ticket (one-time use)
 */

interface WebSocketTicket {
  userId: string;
  email?: string;
  role?: string;
  createdAt: number;
  consumed: boolean;
}

class WebSocketTicketService {
  private static instance: WebSocketTicketService;
  private readonly TICKET_TTL = 30 * 1000; // 30 seconds
  private readonly TICKET_PREFIX = 'ws_ticket:';

  private constructor() {}

  static getInstance(): WebSocketTicketService {
    if (!WebSocketTicketService.instance) {
      WebSocketTicketService.instance = new WebSocketTicketService();
    }
    return WebSocketTicketService.instance;
  }

  /**
   * Generate a single-use ticket for WebSocket authentication
   * @param userId - User ID from authenticated session
   * @param email - User email (optional)
   * @param role - User role (optional)
   * @returns Ticket string to be used in WebSocket handshake
   */
  generateTicket(userId: string, email?: string, role?: string): string {
    const ticketId = randomBytes(32).toString('base64url');
    const ticket: WebSocketTicket = {
      userId,
      email,
      role,
      createdAt: Date.now(),
      consumed: false
    };

    // Store ticket with TTL
    cache.set(`${this.TICKET_PREFIX}${ticketId}`, ticket, this.TICKET_TTL);

    return ticketId;
  }

  /**
   * Validate and consume a ticket (one-time use)
   * @param ticketId - Ticket ID from WebSocket handshake
   * @returns Ticket data if valid, null otherwise
   * @throws Error if ticket is invalid, expired, or already consumed
   */
  validateAndConsumeTicket(ticketId: string): WebSocketTicket | null {
    if (!ticketId || typeof ticketId !== 'string') {
      throw new Error('Invalid ticket format');
    }

    const cacheKey = `${this.TICKET_PREFIX}${ticketId}`;
    const ticket = cache.get<WebSocketTicket>(cacheKey);

    if (!ticket) {
      throw new Error('Invalid or expired ticket');
    }

    if (ticket.consumed) {
      throw new Error('Ticket already consumed');
    }

    // Check expiration
    const now = Date.now();
    if (now - ticket.createdAt > this.TICKET_TTL) {
      cache.delete(cacheKey);
      throw new Error('Ticket expired');
    }

    // Mark as consumed and delete from cache (single-use)
    cache.delete(cacheKey);

    return ticket;
  }

  /**
   * Invalidate all tickets for a user (e.g., on logout)
   * Note: This is a simplified implementation. In production with Redis,
   * you'd maintain a user->tickets index for efficient invalidation.
   */
  invalidateUserTickets(userId: string): void {
    // In production, maintain a reverse index: userId -> [ticketIds]
    // For now, tickets will naturally expire after TTL
    console.log(`Invalidating tickets for user ${userId} (will expire naturally)`);
  }
}

export const wsTicketService = WebSocketTicketService.getInstance();
export default WebSocketTicketService;
