import { supabase } from '@/lib/supabase';

export async function debugAuthState() {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  console.group('🔐 Auth Debug Info');
  console.log('Session exists:', !!session);
  console.log('Access token:', session?.access_token ? `${session.access_token.substring(0, 20)}...` : 'NONE');
  console.log('Token expires at:', session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'N/A');
  console.log('User ID:', session?.user?.id);
  console.log('User email:', session?.user?.email);
  console.log('User role (metadata):', (session?.user as any)?.app_metadata?.role);
  console.log('Error:', error);
  console.groupEnd();
  
  return { session, error };
}
