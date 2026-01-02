import React, { useMemo, useState } from 'react';
import { Quote, Trash2, CheckCircle, XCircle, Loader2, Plus, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AdminReference {
  id: string;
  breederName: string;
  testimonial: string;
  isApproved: boolean;
  rating?: number;
  location?: string;
}

interface ReferencesTabProps {
  references: AdminReference[];
  loading: boolean;
  onRefresh: () => void;
  onCreate: (payload: any) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onUpdate: (id: string, patch: Partial<AdminReference>) => Promise<boolean>;
}

export const ReferencesTab: React.FC<ReferencesTabProps> = ({ 
  references, loading, onCreate, onDelete, onUpdate
}) => {
  const [query, setQuery] = useState('');
  const [showOnlyPending, setShowOnlyPending] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return references
      .filter((r) => (showOnlyPending ? !r.isApproved : true))
      .filter((r) => {
        if (!q) return true;
        const hay = `${r.id} ${r.breederName ?? ''} ${r.location ?? ''} ${r.testimonial ?? ''}`.toLowerCase();
        return hay.includes(q);
      });
  }, [query, references, showOnlyPending]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Quote className="text-purple-500" /> Zarządzanie Referencjami
        </h2>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-muted-foreground select-none">
            <input
              type="checkbox"
              checked={showOnlyPending}
              onChange={(e) => setShowOnlyPending(e.target.checked)}
            />
            Tylko oczekujące
          </label>
          <Button onClick={() => setIsAdding(true)} size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> Dodaj Referencję
          </Button>
        </div>
      </div>

      {isAdding && (
        <ReferenceForm 
          onCancel={() => setIsAdding(false)} 
          onSubmit={async (val: any) => { 
            const ok = await onCreate(val); 
            if (ok) setIsAdding(false); 
          }} 
        />
      )}

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Szukaj (imię, lokalizacja, treść)" />
          <div className="grid grid-cols-1 gap-4">
          {filtered.map(r => (
            <div key={r.id} className="bg-white/5 border border-white/10 p-4 rounded-xl">
              {editingId === r.id ? (
                <ReferenceForm 
                  initialData={r} 
                  onCancel={() => setEditingId(null)} 
                  onSubmit={async (val: any) => { 
                    const ok = await onUpdate(r.id, val); 
                    if (ok) setEditingId(null); 
                  }} 
                />
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold">{r.breederName}</h3>
                      {r.isApproved ? (
                        <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30 flex items-center gap-1">
                          <CheckCircle className="w-2 h-2" /> Zatwierdzona
                        </span>
                      ) : (
                        <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-500/30 flex items-center gap-1">
                          <XCircle className="w-2 h-2" /> Oczekująca
                        </span>
                      )}
                    </div>
                    <p className="text-sm italic text-muted-foreground">"{r.testimonial}"</p>
                    <div className="text-xs text-muted-foreground mt-2">
                      Ocena: {r.rating || 5}/5 • {r.location || 'Brak lokalizacji'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={r.isApproved ? "outline" : "gold"}
                      onClick={() => onUpdate(r.id, { isApproved: !r.isApproved })}
                      className="gap-2"
                    >
                      {r.isApproved ? 'Cofnij' : 'Zatwierdź'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setEditingId(r.id)} className="gap-2">
                      <Edit2 className="w-4 h-4" /> Edytuj
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => {
                      if (confirm('Czy na pewno chcesz usunąć tę referencję?')) {
                        onDelete(r.id);
                      }
                    }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
          </div>
          {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Brak referencji do wyświetlenia.</p>}
        </div>
      )}
    </div>
  );
};

const ReferenceForm = ({ initialData, onSubmit, onCancel }: any) => {
  const [loading, setLoading] = useState(false);

  return (
    <form className="w-full space-y-3 p-4 bg-white/5 rounded-lg border border-white/10" onSubmit={async (e) => {
      e.preventDefault();
      setLoading(true);
      const fd = new FormData(e.currentTarget);
      
      const payload: any = {
        breederName: fd.get('breederName'),
        location: fd.get('location'),
        rating: Number(fd.get('rating')),
        testimonial: fd.get('testimonial'),
        isApproved: initialData ? initialData.isApproved : true
      };

      await onSubmit(payload);
      setLoading(false);
    }}>
      <h3 className="text-sm font-bold text-purple-400 mb-2">{initialData ? 'Edytuj Referencję' : 'Dodaj Nową Referencję'}</h3>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Hodowca</label>
          <input name="breederName" placeholder="Imię i nazwisko" defaultValue={initialData?.breederName} className="w-full bg-black/20 border border-white/10 rounded px-3 py-1 text-sm" required />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Lokalizacja</label>
          <input name="location" placeholder="Miejscowość" defaultValue={initialData?.location} className="w-full bg-black/20 border border-white/10 rounded px-3 py-1 text-sm" />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Ocena (1-5)</label>
        <input name="rating" type="number" min="1" max="5" defaultValue={initialData?.rating || 5} className="w-full bg-black/20 border border-white/10 rounded px-3 py-1 text-sm" required title="Ocena (1-5)" />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Treść referencji</label>
        <textarea name="testimonial" placeholder="Opinia hodowcy..." defaultValue={initialData?.testimonial} className="w-full bg-black/20 border border-white/10 rounded px-3 py-1 text-sm h-24" required />
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Anuluj</Button>
        <Button type="submit" size="sm" disabled={loading}>{loading ? 'Zapisywanie...' : 'Zapisz'}</Button>
      </div>
    </form>
  );
};
