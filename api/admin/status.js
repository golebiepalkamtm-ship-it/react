export default async function handler(req, res) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    if (!supabaseUrl || !serviceKey) return res.status(500).json({ error: 'Service key not configured' });

    // simple verify token and admin check
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });
    const token = authHeader.replace('Bearer ', '');

    // get user
    const uRes = await fetch(`${supabaseUrl}/auth/v1/user`, { headers: { Authorization: `Bearer ${token}`, apikey: serviceKey } });
    if (!uRes.ok) return res.status(401).json({ error: 'Invalid token' });
    const user = await uRes.json();

    // get role from users table
    const r = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${user.id}&select=role`, { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } });
    if (!r.ok) return res.status(403).json({ error: 'Failed to verify role' });
    const roles = await r.json();
    if (!roles?.[0] || roles[0].role !== 'ADMIN') return res.status(403).json({ error: 'Admin required' });

    return res.status(200).json({ message: 'API online' });
  } catch (err) {
    console.error('status error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
