import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { X, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import FileUpload from '@/components/FileUpload';
import { useAuth } from '@/contexts/AuthContext';
import { uploadService } from '@/services/uploadService';
import { auctionService } from '@/services/auctionService';
import type { CreateAuctionRequest } from '@/types/auction';

interface CreateAccessoryAuctionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CreateAccessoryAuctionForm = ({ onSuccess, onCancel }: CreateAccessoryAuctionFormProps) => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startingPrice: '50',
    buyNowPrice: '',
  });

  const [isBidding, setIsBidding] = useState(true);
  const [isBuyNow, setIsBuyNow] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isBidding && !isBuyNow) {
      setError('Musisz wybrać co najmniej jedną opcję sprzedaży (licytacja lub kup teraz).');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const toastId = toast.loading('Przygotowuję dane aukcji...');
      const token = session?.access_token ?? null;

      // 1. Upload images
      const imageUrls: string[] = [];
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          toast.loading(`Przesyłam zdjęcia (${i + 1}/${files.length})...`, { id: toastId });
          const res = await uploadService.uploadImage(files[i], token);
          imageUrls.push(res.url);
        }
      }

      // 2. Upload videos
      const videoUrls: string[] = [];
      if (videoFiles.length > 0) {
        for (let i = 0; i < videoFiles.length; i++) {
          toast.loading(`Przesyłam filmy (${i + 1}/${videoFiles.length})...`, { id: toastId });
          const res = await uploadService.uploadImage(videoFiles[i], token);
          videoUrls.push(res.url);
        }
      }

      toast.loading('Tworzę aukcję...', { id: toastId });

      const endTime = new Date();
      endTime.setDate(endTime.getDate() + 7);

      const auctionData: CreateAuctionRequest = {
        title: formData.title,
        description: formData.description,
        startingPrice: isBidding ? Number(formData.startingPrice) : undefined,
        buyNowPrice: isBuyNow ? Number(formData.buyNowPrice) : undefined,
        category: 'Akcesoria',
        sex: 'male',
        location: 'Lubań, Polska',
        images: imageUrls,
        videos: videoUrls,
        endTime: endTime.toISOString(),
        pigeon: {
          vitality: 'N/A',
          endurance: 'N/A',
          gender: 'male',
        },
      };

      await auctionService.createAuction(auctionData, token);

      toast.success('Aukcja akcesoriów została utworzona!', { id: toastId });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd tworzenia aukcji');
      toast.error('Nie udało się utworzyć aukcji.', { id: 'accessory-error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl">
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-2 text-destructive">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Główne informacje - 4 kolumny */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-muted-foreground mb-2">Nazwa akcesorium *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground"
            placeholder="np. Transporter gołębi"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Licytacja</label>
          <label className="flex items-center gap-2 cursor-pointer h-12 px-4 rounded-xl bg-background border border-border">
            <input
              type="checkbox"
              checked={isBidding}
              onChange={(e) => setIsBidding(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-gold focus:ring-gold"
            />
            <span className="text-foreground font-medium">Licytacja</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Kup Teraz</label>
          <label className="flex items-center gap-2 cursor-pointer h-12 px-4 rounded-xl bg-background border border-border">
            <input
              type="checkbox"
              checked={isBuyNow}
              onChange={(e) => setIsBuyNow(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-gold focus:ring-gold"
            />
            <span className="text-foreground font-medium">Kup Teraz</span>
          </label>
        </div>
      </div>

      {/* Opis - pełna szerokość */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">Opis *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground resize-none"
          placeholder="Opisz akcesorium..."
        />
      </div>

      {/* Ceny - 4 kolumny */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {isBidding && (
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Cena wywoławcza (PLN) *</label>
            <input
              type="number"
              name="startingPrice"
              value={formData.startingPrice}
              onChange={handleChange}
              required={isBidding}
              min={1}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground"
              placeholder="50"
            />
          </div>
        )}

        {isBuyNow && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-muted-foreground mb-2">Cena "Kup teraz" (PLN) *</label>
            <input
              type="number"
              name="buyNowPrice"
              value={formData.buyNowPrice}
              onChange={handleChange}
              required={isBuyNow}
              min={1}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-foreground"
              placeholder="np. 100"
            />
          </div>
        )}
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="font-semibold text-foreground mb-4">Zdjęcia</h3>
        <FileUpload
          files={files}
          onFilesChange={setFiles}
          maxFiles={10}
          maxSize={10}
          accept="image/*"
        />
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="font-semibold text-foreground mb-4">Filmy</h3>
        <FileUpload
          files={videoFiles}
          onFilesChange={setVideoFiles}
          maxFiles={2}
          maxSize={50}
          accept="video/*"
        />
      </div>

      <div className="flex gap-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Anuluj
          </Button>
        )}
        <Button type="submit" variant="gold" disabled={loading} className="flex-1">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Tworzenie...
            </>
          ) : (
            'Utwórz aukcję'
          )}
        </Button>
      </div>
    </form>
  );
};

export default CreateAccessoryAuctionForm;
