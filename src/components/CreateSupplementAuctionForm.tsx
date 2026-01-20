import { useState, type ChangeEvent, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, AlertCircle, Loader2, Check, Sparkles, Camera, Video, Pill, Package } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import FileUpload from '@/components/FileUpload';
import { useAuth } from '@/contexts/AuthContext';
import { uploadService, auctionService } from '@/services';
import type { CreateAuctionRequest } from '@/types/auction';

interface CreateSupplementAuctionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const InputField = ({ 
  label, 
  name, 
  value, 
  onChange, 
  placeholder, 
  type = 'text',
  required = false,
  delay = 0,
}: { 
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, type: "spring", stiffness: 200, damping: 20 }}
    className="group"
  >
    <label className="block text-sm font-medium text-white/70 group-focus-within:text-gold transition-colors mb-2">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {type === 'textarea' ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        rows={4}
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-white placeholder-white/40 transition-all duration-200 hover:bg-white/10 hover:border-white/30 resize-none"
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-white placeholder-white/40 transition-all duration-200 hover:bg-white/10 hover:border-white/30"
      />
    )}
  </motion.div>
);

const CreateSupplementAuctionForm = ({ onSuccess, onCancel }: CreateSupplementAuctionFormProps) => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startingPrice: '10',
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

      const imageUrls: string[] = [];
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          toast.loading(`Przesyłam zdjęcia (${i + 1}/${files.length})...`, { id: toastId });
          const res = await uploadService.uploadImage(files[i], token);
          imageUrls.push(res.url);
        }
      }

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
        startingPrice: isBidding ? (Number(formData.startingPrice) || 10) : undefined,
        buyNowPrice: isBuyNow ? Number(formData.buyNowPrice) || undefined : undefined,
        category: 'Suplementy',
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
      
      toast.success('Aukcja suplementu została utworzona!', { id: toastId });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd tworzenia aukcji');
      toast.error('Nie udało się utworzyć aukcji.', { id: 'supplement-error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence mode="wait">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 backdrop-blur-sm"
          >
            <div className="p-2 rounded-xl bg-red-500/20">
              <AlertCircle className="w-5 h-5" />
            </div>
            <span className="flex-1">{error}</span>
            <button 
              type="button" 
              onClick={() => setError(null)}
              className="p-1 rounded-lg hover:bg-red-500/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <motion.div 
            className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30"
            animate={{ 
              boxShadow: ['0 10px 30px rgba(16,185,129,0.3)', '0 10px 50px rgba(16,185,129,0.5)', '0 10px 30px rgba(16,185,129,0.3)']
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Pill className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h3 className="text-xl font-bold text-white">Nowa aukcja suplementu</h3>
            <p className="text-sm text-white/60">Witaminy i preparaty dla gołębi</p>
          </div>
        </div>

        <InputField
          label="Nazwa suplementu"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="np. Witaminy dla gołębi wyścigowych"
          required
          delay={0.15}
        />

        <InputField
          label="Opis"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Opisz suplement, skład, dawkowanie..."
          type="textarea"
          required
          delay={0.2}
        />
      </motion.div>

      <motion.div 
        className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="text-2xl">💰</span> Opcje sprzedaży
        </h3>

        <div className="flex flex-wrap gap-4">
          <motion.label 
            className={`flex items-center gap-3 px-6 py-4 rounded-xl cursor-pointer transition-all duration-300 ${
              isBidding 
                ? 'bg-gold/20 border-2 border-gold text-gold shadow-lg shadow-gold/20' 
                : 'bg-white/5 border-2 border-white/20 text-white/70 hover:border-white/40'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <input
              type="checkbox"
              checked={isBidding}
              onChange={(e) => setIsBidding(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isBidding ? 'bg-gold' : 'border-2 border-white/30'}`}>
              {isBidding && <Check className="w-4 h-4 text-navy" />}
            </div>
            <span className="font-medium">Licytacja</span>
          </motion.label>

          <motion.label 
            className={`flex items-center gap-3 px-6 py-4 rounded-xl cursor-pointer transition-all duration-300 ${
              isBuyNow 
                ? 'bg-gold/20 border-2 border-gold text-gold shadow-lg shadow-gold/20' 
                : 'bg-white/5 border-2 border-white/20 text-white/70 hover:border-white/40'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <input
              type="checkbox"
              checked={isBuyNow}
              onChange={(e) => setIsBuyNow(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isBuyNow ? 'bg-gold' : 'border-2 border-white/30'}`}>
              {isBuyNow && <Check className="w-4 h-4 text-navy" />}
            </div>
            <span className="font-medium">Kup Teraz</span>
          </motion.label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {isBidding && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <InputField
                  label="Cena wywoławcza (PLN)"
                  name="startingPrice"
                  value={formData.startingPrice}
                  onChange={handleChange}
                  placeholder="10"
                  type="number"
                  required={isBidding}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isBuyNow && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <InputField
                  label="Cena Kup teraz (PLN)"
                  name="buyNowPrice"
                  value={formData.buyNowPrice}
                  onChange={handleChange}
                  placeholder="100"
                  type="number"
                  required={isBuyNow}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <motion.div 
        className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <motion.div 
            className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/30"
          >
            <Package className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h3 className="text-xl font-bold text-white">Media</h3>
            <p className="text-sm text-white/60">Dodaj zdjęcia i filmy produktu</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 text-white">
              <Camera className="w-5 h-5 text-blue-400" />
              <span className="font-medium">Zdjęcia produktu</span>
            </div>
            <FileUpload
              files={files}
              onFilesChange={setFiles}
              maxFiles={10}
              maxSize={10}
              accept="image/*"
            />
            <p className="text-xs text-white/50">Max 10 zdjęć, do 10MB każde</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 text-white">
              <Video className="w-5 h-5 text-green-400" />
              <span className="font-medium">Filmy</span>
            </div>
            <FileUpload
              files={videoFiles}
              onFilesChange={setVideoFiles}
              maxFiles={2}
              maxSize={50}
              accept="video/*"
            />
            <p className="text-xs text-white/50">Max 2 filmy, do 50MB każdy</p>
          </motion.div>
        </div>
      </motion.div>

      <motion.div 
        className="flex gap-4 pt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {onCancel && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel} 
              className="w-full py-6 rounded-xl border-white/20 text-white hover:bg-white/10 transition-all"
            >
              <X className="w-5 h-5 mr-2" />
              Anuluj
            </Button>
          </motion.div>
        )}
        
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 md:flex-[2]">
          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full py-6 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all disabled:opacity-50"
          >
            {loading ? (
              <motion.div 
                className="flex items-center gap-2"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Tworzenie aukcji...</span>
              </motion.div>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Utwórz aukcję suplementu
              </span>
            )}
          </Button>
        </motion.div>
      </motion.div>
    </motion.form>
  );
};

export default CreateSupplementAuctionForm;
