import express from 'express';

const router = express.Router();

// Placeholder upload route
router.post('/', (req, res) => {
  res.status(200).json({ message: 'Upload placeholder' });
});

export default router;
