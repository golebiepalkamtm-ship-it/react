import { verifyAdmin } from '../_auth.js';

export default async function handler(req, res) {
  try {
    const { supabaseUrl, serviceKey } = await verifyAdmin(req);

    if (req.method === 'GET') {
      const page = parseInt(req.query.page || '1', 10);
      const perPage = parseInt(req.query.per_page || req.query.perPage || '100', 10);
      const offset = (page - 1) * perPage;
      const url = `${supabaseUrl}/rest/v1/users?select=*&order=createdAt.desc&limit=${perPage}&offset=${offset}`;
      const resp = await fetch(url, { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } });
      if (!resp.ok) return res.status(resp.status).json({ error: 'Failed to fetch users' });
      const users = await resp.json();
      return res.json({ users, page, perPage });
    }

    // not implemented
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  } catch (err) {
    console.error('users index error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
