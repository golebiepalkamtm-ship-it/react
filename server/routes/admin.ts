import express from 'express';

const router = express.Router();

// Placeholder admin routes
router.get('/status', (req, res) => {
  res.status(200).json({ message: 'Admin status placeholder' });
});

export default router;
