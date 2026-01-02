import fs from 'fs/promises';

const body = await fs.readFile('signup.json','utf8');
const anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jdHZ3eGlxemJlZGdjbWV0eWFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0Nzk2NDUsImV4cCI6MjA4MjA1NTY0NX0.A3ie8bcvSZeXclTKgMyh5L3uz_LPTjlHz95isEQ3kJQ';

try{
  const res = await fetch('https://nctvwxiqzbedgcmetyal.supabase.co/auth/v1/signup', {
    method:'POST',
    headers: {
      'apikey': anon,
      'Authorization': `Bearer ${anon}`,
      'Content-Type': 'application/json'
    },
    body
  });
  const text = await res.text();
  console.log('status', res.status);
  console.log('body', text);
}catch(e){ console.error(e); }
