import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import logger from './lib/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Meetings endpoint
app.get('/api/meetings', (req, res) => {
  try {
    const meetingsPath = join(__dirname, 'data', 'meetings.json');
    const meetingsData = readFileSync(meetingsPath, 'utf-8');
    const meetings = JSON.parse(meetingsData);
    res.json(meetings);
  } catch (error) {
    logger.error('Error loading meetings:', error);
    res.status(500).json({ error: 'Failed to load meetings data' });
  }
});

// Auctions endpoint
app.get('/api/auctions', (req, res) => {
  try {
    const auctionsPath = join(__dirname, 'data', 'auctions.json');
    const auctionsData = readFileSync(auctionsPath, 'utf-8');
    const auctions = JSON.parse(auctionsData);
    res.json(auctions);
  } catch (error) {
    logger.error('Error loading auctions:', error);
    res.status(500).json({ error: 'Failed to load auctions data' });
  }
});
app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/health`);
});
});
