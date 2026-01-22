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
      className="flex items-center gap-2"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: step * 0.1 }}
    >
      <motion.div
        className={`relative w-8 h-8 rounded-md flex items-center justify-center font-bold text-xs transition-all duration-300 ${
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
            <Check className="w-3.5 h-3.5" />
          </motion.div>
        ) : (
          <Icon className="w-3.5 h-3.5" />
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
          className={`text-[10px] font-medium transition-colors ${isActive ? 'text-gold' : isCompleted ? 'text-green-400' : 'text-white/50'}`}
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
    className={`group ${highlighted ? 'p-2 rounded-lg border-2 border-gold/30 bg-gold/5' : ''}`}
  >
    <label className={`block text-[11px] font-medium mb-1 transition-colors ${highlighted ? 'text-gold font-semibold' : 'text-white/70 group-focus-within:text-gold'}`}>
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-gold transition-colors">
          <Icon className="w-3.5 h-3.5" />
        </div>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={`w-full ${Icon ? 'pl-9' : 'px-2.5'} pr-2.5 py-1.5 rounded-md bg-white/5 border border-white/20 focus:border-gold focus:ring-1 focus:ring-gold/20 outline-none text-white placeholder-white/40 transition-all duration-200 hover:bg-white/10 hover:border-white/30 text-xs`}
      />
    </div>
    {highlighted && (
      <p className="text-[9px] text-white/50 mt-1">Wprowadź pełny numer obrączki gołębia</p>
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

    if (profile.role !== 'ADMIN' && profile.role !== 'USER_FULL_VERIFIED') {
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
    } else {
      // Dla kategorii innych niż gołębie, usuń dane gołębia lub ustaw wartości domyślne/puste
      formData.pigeon = undefined;
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
        category: formData.category || 'RACING', // Default to RACING if generic
        sex: formData.sex as 'male' | 'female',
        location: formData.location || 'Lubań, Polska',
        images: imageUrls,
        videos: videoUrls,
        endTime: endTime.toISOString(),
        pigeon: isPigeonCategory ? {
          ...formData.pigeon,
          ringNumber: ringNumber || '',
          gender: formData.sex as 'male' | 'female',
        } : {},
      };

      // Mapowanie kategorii z formularza na enum API
      if (auctionData.category === 'pigeons') auctionData.category = 'RACING';
      if (auctionData.category === 'supplements') auctionData.category = 'SHOW'; // Tymczasowe mapowanie
      if (auctionData.category === 'accessories') auctionData.category = 'BREEDING'; // Tymczasowe mapowanie

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
      className="space-y-1"
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
            className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-400 backdrop-blur-sm"
          >
            <div className="p-1.5 rounded-lg bg-red-500/20">
              <AlertCircle className="w-4 h-4" />
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
        className="flex items-center justify-between gap-1.5 p-1.5 rounded-md bg-white/5 border border-white/10 backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2">
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
          className="hidden md:flex items-center gap-1 px-2 py-1 rounded-md bg-gold/10 border border-gold/30"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Sparkles className="w-2.5 h-2.5 text-gold" />
          <span className="text-[10px] text-gold font-medium">
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
            className="space-y-1"
          >
            <motion.div 
              className="p-2 rounded-lg bg-gradient-to-br from-white/5 via-white/0 to-white/5 border border-white/10 backdrop-blur-sm space-y-1.5 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_20%_20%,rgba(212,175,55,0.12),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(96,165,250,0.2),transparent_28%)] pointer-events-none" />

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
                <label className="block text-xs font-medium text-white/70 mb-1">
                  Opis <span className="text-red-400">*</span>
                </label>
                <div className="rounded-lg border border-white/15 bg-white/5 focus-within:border-gold/60 focus-within:shadow-[0_10px_40px_rgba(212,175,55,0.18)] transition-all">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={2}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-transparent outline-none text-white placeholder-white/40 transition-all duration-200 text-sm"
                    placeholder="Opisz gołębia, jego osiągnięcia, rodowód..."
                  />
                  <div className="flex items-center justify-between px-2.5 pb-1.5 text-[10px] text-white/50">
                    <span>Opowiedz historię – osiągnięcia, linia, dlaczego jest wyjątkowy.</span>
                    <span className="text-gold font-semibold">Storytelling sprzedaje szybciej 🔥</span>
                  </div>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,0.8fr] gap-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium text-white/70">Płeć</label>
                    <span className="text-[9px] text-white/50">Pomaga filtrować</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[
                      { value: 'male', label: 'Samiec' },
                      { value: 'female', label: 'Samica' },
                    ].map((item) => {
                      const active = formData.sex === item.value;
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, sex: item.value as 'male' | 'female' }))}
                          className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                            active
                              ? 'border-gold bg-gold/15 text-gold shadow-lg shadow-gold/20'
                              : 'border-white/15 bg-white/5 text-white/70 hover:border-white/30 hover:text-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div 
              className="p-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm space-y-1.5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                <span className="text-base">💰</span> Opcje sprzedaży
              </h3>

              <div className="flex flex-wrap gap-1.5">
                <motion.label 
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md cursor-pointer transition-all duration-300 ${
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
                  <div className={`w-4 h-4 rounded flex items-center justify-center ${isBidding ? 'bg-gold' : 'border-2 border-white/30'}`}>
                    {isBidding && <Check className="w-2.5 h-2.5 text-navy" />}
                  </div>
                  <span className="font-medium text-xs">Licytacja</span>
                </motion.label>

                <motion.label 
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md cursor-pointer transition-all duration-300 ${
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
                  <div className={`w-4 h-4 rounded flex items-center justify-center ${isBuyNow ? 'bg-gold' : 'border-2 border-white/30'}`}>
                    {isBuyNow && <Check className="w-2.5 h-2.5 text-navy" />}
                  </div>
                  <span className="font-medium text-xs">Kup Teraz</span>
                </motion.label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
            className="space-y-1.5"
          >
            <motion.div 
              className="p-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <div className="p-1.5 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
                  <Bird className="w-3 h-3 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Cechy gołębia</h3>
                  <p className="text-[10px] text-white/60">Opisz szczegóły swojego gołębia</p>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 mt-2">
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
            className="space-y-1.5"
          >
            <motion.div 
              className="p-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <div className="p-1.5 rounded-md bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/30">
                  <Upload className="w-3 h-3 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Media</h3>
                  <p className="text-[10px] text-white/60">Dodaj zdjęcia i filmy</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="space-y-1.5"
                >
                  <div className="flex items-center gap-1 text-white">
                    <Camera className="w-3.5 h-3.5 text-blue-400" />
                    <span className="font-medium text-xs">Zdjęcia gołębia</span>
                  </div>
                  <FileUpload
                    files={pigeonFiles}
                    onFilesChange={setPigeonFiles}
                    maxFiles={10}
                    maxSize={20}
                    accept="image/*"
                  />
                  <p className="text-[10px] text-white/50">Max 10 zdjęć, do 20MB każde</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-1.5"
                >
                  <div className="flex items-center gap-1 text-white">
                    <Video className="w-3.5 h-3.5 text-green-400" />
                    <span className="font-medium text-xs">Wideo</span>
                  </div>
                  <FileUpload
                    files={videoFiles}
                    onFilesChange={setVideoFiles}
                    maxFiles={2}
                    maxSize={50}
                    accept="video/*"
                  />
                  <p className="text-[10px] text-white/50">Max 2 filmy, do 50MB każdy</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="space-y-1.5"
                >
                  <div className="flex items-center gap-1 text-white">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-medium text-xs">Rodowód</span>
                  </div>
                  <FileUpload
                    files={pedigreeFile ? [pedigreeFile] : []}
                    onFilesChange={(files) => setPedigreeFile(files[0] || null)}
                    maxFiles={1}
                    maxSize={10}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <p className="text-[10px] text-white/50">PDF, DOC, DOCX, JPG, PNG - max 10MB</p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="flex gap-1 pt-0.5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep(currentStep - 1)}
            disabled={currentStep === 1}
            className="w-full py-1.5 rounded-md border-white/20 text-white hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs"
          >
            <ChevronLeft className="w-3 h-3 mr-1" />
            Wróć
          </Button>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel} 
            className="w-full py-1.5 rounded-md border-white/20 text-white hover:bg-white/10 transition-all text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Anuluj
          </Button>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 md:flex-[2]">
          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full py-1.5 rounded-md bg-gradient-to-r from-gold via-gold-light to-gold text-navy font-bold shadow-lg shadow-gold/30 hover:shadow-xl hover:shadow-gold/40 transition-all disabled:opacity-50 text-xs"
          >
            {loading ? (
              <motion.div 
                className="flex items-center gap-1"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="text-xs">{currentStep === totalSteps ? 'Tworzenie aukcji...' : 'Przetwarzanie...'}</span>
              </motion.div>
            ) : currentStep === totalSteps ? (
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Utwórz aukcję
              </span>
            ) : (
              <span className="flex items-center gap-1">
                Dalej
                <ChevronRight className="w-3 h-3" />
              </span>
            )}
          </Button>
        </motion.div>
      </motion.div>
    </motion.form>
  );
};

export default CreateAuctionForm;
