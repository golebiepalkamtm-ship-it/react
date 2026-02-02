import { useState, useEffect, useRef, useCallback, type ChangeEvent, type FormEvent, type MutableRefObject, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { auctionService } from '@/services/auctionService';
import { uploadService } from '@/services/uploadService';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api';
import type { CreateAuctionRequest } from '@/types/auction';
import { X, AlertCircle, Loader2, Bird, Check, ChevronRight, ChevronLeft, ChevronDown, Upload, Camera, Video, FileText, Sparkles, Eye, Palette, Dumbbell, Heart, Scale, Feather, Ruler, Zap, Shield } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { UnifiedModal } from '@/components/ui/UnifiedModal';
import FileUpload from '@/components/FileUpload';

const MAX_IMAGE_FILES = 10;
const MAX_IMAGE_SIZE_MB = 20;
const MAX_VIDEO_FILES = 2;
const MAX_VIDEO_SIZE_MB = 50;

export interface FormControls {
  goBack: () => void;
  submit: () => void;
  getStep: () => number;
}

interface CreateAuctionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialCategory?: 'pigeons' | 'supplements' | 'accessories' | '';
  controlsRef?: MutableRefObject<FormControls | null>;
  onStepChange?: (step: number, total: number) => void;
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

interface DnaDropdownProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

const DnaDropdown = ({ value, onChange }: DnaDropdownProps) => {
  const options = ['Tak', 'Nie'];
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const portalRef = useRef<HTMLDivElement | null>(null);
  const [portalStyle, setPortalStyle] = useState<CSSProperties>({});

  const updatePortalPosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPortalStyle({
      position: 'fixed',
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
      zIndex: 12000,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePortalPosition();
    const handleResize = () => updatePortalPosition();
    const handleScroll = () => updatePortalPosition();
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (portalRef.current?.contains(target)) return;
      setOpen(false);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);
    document.addEventListener('mousedown', handleClick);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [open, updatePortalPosition]);

  return (
    <>
      <div ref={containerRef} className="relative">
        <div className="flex items-center gap-2 text-xs text-white/60 mb-1">
          <Shield className="w-3.5 h-3.5 text-gold" />
          <span className="font-semibold uppercase tracking-wide">8. Certyfikat DNA (Tak/Nie)</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-left text-sm text-white/80 hover:border-gold/60 transition flex items-center gap-2"
        >
          <span className="flex-1">{value ? 'Tak' : 'Nie'}</span>
          <ChevronDown
            className={`w-4 h-4 text-white/60 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </div>
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={portalRef}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              style={portalStyle}
              className="rounded-2xl border border-white/10 bg-gray-950 shadow-none"
            >
              <div className="py-1">
                {options.map((option) => {
                  const selected = value === (option === 'Tak');
                  return (
                    <label
                      key={option}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:bg-white/5 cursor-pointer select-none"
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <input
                        type="radio"
                        checked={selected}
                        onChange={() => onChange(option === 'Tak')}
                        className="h-4 w-4 rounded-full border-white/30 bg-transparent checked:bg-gold checked:border-gold focus:ring-gold"
                      />
                      <span className="flex-1">{option}</span>
                    </label>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
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
  </motion.div>
);

interface TraitDropdownProps {
  label: string;
  description?: string;
  field: TraitField;
  icon: LucideIcon;
  options: string[];
  value: string[];
  onChange: (field: TraitField, values: string[]) => void;
}

const TraitDropdown = ({ label, description, field, icon: Icon, options, value, onChange }: TraitDropdownProps) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const portalRef = useRef<HTMLDivElement | null>(null);
  const [portalStyle, setPortalStyle] = useState<CSSProperties>({});

  const updatePortalPosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPortalStyle({
      position: 'fixed',
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
      zIndex: 12000,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePortalPosition();
    const handleResize = () => updatePortalPosition();
    const handleScroll = () => updatePortalPosition();
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (portalRef.current?.contains(target)) return;
      setOpen(false);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);
    document.addEventListener('mousedown', handleClick);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [open, updatePortalPosition]);

  const toggleOption = (option: string) => {
    const next = value.includes(option) ? value.filter((v) => v !== option) : [...value, option];
    onChange(field, next);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2 text-xs text-white/60 mb-1">
        <Icon className="w-3.5 h-3.5 text-gold" />
        <span className="font-semibold uppercase tracking-wide">{label}</span>
      </div>
      {description && <p className="text-[10px] text-white/40 mb-1">{description}</p>}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-left text-sm text-white/80 hover:border-gold/60 transition flex items-center gap-2"
      >
        <span className="flex-1 truncate">
          {value.length ? value.join(', ') : 'Wybierz z listy'}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-white/60 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[10000] pointer-events-none"
            >
              <motion.div
                ref={portalRef}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                style={portalStyle}
                className="rounded-2xl border border-white/15 bg-gray-950 shadow-2xl pointer-events-auto"
              >
                <div className="py-1 max-h-52 overflow-y-auto">
                  {options.map((option) => {
                    const selected = value.includes(option);
                    return (
                      <label
                        key={option}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:bg-white/5 cursor-pointer select-none"
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleOption(option)}
                          className="h-4 w-4 rounded border-white/30 bg-transparent checked:bg-gold checked:border-gold focus:ring-gold"
                        />
                        <span className="flex-1">{option}</span>
                      </label>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between border-t border-white/10 px-3 py-2 text-[10px] uppercase tracking-wide text-white/60">
                  <button type="button" onClick={() => onChange(field, options)} className="hover:text-gold">
                    zaznacz wszystkie
                  </button>
                  <button type="button" onClick={() => onChange(field, [])} className="hover:text-red-400">
                    wyczyść
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

type TraitField =
  | 'colorTraits'
  | 'eyeTraits'
  | 'bodyStructureTraits'
  | 'breastboneTraits'
  | 'forkTraits'
  | 'musculatureTraits'
  | 'backTraits'
  | 'wingTraits'
  | 'wingBehaviorTraits'
  | 'breedingValueTraits'
  | 'distanceTraits';

interface TraitSelectConfig {
  label: string;
  description?: string;
  field: TraitField;
  icon: LucideIcon;
  options: string[];
}

const traitSelects: TraitSelectConfig[] = [
  {
    label: 'Ubarwienie',
    icon: Palette,
    field: 'colorTraits',
    options: [
      'Niebieska',
      'Niebiesko-nakrapiana',
      'Ciemno-nakrapiana',
      'Ciemna',
      'Czarna',
      'Czerwona',
      'Czerwono-nakrapiana',
      'Płowa',
      'Biała',
      'Szpakowata',
      'Pstra',
    ],
  },
  {
    label: 'Oko',
    icon: Eye,
    field: 'eyeTraits',
    options: [
      'Perłowe',
      'Pomarańczowe',
      'Żółte',
      'Bycze',
      'Pierścień Vermeyena pełny',
      'Pierścień Vermeyena niepełny',
    ],
  },
  {
    label: 'Budowa',
    icon: Dumbbell,
    field: 'bodyStructureTraits',
    options: [
      'Budowa zwarta',
      'Budowa średnia',
      'Budowa długa',
      'Mostek: Wysoki',
      'Mostek: Płaski',
      'Widełki: Zwarte',
      'Widełki: Otwarte',
    ],
  },
  {
    label: 'Muskulatura',
    icon: Heart,
    field: 'musculatureTraits',
    options: [
      'Elastyczna',
      'Pełna',
      'Sucha',
      'Grzbiet: Bardzo mocny',
      'Grzbiet: Mocny',
      'Grzbiet: Standardowy',
    ],
  },
  {
    label: 'Skrzydło i Upierzenie',
    icon: Feather,
    field: 'wingTraits',
    options: [
      'Pióro jedwabiste',
      'Pióro suche',
      'Lotka: Wąska',
      'Lotka: Szeroka',
      'Skrzydło: Aktywne',
      'Skrzydło: Pasywne',
    ],
  },
  {
    label: 'Wartość hodowlana',
    icon: Shield,
    field: 'breedingValueTraits',
    options: [
      'Sprawdzony rozpłodowiec',
      'Sprawdzony lotnik',
      'Potencjał rozpłodowy',
    ],
  },
  {
    label: 'Przeznaczenie',
    icon: Ruler,
    field: 'distanceTraits',
    options: [
      'Krótki dystans',
      'Średni dystans',
      'Długi dystans',
      'Maraton',
    ],
  },
];

const createDefaultPigeon = (): NonNullable<CreateAuctionRequest['pigeon']> => ({
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
  dnaCertificate: false,
  colorTraits: [],
  eyeTraits: [],
  bodyStructureTraits: [],
  breastboneTraits: [],
  forkTraits: [],
  musculatureTraits: [],
  backTraits: [],
  wingTraits: [],
  wingBehaviorTraits: [],
  breedingValueTraits: [],
  distanceTraits: [],
});

const CreateAuctionForm = ({
  onSuccess,
  onCancel,
  initialCategory = '',
  controlsRef,
  onStepChange
}: CreateAuctionFormProps) => {
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
    pigeon: createDefaultPigeon(),
  });

  const [pedigreeFile, setPedigreeFile] = useState<File | null>(null);
  const [pigeonFiles, setPigeonFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isBidding, setIsBidding] = useState(true);
  const [isBuyNow, setIsBuyNow] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const isPigeonCategory = formData.category === 'pigeons';
  const isSupplementCategory = formData.category === 'supplements';
  const isAccessoryCategory = formData.category === 'accessories';
  const totalSteps = isPigeonCategory ? 3 : 2;

  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
    onClose?: () => void;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const steps = isPigeonCategory
    ? [
        { step: 1, label: 'Podstawowe', icon: Bird },
        { step: 2, label: 'Cechy gołębia', icon: Eye },
        { step: 3, label: 'Media', icon: Camera },
      ]
    : [
        { step: 1, label: 'Podstawowe', icon: Bird },
        { step: 2, label: 'Media', icon: Camera },
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

  useEffect(() => {
    setFormData((prev) => ({ ...prev, category: initialCategory }));
  }, [initialCategory]);

  useEffect(() => {
    if (!controlsRef) return;
    controlsRef.current = {
      goBack: () => setCurrentStep((prev) => Math.max(1, prev - 1)),
      submit: () => {
        if (formRef.current) {
          formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
      },
      getStep: () => currentStep,
    };
    return () => {
      if (controlsRef) controlsRef.current = null;
    };
  }, [controlsRef, currentStep]);

  useEffect(() => {
    onStepChange?.(currentStep, totalSteps);
    // onStepChange pochodzi z rodzica (anonimowa funkcja) — nie dodajemy do deps, żeby uniknąć pętli renderów
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, totalSteps]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('pigeon.')) {
      const pigeonField = name.replace('pigeon.', '');
      setFormData(prev => {
        const snapshot = { ...(prev.pigeon ?? createDefaultPigeon()) };
        return {
          ...prev,
          pigeon: {
            ...snapshot,
            [pigeonField]: value,
          },
        };
      });
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTraitSelect = useCallback((field: TraitField, values: string[]) => {
    setFormData(prev => {
      const snapshot = { ...(prev.pigeon ?? createDefaultPigeon()) };
      return {
        ...prev,
        pigeon: {
          ...snapshot,
          [field]: values,
        },
      };
    });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      return;
    }

    if (!user) {
      setError('Musisz być zalogowany');
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'Błąd',
        message: 'Musisz się zalogować, aby utworzyć aukcję. Zaloguj się i spróbuj ponownie.'
      });
      return;
    }

    if (!profile) {
      setError('Ładowanie profilu...');
      setFeedbackModal({
        isOpen: true,
        type: 'info',
        title: 'Ładowanie',
        message: 'Ładuję Twój profil... Poczekaj chwilę i spróbuj ponownie.'
      });
      return;
    }

    if (profile.role === 'USER_REGISTERED') {
      setError('Musisz potwierdzić email, aby tworzyć aukcje.');
      setFeedbackModal({
        isOpen: true,
        type: 'warning',
        title: 'Wymagana weryfikacja',
        message: 'Najpierw potwierdź email. Wejdź w link w emailu weryfikacyjnym, a potem spróbuj ponownie.'
      });
      return;
    }

    if (profile.role === 'USER_EMAIL_VERIFIED') {
      setError('Musisz zweryfikować numer telefonu, aby tworzyć aukcje.');
      setFeedbackModal({
        isOpen: true,
        type: 'warning',
        title: 'Wymagana weryfikacja',
        message: 'Dokończ weryfikację konta. Uzupełnij profil i zweryfikuj numer telefonu, aby móc tworzyć aukcje.'
      });
      return;
    }

    if (profile.role !== 'ADMIN' && profile.role !== 'USER_FULL_VERIFIED') {
      setError('Brak uprawnień do tworzenia aukcji.');
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'Brak uprawnień',
        message: 'Brak uprawnień do tworzenia aukcji. Dokończ weryfikację konta (email + telefon) i spróbuj ponownie.'
      });
      return;
    }

    if (!isBidding && !isBuyNow) {
      setError('Musisz wybrać co najmniej jedną opcję sprzedaży (licytacja lub kup teraz).');
      return;
    }

    const startingPriceNumber = Number(formData.startingPrice ?? 0);
    const buyNowPriceNumber = Number(formData.buyNowPrice ?? 0);

    if (isBidding && (!startingPriceNumber || startingPriceNumber <= 0)) {
      setError('Cena wywoławcza musi być większa niż 0.');
      return;
    }

    if (isBuyNow && (!buyNowPriceNumber || buyNowPriceNumber <= 0)) {
      setError('Cena Kup Teraz musi być większa niż 0.');
      return;
    }

    if (isBidding && isBuyNow && buyNowPriceNumber < startingPriceNumber) {
      setError('Cena Kup Teraz musi być większa lub równa cenie wywoławczej.');
      return;
    }

    if (isPigeonCategory) {
      const ringNumber = formData.pigeon?.ringNumber?.trim();
      if (!ringNumber) {
        setError('Podaj numer obrączki gołębia.');
        setFeedbackModal({
          isOpen: true,
          type: 'error',
          title: 'Brak danych',
          message: 'Brakuje numeru obrączki. Uzupełnij numer obrączki (ringNumber), aby utworzyć aukcję.'
        });
        return;
      }
    } else {
      setFormData((prev) => ({ ...prev, pigeon: undefined }));
    }

    if (!formData.category) {
      setError('Wybierz kategorię aukcji.');
      return;
    }

    if (!session?.access_token) {
      setError('Brak tokenu sesji. Zaloguj się ponownie.');
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'Sesja wygasła',
        message: 'Sesja wygasła lub jest niekompletna. Wyloguj się i zaloguj ponownie, a potem spróbuj jeszcze raz.'
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      setFeedbackModal({
        isOpen: true,
        type: 'info',
        title: 'Przygotowywanie',
        message: 'Przygotowuję dane aukcji...'
      });

      const token = session.access_token;

      let pedigreeUrl = '';
      if (pedigreeFile) {
        setFeedbackModal(prev => ({ ...prev, message: 'Przesyłam rodowód...' }));
        const res = await uploadService.uploadDocument(pedigreeFile, token);
        pedigreeUrl = res.url;
      }

      const imageUrls: string[] = [];
      if (pigeonFiles.length > 0) {
        if (pigeonFiles.length > MAX_IMAGE_FILES) {
          throw new Error(`Zbyt wiele zdjęć (max ${MAX_IMAGE_FILES}).`);
        }
        setFeedbackModal(prev => ({ ...prev, message: `Przesyłam zdjęcia (0/${pigeonFiles.length})...` }));
        for (let i = 0; i < pigeonFiles.length; i++) {
          const file = pigeonFiles[i];
          if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
            throw new Error(`Każde zdjęcie musi być <= ${MAX_IMAGE_SIZE_MB}MB.`);
          }
          setFeedbackModal(prev => ({ ...prev, message: `Przesyłam zdjęcia (${i + 1}/${pigeonFiles.length})...` }));
          const res = await uploadService.uploadImage(file, token);
          imageUrls.push(res.url);
        }
      } else {
        throw new Error('Dodaj co najmniej jedno zdjęcie.');
      }

      const videoUrls: string[] = [];
      if (videoFiles.length > 0) {
        if (videoFiles.length > MAX_VIDEO_FILES) {
          throw new Error(`Zbyt wiele filmów (max ${MAX_VIDEO_FILES}).`);
        }
        setFeedbackModal(prev => ({ ...prev, message: `Przesyłam filmy (0/${videoFiles.length})...` }));
        for (let i = 0; i < videoFiles.length; i++) {
          const file = videoFiles[i];
          if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
            throw new Error(`Każdy film musi być <= ${MAX_VIDEO_SIZE_MB}MB.`);
          }
          setFeedbackModal(prev => ({ ...prev, message: `Przesyłam filmy (${i + 1}/${videoFiles.length})...` }));
          const res = await uploadService.uploadVideo(file, token);
          videoUrls.push(res.url);
        }
      }

      setFeedbackModal(prev => ({ ...prev, message: 'Tworzę aukcję...' }));
      
      const endTime = new Date();
      endTime.setDate(endTime.getDate() + 7);

      const ringNumber = formData.pigeon?.ringNumber?.trim();

      const mapCategory = (category: string): CreateAuctionRequest['category'] => {
        if (category === 'pigeons') return 'RACING';
        if (category === 'supplements') return 'SHOW';
        if (category === 'accessories') return 'BREEDING';
        return category as CreateAuctionRequest['category'];
      };

      const auctionData: CreateAuctionRequest = {
        title: formData.title || '',
        description: formData.description || '',
        startingPrice: isBidding ? startingPriceNumber : undefined,
        buyNowPrice: isBuyNow ? buyNowPriceNumber : undefined,
        category: mapCategory(formData.category || 'RACING'),
        sex: formData.sex as 'male' | 'female',
        location: formData.location || 'Lubań, Polska',
        images: imageUrls,
        videos: videoUrls,
        endTime: endTime.toISOString(),
        pigeon: isPigeonCategory ? {
          ...formData.pigeon,
          ringNumber: ringNumber,
          gender: formData.sex as 'male' | 'female',
        } : {},
      };

      await auctionService.createAuction(auctionData, token);
      
      setFeedbackModal({
        isOpen: true,
        type: 'success',
        title: 'Sukces',
        message: 'Aukcja została utworzona pomyślnie!',
        onClose: onSuccess
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd podczas tworzenia aukcji');
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'Błąd',
        message: 'Nie udało się utworzyć aukcji. Spróbuj ponownie.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form 
      ref={formRef}
      onSubmit={handleSubmit} 
      className="space-y-5"
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
        className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-4">
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
          className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-gold/10 border border-gold/30"
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
            className="space-y-2.5"
          >
            <motion.div 
              className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2.5 mb-1">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-gold to-gold-dark shadow-lg shadow-gold/30">
                  <Bird className="w-5 h-5 text-navy" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">Podstawowe informacje</h3>
                </div>
              </div>

              <InputField
                label="Tytuł aukcji"
                name="title"
                value={formData.title || ''}
                onChange={handleChange}
                placeholder={
                  isPigeonCategory
                    ? "np. Champion Bloodline - Złoty Orzeł"
                    : isSupplementCategory
                      ? "np. Premium mix witamin dla gołębi"
                      : "np. Profesjonalna klatka transportowa / poidło"
                }
                required
                delay={0.1}
              />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="-mt-1"
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/20 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-white placeholder-white/40 transition-all duration-200 hover:bg-white/10 resize-none"
                  placeholder={
                    isPigeonCategory
                      ? "Opisz gołębia, jego osiągnięcia, rodowód..."
                      : isSupplementCategory
                        ? "Opisz suplement: skład, przeznaczenie, dawkowanie, korzyści..."
                        : "Opisz akcesorium: materiał, wymiary, zastosowanie, zalety..."
                  }
                />
              </motion.div>

              <div className="space-y-3 -mt-1" />
            </motion.div>

            <motion.div 
              className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
                <div className="flex items-center gap-2 text-sm font-semibold text-white whitespace-nowrap">
                  <span className="text-lg">💰</span> Opcje sprzedaży
                </div>
                <div className="flex flex-nowrap items-stretch gap-2 w-full">
                  <motion.label 
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 flex-1 min-w-0 ${
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
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 flex-1 min-w-0 ${
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
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
            className="space-y-4.5"
          >
            <motion.div 
              className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <InputField
                  label="Numer obrączki"
                  name="pigeon.ringNumber"
                  value={formData.pigeon?.ringNumber || ''}
                  onChange={handleChange}
                  placeholder="np. PL-0123-22-12345"
                  required
                />
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="group"
                >
                  <label className="block text-sm font-medium mb-2 text-white/70 group-focus-within:text-gold transition-colors">
                    Płeć <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="sex"
                      value={formData.sex || 'male'}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-white placeholder-white/40 transition-all duration-200 hover:bg-white/10 hover:border-white/30"
                    >
                      <option value="male" className="bg-slate-900 text-white">Samiec</option>
                      <option value="female" className="bg-slate-900 text-white">Samica</option>
                    </select>
                  </div>
                </motion.div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-visible">
                {traitSelects.map((trait) => (
                  <motion.div key={trait.field} className="relative z-10 overflow-visible">
                    <TraitDropdown
                      label={trait.label}
                      description={trait.description}
                      field={trait.field}
                      icon={trait.icon}
                      options={trait.options}
                      value={(formData.pigeon?.[trait.field] as string[]) || []}
                      onChange={handleTraitSelect}
                    />
                  </motion.div>
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
            className="space-y-4.5"
          >
            <motion.div 
              className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/30">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">Media</h3>
                  <p className="text-xs text-white/60">
                    {isPigeonCategory ? 'Dodaj zdjęcia i filmy gołębia' : 'Dodaj materiały produktu'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2 text-white">
                    <Camera className="w-5 h-5 text-blue-400" />
                    <span className="font-medium">Zdjęcia</span>
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
                    <span className="font-medium">Dokument</span>
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

      {/* Feedback Modal */}
      <UnifiedModal
        isOpen={feedbackModal.isOpen}
        onClose={() => {
          setFeedbackModal(prev => ({ ...prev, isOpen: false }));
          if (feedbackModal.onClose) feedbackModal.onClose();
        }}
        type={feedbackModal.type}
        title={feedbackModal.title}
        message={feedbackModal.message}
        confirmButton={{
          text: feedbackModal.onClose ? "OK" : "Zamknij",
          onClick: () => {
            setFeedbackModal(prev => ({ ...prev, isOpen: false }));
            if (feedbackModal.onClose) feedbackModal.onClose();
          }
        }}
      />
    </motion.form>
  );
};

export default CreateAuctionForm;
