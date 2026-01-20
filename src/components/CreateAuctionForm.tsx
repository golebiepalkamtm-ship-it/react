import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { auctionService } from '@/services/auctionService';
import { uploadService } from '@/services/uploadService';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api';
import type { CreateAuctionRequest } from '@/types/auction';
import { X, AlertCircle, Loader2, Bird, Check, ChevronRight, ChevronLeft, Upload, Camera, Video, FileText, Sparkles, Eye, Palette, Dumbbell, Heart, Scale, Feather, Ruler, Zap } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import FileUpload from '@/components/FileUpload';

interface CreateAuctionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialCategory?: 'pigeons' | 'supplements' | 'accessories' | '';
}

const StepIndicator = ({ 
  step, 
  currentStep, 
  label, 
  icon: Icon 
}: { 
  step: number; 
  currentStep: number; 
  label: string;
  icon: any;
}) => {
  const isActive = step === currentStep;
  const isCompleted = step < currentStep;
  
  return (
    <motion.div 
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: step * 0.1 }}
    >
      <motion.div
        className={`relative w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg transition-all duration-300 ${
          isCompleted 
            ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30' 
            : isActive 
              ? 'bg-gradient-to-br from-gold to-gold-dark text-navy shadow-lg shadow-gold/40' 
              : 'bg-white/10 text-white/50 border border-white/20'
        }`}
        whileHover={{ scale: 1.05 }}
        animate={isActive ? { 
          boxShadow: ['0 10px 30px rgba(212,175,55,0.3)', '0 10px 50px rgba(212,175,55,0.5)', '0 10px 30px rgba(212,175,55,0.3)']
        } : {}}
        transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
      >
        {isCompleted ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
          >
            <Check className="w-6 h-6" />
          </motion.div>
        ) : (
          <Icon className="w-5 h-5" />
        )}
        
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-2xl"
            animate={{ 
              boxShadow: ['0 0 0 0 rgba(212,175,55,0.4)', '0 0 0 8px rgba(212,175,55,0)', '0 0 0 0 rgba(212,175,55,0)']
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.div>
      
      <div className="hidden md:block">
        <motion.p 
          className={`text-sm font-medium transition-colors ${isActive ? 'text-gold' : isCompleted ? 'text-green-400' : 'text-white/50'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 + step * 0.1 }}
        >
          {label}
        </motion.p>
      </div>
    </motion.div>
  );
};

const InputField = ({ 
  label, 
  name, 
  value, 
  onChange, 
  placeholder, 
  type = 'text',
  required = false,
  icon: Icon,
  delay = 0,
  highlighted = false,
}: { 
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  icon?: any;
  delay?: number;
  highlighted?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, type: "spring", stiffness: 200, damping: 20 }}
    className={`group ${highlighted ? 'p-4 rounded-2xl border-2 border-gold/30 bg-gold/5' : ''}`}
  >
    <label className={`block text-sm font-medium mb-2 transition-colors ${highlighted ? 'text-gold font-semibold' : 'text-white/70 group-focus-within:text-gold'}`}>
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-gold transition-colors">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={`w-full ${Icon ? 'pl-12' : 'px-4'} pr-4 py-3 rounded-xl bg-white/5 border border-white/20 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-white placeholder-white/40 transition-all duration-200 hover:bg-white/10 hover:border-white/30`}
      />
    </div>
    {highlighted && (
      <p className="text-xs text-white/50 mt-2">Wprowadź pełny numer obrączki gołębia</p>
    )}
  </motion.div>
);

const CreateAuctionForm = ({ onSuccess, onCancel, initialCategory = 'pigeons' }: CreateAuctionFormProps) => {
  const { user, session, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<CreateAuctionRequest>>({
    title: '',
    description: '',
    startingPrice: 1000,
    category: initialCategory,
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
  const isPigeonCategory = formData.category === 'pigeons';
  const totalSteps = isPigeonCategory ? 3 : 2;

  const steps = [
    { step: 1, label: 'Podstawowe', icon: Bird },
    { step: 2, label: 'Cechy gołębia', icon: Eye },
    { step: 3, label: 'Media', icon: Camera },
  ];

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

    if (profile.role === 'ADMIN') {
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

    if (isPigeonCategory) {
      const ringNumber = formData.pigeon?.ringNumber?.trim();
      if (!ringNumber) {
        setError('Podaj numer obrączki gołębia.');
        toast('Brakuje numeru obrączki.', {
          description: 'Uzupełnij numer obrączki (ringNumber), aby utworzyć aukcję.',
        });
        return;
      }
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

      let pedigreeUrl = '';
      if (pedigreeFile) {
        toast.loading('Przesyłam rodowód...', { id: toastId });
        const res = await uploadService.uploadDocument(pedigreeFile, token);
        pedigreeUrl = res.url;
      }

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

      const ringNumber = formData.pigeon?.ringNumber?.trim();

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
          ringNumber: ringNumber,
          gender: formData.sex as 'male' | 'female',
        },
      };

      await auctionService.createAuction(auctionData, token);
      
      toast.success('Aukcja została utworzona pomyślnie!', { id: toastId });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd podczas tworzenia aukcji');
      toast.error('Nie udało się utworzyć aukcji. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  const pigeonCharacteristics = [
    { name: 'pigeon.featherColor', label: 'Kolor', icon: Palette, placeholder: 'np. Niebieski' },
    { name: 'pigeon.eyeColor', label: 'Kolor oka', icon: Eye, placeholder: 'np. Pomarańczowy' },
    { name: 'pigeon.construction', label: 'Budowa', icon: Dumbbell, placeholder: 'np. Mocna, zwarta' },
    { name: 'pigeon.vitality', label: 'Witalność', icon: Heart, placeholder: 'np. Doskonała' },
    { name: 'pigeon.muscles', label: 'Mięśnie', icon: Dumbbell, placeholder: 'np. Silne' },
    { name: 'pigeon.shoulders', label: 'Plecy', icon: Scale, placeholder: 'np. Szerokie' },
    { name: 'pigeon.balance', label: 'Balans', icon: Scale, placeholder: 'np. Doskonały' },
    { name: 'pigeon.feathers', label: 'Upierzenie', icon: Feather, placeholder: 'np. Gęste' },
    { name: 'pigeon.length', label: 'Długość', icon: Ruler, placeholder: 'np. Średnia' },
    { name: 'pigeon.endurance', label: 'Wytrzymałość', icon: Zap, placeholder: 'np. Wysoka' },
  ];

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
        className="flex items-center justify-between gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-6">
          {steps.slice(0, totalSteps).map((s) => (
            <StepIndicator 
              key={s.step}
              step={s.step} 
              currentStep={currentStep} 
              label={s.label}
              icon={s.icon}
            />
          ))}
        </div>
        
        <motion.div 
          className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gold/10 border border-gold/30"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Sparkles className="w-4 h-4 text-gold" />
          <span className="text-sm text-gold font-medium">
            Krok {currentStep} z {totalSteps}
          </span>
        </motion.div>
      </motion.div>

      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="space-y-6"
          >
            <motion.div 
              className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-gold to-gold-dark shadow-lg shadow-gold/30">
                  <Bird className="w-6 h-6 text-navy" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Podstawowe informacje</h3>
                  <p className="text-sm text-white/60">Wypełnij dane aukcji</p>
                </div>
              </div>

              <InputField
                label="Tytuł aukcji"
                name="title"
                value={formData.title || ''}
                onChange={handleChange}
                placeholder="np. Champion Bloodline - Złoty Orzeł"
                required
                delay={0.1}
              />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Opis <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-white placeholder-white/40 transition-all duration-200 hover:bg-white/10 resize-none"
                  placeholder="Opisz gołębia, jego osiągnięcia, rodowód..."
                />
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-sm font-medium text-white/70 mb-2">Kategoria</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-white transition-all duration-200 hover:bg-white/10"
                  >
                    <option value="pigeons" className="bg-navy">Gołębie</option>
                    <option value="supplements" className="bg-navy">Suplementy</option>
                    <option value="accessories" className="bg-navy">Akcesoria</option>
                  </select>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <label className="block text-sm font-medium text-white/70 mb-2">Płeć</label>
                  <select
                    name="sex"
                    value={formData.sex}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-white transition-all duration-200 hover:bg-white/10"
                  >
                    <option value="male" className="bg-navy">Samiec</option>
                    <option value="female" className="bg-navy">Samica</option>
                  </select>
                </motion.div>
              </div>
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
                        value={String(formData.startingPrice || '')}
                        onChange={handleChange}
                        placeholder="100"
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
                        value={String(formData.buyNowPrice || '')}
                        onChange={handleChange}
                        placeholder="500"
                        type="number"
                        required={isBuyNow}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}

        {currentStep === 2 && isPigeonCategory && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="space-y-6"
          >
            <motion.div 
              className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
                  <Bird className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Cechy gołębia</h3>
                  <p className="text-sm text-white/60">Opisz szczegóły swojego gołębia</p>
                </div>
              </div>

              <InputField
                label="Numer obrączki"
                name="pigeon.ringNumber"
                value={formData.pigeon?.ringNumber || ''}
                onChange={handleChange}
                placeholder="np. DV-0987-11-396"
                required
                highlighted
                delay={0.15}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {pigeonCharacteristics.map((char, index) => (
                  <InputField
                    key={char.name}
                    label={char.label}
                    name={char.name}
                    value={(formData.pigeon as any)?.[char.name.replace('pigeon.', '')] || ''}
                    onChange={handleChange}
                    placeholder={char.placeholder}
                    icon={char.icon}
                    delay={0.2 + index * 0.03}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {currentStep === (isPigeonCategory ? 3 : 2) && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="space-y-6"
          >
            <motion.div 
              className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/30">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Media</h3>
                  <p className="text-sm text-white/60">Dodaj zdjęcia i filmy</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2 text-white">
                    <Camera className="w-5 h-5 text-blue-400" />
                    <span className="font-medium">Zdjęcia gołębia</span>
                  </div>
                  <FileUpload
                    files={pigeonFiles}
                    onFilesChange={setPigeonFiles}
                    maxFiles={10}
                    maxSize={20}
                    accept="image/*"
                  />
                  <p className="text-xs text-white/50">Max 10 zdjęć, do 20MB każde</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2 text-white">
                    <Video className="w-5 h-5 text-green-400" />
                    <span className="font-medium">Wideo</span>
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

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2 text-white">
                    <FileText className="w-5 h-5 text-amber-400" />
                    <span className="font-medium">Rodowód</span>
                  </div>
                  <FileUpload
                    files={pedigreeFile ? [pedigreeFile] : []}
                    onFilesChange={(files) => setPedigreeFile(files[0] || null)}
                    maxFiles={1}
                    maxSize={10}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <p className="text-xs text-white/50">PDF, DOC, DOCX, JPG, PNG - max 10MB</p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="flex gap-4 pt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {currentStep > 1 && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="w-full py-6 rounded-xl border-white/20 text-white hover:bg-white/10 transition-all"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Wróć
            </Button>
          </motion.div>
        )}
        
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
            className="w-full py-6 rounded-xl bg-gradient-to-r from-gold via-gold-light to-gold text-navy font-bold shadow-lg shadow-gold/30 hover:shadow-xl hover:shadow-gold/40 transition-all disabled:opacity-50"
          >
            {loading ? (
              <motion.div 
                className="flex items-center gap-2"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{currentStep === totalSteps ? 'Tworzenie aukcji...' : 'Przetwarzanie...'}</span>
              </motion.div>
            ) : currentStep === totalSteps ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Utwórz aukcję
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Dalej
                <ChevronRight className="w-5 h-5" />
              </span>
            )}
          </Button>
        </motion.div>
      </motion.div>
    </motion.form>
  );
};

export default CreateAuctionForm;
