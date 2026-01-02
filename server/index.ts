import { createServer } from 'http';
import dotenv from 'dotenv';
import { setupWebSocket } from './websocket/bidding.js';
import app from './app.js';

dotenv.config();

const server = createServer(app);
const io = setupWebSocket(server);
app.set('io', io);

const INITIAL_PORT = Number(process.env.PORT) || 8000;

const tryListen = (port: number) => {
  server.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📊 Health check: http://localhost:${port}/health`);
  });
};

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    const nextPort = (Number(process.env.PORT) || INITIAL_PORT) + 1;
    process.env.PORT = String(nextPort);
    console.warn(`⚠️ Port in use. Retrying on port ${nextPort}...`);
    setTimeout(() => tryListen(nextPort), 200);
    return;
  }
  throw err;
});

tryListen(INITIAL_PORT);
