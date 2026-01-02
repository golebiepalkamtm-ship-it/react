import React, { useState } from 'react';
import { Calendar, Plus, Trash2, Edit2, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminMeeting {
  id: string;
  name: string;
  date: string;
  location: string;
  description?: string;
  images?: string[];
}

interface MeetingsTabProps {
  meetings: AdminMeeting[];
  loading: boolean;
  onRefresh: () => void;
  onCreate: (payload: any) => Promise<boolean>;
  onUpdate: (id: string, payload: any) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export const MeetingsTab: React.FC<MeetingsTabProps> = ({ 
  meetings, loading, onCreate, onUpdate, onDelete 
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Calendar className="text-blue-500" /> Zarządzanie Spotkaniami
        </h2>
        <Button onClick={() => setIsAdding(true)} size="sm" className="gap-2">
          <Plus className="w-4 h-4" /> Dodaj Spotkanie
        </Button>
      </div>

      {isAdding && (
        <MeetingForm 
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
          {meetings.map(m => (
            <div key={m.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col gap-4">
              {editingId === m.id ? (
                <MeetingForm 
                  initialData={m} 
                  onCancel={() => setEditingId(null)} 
                  onSubmit={async (val: any) => { 
                    const ok = await onUpdate(m.id, val); 
                    if (ok) setEditingId(null); 
                  }} 
                />
              ) : (
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    {m.images?.[0] && (
                      <img 
                        src={m.images[0]} 
                        alt={m.name} 
                        className="w-20 h-20 object-cover rounded-lg border border-white/10"
                      />
                    )}
                    <div>
                      <h3 className="font-bold">{m.name}</h3>
                      <div className="text-sm text-muted-foreground flex gap-4">
                        <span>{m.date ? new Date(m.date).toLocaleDateString('pl-PL') : 'Brak daty'}</span>
                        <span>{m.location}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{m.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingId(m.id)} className="gap-2">
                      <Edit2 className="w-4 h-4" /> Edytuj
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => onDelete(m.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {meetings.length === 0 && <p className="text-center text-muted-foreground py-8">Brak zaplanowanych spotkań.</p>}
        </div>
      )}
    </div>
  );
};

const MeetingForm = ({ initialData, onSubmit, onCancel }: any) => {
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);

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
        name: fd.get('name'),
        location: fd.get('location'),
        date: fd.get('date'),
        description: fd.get('description'),
      };

      if (deletedImages.length) {
        payload.deleteImages = deletedImages;
      }

      const fileInput = (e.currentTarget as HTMLFormElement).querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput?.files?.length) {
        const filesData = await Promise.all(Array.from(fileInput.files).map(fileToBase64));
        if (initialData) {
          payload.addImages = filesData;
        } else {
          payload.images = filesData;
        }
      }

      await onSubmit(payload);
      setLoading(false);
    }}>
      <h3 className="text-sm font-bold text-blue-400 mb-2">{initialData ? 'Edytuj Spotkanie' : 'Dodaj Nowe Spotkanie'}</h3>
      <div className="space-y-1">
        <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Nazwa spotkania</label>
        <input name="name" placeholder="Tytuł/Nazwa hodowcy" defaultValue={initialData?.name} className="w-full bg-black/20 border border-white/10 rounded px-3 py-1 text-sm" required />
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Data</label>
          <input name="date" type="date" defaultValue={initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : ''} className="w-full bg-black/20 border border-white/10 rounded px-3 py-1 text-sm" required title="Wybierz datę" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Lokalizacja</label>
          <input name="location" placeholder="Miejscowość" defaultValue={initialData?.location} className="w-full bg-black/20 border border-white/10 rounded px-3 py-1 text-sm" required />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Opis</label>
        <textarea name="description" placeholder="Krótki opis spotkania" defaultValue={initialData?.description} className="w-full bg-black/20 border border-white/10 rounded px-3 py-1 text-sm h-20" />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Zdjęcia</label>
        <div className="flex flex-col gap-2">
          <input 
            type="file" 
            accept="image/*" 
            multiple
            className="text-xs file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              const urls = files.map(f => URL.createObjectURL(f));
              setPreviews(urls);
            }}
            title="Wybierz zdjęcia"
          />
          <div className="flex flex-wrap gap-2">
            {previews.map((url, i) => (
              <img key={i} src={url} className="w-12 h-12 object-cover rounded border border-white/10" alt={`Preview ${i}`} />
            ))}
            {!previews.length && initialData?.images?.filter((img: string) => !deletedImages.includes(img)).map((url: string, i: number) => (
              <div key={i} className="relative group">
                <img src={url} className="w-12 h-12 object-cover rounded border border-white/10" alt={`Current ${i}`} />
                <button 
                  type="button"
                  onClick={() => setDeletedImages(prev => [...prev, url])}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Usuń zdjęcie"
                >
                  <Trash2 className="w-2 h-2" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Anuluj</Button>
        <Button type="submit" size="sm" disabled={loading}>{loading ? 'Zapisywanie...' : 'Zapisz'}</Button>
      </div>
    </form>
  );
};
