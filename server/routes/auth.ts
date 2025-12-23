import express from 'express';

const router = express.Router();

// Placeholder auth routes
router.post('/login', (req, res) => {
  res.status(200).json({ message: 'Auth login placeholder' });
});

router.post('/register', (req, res) => {
  res.status(200).json({ message: 'Auth register placeholder' });
});

export default router;
