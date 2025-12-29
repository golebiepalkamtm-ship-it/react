import React, { useEffect, useState } from 'react';
import { logger } from '@/lib/logger';
import { useAuth } from '@/contexts/AuthContext';

interface UserItem {
  id: string;
  email?: string;
  name?: string;
  role?: string;
  createdAt?: string;
}

const AdminPage: React.FC = () => {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profile || profile.role !== 'ADMIN') return;
    fetchData();
    fetchStats();
  }, [profile]);

  async function fetchData() {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/users');
      if (!r.ok) throw new Error('Failed to load users');
      const j = await r.json();
      setUsers(j.users || []);
    } catch (e) {
      logger.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    try {
      const r = await fetch('/api/admin/stats');
      if (!r.ok) return;
      const j = await r.json();
      setStats(j);
    } catch (e) {
      logger.error(e);
    }
  }

  async function updateRole(id: string, role: string) {
    try {
      const r = await fetch(`/api/admin/users/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role }) });
      if (!r.ok) throw new Error('Failed');
      await fetchData();
    } catch (e) {
      logger.error(e);
    }
  }

  async function deleteUser(id: string) {
    if (!confirm('Na pewno usunąć użytkownika? (This will attempt to delete auth record and profile)')) return;
    try {
      const r = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (!r.ok) throw new Error('Failed');
      await fetchData();
    } catch (e) {
      console.error(e);
    }
  }

  if (!profile) return <div className="container mx-auto p-8">Ładowanie...</div>;
  if (profile.role !== 'ADMIN') return <div className="container mx-auto p-8">Dostęp zabroniony</div>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="font-display text-4xl md:text-5xl text-foreground font-bold leading-tight mb-4">Panel administratora</h1>

      <section className="mb-6">
        <h2 className="font-medium">Statystyki</h2>
        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
          <div>Auctions: {stats?.auctionsCount ?? 'n/a'}</div>
          <div>Users: {stats?.usersCount ?? 'service key not configured'}</div>
        </div>
      </section>

      <section>
        <h2 className="font-medium mb-2">Użytkownicy</h2>
        {loading ? (
          <div>Ładowanie...</div>
        ) : (
          <div className="space-y-2">
            {users.map(u => (
              <div key={u.id} className="p-3 border rounded flex items-center justify-between">
                <div>
                  <div className="font-semibold">{u.name || u.email || u.id}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                  <div className="text-xs text-muted-foreground">Rola: {u.role}</div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-yellow-400 text-black rounded" onClick={() => updateRole(u.id, 'USER_REGISTERED')}>User</button>
                  <button className="px-3 py-1 bg-blue-500 text-white rounded" onClick={() => updateRole(u.id, 'USER_FULL_VERIFIED')}>Full</button>
                  <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={() => updateRole(u.id, 'ADMIN')}>Admin</button>
                  <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={() => deleteUser(u.id)}>Usuń</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminPage;
