import { motion } from 'framer-motion';
import { Calendar, Camera, MapPin, MessageSquare, Plus, Star, Trophy, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { referencesService } from '@/services/referencesService';

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

  useEffect(() => {
    return () => {
      if (imagePreview) {
        try {
          URL.revokeObjectURL(imagePreview);
        } catch {}
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
      toast.error(msg);
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

      await referencesService.addReferenceWithFiles(body);

      toast.success('Referencja została dodana pomyślnie!', {
        duration: 4000,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Wystąpił nieoczekiwany błąd';
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="card-glass p-8"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 id="add-reference-title" className="font-display font-bold text-2xl text-white">Dodaj referencję</h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Zamknij formularz"
            title="Zamknij formularz"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Podstawowe informacje */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Imię i nazwisko hodowcy
            </label>
            <input
              type="text"
              value={formData.breederName}
              onChange={e => handleInputChange('breederName', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="np. Imię i Nazwisko"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Lokalizacja
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={e => handleInputChange('location', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="np. Kraków"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Doświadczenie
            </label>
            <input
              type="text"
              value={formData.experience}
              onChange={e => handleInputChange('experience', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="np. 10 lat hodowli"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              <Star className="w-4 h-4 inline mr-2" />
              Ocena (1-5)
            </label>
            <select
              value={formData.rating}
              onChange={e => handleInputChange('rating', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        </div>

        {/* Testimonial */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            <MessageSquare className="w-4 h-4 inline mr-2" />
            Opinia hodowcy
          </label>
          <textarea
            value={formData.testimonial}
            onChange={e => handleInputChange('testimonial', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Opisz swoje doświadczenia z gołębiami z naszej hodowli..."
            required
          />
          <div className="flex items-center justify-between mt-2">
            <div className="text-sm text-muted-foreground">{formData.testimonial.length} znaków</div>
            <div className="text-sm text-muted-foreground">minimum 20 znaków</div>
          </div>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
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
          {image && (
            <div className="mt-4">
              <div className="w-48 h-48 rounded-lg overflow-hidden border border-white/10">
                <img
                  src={imagePreview ?? URL.createObjectURL(image)}
                  alt="Podgląd zdjęcia"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>

        {/* Osiągnięcia */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg text-white">
              <Trophy className="w-5 h-5 inline mr-2" />
              Osiągnięcia gołębi
            </h3>
            <button
              type="button"
              onClick={addAchievement}
              className="flex items-center space-x-2 text-white/80 hover:text-white font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Dodaj gołębia</span>
            </button>
          </div>

          <div className="space-y-6">
            {achievements.map((achievement, achievementIndex) => (
              <div
                key={achievementIndex}
                className="bg-white/5 rounded-xl p-6 border border-white/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-white">Gołąb {achievementIndex + 1}</h4>
                  {achievements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAchievement(achievementIndex)}
                      className="text-red-500 hover:text-red-700"
                      aria-label={`Usuń gołębia ${achievementIndex + 1}`}
                      title={`Usuń gołębia ${achievementIndex + 1}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Nazwa gołębia
                    </label>
                    <input
                      type="text"
                      value={achievement.pigeon}
                      onChange={e =>
                        handleAchievementChange(achievementIndex, 'pigeon', e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="np. Thunder Storm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Numer obrączki
                    </label>
                    <input
                      type="text"
                      value={achievement.ringNumber}
                      onChange={e =>
                        handleAchievementChange(achievementIndex, 'ringNumber', e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="np. PL-2023-001"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-white">Wyniki</h5>
                    <button
                      type="button"
                      onClick={() => addResult(achievementIndex)}
                      className="flex items-center space-x-1 text-white/80 hover:text-white text-sm"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Dodaj wynik</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {achievement.results.map((result, resultIndex) => (
                      <div key={resultIndex} className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                        <div className="flex items-center space-x-2">
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
                            className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                            className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent datetime-fallback hidden"
                            placeholder="RRRR-MM-DD"
                            aria-label="Data zawodów (format: RRRR-MM-DD)"
                            title="Wprowadź datę w formacie RRRR-MM-DD"
                          />
                          {achievement.results.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeResult(achievementIndex, resultIndex)}
                              className="text-red-500 hover:text-red-700"
                              aria-label={`Usuń wynik ${resultIndex + 1}`}
                              title={`Usuń wynik ${resultIndex + 1}`}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Przyciski */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6 border-t border-white/20">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-white/30 text-white/80 hover:bg-white/10 font-medium rounded-lg transition-colors"
            >
              Anuluj
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-gold text-navy hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium rounded-lg transition-colors flex items-center space-x-2"
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
          </button>
        </div>
      </form>
    </motion.div>
  );
}
