import './env.js'; // Must be first
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupWebSocketEvents } from './websocket/bidding.js';
import { initSocket } from './lib/socket.js';
import app, { allowedOrigins } from './app.js';
import { initializeAuth } from './middleware/auth.js';

// Initialize auth system
initializeAuth();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = createServer(app);
const io = initSocket(server, allowedOrigins());
setupWebSocketEvents(io);

const findAvailablePort = (startPort: number, attempts = 0): Promise<number> => {
  const MAX_ATTEMPTS = 20;
  return new Promise((resolve, reject) => {
    if (attempts >= MAX_ATTEMPTS) {
      return reject(new Error(`No free port found after ${MAX_ATTEMPTS} attempts starting from ${startPort - attempts}`));
    }

    const testServer = createServer();
    testServer.listen(startPort, () => {
      testServer.close(() => {
        resolve(startPort);
      });
    });
    testServer.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        resolve(findAvailablePort(startPort + 1, attempts + 1));
      } else {
        reject(err);
      }
    });
  });
};

const PORT = Number(process.env.PORT) || 8001;
const isProdStaticPort = process.env.NODE_ENV === 'production' && process.env.FORCE_DYNAMIC_PORT !== 'true';

const startServer = (listenPort: number) => {
  server.listen(listenPort, () => {
    console.log(`🚀 Backend server running on port ${listenPort}`);
    console.log(`📊 Health check: http://localhost:${listenPort}/health`);
    console.log(`📡 API endpoint: http://localhost:${listenPort}/api`);
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${listenPort} is already in use!`);
      if (isProdStaticPort) {
        process.exit(1);
      } else {
        findAvailablePort(listenPort + 1)
          .then((fallbackPort) => {
            console.log(`↪️  Retrying on free port ${fallbackPort}`);
            startServer(fallbackPort);
          })
          .catch((findErr) => {
            console.error('Failed to find available fallback port:', findErr);
            process.exit(1);
          });
      }
    } else {
      throw err;
    }
  });
};

if (isProdStaticPort) {
  startServer(PORT);
} else {
  findAvailablePort(PORT)
    .then((availablePort) => startServer(availablePort))
    .catch((err) => {
      console.error('Failed to find available port:', err);
      process.exit(1);
    });
}
