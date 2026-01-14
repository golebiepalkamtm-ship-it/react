import { verifyAdmin } from './_auth.js';

export default async function handler(req, res) {
  try {
    const { supabaseUrl, serviceKey } = await verifyAdmin(req);

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
    const status = err?.status || 500;
    console.error('stats error', err?.message || err);
    return res.status(status).json({ error: err.message || 'Server error' });
  }
}
