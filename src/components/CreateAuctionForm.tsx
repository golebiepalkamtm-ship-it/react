import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { auctionService } from '@/services/auctionService';
import { useAuth } from '@/contexts/AuthContext';
import type { CreateAuctionRequest } from '@/types/auction';
import { X, Plus, Upload, AlertCircle } from 'lucide-react';

interface CreateAuctionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CreateAuctionForm = ({ onSuccess, onCancel }: CreateAuctionFormProps) => {
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<CreateAuctionRequest>>({
    title: '',
    description: '',
    startingPrice: 1000,
    category: 'racing',
    sex: 'male',
    age: 1,
    location: 'Lubań, Polska',
    images: [],
    pigeon: {
      bloodline: '',
      achievements: '',
      eyeColor: '',
      featherColor: '',
      vitality: 'Wysoka',
      endurance: 'Wysoka',
    },
  });

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('pigeon.')) {
      const pigeonField = name.replace('pigeon.', '');
      setFormData(prev => ({
        ...prev,
        pigeon: { ...prev.pigeon, [pigeonField]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addImageUrl = () => {
    if (newImageUrl && !imageUrls.includes(newImageUrl)) {
      const updated = [...imageUrls, newImageUrl];
      setImageUrls(updated);
      setFormData(prev => ({ ...prev, images: updated }));
      setNewImageUrl('');
    }
  };

  const removeImageUrl = (url: string) => {
    const updated = imageUrls.filter(u => u !== url);
    setImageUrls(updated);
    setFormData(prev => ({ ...prev, images: updated }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Musisz być zalogowany');
      return;
    }

    const token = session?.access_token ?? null;
    if (!token) {
      setError('Brak tokenu sesji. Zaloguj się ponownie.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const endTime = new Date();
      endTime.setDate(endTime.getDate() + 7);

      const auctionData: CreateAuctionRequest = {
        title: formData.title || '',
        description: formData.description || '',
        startingPrice: Number(formData.startingPrice) || 1000,
        category: formData.category as 'racing' | 'breeding' | 'show',
        sex: formData.sex as 'male' | 'female',
        age: Number(formData.age) || 1,
        location: formData.location || '',
        images: imageUrls,
        endTime: endTime.toISOString(),
        pigeon: formData.pigeon as CreateAuctionRequest['pigeon'],
      };

      await auctionService.createAuction(auctionData, token);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd tworzenia aukcji');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-2 text-destructive">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-muted-foreground mb-2">Tytuł aukcji *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground"
            placeholder="np. Champion Bloodline - Złoty Orzeł"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-muted-foreground mb-2">Opis *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground resize-none"
            placeholder="Opisz gołębia, jego cechy i osiągnięcia..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Cena wywoławcza (PLN) *</label>
          <input
            type="number"
            name="startingPrice"
            value={formData.startingPrice}
            onChange={handleChange}
            required
            min={100}
            title="Cena wywoławcza"
            placeholder="1000"
            className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Cena "Kup teraz" (PLN)</label>
          <input
            type="number"
            name="buyNowPrice"
            value={formData.buyNowPrice || ''}
            onChange={handleChange}
            min={formData.startingPrice}
            title="Cena kup teraz"
            placeholder="Opcjonalnie"
            className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Kategoria *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            title="Wybierz kategorię"
            className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground"
          >
            <option value="racing">Wyścigowy</option>
            <option value="breeding">Hodowlany</option>
            <option value="show">Pokazowy</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Płeć *</label>
          <select
            name="sex"
            value={formData.sex}
            onChange={handleChange}
            title="Wybierz płeć"
            className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground"
          >
            <option value="male">Samiec</option>
            <option value="female">Samica</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Wiek (lata) *</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            required
            min={0}
            max={20}
            title="Wiek gołębia"
            placeholder="1"
            className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Lokalizacja *</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            title="Lokalizacja"
            placeholder="np. Lubą, Polska"
            className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground"
          />
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="font-semibold text-foreground mb-4">Cechy gołębia</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Rodowód</label>
            <input
              type="text"
              name="pigeon.bloodline"
              value={formData.pigeon?.bloodline || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground"
              placeholder="np. Janssen Brothers Line"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Osiągnięcia</label>
            <input
              type="text"
              name="pigeon.achievements"
              value={formData.pigeon?.achievements || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground"
              placeholder="np. 15 wygranych, 5 miejsc na podium"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Kolor oczu</label>
            <input
              type="text"
              name="pigeon.eyeColor"
              value={formData.pigeon?.eyeColor || ''}
              onChange={handleChange}
              title="Kolor oczu"
              placeholder="np. Pomarańczowy"
              className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Umaszczenie</label>
            <input
              type="text"
              name="pigeon.featherColor"
              value={formData.pigeon?.featherColor || ''}
              onChange={handleChange}
              title="Umaszczenie"
              placeholder="np. Niebieski z prążkami"
              className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="font-semibold text-foreground mb-4">Zdjęcia</h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground"
              placeholder="URL zdjęcia..."
            />
            <Button type="button" variant="outline" onClick={addImageUrl}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {imageUrls.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {imageUrls.map((url, idx) => (
                <div key={idx} className="relative group">
                  <img src={url} alt={`Zdjęcie ${idx + 1}`} className="w-20 h-20 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => removeImageUrl(url)}
                    title="Usuń zdjęcie"
                    className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Anuluj
          </Button>
        )}
        <Button type="submit" variant="gold" disabled={loading} className="flex-1">
          {loading ? 'Tworzenie...' : 'Utwórz aukcję'}
        </Button>
      </div>
    </form>
  );
};

export default CreateAuctionForm;
