import express from 'express';

const router = express.Router();

// Placeholder user routes
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Users list placeholder' });
});

router.get('/:id', (req, res) => {
  res.status(200).json({ message: `User ${req.params.id} placeholder` });
});

export default router;
