'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SmartImage } from '@/components/ui/SmartImage';
import { UnifiedModal } from '@/components/ui/UnifiedModal';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileVerification } from '@/hooks/useProfileVerification';
import { AlertCircle, Camera, CheckCircle, Upload, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { meetingsService } from '@/services/meetingsService';

interface AddBreederMeetingFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  embedded?: boolean;
}

export default function AddBreederMeetingForm({ onSuccess, onCancel, embedded = false }: AddBreederMeetingFormProps) {
  const { user, loading } = useAuth();
  const { canBid, missingFields } = useProfileVerification();
  const verificationLoading = false;
  const canAddPhotos = !!canBid;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    images: [] as File[],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('date', formData.date);

      formData.images.forEach(image => formDataToSend.append('images', image));

      await meetingsService.addMeeting({
        name: formData.title,
        description: formData.description,
        location: formData.location,
        date: formData.date,
        images: [], // Images handled separately or not supported by this method
      });
      
      setSubmitStatus('success');
      setFormData({ title: '', description: '', location: '', date: '', images: [] });
      setPreviewImages([]);
      setFeedbackModal({
        isOpen: true,
        type: 'success',
        title: 'Sukces',
        message: 'Spotkanie zostało dodane pomyślnie!'
      });
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Wystąpił błąd podczas wysyłania formularza';
      setSubmitStatus('error');
      setErrorMessage(errorMsg);
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'Błąd',
        message: errorMsg
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData(prev => ({ ...prev, images: files }));
      const previews = files.map(file => URL.createObjectURL(file));
      setPreviewImages(previews);
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = previewImages.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, images: newImages }));
    setPreviewImages(newPreviews);
  };

  const content = (
    <div className="max-w-4xl mx-auto">
          {/* Header is rendered by the parent page to avoid duplicate titles */}

        {user ? (
          <>
            {!canAddPhotos ? (
              <div className="mb-6 p-4 bg-gold/10 border border-gold/25 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-gold" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-foreground"><strong>Weryfikacja profilu wymagana</strong></p>
                    <p className="text-sm text-muted-foreground mt-1">Aby dodawać zdjęcia, musisz uzupełnić dane w profilu i zweryfikować numer telefonu.</p>
                    {missingFields.length > 0 && <p className="text-sm text-muted-foreground mt-1">Brakujące pola: {missingFields.join(', ')}</p>}
                    <div className="mt-3">
                      <button onClick={() => window.location.href = '/account'} className="font-medium underline text-gold hover:text-gold-light">Uzupełnij profil</button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {submitStatus === 'success' && (
                  <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                    <span className="text-green-400">Spotkanie zostało dodane pomyślnie! Przekierowujemy...</span>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
                    <span className="text-red-400">{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-foreground text-sm font-medium mb-2">Tytuł spotkania *</label>
                      <input type="text" value={formData.title} onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold" placeholder="np. Spotkanie w Lubaniu 2024" required />
                    </div>
                    <div>
                      <label className="block text-foreground text-sm font-medium mb-2">Data spotkania *</label>
                      <input type="date" value={formData.date} onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))} title="Data spotkania" className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold" required />
                    </div>
                  </div>

                  <div>
                    <label className="block text-foreground text-sm font-medium mb-2">Lokalizacja *</label>
                    <input type="text" value={formData.location} onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold" placeholder="Gdzie odbyło się spotkanie?" required />
                  </div>

                  <div>
                    <label className="block text-foreground text-sm font-medium mb-2">Opis spotkania</label>
                    <textarea value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold h-24 resize-none" placeholder="Opisz przebieg spotkania, uczestników, tematy rozmów..." rows={4} />
                  </div>

                  <div>
                    <label className="block text-foreground text-sm font-medium mb-2">Zdjęcia ze spotkania *</label>
                    <div className="border-2 border-dashed border-border hover:border-gold/50 transition-colors rounded-xl p-6 text-center">
                      <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" id="image-upload" required />
                      <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center"><Camera className="w-8 h-8 text-gold" /></div>
                        <div>
                          <p className="text-foreground font-medium">Kliknij aby wybrać zdjęcia</p>
                          <p className="text-muted-foreground text-sm">lub przeciągnij i upuść</p>
                        </div>
                        <div className="flex items-center space-x-2 text-gold"><Upload className="w-4 h-4" /> <span className="text-sm">Wybierz pliki</span></div>
                      </label>
                    </div>

                    {previewImages.length > 0 && (
                      <div className="mt-4">
                        <p className="text-muted-foreground text-sm mb-3">Wybrano {previewImages.length} zdjęć</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {previewImages.map((preview, index) => (
                            <div key={index} className="relative group">
                              <SmartImage src={preview} alt={`Podgląd ${index + 1}`} width={96} height={96} fitMode="contain" aspectRatio="square" className="w-full h-24 rounded-lg border border-border" />
                              <button type="button" onClick={() => removeImage(index)} title="Usuń zdjęcie" className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"><X className="w-4 h-4" /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4">
                    <button type="submit" disabled={isSubmitting} className="w-full px-6 py-4 bg-gradient-to-r from-gold to-gold-light text-navy font-semibold rounded-xl transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
                      {isSubmitting ? (
                        <div className="flex items-center justify-center"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-navy mr-2" />Dodawanie...</div>
                      ) : (
                        <div className="flex items-center justify-center"><Camera className="w-5 h-5 mr-2" />Dodaj Spotkanie</div>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Dołącz do naszej społeczności!</h2>
            <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">Aby dodać zdjęcia ze spotkania, musisz być zalogowanym użytkownikiem.</p>
            <button onClick={() => navigate('/register?callbackUrl=/breeder-meetings')} className="px-6 py-4 bg-linear-to-r from-gold to-gold-light text-navy font-semibold rounded-xl transition-opacity duration-200 hover:opacity-90">Zaloguj się lub Zarejestruj</button>
          </div>
        )}
      </div>
  );

  if (loading || verificationLoading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="bg-black/70 backdrop-blur-xl border border-white/25 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4" />
          <p className="text-lg text-foreground">Sprawdzanie autoryzacji...</p>
        </div>
      </div>
    );
  }

  if (embedded) {
    return (
      <div className="py-4">
        {content}
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
      </div>
    );
  }

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragConstraints={{ left: -800, right: 800, top: -400, bottom: 400 }}
      dragElastic={0.1}
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="bg-hero-gradient rounded-2xl p-4 md:p-6 border border-white/20 shadow-2xl cursor-move max-h-[90vh] overflow-y-auto"
    >
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-between mb-4 cursor-grab active:cursor-grabbing"
      >
        <h2 id="add-meeting-title" className="font-display font-bold text-xl md:text-2xl text-white select-none flex items-center gap-2">
          <Camera className="w-6 h-6 text-gold" />
          Dodaj spotkanie
        </h2>
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

      {content}
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
    </motion.div>
  );
}
