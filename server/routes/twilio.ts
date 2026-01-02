import express from 'express';

const router = express.Router();

// Simple inbound SMS webhook for Twilio
router.post('/incoming', (req, res) => {
  try {
    const from = (req.body && req.body.From) || req.query.From || '';
    const body = (req.body && req.body.Body) || req.query.Body || '';

    console.log('[Twilio] inbound SMS from:', from, 'body:', body);

    // Respond with simple TwiML acknowledgement
    const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>Thanks! We received your message.</Message></Response>`;
    res.header('Content-Type', 'text/xml');
    res.status(200).send(twiml);
  } catch (err) {
    console.error('Twilio webhook error', err);
    res.status(500).send('Server error');
  }
});

// Health check for the webhook
router.get('/ping', (_req, res) => {
  res.json({ ok: true, webhook: 'twilio' });
});

export default router;
