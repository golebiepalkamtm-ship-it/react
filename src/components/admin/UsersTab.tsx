import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface UserItem {
    id: string;
    email?: string;
    name?: string;
    role?: string;
    createdAt?: string;
    created_at?: string;
    is_blocked?: boolean;
    is_banned?: boolean;
    blocked_until?: string | null;
    banned_until?: string | null;
  }

function UserRow({
    user,
    onDelete,
    onResetPassword,
    onSave,
  }: {
    user: UserItem;
    onDelete: (id: string) => Promise<boolean>;
    onResetPassword: (id: string, pw: string) => Promise<boolean>;
    onSave: (id: string, patch: Partial<UserItem>) => Promise<boolean>;
  }) {
    const [editing, setEditing] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [isBlocked, setIsBlocked] = useState(Boolean(user.is_blocked));
    const [isBanned, setIsBanned] = useState(Boolean(user.is_banned));
    const [busy, setBusy] = useState(false);
  
    return (
      <div className="p-3 border rounded">
        {!editing ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">{user.name || user.email || user.id}</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
              <div className="text-xs text-muted-foreground">
                Rola: {user.role}
                {user.is_banned ? ' • BAN' : user.is_blocked ? ' • BLOKADA' : ''}
              </div>
              {(user.created_at || user.createdAt) && (
                <div className="text-xs text-muted-foreground">
                  Utworzono: {new Date(user.created_at || user.createdAt || '').toLocaleString('pl-PL')}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditing(true)} disabled={busy}>Edytuj</Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive" disabled={busy}>Usuń</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Usunąć użytkownika?</AlertDialogTitle>
                    <AlertDialogDescription>
                      To działanie jest nieodwracalne.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Anuluj</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={async () => {
                        setBusy(true);
                        await onDelete(user.id);
                        setBusy(false);
                      }}
                    >
                      Usuń
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ) : (
          <form
            className="space-y-2"
            onSubmit={async (e) => {
              e.preventDefault();
              if (busy) return;
              setBusy(true);
              const formData = new FormData(e.currentTarget);
              const role = String(formData.get('role') ?? user.role ?? '');
              const ok = await onSave(user.id, { role, is_blocked: isBlocked, is_banned: isBanned });
              setBusy(false);
              if (ok) setEditing(false);
            }}
          >
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" checked={isBlocked} onChange={(e) => setIsBlocked(e.target.checked)} />
                Blokada
              </label>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" checked={isBanned} onChange={(e) => setIsBanned(e.target.checked)} />
                Ban
              </label>
              <select name="role" title="Rola" aria-label="Rola" className="px-2 py-1 bg-white/5 border border-white/10 rounded" defaultValue={user.role ?? ''}>
                <option value="USER_REGISTERED">USER_REGISTERED</option>
                <option value="USER_EMAIL_VERIFIED">USER_EMAIL_VERIFIED</option>
                <option value="USER_FULL_VERIFIED">USER_FULL_VERIFIED</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nowe hasło"
              />
              <Button
                type="button"
                onClick={async () => {
                  if (busy) return;
                  if (!newPassword.trim()) return;
                  setBusy(true);
                  const ok = await onResetPassword(user.id, newPassword.trim());
                  setBusy(false);
                  if (ok) setNewPassword('');
                }}
                variant="outline"
                disabled={busy || !newPassword.trim()}
              >
                Resetuj hasło
              </Button>
            </div>
            <div className="flex gap-2 mt-4">
              <Button type="submit" disabled={busy}>Zapisz</Button>
              <Button type="button" variant="outline" onClick={() => setEditing(false)} disabled={busy}>Anuluj</Button>
            </div>
          </form>
        )}
      </div>
    );
  }

interface UsersTabProps {
    users: UserItem[];
    loading: boolean;
    updateUser: (id: string, patch: Partial<UserItem>) => Promise<boolean>;
    deleteUser: (id: string) => Promise<boolean>;
    resetUserPassword: (id: string, pw: string) => Promise<boolean>;
}

export const UsersTab: React.FC<UsersTabProps> = ({ users, loading, updateUser, deleteUser, resetUserPassword }) => {
    const [query, setQuery] = useState('');
    const filtered = useMemo(() => {
      const q = query.trim().toLowerCase();
      if (!q) return users;
      return users.filter((u) => {
        const hay = `${u.id} ${u.email ?? ''} ${u.name ?? ''} ${u.role ?? ''}`.toLowerCase();
        return hay.includes(q);
      });
    }, [query, users]);

    return (
        <section className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
              <h2 className="font-medium">Użytkownicy</h2>
              <div className="w-full md:w-80">
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Szukaj (email, nazwa, ID, rola)" />
              </div>
            </div>
            {loading ? (
                <div>Ładowanie...</div>
            ) : (
                <div className="space-y-2">
                {filtered.map((u) => (
                    <UserRow
                    key={u.id}
                    user={u}
                    onDelete={deleteUser}
                    onResetPassword={resetUserPassword}
                    onSave={updateUser}
                    />
                ))}
                {filtered.length === 0 && <div className="text-sm text-muted-foreground p-3 border rounded">Brak wyników.</div>}
                </div>
            )}
        </section>
    );
};
