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

function AuctionRow({ auction, onDelete, onSave }: { auction: any; onDelete: () => Promise<boolean>; onSave: (patch: any) => Promise<boolean> }) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const endTimeValue =
    typeof auction.endTime === 'string'
      ? auction.endTime.replace('Z', '').slice(0, 16)
      : '';

  return (
    <div className="p-3 border rounded">
      {!editing ? (
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">{auction.title}</div>
            <div className="text-xs text-muted-foreground">ID: {auction.id}</div>
            <div className="text-xs text-muted-foreground">Cena: {auction.currentPrice}</div>
            <div className="text-xs text-muted-foreground">Status: {auction.status}</div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setEditing(true)} disabled={busy}>Edytuj</Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive" disabled={busy}>Usuń</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Usunąć aukcję?</AlertDialogTitle>
                  <AlertDialogDescription>
                    To działanie jest nieodwracalne.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Anuluj</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      setBusy(true);
                      await onDelete();
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
            const title = String(formData.get('title') ?? '');
            const status = String(formData.get('status') ?? '');
            const currentPrice = Number(formData.get('currentPrice'));
            const endTime = String(formData.get('endTime') ?? '');

            const ok = await onSave({
              title,
              status,
              currentPrice: Number.isFinite(currentPrice) ? currentPrice : auction.currentPrice,
              ...(endTime ? { endTime } : {}),
            });
            setBusy(false);
            if (ok) setEditing(false);
          }}
        >
          <Input name="title" title="Tytuł aukcji" placeholder="Tytuł aukcji" defaultValue={auction.title ?? ''} disabled={busy} />
          <Input name="currentPrice" type="number" title="Aktualna cena" placeholder="Aktualna cena" className="w-48" defaultValue={auction.currentPrice ?? 0} disabled={busy} />
          <select name="status" title="Status aukcji" aria-label="Status aukcji" className="px-2 py-1 bg-white/5 border border-white/10 rounded" defaultValue={auction.status ?? 'active'}>
            <option value="active">active</option>
            <option value="pending">pending</option>
            <option value="ended">ended</option>
          </select>
          <Input name="endTime" type="datetime-local" title="Czas zakończenia" className="w-64" defaultValue={endTimeValue} disabled={busy} />
          <div className="flex gap-2">
            <Button type="submit" disabled={busy}>Zapisz</Button>
            <Button type="button" variant="outline" onClick={() => setEditing(false)} disabled={busy}>Anuluj</Button>
          </div>
        </form>
      )}
    </div>
  );
}

interface AuctionsTabProps {
    auctions: any[];
    auctionsLoading: boolean;
    deleteAuction: (id: string) => Promise<boolean>;
    updateAuction: (id: string, patch: any) => Promise<boolean>;
}

export const AuctionsTab: React.FC<AuctionsTabProps> = ({ auctions, auctionsLoading, deleteAuction, updateAuction }) => {
    const [query, setQuery] = useState('');
    const filtered = useMemo(() => {
      const q = query.trim().toLowerCase();
      if (!q) return auctions;
      return auctions.filter((a) => {
        const hay = `${a?.id ?? ''} ${a?.title ?? ''} ${a?.status ?? ''}`.toLowerCase();
        return hay.includes(q);
      });
    }, [auctions, query]);

    return (
        <section className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
            <h2 className="font-medium">Aukcje</h2>
            <div className="w-full md:w-80">
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Szukaj (tytuł, ID, status)" />
            </div>
          </div>
          {auctionsLoading ? (
            <div>Ładowanie aukcji...</div>
          ) : (
            <div className="space-y-2">
              {filtered.map((a) => (
                <AuctionRow
                  key={a.id}
                  auction={a}
                  onDelete={() => deleteAuction(a.id)}
                  onSave={(patch: any) => updateAuction(a.id, patch)}
                />
              ))}
              {filtered.length === 0 && <div className="text-sm text-muted-foreground p-3 border rounded">Brak wyników.</div>}
            </div>
          )}
        </section>
    );
};
