
import express, { type Router } from 'express';

const router: Router = express.Router();

// Public endpoint to get current server time (ISO 8601)
// Used by clients to synchronize their clocks
router.get('/server-time', (req, res) => {
  res.json({
    iso: new Date().toISOString(),
    timestamp: Date.now()
  });
});

export default router;
