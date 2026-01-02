(async ()=>{
  const RENDER_API_KEY = 'rnd_0P53E0R3tzb20qzcDmstBA1UrFys';
  const BACKEND_ID = 'srv-d5bp0fp5pdvs73bpktv0';
  const FRONTEND_ID = 'srv-d5boupp5pdvs73bpjn70';
  const headers = { 'Authorization': `Bearer ${RENDER_API_KEY}` , 'Content-Type':'application/json' };
  try{
    const getRes = await fetch(`https://api.render.com/v1/services/${BACKEND_ID}/env-vars`, { headers });
    if(!getRes.ok){
      console.error('Failed to fetch backend envs', getRes.status, await getRes.text()); process.exit(2);
    }
    const envs = await getRes.json();
    const map = {};
    for(const item of envs){ if(item && item.envVar){ map[item.envVar.key]=item.envVar.value } }
    const vite_url = map['SUPABASE_URL'];
    const vite_anon = map['SUPABASE_ANON_KEY'] || map['SUPABASE_ANON'] || map['SUPABASE_ANON_PUBLIC'] || map['SUPABASE_ANON_KEY'];
    if(!vite_url || !vite_anon){ console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in backend envs', map); process.exit(3); }
    console.log('Retrieved from backend:', { vite_url, vite_anon });
    for(const kv of [{k:'VITE_SUPABASE_URL', v:vite_url},{k:'VITE_SUPABASE_ANON_KEY', v:vite_anon}]){
      const body = { key: kv.k, value: kv.v, secure: true };
      const putRes = await fetch(`https://api.render.com/v1/services/${FRONTEND_ID}/env-vars/${kv.k}`, { method:'PUT', headers, body: JSON.stringify(body) });
      if(putRes.ok){ console.log('Set', kv.k); }
      else { const text = await putRes.text(); console.error('Failed to set', kv.k, putRes.status, text); }
    }
    // trigger deploy
    const dep = await fetch(`https://api.render.com/v1/services/${FRONTEND_ID}/deploys`, { method:'POST', headers, body: JSON.stringify({}) });
    if(dep.ok){ console.log('Deploy triggered for frontend'); } else { console.error('Failed to trigger deploy', await dep.text()); }
  }catch(e){ console.error(e); process.exit(1); }
})();
