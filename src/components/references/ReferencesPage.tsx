import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ImageOff,
  MapPin,
  Quote,
  Star,
  Trophy,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddReferenceForm } from '@/components/references/AddReferenceForm';
import { type Reference, referencesService } from '@/services/referencesService';

export function ReferencesPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [references, setReferences] = useState<Reference[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const previouslyActiveElement = useRef<HTMLElement | null>(null);

  const loadReferences = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await referencesService.getReferences();
      setReferences(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReferences();
  }, [loadReferences]);

  useEffect(() => {
    if (references.length === 0) {
      setCurrentIndex(0);
      return;
    }
    if (currentIndex >= references.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex, references.length]);

  const currentRef = references[currentIndex];

  const carouselCountText = useMemo(() => {
    if (references.length === 0) return '0 / 0';
    return `${currentIndex + 1} / ${references.length}`;
  }, [currentIndex, references.length]);

  const getPrimaryImage = (ref: Reference | undefined) => {
    const img = ref?.images?.[0];
    return typeof img === 'string' && img.length > 0 ? img : null;
  };

  const getReferenceTitle = (ref: Reference) => {
    return ref.pigeonName?.trim() || 'Gołębie z hodowli MTM Pałka';
  };

  const formatDatePl = (iso: string | undefined) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('pl-PL');
  };

  const renderAchievements = (ref: Reference) => {
    if (!ref.achievements) return null;

    try {
      const parsed = JSON.parse(ref.achievements) as Array<{ competition?: string; place?: number; date?: string }>;
      if (!Array.isArray(parsed) || parsed.length === 0) return null;

      return (
        <ul className="space-y-1 text-muted-foreground text-sm">
          {parsed.slice(0, 4).map((a, i) => (
            <li key={i}>
              {typeof a.place === 'number' ? `${a.place}. miejsce` : 'Wynik'}
              {a.competition ? ` — ${a.competition}` : ''}
              {a.date ? ` (${formatDatePl(a.date)})` : ''}
            </li>
          ))}
        </ul>
      );
    } catch {
      // achievements may be plain text
      return <p className="text-muted-foreground text-sm">{ref.achievements}</p>;
    }
  };

  const nextSlide = () => {
    if (references.length === 0) return;
    setCurrentIndex(prev => (prev + 1) % references.length);
  };

  const prevSlide = () => {
    if (references.length === 0) return;
    setCurrentIndex(prev => (prev - 1 + references.length) % references.length);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[52vh] flex items-center justify-center overflow-hidden text-center">
        <div className="relative z-10 container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Users className="w-8 h-8 text-gold" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-foreground font-bold leading-tight mb-4">
            Referencje <span className="text-gradient-gold">hodowców</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Poznaj opinie zadowolonych hodowców o naszych gołębiach
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <Button
              ref={triggerButtonRef}
              onClick={() => setIsFormOpen(true)}
              className="bg-gold text-navy hover:bg-gold/90"
            >
              Dodaj opinię
            </Button>
            <Button
              variant="outline"
              onClick={() => void loadReferences()}
              className="border-gold/40 text-foreground hover:bg-gold/10"
            >
              Odśwież
            </Button>
          </div>
        </div>
      </section>

      {/* Main Reference Carousel */}
      <section className="py-20 section-surface-alt">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="max-w-5xl mx-auto">
              <div className="rounded-2xl border border-border/70 bg-card/55 backdrop-blur-md p-10 text-center text-muted-foreground shadow-lg">
                Ładuję referencje…
              </div>
            </div>
          ) : currentRef ? (
            <div className="max-w-5xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                
                {/* Reference Content */}
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <Quote className="w-8 h-8 text-gold shrink-0 mt-1" />
                    <blockquote className="text-xl text-foreground leading-relaxed italic">
                      "{currentRef.opinion}"
                    </blockquote>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-gold" />
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-5 h-5 ${i < Math.max(1, Math.min(5, currentRef.rating)) ? 'text-gold fill-gold' : 'text-muted-foreground'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground ml-2">
                        {currentRef.rating}/5
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-foreground">
                        {currentRef.breederName}
                      </h3>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{currentRef.location}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDatePl(currentRef.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-card/55 backdrop-blur-md border border-border/70 shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Trophy className="w-5 h-5 text-gold" />
                      <h4 className="font-semibold text-foreground">
                        {getReferenceTitle(currentRef)}
                      </h4>
                    </div>
                    {renderAchievements(currentRef)}
                  </div>
                </div>

                {/* Pigeon Image */}
                <div className="relative">
                  <div className="aspect-square rounded-2xl overflow-hidden border border-border/70 bg-card/30 backdrop-blur-md shadow-2xl">
                    {getPrimaryImage(currentRef) ? (
                      <img 
                        src={getPrimaryImage(currentRef) as string} 
                        alt={getReferenceTitle(currentRef)}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-background/30">
                        <div className="text-center text-muted-foreground">
                          <ImageOff className="w-10 h-10 mx-auto mb-3" />
                          <div className="text-sm">Brak zdjęcia</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Navigation */}
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                    <div className="flex items-center gap-4 bg-card/55 backdrop-blur-md border border-border/70 rounded-full p-2 shadow-lg">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={prevSlide}
                        disabled={references.length === 0}
                        className="rounded-full w-10 h-10 p-0"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      
                      <span className="text-sm text-muted-foreground px-2">
                        {carouselCountText}
                      </span>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={nextSlide}
                        disabled={references.length === 0}
                        className="rounded-full w-10 h-10 p-0"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto">
              <div className="rounded-2xl border border-border/70 bg-card/55 backdrop-blur-md p-10 text-center shadow-lg">
                <h2 className="font-display text-2xl font-bold text-foreground">Brak referencji</h2>
                <p className="mt-2 text-muted-foreground">
                  Dodaj pierwszą opinię – pojawi się tutaj od razu.
                </p>
                {/* Use the primary "Dodaj opinię" button in the hero above to open the form */}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* All References Grid */}
      <section className="py-16 section-surface-alt">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Wszystkie <span className="text-gold">referencje</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Zobacz pełną listę opinii zadowolonych hodowców
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {references.map((ref, index) => (
              <div 
                key={ref.id}
                className={`group cursor-pointer p-6 rounded-2xl border transition-all duration-300 ${
                  index === currentIndex 
                    ? 'border-gold/60 bg-gold/10 shadow-lg shadow-gold/10' 
                    : 'border-border/70 bg-card/55 backdrop-blur-md hover:border-gold/30 hover-lift'
                }`}
                onClick={() => setCurrentIndex(index)}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gold/20">
                    {getPrimaryImage(ref) ? (
                      <img 
                        src={getPrimaryImage(ref) as string} 
                        alt={getReferenceTitle(ref)}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <ImageOff className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground group-hover:text-gold transition-colors">
                      {ref.breederName}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{ref.location}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < Math.max(1, Math.min(5, ref.rating)) ? 'text-gold fill-gold' : 'text-muted-foreground'}`} 
                    />
                  ))}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                  "{ref.opinion}"
                </p>

                <div className="text-xs text-gold font-medium">
                  {getReferenceTitle(ref)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-reference-title"
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/70"
              aria-label="Zamknij"
              onClick={() => setIsFormOpen(false)}
            />

            <div
              ref={modalRef}
              className="relative z-10 w-full max-w-3xl"
              onKeyDown={(e) => {
                // Focus trap + ESC handling
                if (e.key === 'Escape') {
                  e.stopPropagation();
                  setIsFormOpen(false);
                  return;
                }

                if (e.key === 'Tab') {
                  const container = modalRef.current;
                  if (!container) return;
                  const focusable = Array.from(
                    container.querySelectorAll<HTMLElement>(
                      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
                    ),
                  ).filter((el) => el.offsetParent !== null);

                  if (focusable.length === 0) {
                    e.preventDefault();
                    return;
                  }

                  const idx = focusable.indexOf(document.activeElement as HTMLElement);
                  if (e.shiftKey) {
                    // backwards
                    const prev = idx <= 0 ? focusable.length - 1 : idx - 1;
                    focusable[prev].focus();
                    e.preventDefault();
                  } else {
                    const next = idx === -1 || idx === focusable.length - 1 ? 0 : idx + 1;
                    focusable[next].focus();
                    e.preventDefault();
                  }
                }
              }}
            >
              <AddReferenceForm
                onCancel={() => setIsFormOpen(false)}
                onSuccess={() => {
                  setIsFormOpen(false);
                  void loadReferences();
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manage focus/scroll lock when modal opens */}
      {isFormOpen && (
        <ModalSideEffects
          modalRef={modalRef}
          triggerRef={triggerButtonRef}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
}

function ModalSideEffects({
  modalRef,
  triggerRef,
  onClose,
}: {
  modalRef: React.RefObject<HTMLDivElement>;
  triggerRef: React.RefObject<HTMLButtonElement>;
  onClose: () => void;
}) {
  const previouslyActive = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previouslyActive.current = document.activeElement as HTMLElement | null;

    // lock scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // focus first focusable inside modal
    const container = modalRef.current;
    if (container) {
      const first = container.querySelector<HTMLElement>('input,select,textarea,button,a[href],[tabindex]:not([tabindex="-1"])');
      try {
        first?.focus();
      } catch (err) {
        // ignore optional parse errors
      }
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', onKey);

    const triggerEl = triggerRef.current;
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      // restore focus
      try {
        (triggerEl ?? previouslyActive.current)?.focus();
      } catch (err) {
        // ignore optional parse errors
      }
    };
  }, [modalRef, onClose, triggerRef]);

  return null;
}
