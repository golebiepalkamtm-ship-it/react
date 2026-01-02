import React, { useState } from 'react';
import { Trophy, Plus, Trash2, Edit2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminChampion {
  id: string;
  manifest: {
    id: number;
    image: string;
    pedigree?: string;
  };
  data: {
    name: string;
    category: string;
    achievements: string;
    year: number;
  };
  galleryFiles: string[];
  pedigreeFiles: string[];
}

interface ChampionsTabProps {
  champions: AdminChampion[];
  loading: boolean;
  onRefresh: () => void;
  onCreate: (payload: any) => Promise<boolean>;
  onUpdate: (id: string, payload: any) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export const ChampionsTab: React.FC<ChampionsTabProps> = ({ 
  champions, loading, onCreate, onUpdate, onDelete 
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Trophy className="text-gold" /> Zarządzanie Czempionami
        </h2>
        <Button onClick={() => setIsAdding(true)} size="sm" className="gap-2">
          <Plus className="w-4 h-4" /> Dodaj Czempiona
        </Button>
      </div>

      {isAdding && (
        <ChampionForm 
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {champions.map(c => (
            <div key={c.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col gap-4">
              {editingId === c.id ? (
                <ChampionForm 
                  initialData={c} 
                  onCancel={() => setEditingId(null)} 
                  onSubmit={async (val: any) => { 
                    const ok = await onUpdate(c.id, val); 
                    if (ok) setEditingId(null); 
                  }} 
                />
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      {c.manifest.image && (
                        <img 
                          src={`/champions/${c.id}/gallery/${c.manifest.image}`} 
                          alt={c.data?.name} 
                          className="w-20 h-20 object-cover rounded-lg border border-white/10"
                        />
                      )}
                      <div>
                        <h3 className="font-bold text-lg">{c.data?.name || 'Bez nazwy'} ({c.data?.year || '-'})</h3>
                        <p className="text-sm text-gold">{c.data?.category}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.data?.achievements}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingId(c.id)} className="gap-2">
                        <Edit2 className="w-4 h-4" /> Edytuj
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500" onClick={() => onDelete(c.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
          {champions.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              Brak czempionów w galerii.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ChampionForm = ({ initialData, onSubmit, onCancel }: any) => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const fileToBase64 = (file: File): Promise<{ fileName: string; dataUrl: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve({ fileName: file.name, dataUrl: reader.result as string });
      reader.onerror = error => reject(error);
    });
  };

  return (
    <form className="w-full space-y-3 p-4 bg-white/5 rounded-lg border border-white/10" onSubmit={async (e) => {
      e.preventDefault();
      setLoading(true);
      const fd = new FormData(e.currentTarget);
      
      const payload: any = {
        data: {
          name: fd.get('name'),
          category: fd.get('category'),
          year: Number(fd.get('year')),
          achievements: fd.get('achievements'),
        }
      };

      const fileInput = (e.currentTarget as HTMLFormElement).querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput?.files?.length) {
        const fileData = await fileToBase64(fileInput.files[0]);
        if (initialData) {
          payload.addGalleryImages = [fileData];
          payload.setPrimaryImage = fileData.fileName;
        } else {
          payload.primaryImage = fileData;
        }
      }

      await onSubmit(payload);
      setLoading(false);
    }}>
      <h3 className="text-sm font-bold text-gold mb-2">{initialData ? 'Edytuj Czempiona' : 'Dodaj Nowego Czempiona'}</h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Nazwa</label>
          <input name="name" placeholder="Imię/Nazwa" defaultValue={initialData?.data?.name} className="w-full bg-black/20 border border-white/10 rounded px-3 py-1 text-sm" required />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Rok</label>
          <input name="year" type="number" placeholder="Rok" defaultValue={initialData?.data?.year || new Date().getFullYear()} className="w-full bg-black/20 border border-white/10 rounded px-3 py-1 text-sm" required />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Kategoria</label>
        <input name="category" placeholder="Kategoria" defaultValue={initialData?.data?.category} className="w-full bg-black/20 border border-white/10 rounded px-3 py-1 text-sm" required />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Osiągnięcia</label>
        <textarea name="achievements" placeholder="Osiągnięcia" defaultValue={initialData?.data?.achievements} className="w-full bg-black/20 border border-white/10 rounded px-3 py-1 text-sm h-20" required />
      </div>
      
      <div className="space-y-1">
        <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Zdjęcie główne</label>
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            accept="image/*" 
            className="text-xs file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gold file:text-black hover:file:bg-gold/80"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const url = URL.createObjectURL(file);
                setPreview(url);
              }
            }}
            id="champion-image"
            title="Wybierz zdjęcie główne"
          />
          {preview && <img src={preview} className="w-10 h-10 object-cover rounded" alt="Preview" />}
          {!preview && initialData?.manifest?.image && (
             <img src={`/champions/${initialData.id}/gallery/${initialData.manifest.image}`} className="w-10 h-10 object-cover rounded" alt="Current" />
          )}
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Anuluj</Button>
        <Button type="submit" size="sm" disabled={loading}>{loading ? 'Zapisywanie...' : 'Zapisz'}</Button>
      </div>
    </form>
  );
};
