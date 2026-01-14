const getSupabaseConfig = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !serviceKey) {
    const error = new Error('Service key not configured');
    error.status = 500;
    throw error;
  }
  return { supabaseUrl, serviceKey };
};

export const verifyAdmin = async (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader) {
    const error = new Error('No token provided');
    error.status = 401;
    throw error;
  }
  const token = authHeader.replace('Bearer ', '');
  const { supabaseUrl, serviceKey } = getSupabaseConfig();

  const uRes = await fetch(`${supabaseUrl}/auth/v1/user`, { headers: { Authorization: `Bearer ${token}`, apikey: serviceKey } });
  if (!uRes.ok) {
    const error = new Error('Invalid token');
    error.status = 401;
    throw error;
  }
  const user = await uRes.json();
  const r = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${user.id}&select=role`, { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } });
  if (!r.ok) {
    const error = new Error('Failed to verify role');
    error.status = 403;
    throw error;
  }
  const roles = await r.json();
  if (!roles?.[0] || roles[0].role !== 'ADMIN') {
    const error = new Error('Admin required');
    error.status = 403;
    throw error;
  }

  return { supabaseUrl, serviceKey, user };
};

export const validateUuid = (value) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value || '');
};
