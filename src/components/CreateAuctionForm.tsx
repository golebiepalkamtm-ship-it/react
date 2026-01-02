import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { auctionService } from '@/services/auctionService';
import { useAuth } from '@/contexts/AuthContext';
import type { AuctionCategory, CreateAuctionRequest } from '@/types/auction';
import { X, Plus, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface CreateAuctionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

type PigeonFormData = {
  ringNumber: string;
  bloodline: string;
  budowa: string;
  eyeColor: string;
  color: string;
  vitality: string;
  endurance: string;
};

type CreateAuctionFormData = {
  title: string;
  description: string;
  startingPrice: string;
  buyNowPrice: string;
  category: AuctionCategory;
  sex: 'male' | 'female';
  location: string;
  pigeon: PigeonFormData;
};

const isHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const parsePricePln = (raw: string): number | null => {
  const normalized = raw.trim().replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

import { CreateAuctionSchema } from '../../shared/contracts/auction';
import { z } from 'zod';

const CreateAuctionForm = ({ onSuccess, onCancel }: CreateAuctionFormProps) => {
  const { user, session, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isAuctionEnabled, setIsAuctionEnabled] = useState(true);
  const [isBuyNowEnabled, setIsBuyNowEnabled] = useState(false);
  const [pedigreeUrl, setPedigreeUrl] = useState('');
  
  const [formData, setFormData] = useState<CreateAuctionFormData>({
    title: '',
    description: '',
    startingPrice: '1000',
    buyNowPrice: '1000',
    category: 'pigeons',
    sex: 'male',
    location: 'Lubań, Polska',
    pigeon: {
      ringNumber: '',
      bloodline: '',
      budowa: '',
      eyeColor: '',
      color: '',
      vitality: 'Wysoka',
      endurance: 'Wysoka',
    },
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [pedigreeFile, setPedigreeFile] = useState<File | null>(null);

  const validateForm = () => {
    try {
      setValidationErrors({});
      // Prepare data for Zod validation
      const dataToValidate = {
        title: formData.title,
        description: formData.description,
        startingPrice: Number(formData.startingPrice),
        buyNowPrice: isBuyNowEnabled ? Number(formData.buyNowPrice) : undefined,
        category: formData.category,
        sex: formData.sex,
        location: formData.location,
        pigeon: formData.pigeon,
        images: imagePreviews, // We validate that images exist, actual URLs generated later
      };
      
      CreateAuctionSchema.parse(dataToValidate);
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.errors.forEach(e => {
          const path = e.path.join('.');
          errors[path] = e.message;
        });
        setValidationErrors(errors);
        
        // Show first error toast
        const firstError = Object.values(errors)[0];
        toast.error('Błąd walidacji', { description: firstError });
      }
      return false;
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('pigeon.')) {
      const pigeonField = name.slice('pigeon.'.length) as keyof PigeonFormData;
      setFormData(prev => ({ ...prev, pigeon: { ...prev.pigeon, [pigeonField]: value } }));
      return;
    }

    if (name === 'title') setFormData(prev => ({ ...prev, title: value }));
    else if (name === 'description') setFormData(prev => ({ ...prev, description: value }));
    else if (name === 'startingPrice') setFormData(prev => ({ ...prev, startingPrice: value }));
    else if (name === 'buyNowPrice') setFormData(prev => ({ ...prev, buyNowPrice: value }));
    else if (name === 'category') setFormData(prev => ({ ...prev, category: value as AuctionCategory }));
    else if (name === 'sex') setFormData(prev => ({ ...prev, sex: value as 'male' | 'female' }));
    else if (name === 'location') setFormData(prev => ({ ...prev, location: value }));
    
    // Clear specific error when field changes
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // sale options: allow auction and/or buy now (both possible)

  const handleImageFilesChange = (files: FileList | null) => {
    if (!files) return;
    const allowed = ['image/jpeg', 'image/png', 'image/bmp', 'image/webp'];
    const nextFiles: File[] = [];
    const nextPreviews: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      // allow png,jpg,bmp,psd,pdf
      if (
        f.type.startsWith('image/') ||
        f.type === 'application/pdf' ||
        f.name.toLowerCase().endsWith('.psd')
      ) {
        nextFiles.push(f);
        if (f.type.startsWith('image/')) nextPreviews.push(URL.createObjectURL(f));
      }
    }
    setImageFiles(prev => [...prev, ...nextFiles]);
    setImagePreviews(prev => [...prev, ...nextPreviews]);
  };

  const removeImageAt = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handlePedigreeFileChange = (file: File | null) => {
    setPedigreeFile(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Musisz być zalogowany');
      toast('Musisz się zalogować, aby utworzyć aukcję.', {
        description: 'Zaloguj się i spróbuj ponownie.',
      });
      return;
    }

    if (!profile) {
      setError('Ładowanie profilu...');
      toast('Ładuję Twój profil…', {
        description: 'Poczekaj chwilę i spróbuj ponownie.',
      });
      return;
    }

    if (profile.role === 'USER_REGISTERED') {
      setError('Musisz potwierdzić email, aby tworzyć aukcje.');
      toast('Najpierw potwierdź email.', {
        description: 'Wejdź w link w emailu weryfikacyjnym, a potem spróbuj ponownie.',
      });
      return;
    }

    if (profile.role === 'USER_EMAIL_VERIFIED') {
      setError('Musisz zweryfikować numer telefonu, aby tworzyć aukcje.');
      toast('Dokończ weryfikację konta.', {
        description: 'Uzupełnij profil i zweryfikuj numer telefonu, aby móc tworzyć aukcje.',
      });
      return;
    }

    if (profile.role !== 'USER_FULL_VERIFIED' && profile.role !== 'ADMIN') {
      setError('Brak uprawnień do tworzenia aukcji.');
      toast('Brak uprawnień do tworzenia aukcji.', {
        description: 'Dokończ weryfikację konta (email + telefon) i spróbuj ponownie.',
      });
      return;
    }

    const token = session?.access_token ?? null;
    if (!token) {
      setError('Brak tokenu sesji. Zaloguj się ponownie.');
      toast('Sesja wygasła lub jest niekompletna.', {
        description: 'Wyloguj się i zaloguj ponownie, a potem spróbuj jeszcze raz.',
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    if (imageFiles.length === 0) {
      setError('Dodaj przynajmniej jedno zdjęcie gołębia.');
      toast('Dodaj zdjęcie gołębia.', {
        description: 'Załaduj przynajmniej jedno zdjęcie (jpg, png, bmp).',
      });
      return;
    }

    if (!pedigreeFile) {
      setError('Dodaj zdjęcie rodowodu.');
      toast('Dodaj zdjęcie rodowodu.', {
        description: 'Dodaj plik PDF, PSD lub obraz z rodowodem.',
      });
      return;
    }

    const title = formData.title.trim();
    const description = formData.description.trim();
    const location = formData.location.trim();
    if (!title || !description || !location) {
      setError('Uzupełnij wymagane pola.');
      toast('Uzupełnij wymagane pola.', { description: 'Tytuł, opis i lokalizacja nie mogą być puste.' });
      return;
    }

    const parsedStartingPrice = parsePricePln(formData.startingPrice);
    if (isAuctionEnabled) {
      if (parsedStartingPrice == null || parsedStartingPrice < 100) {
        setError('Podaj prawidłową cenę wywoławczą (min. 100 PLN).');
        toast('Nieprawidłowa cena.', { description: 'Wpisz liczbę (np. 1000 lub 1000.00).' });
        return;
      }
    }

    const parsedBuyNowPrice = isBuyNowEnabled ? parsePricePln(formData.buyNowPrice) : null;
    if (isBuyNowEnabled && (parsedBuyNowPrice == null || parsedBuyNowPrice < 100)) {
      setError('Podaj prawidłową cenę kup teraz (min. 100 PLN).');
      toast('Nieprawidłowa cena kup teraz.', { description: 'Wpisz liczbę (np. 1000 lub 1000.00).' });
      return;
    }

    if (!isAuctionEnabled && !isBuyNowEnabled) {
      setError('Wybierz co najmniej jedną opcję sprzedaży.');
      toast('Wybierz przynajmniej jedną opcję: Licytacja lub Kup teraz.');
      return;
    }

    const endTime = new Date();
    endTime.setDate(endTime.getDate() + 7);

    const auctionData: CreateAuctionRequest = {
      title,
      description,
      startingPrice: isAuctionEnabled ? parsedStartingPrice! : parsedBuyNowPrice!,
      ...(isBuyNowEnabled && parsedBuyNowPrice != null ? { buyNowPrice: parsedBuyNowPrice } : {}),
      category: formData.category,
      sex: formData.sex,
      location,
      images: [],
      endTime: endTime.toISOString(),
      pigeon: formData.pigeon,
      documents: [],
    };

    try {
      setLoading(true);
      setError(null);
      toast('Tworzę aukcję…', {
        description: 'Nie zamykaj okna — zapisuję dane.',
      });

      // If we have files, upload as FormData
      if (imageFiles.length > 0 || pedigreeFile) {
        const fd = new FormData();
        fd.append('title', auctionData.title);
        fd.append('description', auctionData.description);
        fd.append('startingPrice', String(auctionData.startingPrice));
        if (auctionData.buyNowPrice) fd.append('buyNowPrice', String(auctionData.buyNowPrice));
        fd.append('category', auctionData.category as string);
        fd.append('sex', auctionData.sex);
        fd.append('location', auctionData.location);
        fd.append('endTime', auctionData.endTime);
        fd.append('pigeon', JSON.stringify(auctionData.pigeon));
        // append images
        imageFiles.forEach((f) => fd.append('images', f));
        // append pedigree/document
        if (pedigreeFile) fd.append('documents', pedigreeFile);

        await auctionService.createAuction(fd, token);
      } else {
        await auctionService.createAuction(auctionData, token);
      }
      toast('Aukcja utworzona.', {
        description: 'Możesz ją teraz znaleźć na liście aukcji.',
      });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd tworzenia aukcji');
      toast('Nie udało się utworzyć aukcji.', {
        description: 'Sprawdź połączenie i spróbuj ponownie. Jeśli problem wraca, odśwież stronę i zaloguj się ponownie.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-2 text-destructive">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid md:grid-cols-5 gap-3">
        <div className="md:col-span-5">
          <label className="block text-sm font-medium text-muted-foreground mb-2">Tytuł aukcji *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground"
            placeholder="np. Champion Bloodline - Złoty Orzeł"
          />
        </div>

        

        <div className="md:col-span-5">
          <label className="block text-sm font-medium text-muted-foreground mb-2">Opis *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={2}
            className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground resize-none"
            placeholder="Opisz gołębia, jego cechy i osiągnięcia..."
          />
        </div>

        <div className="md:col-span-5">
          <label className="block text-sm font-medium text-muted-foreground mb-2">Sposób sprzedaży *</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isAuctionEnabled}
                onChange={(e) => setIsAuctionEnabled(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Licytacja</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isBuyNowEnabled}
                onChange={(e) => setIsBuyNowEnabled(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Kup teraz</span>
            </label>
          </div>
        </div>





        <div className="md:col-span-5">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
            {isAuctionEnabled && (
              <div className="col-span-1">
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
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground"
                />
              </div>
            )}

            {isBuyNowEnabled && (
              <div className="col-span-1">
                <label className="block text-sm font-medium text-muted-foreground mb-2">Cena (Kup teraz) (PLN) *</label>
                <input
                  type="number"
                  name="buyNowPrice"
                  value={formData.buyNowPrice}
                  onChange={handleChange}
                  min={100}
                  title="Cena kup teraz"
                  placeholder="1000"
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground"
                />
              </div>
            )}

            <div className="col-span-1">
              <label className="block text-sm font-medium text-muted-foreground mb-2">Lokalizacja *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                title="Lokalizacja"
                placeholder="np. Lubań, Polska"
                className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-muted-foreground mb-2">Kategoria *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                title="Wybierz kategorię"
                className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground"
              >
                <option value="pigeons">Aukcje gołębi</option>
                <option value="supplements">Aukcje suplementów / odżywek / witamin</option>
                <option value="accessories">Akcesoria hodowlane</option>
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-muted-foreground mb-2">Płeć *</label>
              <select
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                title="Wybierz płeć"
                className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground"
              >
                <option value="male">Samiec</option>
                <option value="female">Samica</option>
              </select>
            </div>

            <div className="col-span-1">
              <label htmlFor="pigeon.ringNumber" className="block text-sm font-medium text-muted-foreground mb-2">Numer obrączki *</label>
              <input
                id="pigeon.ringNumber"
                type="text"
                name="pigeon.ringNumber"
                value={formData.pigeon?.ringNumber || ''}
                onChange={handleChange}
                required
                aria-required="true"
                title="Numer obrączki"
                placeholder="np. PL-2025-12345"
                className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground"
              />
            </div>

          </div>
        </div>

        
      </div>

      <div className="border-t border-border pt-4">
      <h3 className="font-semibold text-foreground mb-3">Cechy gołębia</h3>
      <div className="grid md:grid-cols-5 gap-3">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Linia</label>
            <input
              type="text"
              name="pigeon.bloodline"
              value={formData.pigeon?.bloodline || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground"
              placeholder="np. Janssen Brothers Line"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Budowa</label>
            <input
              type="text"
              name="pigeon.budowa"
              value={formData.pigeon?.budowa || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground"
              placeholder="np. Silna, smukła"
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
              className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Kolor</label>
            <input
              type="text"
              name="pigeon.color"
              value={formData.pigeon?.color || ''}
              onChange={handleChange}
              title="Kolor"
              placeholder="np. Niebieski"
              className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground"
            />
          </div>
        </div>
      </div>

        
      <div className="border-t border-border pt-4">
        <div className="flex flex-col md:flex-row items-stretch gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-3">Zdjęcia gołębia</h3>
            <div className="flex items-center gap-3 h-12">
              <input
                type="file"
                accept="image/jpeg,image/png,image/bmp,image/webp,application/pdf,.psd"
                multiple
                onChange={(e) => handleImageFilesChange(e.target.files)}
                className="text-sm text-muted-foreground h-full"
              />
              <span className="text-muted-foreground text-xs">Dozwolone: jpg, png, bmp, webp, pdf, psd</span>
            </div>

            {imageFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center mt-3">
                {imageFiles.map((file, idx) => (
                  <div key={idx} className="relative group w-12 h-12 rounded-lg overflow-hidden bg-muted">
                    {imagePreviews[idx] ? (
                      <img src={imagePreviews[idx]} alt={file.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">{file.name.split('.').pop()}</div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImageAt(idx)}
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

          <div className="w-full md:w-1/3">
            <h3 className="font-semibold text-foreground mb-3">Zdjęcie rodowodu</h3>
            <div className="flex items-center gap-3 h-12">
              <input
                type="file"
                accept="image/jpeg,image/png,image/bmp,image/webp,application/pdf,.psd"
                onChange={(e) => handlePedigreeFileChange(e.target.files ? e.target.files[0] : null)}
                required
                className="text-sm text-muted-foreground h-full"
              />
              {pedigreeFile && (
                <p className="text-xs text-muted-foreground ml-2 truncate">{pedigreeFile.name}</p>
              )}
            </div>
          </div>
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
