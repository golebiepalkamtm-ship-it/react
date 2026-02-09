import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Camera, MapPin, MessageSquare, Plus, Star, Trophy, User, X } from 'lucide-react';
import { useState, useEffect } from "react";
import { referenceService } from "@/services/referenceService";
import { UnifiedModal } from "@/components/ui/UnifiedModal";

interface Achievement {
  pigeon: string;
  ringNumber: string;
  results: Array<{
    competition: string;
    place: number;
    date: string;
  }>;
}

interface AddReferenceFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddReferenceForm({ onSuccess, onCancel }: AddReferenceFormProps) {
  const [formData, setFormData] = useState({
    breederName: '',
    location: '',
    experience: '',
    testimonial: '',
    rating: 5,
  });

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      pigeon: '',
      ringNumber: '',
      results: [{ competition: '', place: 1, date: '' }],
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
    onClose?: () => void;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  useEffect(() => {
    return () => {
      if (imagePreview) {
        try {
          URL.revokeObjectURL(imagePreview);
        } catch (err) {
          // ignore parse errors from optional fields
        }
      }
    };
  }, [imagePreview]);

  // Sprawdź czy przeglądarka obsługuje input[type=date]
  useEffect(() => {
    const testInput = document.createElement('input');
    testInput.type = 'date';
    const supportsDate = testInput.type === 'date';

    if (!supportsDate) {
      // Ukryj input[type=date] i pokaż fallback
      const dateInputs = document.querySelectorAll('input[type="date"][data-fallback="true"]');
      const fallbackInputs = document.querySelectorAll('.datetime-fallback');

      dateInputs.forEach((input, index) => {
        const fallback = fallbackInputs[index] as HTMLElement;
        if (fallback) {
          input.classList.add('hidden');
          fallback.classList.remove('hidden');
        }
      });
    }
  }, []);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAchievementChange = (index: number, field: string, value: string) => {
    setAchievements(prev =>
      prev.map((achievement, i) => (i === index ? { ...achievement, [field]: value } : achievement)),
    );
  };

  const handleResultChange = (
    achievementIndex: number,
    resultIndex: number,
    field: string,
    value: string | number,
  ) => {
    setAchievements(prev =>
      prev.map((achievement, i) =>
        i === achievementIndex
          ? {
              ...achievement,
              results: achievement.results.map((result, j) =>
                j === resultIndex ? { ...result, [field]: value } : result,
              ),
            }
          : achievement,
      ),
    );
  };

  const addAchievement = () => {
    setAchievements(prev => [
      ...prev,
      {
        pigeon: '',
        ringNumber: '',
        results: [{ competition: '', place: 1, date: '' }],
      },
    ]);
  };

  const removeAchievement = (index: number) => {
    setAchievements(prev => prev.filter((_, i) => i !== index));
  };

  const addResult = (achievementIndex: number) => {
    setAchievements(prev =>
      prev.map((achievement, i) =>
        i === achievementIndex
          ? {
              ...achievement,
              results: [...achievement.results, { competition: '', place: 1, date: '' }],
            }
          : achievement,
      ),
    );
  };

