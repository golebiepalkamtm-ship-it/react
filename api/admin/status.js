import { verifyAdmin } from './_auth.js';

export default async function handler(req, res) {
  try {
    await verifyAdmin(req);
    return res.status(200).json({ message: 'API online' });
  } catch (err) {
    const status = err?.status || 500;
    console.error('status error', err);
    return res.status(status).json({ error: err.message || 'Server error' });
  }
}
