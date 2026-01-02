import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { logger } from '@/lib/logger';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Users, Gavel, Trophy, Calendar, Quote, 
  TrendingUp, RefreshCw
} from 'lucide-react';

import { AuctionsTab } from '@/components/admin/AuctionsTab';
import { UsersTab } from '@/components/admin/UsersTab';
import { ChampionsTab } from '@/components/admin/ChampionsTab';
import { MeetingsTab } from '@/components/admin/MeetingsTab';
import { ReferencesTab } from '@/components/admin/ReferencesTab';

type AdminTab = 'auctions' | 'users' | 'champions' | 'meetings' | 'references';

const isAdminTab = (value: string | null): value is AdminTab =>
  value === 'auctions' || value === 'users' || value === 'champions' || value === 'meetings' || value === 'references';

const AdminPage: React.FC = () => {
  const { profile, session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<AdminTab>(() => {
    const tab = searchParams.get('tab');
    return isAdminTab(tab) ? tab : 'auctions';
  });
  const [stats, setStats] = useState<any>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authHeaders = useMemo(() => ({
    Authorization: `Bearer ${session?.access_token}`,
    'Content-Type': 'application/json'
  }), [session?.access_token]);

  const setTab = useCallback((tab: AdminTab) => {
    setActiveTab(tab);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const readResponseError = useCallback(async (r: Response) => {
    try {
      const contentType = r.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const j = await r.json().catch(() => null);
        const msg = j?.error || j?.message;
        if (typeof msg === 'string' && msg.trim()) return msg;
      }
      const t = await r.text().catch(() => '');
      return t?.trim() || `HTTP ${r.status}`;
    } catch {
      return `HTTP ${r.status}`;
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      if (!session?.access_token) return;
      setStatsLoading(true);
      const r = await fetch('/api/admin/stats', { headers: authHeaders });
      if (!r.ok) {
        setError(await readResponseError(r));
        return;
      }
      setStats(await r.json());
      setError(null);
    } catch (e) { logger.error(e); }
    finally { setStatsLoading(false); }
  }, [authHeaders, readResponseError, session?.access_token]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (!session?.access_token) return;
      const r = await fetch(`/api/admin/${activeTab}`, { headers: authHeaders });
      if (!r.ok) {
        setError(await readResponseError(r));
        setData([]);
        return;
      }
      const j = await r.json();
      setData(j[activeTab] || []);
      setError(null);
    } catch (e) { logger.error(e); }
    finally { setLoading(false); }
  }, [activeTab, authHeaders, readResponseError, session?.access_token]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (isAdminTab(tab) && tab !== activeTab) setActiveTab(tab);
  }, [activeTab, searchParams]);

  useEffect(() => {
    if (profile?.role === 'ADMIN') fetchStats();
  }, [fetchStats, profile?.role]);

  useEffect(() => {
    if (profile?.role === 'ADMIN') fetchData();
  }, [activeTab, fetchData, profile?.role]);

  const handleAction = async (method: string, url: string, body?: any, messages?: { ok?: string; fail?: string }) => {
    try {
      const r = await fetch(url, { method, headers: authHeaders, body: body ? JSON.stringify(body) : undefined });
      if (r.ok) {
        if (messages?.ok) toast.success(messages.ok);
        else if (method === 'DELETE') toast.success('Usunięto');
        else toast.success('Zapisano');
        fetchData(); 
        fetchStats(); 
        return true;
      }
      const msg = await readResponseError(r);
      toast.error(messages?.fail || msg || 'Operacja nieudana');
      return false;
    } catch (e) { 
      logger.error(e); 
      toast.error(messages?.fail || 'Operacja nieudana');
      return false;
    }
  };

  if (authLoading) return <div className="p-10 text-center">Ładowanie...</div>;

  if (!session?.access_token) {
    return (
      <div className="p-10 text-center space-y-4">
        <div className="text-lg font-semibold">Zaloguj się, aby wejść do panelu admina.</div>
        <Button onClick={() => navigate('/login')} variant="gold">Przejdź do logowania</Button>
      </div>
    );
  }

  if (profile?.role !== 'ADMIN') return <div className="p-10 text-center">Brak dostępu.</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Panel Administratora</h1>
          <p className="text-muted-foreground">Witaj, {profile?.name || profile?.email || 'Admin'}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { fetchStats(); fetchData(); }} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${(loading || statsLoading) ? 'animate-spin' : ''}`} /> Odśwież
        </Button>
      </div>

      {/* STATYSTYKI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Users className="text-blue-500" />} label="Użytkownicy" value={stats?.users?.total} />
        <StatCard icon={<Gavel className="text-gold" />} label="Aukcje" value={stats?.auctions?.active} />
        <StatCard icon={<Trophy className="text-green-500" />} label="Sprzedane" value={stats?.auctions?.sales?.soldCount} />
        <StatCard icon={<TrendingUp className="text-purple-500" />} label="Obroty" value={`${stats?.auctions?.sales?.totalAmount || 0} zł`} />
      </div>

      {error && (
        <div className="rounded-xl border border-border/50 bg-card/30 p-4 text-sm text-muted-foreground">
          {error}
        </div>
      )}

      {/* NAWIGACJA */}
      <div className="flex flex-wrap gap-2 bg-background/50 p-1 rounded-xl border border-border/50">
        <NavBtn active={activeTab === 'auctions'} onClick={() => setTab('auctions')} icon={<Gavel />} label="Aukcje" />
        <NavBtn active={activeTab === 'users'} onClick={() => setTab('users')} icon={<Users />} label="Użytkownicy" />
        <NavBtn active={activeTab === 'champions'} onClick={() => setTab('champions')} icon={<Trophy />} label="Czempiony" />
        <NavBtn active={activeTab === 'meetings'} onClick={() => setTab('meetings')} icon={<Calendar />} label="Spotkania" />
        <NavBtn active={activeTab === 'references'} onClick={() => setTab('references')} icon={<Quote />} label="Referencje" />
      </div>

      {/* TREŚĆ ZAKŁADEK */}
      <div className="bg-card/30 rounded-2xl border border-border/50 p-6 min-h-[500px]">
        {activeTab === 'auctions' && (
          <AuctionsTab 
            auctions={data} 
            auctionsLoading={loading} 
            deleteAuction={(id)=>handleAction('DELETE', `/api/admin/auctions/${id}`)} 
            updateAuction={(id,p)=>handleAction('PUT', `/api/admin/auctions/${id}`, p)} 
          />
        )}
        {activeTab === 'users' && (
          <UsersTab 
            users={data} 
            loading={loading} 
            updateUser={(id,p)=>handleAction('PUT', `/api/admin/users/${id}`, p, { ok: 'Zaktualizowano użytkownika' })} 
            deleteUser={(id)=>handleAction('DELETE', `/api/admin/users/${id}`, undefined, { ok: 'Usunięto użytkownika' })} 
            resetUserPassword={(id,p)=>handleAction('POST', `/api/admin/users/${id}/reset-password`, {password:p}, { ok: 'Zresetowano hasło' })} 
          />
        )}
        {activeTab === 'champions' && (
          <ChampionsTab 
            champions={data} 
            loading={loading} 
            onRefresh={fetchData} 
            onCreate={(p)=>handleAction('POST', '/api/admin/champions', p, { ok: 'Dodano czempiona' })} 
            onUpdate={(id,p)=>handleAction('PUT', `/api/admin/champions/${id}`, p, { ok: 'Zapisano czempiona' })} 
            onDelete={(id)=>handleAction('DELETE', `/api/admin/champions/${id}`, undefined, { ok: 'Usunięto czempiona' })} 
          />
        )}
        {activeTab === 'meetings' && (
          <MeetingsTab 
            meetings={data} 
            loading={loading} 
            onRefresh={fetchData} 
            onCreate={(p)=>handleAction('POST', '/api/admin/meetings', p, { ok: 'Dodano spotkanie' })} 
            onUpdate={(id,p)=>handleAction('PUT', `/api/admin/meetings/${id}`, p, { ok: 'Zapisano spotkanie' })} 
            onDelete={(id)=>handleAction('DELETE', `/api/admin/meetings/${id}`, undefined, { ok: 'Usunięto spotkanie' })} 
          />
        )}
        {activeTab === 'references' && (
          <ReferencesTab 
            references={data} 
            loading={loading} 
            onRefresh={fetchData} 
            onCreate={(p)=>handleAction('POST', '/api/admin/references', p, { ok: 'Dodano referencję' })} 
            onDelete={(id)=>handleAction('DELETE', `/api/admin/references/${id}`, undefined, { ok: 'Usunięto referencję' })} 
            onUpdate={(id,p)=>handleAction('PUT', `/api/admin/references/${id}`, p, { ok: 'Zapisano referencję' })} 
          />
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }: any) => (
  <div className="bg-card/50 backdrop-blur-md p-4 rounded-2xl border border-border/50 shadow-sm">
    <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">{icon} {label}</div>
    <div className="text-2xl font-bold">{value ?? '-'}</div>
  </div>
);

const NavBtn = ({ active, onClick, icon, label }: any) => (
  <Button variant={active ? "gold" : "ghost"} size="sm" onClick={onClick} className="rounded-lg gap-2">
    {React.cloneElement(icon as React.ReactElement, { className: "w-4 h-4" })} {label}
  </Button>
);

export default AdminPage;
