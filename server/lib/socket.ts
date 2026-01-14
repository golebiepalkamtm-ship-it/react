import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: SocketIOServer | null = null;

export const initSocket = (server: HttpServer, allowedOrigins: string[]) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, etc.)
        if (!origin) return callback(null, true);
        
        // Check against allowed origins
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        
        // Log blocked WebSocket origins for security monitoring
        console.warn(`WebSocket CORS blocked origin: ${origin}`);
        return callback(new Error('WebSocket CORS policy: origin not allowed'), false);
      },
      credentials: true,
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling'],
    // Security settings
    allowEIO3: false, // Disable Engine.IO protocol v3 for better security
    maxHttpBufferSize: 1e6, // 1MB max message size
    pingTimeout: 60000, // 60 seconds
    pingInterval: 25000, // 25 seconds
    // Rate limiting
    connectTimeout: 45000, // 45 seconds connection timeout
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};
