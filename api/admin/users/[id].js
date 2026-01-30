import { validateUuid, verifyAdmin } from '../_auth.js';

export default async function handler(req, res) {
  try {
    const { supabaseUrl, serviceKey } = await verifyAdmin(req);

    const id = req.query.id || req.query?.['id'] || (req.url && req.url.split('/').pop());
    if (!validateUuid(id)) return res.status(400).json({ error: 'Invalid user id' });

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const body = req.body || (await new Promise((r) => { let data=''; req.on('data',c=>data+=c); req.on('end',()=>r(JSON.parse(data||'{}'))); }));
      const { password, ...profileBody } = body || {};

      // Update auth password if provided
      if (password) {
        const authUrl = `${supabaseUrl}/auth/v1/admin/users/${id}`;
        const authRes = await fetch(authUrl, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        });
        if (!authRes.ok) return res.status(authRes.status).json({ error: 'Failed to update password' });
      }

      let updatedUser = null;
      if (Object.keys(profileBody).length) {
        const url = `${supabaseUrl}/rest/v1/users?id=eq.${id}`;
        const resp = await fetch(url, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, 'Content-Type': 'application/json', Prefer: 'return=representation' },
          body: JSON.stringify(profileBody),
        });
        if (!resp.ok) return res.status(resp.status).json({ error: 'Failed to update user' });
        const updated = await resp.json();
        updatedUser = updated?.[0] ?? null;
      } else {
        // fetch current profile to return something consistent
        const url = `${supabaseUrl}/rest/v1/users?id=eq.${id}`;
        const resp = await fetch(url, { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } });
        if (resp.ok) {
          const current = await resp.json();
          updatedUser = current?.[0] ?? null;
        }
      }

      return res.json({ user: updatedUser });
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
