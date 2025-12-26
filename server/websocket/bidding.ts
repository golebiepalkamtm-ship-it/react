import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

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
      console.warn('Prisma client failed to initialize:', err);
      prisma = null;
    }
  })
  .catch((err) => {
    console.warn('Could not import @prisma/client or adapter. DB operations will be disabled:', err);
    prisma = null;
  });

function createPrismaMock() {
  return {
    auction: {
      findUnique: async () => null,
      update: async () => ({}),
    },
    bid: {
      create: async ({ data }: any) => ({ id: 'mock-bid', ...data }),
    },
  };
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

      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const apiKey = supabaseAnonKey || supabaseServiceKey;
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
      console.error('WebSocket auth error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.data.userId}`);

    socket.on('join-auction', (auctionId: string) => {
      socket.join(`auction-${auctionId}`);
      console.log(`User ${socket.data.userId} joined auction ${auctionId}`);
    });

    socket.on('leave-auction', (auctionId: string) => {
      socket.leave(`auction-${auctionId}`);
      console.log(`User ${socket.data.userId} left auction ${auctionId}`);
    });

    socket.on('place-bid', async (data: { auctionId: string; amount: number }) => {
      try {
        const { auctionId, amount } = data;
        const userId = socket.data.userId;

        // Validate auction
        const db = prisma || createPrismaMock();
        const auction = await db.auction.findUnique({
          where: { id: auctionId }
        });

        if (!auction) {
          return socket.emit('bid-error', { message: 'Auction not found' });
        }

        if (auction.status !== 'active' || new Date(auction.endTime) < new Date()) {
          return socket.emit('bid-error', { message: 'Auction is not active' });
        }

        if (amount <= auction.currentPrice) {
          return socket.emit('bid-error', { 
            message: 'Bid must be higher than current price' 
          });
        }

        // Create bid
        const bid = await db.bid.create({
          data: {
            amount,
            userId,
            auctionId
          },
        });

        // Update auction (noop for mock)
        await db.auction.update({
          where: { id: auctionId },
          data: { currentPrice: amount }
        });

        // Notify all users in auction room
        io.to(`auction-${auctionId}`).emit('bid-placed', {
          bid,
          newPrice: amount,
          auctionId
        });

        console.log(`Bid placed: ${amount} by ${userId} on auction ${auctionId}`);

      } catch (error) {
        console.error('Bid error:', error);
        socket.emit('bid-error', { 
          message: 'Failed to place bid. Please try again.' 
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.data.userId}`);
    });
  });

  return io;
};