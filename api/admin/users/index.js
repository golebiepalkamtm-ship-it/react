export default async function handler(req, res) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    if (!supabaseUrl || !serviceKey) return res.status(500).json({ error: 'Service key not configured' });

    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });
    const token = authHeader.replace('Bearer ', '');

    // verify admin
    const uRes = await fetch(`${supabaseUrl}/auth/v1/user`, { headers: { Authorization: `Bearer ${token}`, apikey: serviceKey } });
    if (!uRes.ok) return res.status(401).json({ error: 'Invalid token' });
    const user = await uRes.json();
    const r = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${user.id}&select=role`, { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } });
    if (!r.ok) return res.status(403).json({ error: 'Failed to verify role' });
    const roles = await r.json();
    if (!roles?.[0] || roles[0].role !== 'ADMIN') return res.status(403).json({ error: 'Admin required' });

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
