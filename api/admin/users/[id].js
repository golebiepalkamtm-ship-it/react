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

    const id = req.query.id || req.query?.['id'] || (req.url && req.url.split('/').pop());

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const body = req.body || (await new Promise((r) => { let data=''; req.on('data',c=>data+=c); req.on('end',()=>r(JSON.parse(data||'{}'))); }));
      const url = `${supabaseUrl}/rest/v1/users?id=eq.${id}`;
      const resp = await fetch(url, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, 'Content-Type': 'application/json', Prefer: 'return=representation' },
        body: JSON.stringify(body),
      });
      if (!resp.ok) return res.status(resp.status).json({ error: 'Failed to update user' });
      const updated = await resp.json();
      return res.json({ user: updated?.[0] ?? null });
    }

    if (req.method === 'DELETE') {
      // delete auth user
      const authUrl = `${supabaseUrl}/auth/v1/admin/users/${id}`;
      const authRes = await fetch(authUrl, { method: 'DELETE', headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } });
      const url = `${supabaseUrl}/rest/v1/users?id=eq.${id}`;
      const r2 = await fetch(url, { method: 'DELETE', headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, Prefer: 'return=representation' } });
      if (!r2.ok) return res.status(r2.status).json({ error: 'Failed to delete user profile' });
      const deleted = await r2.json();
      return res.json({ deleted: deleted?.[0] ?? null });
    }

    res.setHeader('Allow', 'PUT, PATCH, DELETE');
    return res.status(405).end('Method Not Allowed');
  } catch (err) {
    console.error('user id error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
