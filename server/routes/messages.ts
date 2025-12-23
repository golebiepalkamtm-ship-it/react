import express from 'express';

const router = express.Router();

// Placeholder message routes
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Messages list placeholder' });
});

router.post('/', (req, res) => {
  res.status(200).json({ message: 'Message create placeholder' });
});

export default router;