  const removeResult = (achievementIndex: number, resultIndex: number) => {
    setAchievements(prev =>
      prev.map((achievement, i) =>
        i === achievementIndex
          ? {
              ...achievement,
              results: achievement.results.filter((_, j) => j !== resultIndex),
            }
          : achievement,
      ),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // simple client-side validation
    if ((formData.testimonial ?? '').trim().length < 20) {
      const msg = 'Opinia jest za krótka — podaj co najmniej 20 znaków.';
      setError(msg);
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'Błąd',
        message: msg
      });
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const body = new FormData();
      if (image) {
        body.append('image', image as Blob);
      }
      body.append(
        'data',
        JSON.stringify({
          ...formData,
          achievements: achievements.filter(
            achievement =>
              achievement.pigeon &&
              achievement.ringNumber &&
              achievement.results.some(result => result.competition && result.date),
          ),
        }),
      );

      await referenceService.addReferenceWithFiles(body);

      setFeedbackModal({
        isOpen: true,
        type: 'success',
        title: 'Sukces',
        message: 'Referencja została dodana pomyślnie!'
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Wystąpił nieoczekiwany błąd';
      setError(errorMessage);
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'Błąd',
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: -14 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="bg-white/5 border border-white/15 rounded-2xl shadow-2xl p-4 md:p-6 backdrop-blur-xl"
    >
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-between mb-4 cursor-grab active:cursor-grabbing"
      >
        <h2 id="add-reference-title" className="font-display font-bold text-xl md:text-2xl text-white select-none">Dodaj referencję</h2>
        {onCancel && (
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onCancel}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Zamknij formularz"
            title="Zamknij formularz"
          >
            <X className="w-5 h-5 text-white/70" />
          </motion.button>
        )}
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg overflow-hidden"
          >
            <p className="text-red-400">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
      <UnifiedModal
        isOpen={feedbackModal.isOpen}
        onClose={() => setFeedbackModal(prev => ({ ...prev, isOpen: false }))}
        type={feedbackModal.type}
        title={feedbackModal.title}
        message={feedbackModal.message}
        confirmButton={{
          text: 'OK',
          onClick: () => setFeedbackModal(prev => ({ ...prev, isOpen: false }))
        }}
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Podstawowe informacje */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-3"
        >
          <div>
            <label className="block text-xs font-medium text-white mb-1">
              <User className="w-3 h-3 inline mr-1" />
              Imię i nazwisko
            </label>
            <input
              type="text"
              value={formData.breederName}
              onChange={e => handleInputChange('breederName', e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-200 hover:bg-white/15 hover:border-white/30"
              placeholder="Imię Nazwisko"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white mb-1">
              <MapPin className="w-3 h-3 inline mr-1" />
              Lokalizacja
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={e => handleInputChange('location', e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-200 hover:bg-white/15 hover:border-white/30"
              placeholder="Miasto"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white mb-1">
              <Calendar className="w-3 h-3 inline mr-1" />
              Doświadczenie
            </label>
            <input
              type="text"
              value={formData.experience}
              onChange={e => handleInputChange('experience', e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-200 hover:bg-white/15 hover:border-white/30"
              placeholder="np. 10 lat"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white mb-1">
              <Star className="w-3 h-3 inline mr-1" />
              Ocena
            </label>
            <select
              value={formData.rating}
              onChange={e => handleInputChange('rating', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-200 hover:bg-white/15 hover:border-white/30"
              aria-label="Ocena hodowcy od 1 do 5"
              title="Wybierz ocenę od 1 do 5"
            >
              {[1, 2, 3, 4, 5].map(rating => (
                <option key={rating} value={rating}>
                  {rating} {rating === 1 ? 'gwiazdka' : 'gwiazdki'}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block text-xs font-medium text-white mb-1">
            <MessageSquare className="w-4 h-4 inline mr-2" />
            Opinia hodowcy
          </label>
          <textarea
            value={formData.testimonial}
            onChange={e => handleInputChange('testimonial', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-200 hover:bg-white/15 hover:border-white/30 resize-none"
            placeholder="Opisz swoje doświadczenia z gołębiami..."
            required
          />
          <div className="flex items-center justify-between mt-1">
            <div className="text-xs text-muted-foreground">{formData.testimonial.length} znaków</div>
            <div className="text-xs text-muted-foreground">min. 20</div>
          </div>
        </motion.div>

        {/* File Upload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="block"
        >
          <label className="block text-xs font-medium text-white mb-1">
            <Camera className="w-4 h-4 inline mr-2" />
            Zdjęcie gołębia (opcjonalnie)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={e => {
              const f = e.target.files && e.target.files[0];
              if (f) {
                setImage(f);
                try {
                  const url = URL.createObjectURL(f);
                  setImagePreview(url);
                } catch {
                  setImagePreview(null);
                }
              } else {
                setImage(null);
                setImagePreview(null);
              }
            }}
            className="w-full text-sm text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
            aria-label="Wybierz zdjęcie gołębia"
            title="Wybierz zdjęcie gołębia (opcjonalnie)"
            placeholder="Brak wybranego pliku"
          />
          <AnimatePresence>
            {image && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="mt-4"
              >
                <div className="w-48 h-48 rounded-lg overflow-hidden border border-white/20 shadow-xl hover:border-gold/40 transition-all duration-300 hover:shadow-gold/20">
                  <img
                    src={imagePreview ?? URL.createObjectURL(image)}
                    alt="Podgląd zdjęcia"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Osiągnięcia */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display font-bold text-sm md:text-base text-white">
              <Trophy className="w-5 h-5 inline mr-2 text-gold" />
              Osiągnięcia gołębi
            </h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={addAchievement}
              className="flex items-center space-x-2 text-white/80 hover:text-gold font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Dodaj gołębia</span>
              <span className="sm:hidden">Dodaj</span>
            </motion.button>
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {achievements.map((achievement, achievementIndex) => (
                <motion.div
                  key={`achievement-${achievementIndex}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/5 rounded-lg p-3 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white flex items-center gap-2 text-sm">
                      <span className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center text-gold text-xs font-bold">
                        {achievementIndex + 1}
                      </span>
                      Gołąb
                    </h4>
                    {achievements.length > 1 && (
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => removeAchievement(achievementIndex)}
                        className="text-red-500 hover:text-red-400 transition-colors p-1"
                        aria-label={`Usuń gołębia ${achievementIndex + 1}`}
                        title={`Usuń gołębia ${achievementIndex + 1}`}
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="block text-xs font-medium text-white mb-1">
                      Nazwa gołębia
                    </label>
                    <input
                      type="text"
                      value={achievement.pigeon}
                      onChange={e =>
                        handleAchievementChange(achievementIndex, 'pigeon', e.target.value)
                      }
                      className="w-full px-2 py-1.5 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-200 hover:bg-white/15"
                      placeholder="np. Thunder Storm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white mb-1">
                      Numer obrączki
                    </label>
                    <input
                      type="text"
                      value={achievement.ringNumber}
                      onChange={e =>
                        handleAchievementChange(achievementIndex, 'ringNumber', e.target.value)
                      }
                      className="w-full px-2 py-1.5 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-200 hover:bg-white/15"
                      placeholder="np. PL-2023-001"
                    />
                  </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-white text-xs">Wyniki</h5>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => addResult(achievementIndex)}
                        className="flex items-center space-x-1 text-white/80 hover:text-gold text-xs transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Dodaj</span>
                      </motion.button>
                    {achievement.results.map((result, resultIndex) => (
                      <div key={resultIndex} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-2">
                        <div className="md:col-span-2">
                          <input
                            type="text"
                            value={result.competition}
                            onChange={e =>
                              handleResultChange(
                                achievementIndex,
                                resultIndex,
                                'competition',
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Nazwa zawodów"
                            aria-label="Nazwa zawodów"
                            title="Wprowadź nazwę zawodów"
                          />
                        </div>

                        <div>
                          <select
                            value={result.place}
                            onChange={e =>
                              handleResultChange(
                                achievementIndex,
                                resultIndex,
                                'place',
                                parseInt(e.target.value),
                              )
                            }
                            className="w-full px-2 py-1.5 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-200 hover:bg-white/15"
                            aria-label="Miejsce w zawodach"
                            title="Wybierz miejsce w zawodach"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(place => (
                              <option key={place} value={place}>
                                {place}. miejsce
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center space-x-1 flex-wrap">
                          <input
                            type="date"
                            value={result.date}
                            onChange={e =>
                              handleResultChange(
                                achievementIndex,
                                resultIndex,
                                'date',
                                e.target.value,
                              )
                            }
                            className="flex-1 px-2 py-1.5 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-200 hover:bg-white/15"
                            aria-label="Data zawodów"
                            title="Wybierz datę zawodów"
                            placeholder="RRRR-MM-DD"
                            data-fallback="true"
                          />
                          {/* Fallback dla starszych przeglądarek */}
                          <input
                            type="text"
                            value={result.date}
                            onChange={e =>
                              handleResultChange(
                                achievementIndex,
                                resultIndex,
                                'date',
                                e.target.value,
                              )
                            }
                            className="flex-1 px-2 py-1.5 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-200 hover:bg-white/15 datetime-fallback hidden"
                            placeholder="RRRR-MM-DD"
                            aria-label="Data zawodów (format: RRRR-MM-DD)"
                            title="Wprowadź datę w formacie RRRR-MM-DD"
                          />
                          {achievement.results.length > 1 && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              type="button"
                              onClick={() => removeResult(achievementIndex, resultIndex)}
                              className="text-red-500 hover:text-red-400 transition-colors p-1"
                              aria-label={`Usuń wynik ${resultIndex + 1}`}
                              title={`Usuń wynik ${resultIndex + 1}`}
                            >
                              <X className="w-4 h-4" />
                            </motion.button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Przyciski */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-white/20"
        >
          {onCancel && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-4 py-2 border border-white/30 text-white/80 hover:bg-white/10 hover:border-white/40 font-medium rounded-lg transition-all duration-200 text-sm"
            >
              Anuluj
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-2 bg-gold text-navy hover:bg-gold/90 hover:shadow-lg hover:shadow-gold/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-medium rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Dodawanie...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Dodaj referencję</span>
              </>
            )}
          </motion.button>
        </motion.div>
      </form>

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
          text: 'OK',
          onClick: () => {
            setFeedbackModal(prev => ({ ...prev, isOpen: false }));
            if (feedbackModal.onClose) feedbackModal.onClose();
          }
        }}
        showCloseButton={true}
        closeOnBackdrop={true}
        closeOnEscape={true}
      />
    </motion.div>
  );
}
