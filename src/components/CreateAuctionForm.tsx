import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { auctionService } from '@/services/auctionService';
import { uploadService } from '@/services/uploadService';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api';
import type { CreateAuctionRequest } from '@/types/auction';
import { X, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import FileUpload from '@/components/FileUpload';
// import { paymentService } from '@/services/paymentService'; // Disabled - payments not configured

interface CreateAuctionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CreateAuctionForm = ({ onSuccess, onCancel }: CreateAuctionFormProps) => {
  const { user, session, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<CreateAuctionRequest>>({
    title: '',
    description: '',
    startingPrice: 1000,
    category: '',
    sex: 'male',
    location: 'Lubań, Polska',
    images: [],
    pigeon: {
      ringNumber: '',
      eyeColor: '',
      pigeonColor: '',
      construction: '',
      vitality: '',
      muscles: '',
      shoulders: '',
      balance: '',
      feathers: '',
      length: '',
      endurance: '',
    },
  });

  const [isBidding, setIsBidding] = useState(true);
  const [isBuyNow, setIsBuyNow] = useState(false);
  const [pedigreeFile, setPedigreeFile] = useState<File | null>(null);
  const [pigeonFiles, setPigeonFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Debug currentStep
  useEffect(() => {
    console.log('🔍 CreateAuctionForm currentStep:', currentStep, 'totalSteps:', totalSteps);
  }, [currentStep]);

  // Pobierz CSRF token przy montowaniu komponentu
  useEffect(() => {
    const fetchCSRFToken = async () => {
      try {
        await apiClient.getCSRFToken();
      } catch (error) {
        console.warn('Failed to fetch CSRF token:', error);
      }
    };
    fetchCSRFToken();
  }, []);

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

  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      return;
    }

    // Final submission logic starts here
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

    // Admin nie wymaga weryfikacji telefonu
    if (profile.role === 'ADMIN') {
      // Kontynuuj bez sprawdzania telefonu
    } else if (profile.role !== 'USER_FULL_VERIFIED') {
      setError('Brak uprawnień do tworzenia aukcji.');
      toast('Brak uprawnień do tworzenia aukcji.', {
        description: 'Dokończ weryfikację konta (email + telefon) i spróbuj ponownie.',
      });
      return;
    }

    if (!isBidding && !isBuyNow) {
      setError('Musisz wybrać co najmniej jedną opcję sprzedaży (licytacja lub kup teraz).');
      return;
    }

    const ringNumber = formData.pigeon?.ringNumber?.trim();
    if (!ringNumber) {
      setError('Podaj numer obrączki gołębia.');
      toast('Brakuje numeru obrączki.', {
        description: 'Uzupełnij numer obrączki (ringNumber), aby utworzyć aukcję.',
      });
      return;
    }

    if (!session?.access_token) {
      setError('Brak tokenu sesji. Zaloguj się ponownie.');
      toast('Sesja wygasła lub jest niekompletna.', {
        description: 'Wyloguj się i zaloguj ponownie, a potem spróbuj jeszcze raz.',
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const toastId = toast.loading('Przygotowuję dane aukcji...');
      const token = session.access_token;

      // 1. Upload pedigree if exists
      let pedigreeUrl = '';
      if (pedigreeFile) {
        toast.loading('Przesyłam rodowód...', { id: toastId });
        const res = await uploadService.uploadDocument(pedigreeFile, token);
        pedigreeUrl = res.url;
      }

      // 2. Upload pigeon images
      const imageUrls: string[] = [];
      if (pigeonFiles.length > 0) {
        if (pigeonFiles.length > 20) {
          throw new Error('Zbyt wiele zdjęć (max 20).');
        }
        toast.loading(`Przesyłam zdjęcia (0/${pigeonFiles.length})...`, { id: toastId });
        for (let i = 0; i < pigeonFiles.length; i++) {
          const file = pigeonFiles[i];
          if (file.size > 5 * 1024 * 1024) {
            throw new Error('Każde zdjęcie musi być <= 5MB.');
          }
          toast.loading(`Przesyłam zdjęcia (${i + 1}/${pigeonFiles.length})...`, { id: toastId });
          const res = await uploadService.uploadImage(file, token);
          imageUrls.push(res.url);
        }
      }

      // 3. Upload videos
      const videoUrls: string[] = [];
      if (videoFiles.length > 0) {
        if (videoFiles.length > 10) {
          throw new Error('Zbyt wiele filmów (max 10).');
        }
        toast.loading(`Przesyłam filmy (0/${videoFiles.length})...`, { id: toastId });
        for (let i = 0; i < videoFiles.length; i++) {
          const file = videoFiles[i];
          if (file.size > 20 * 1024 * 1024) {
            throw new Error('Każdy film musi być <= 20MB.');
          }
          toast.loading(`Przesyłam filmy (${i + 1}/${videoFiles.length})...`, { id: toastId });
          const res = await uploadService.uploadImage(file, token);
          videoUrls.push(res.url);
        }
      }

      toast.loading('Tworzę aukcję...', { id: toastId });
      
      const endTime = new Date();
      endTime.setDate(endTime.getDate() + 7);

      const auctionData: CreateAuctionRequest = {
        title: formData.title || '',
        description: formData.description || '',
        startingPrice: isBidding ? (Number(formData.startingPrice) || 100) : undefined,
        buyNowPrice: isBuyNow ? (Number(formData.buyNowPrice) || undefined) : undefined,
        category: formData.category || 'Ogólna',
        sex: formData.sex as 'male' | 'female',
        location: formData.location || 'Lubań, Polska',
        images: imageUrls,
        videos: videoUrls,
        endTime: endTime.toISOString(),
        pigeon: {
          ...formData.pigeon,
          ringNumber,
          gender: formData.sex as 'male' | 'female',
        },
      };

      await auctionService.createAuction(auctionData, token);
      
      // Listing fee disabled - payments not configured
      toast.success('Aukcja została utworzona pomyślnie!', { id: toastId });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd podczas tworzenia aukcji');
      toast.error('Nie udało się utworzyć aukcji. Spróbuj ponownie.');
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

      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep
                  ? 'bg-gold text-navy'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step}
            </div>
          ))}
        </div>
        <div className="text-sm text-muted-foreground">
          Krok {currentStep} z {totalSteps}
        </div>
      </div>

      {/* Step 1: Basic Information & Pricing */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <div>
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

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Opis *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground resize-none"
              placeholder="Opisz gołębia..."
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4 border-t border-border pt-6">
            <div className="md:col-span-3 flex gap-6 py-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBidding}
                  onChange={(e) => setIsBidding(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-gold focus:ring-gold"
                />
                <span className="text-foreground font-medium">Licytacja</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBuyNow}
                  onChange={(e) => setIsBuyNow(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-gold focus:ring-gold"
                />
                <span className="text-foreground font-medium">Kup Teraz</span>
              </label>
            </div>

            {isBidding && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Cena wywoławcza (PLN) *</label>
                <input
                  type="number"
                  name="startingPrice"
                  value={formData.startingPrice}
                  onChange={handleChange}
                  required
                  min={1}
                  title="Cena wywoławcza"
                  placeholder="100"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground"
                />
              </div>
            )}

            {isBuyNow && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Cena "Kup teraz" (PLN) *</label>
                <input
                  type="number"
                  name="buyNowPrice"
                  value={formData.buyNowPrice || ''}
                  onChange={handleChange}
                  required
                  min={1}
                  title="Cena kup teraz"
                  placeholder="np. 500"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground"
                />
              </div>
            )}

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
          </div>
        </div>
      )}

      {/* Step 2: Pigeon Characteristics */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <div className="border-t border-border pt-6">
            <h3 className="font-semibold text-foreground mb-4">Cechy gołębia</h3>
            {/* Numer obrączki - pierwsze pole, obowiązkowe */}
            <div className="mb-6 p-4 rounded-xl border-2 border-gold/20 bg-gold/5">
              <label className="block text-sm font-medium text-foreground mb-2 font-semibold">
                Numer obrączki <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="pigeon.ringNumber"
                value={formData.pigeon?.ringNumber || ''}
                onChange={handleChange}
                required
                title="Numer obrączki"
                placeholder="np. DV-0987-11-396"
                className="w-full px-4 py-3 rounded-xl bg-background border-2 border-gold/30 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground font-medium"
              />
              <p className="text-xs text-muted-foreground mt-1">Wprowadź pełny numer obrączki gołębia</p>
            </div>
            
            {/* Reszta pól w grid 4 kolumny */}
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Kolor</label>
                <input
                  type="text"
                  name="pigeon.pigeonColor"
                  value={formData.pigeon?.pigeonColor || ''}
                  onChange={handleChange}
                  title="Kolor gołębia"
                  placeholder="np. Niebieski"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Kolor oka</label>
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
                <label className="block text-sm font-medium text-muted-foreground mb-2">Budowa</label>
                <input
                  type="text"
                  name="pigeon.construction"
                  value={formData.pigeon?.construction || ''}
                  onChange={handleChange}
                  title="Budowa"
                  placeholder="np. Mocna, zwarta"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Witalność</label>
                <input
                  type="text"
                  name="pigeon.vitality"
                  value={formData.pigeon?.vitality || ''}
                  onChange={handleChange}
                  title="Witalność"
                  placeholder="np. Doskonała"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Mięśnie</label>
                <input
                  type="text"
                  name="pigeon.muscles"
                  value={formData.pigeon?.muscles || ''}
                  onChange={handleChange}
                  title="Mięśnie"
                  placeholder="np. Silne, dobrze rozwinięte"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Plecy</label>
                <input
                  type="text"
                  name="pigeon.shoulders"
                  value={formData.pigeon?.shoulders || ''}
                  onChange={handleChange}
                  title="Plecy"
                  placeholder="np. Szerokie, mocne"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Balans</label>
                <input
                  type="text"
                  name="pigeon.balance"
                  value={formData.pigeon?.balance || ''}
                  onChange={handleChange}
                  title="Balans"
                  placeholder="np. Doskonały"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Upierzenie</label>
                <input
                  type="text"
                  name="pigeon.feathers"
                  value={formData.pigeon?.feathers || ''}
                  onChange={handleChange}
                  title="Upierzenie"
                  placeholder="np. Gęste, lśniące"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Długość</label>
                <input
                  type="text"
                  name="pigeon.length"
                  value={formData.pigeon?.length || ''}
                  onChange={handleChange}
                  title="Długość"
                  placeholder="np. Średnia"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Wytrzymałość</label>
                <input
                  type="text"
                  name="pigeon.endurance"
                  value={formData.pigeon?.endurance || ''}
                  onChange={handleChange}
                  title="Wytrzymałość"
                  placeholder="np. Wysoka"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Media Upload */}
      {currentStep === 3 && (
        <div className="space-y-4 border-t border-border pt-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-semibold text-foreground mb-4">Zdjęcia gołębia</h3>
              <FileUpload
                files={pigeonFiles}
                onFilesChange={setPigeonFiles}
                maxFiles={10}
                maxSize={20}
                accept="image/*"
              />
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Wideo</h3>
              <FileUpload
                files={videoFiles}
                onFilesChange={setVideoFiles}
                maxFiles={2}
                maxSize={50}
                accept="video/*"
              />
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Rodowód</h3>
              <FileUpload
                files={pedigreeFile ? [pedigreeFile] : []}
                onFilesChange={(files) => setPedigreeFile(files[0] || null)}
                maxFiles={1}
                maxSize={10}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Dodaj rodowód gołębia (PDF, DOC, DOCX, JPG, PNG - max 10MB)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4">
        {currentStep > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep(currentStep - 1)}
            className="flex-1"
          >
            Wróć
          </Button>
        )}
        
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Anuluj
          </Button>
        )}
        
        <Button type="submit" variant="gold" disabled={loading} className="flex-1">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {currentStep === totalSteps ? 'Tworzenie...' : 'Przetwarzanie...'}
            </>
          ) : (
            currentStep === totalSteps ? 'Utwórz aukcję' : 'Dalej'
          )}
        </Button>
      </div>
    </form>
  );
};

export default CreateAuctionForm;
