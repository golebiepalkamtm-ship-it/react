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

    // get auctions count from local data if exists
    let auctionsCount = null;
    try {
      const raw = await fetch('http://localhost/data/auctions.json').then(r=>r.text()).catch(()=>null);
      if (raw) {
        const parsed = JSON.parse(raw);
        auctionsCount = Array.isArray(parsed.auctions) ? parsed.auctions.length : null;
      }
    } catch (e) {
      auctionsCount = null;
    }

    let usersCount = null;
    const uResp = await fetch(`${supabaseUrl}/rest/v1/users?select=id`, { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } });
    if (uResp.ok) {
      const users = await uResp.json();
      usersCount = Array.isArray(users) ? users.length : null;
    }

    return res.json({ auctionsCount, usersCount });
  } catch (err) {
    console.error('stats error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
