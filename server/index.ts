import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { setupWebSocket } from './websocket/bidding.ts';
import app from './app.ts';

dotenv.config();

const server = createServer(app);
setupWebSocket(server);

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});