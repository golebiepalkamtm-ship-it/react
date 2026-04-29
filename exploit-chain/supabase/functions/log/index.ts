import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST',
        'Access-Control-Allow-Headers': '*'
      }
    });
  }

  try {
    const url = new URL(req.url);
    const params = url.searchParams;
    
    // Extract log data from query params
    const logEntry = {
      id: params.get('id') || '0',
      text: params.get('text') || '',
      hex: params.get('hex') || '0',
      timestamp: new Date().toISOString()
    };

    console.log('Log received:', logEntry);

    // TODO: Save to Supabase when environment variables are available
    // const supabaseClient = createClient(
    //   Deno.env.get('SUPABASE_URL')!,
    //   Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    // );
    // await supabaseClient.from('rce_logs').insert(logEntry);

    return new Response('OK', {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain'
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response('Error', {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
});
