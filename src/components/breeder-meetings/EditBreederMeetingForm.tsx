'use client';

import React, { useState } from 'react';
import { AlertCircle, Camera, CheckCircle, Upload, X, Trash2 } from 'lucide-react';
import { meetingsService } from '@/services/meetingsService';
import { SmartImage } from '@/components/ui/SmartImage';
import { UnifiedModal } from '@/components/ui/UnifiedModal';

interface EditBreederMeetingFormProps {
  meeting: {
    id: string;
    name: string;
    location?: string;
    date?: string;
    description?: string;
    images: string[];
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EditBreederMeetingForm({ meeting, onSuccess, onCancel }: EditBreederMeetingFormProps) {
  const [formData, setFormData] = useState({
    title: meeting.name || '',
    description: meeting.description || '',
    location: meeting.location || '',
    date: meeting.date || '',
    newImages: [] as File[],
    existingImages: meeting.images || [],
  });

  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
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
      const totalImages = formData.existingImages.length + formData.newImages.length;
      if (totalImages === 0) {
        const msg = 'Dodaj minimum jedno zdjęcie (pozostaw istniejące lub dodaj nowe).';
        setErrorMessage(msg);
        setSubmitStatus('error');
        setFeedbackModal({
          isOpen: true,
          type: 'error',
          title: 'Błąd',
          message: msg
        });
        setIsSubmitting(false);
        return;
      }

      await meetingsService.updateMeeting(meeting.id, {
        name: formData.title,
        description: formData.description,
        location: formData.location,
        date: formData.date,
        newImages: formData.newImages,
        existingImages: formData.existingImages,
      });

      setSubmitStatus('success');
      setFeedbackModal({
        isOpen: true,
        type: 'success',
        title: 'Sukces',
        message: 'Spotkanie zostało zaktualizowane.'
      });
      onSuccess?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Wystąpił błąd podczas zapisu.';
      setSubmitStatus('error');
      setErrorMessage(msg);
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'Błąd',
        message: msg
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData(prev => ({ ...prev, newImages: files }));
      const previews = files.map(file => URL.createObjectURL(file));
      setPreviewImages(previews);
    }
  };

  const removeExistingImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      existingImages: prev.existingImages.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="bg-hero-gradient rounded-2xl p-4 md:p-6 border border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Camera className="w-6 h-6 text-gold" />
          <h2 className="font-display font-bold text-xl md:text-2xl text-white select-none">Edytuj spotkanie</h2>
        </div>
        {onCancel && (
          <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-lg transition-colors" aria-label="Zamknij">
            <X className="w-5 h-5 text-white/70" />
          </button>
        )}
      </div>

      {submitStatus === 'success' && (
        <div className="mb-4 p-3 bg-green-500/15 border border-green-500/40 rounded-lg text-green-300 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" /> Zapisano zmiany.
        </div>
      )}
      {submitStatus === 'error' && errorMessage && (
        <div className="mb-4 p-3 bg-red-500/15 border border-red-500/40 rounded-lg text-red-300 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-foreground text-sm font-medium mb-2">Tytuł *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold"
              required
            />
          </div>
          <div>
            <label className="block text-foreground text-sm font-medium mb-2">Data *</label>
            <input
              type="date"
              value={formData.date}
              onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-foreground text-sm font-medium mb-2">Lokalizacja *</label>
          <input
            type="text"
            value={formData.location}
            onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
            className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold"
            required
          />
        </div>

        <div>
          <label className="block text-foreground text-sm font-medium mb-2">Opis spotkania</label>
          <textarea
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold h-24 resize-none"
            rows={4}
          />
        </div>

        <div className="space-y-3">
          <label className="block text-foreground text-sm font-medium">Istniejące zdjęcia</label>
          {formData.existingImages.length === 0 && (
            <p className="text-sm text-muted-foreground">Brak zapisanych zdjęć.</p>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {formData.existingImages.map((img, idx) => (
              <div key={idx} className="relative group border border-border rounded-xl overflow-hidden">
                <SmartImage src={img} alt={`Istniejące zdjęcie ${idx + 1}`} width={300} height={200} fitMode="cover" />
                <button
                  type="button"
                  onClick={() => removeExistingImage(idx)}
                  className="absolute top-2 right-2 bg-black/60 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition"
                  title="Usuń zdjęcie"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-foreground text-sm font-medium mb-2">Dodaj nowe zdjęcia</label>
          <div className="border-2 border-dashed border-border hover:border-gold/50 transition-colors rounded-xl p-6 text-center">
            <input type="file" multiple accept="image/*" onChange={handleNewImages} className="hidden" id="edit-image-upload" />
            <label htmlFor="edit-image-upload" className="cursor-pointer flex flex-col items-center space-y-4">
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
              <p className="text-muted-foreground text-sm mb-3">Nowe zdjęcia: {previewImages.length}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {previewImages.map((preview, index) => (
                  <div key={index} className="relative border border-border rounded-xl overflow-hidden">
                    <SmartImage src={preview} alt={`Nowe zdjęcie ${index + 1}`} width={300} height={200} fitMode="cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {onCancel && (
            <button type="button" onClick={onCancel} className="flex-1 px-4 py-3 rounded-xl border border-border text-foreground hover:bg-white/5 transition">
              Anuluj
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 rounded-xl bg-gold text-navy font-semibold hover:bg-gold/90 transition disabled:opacity-70"
          >
            {isSubmitting ? 'Zapisywanie...' : 'Zapisz zmiany'}
          </button>
        </div>
      </form>
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
