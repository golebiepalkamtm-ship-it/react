import React from 'react';
import { Button } from '@/components/ui/button';
import { useUI } from '@/hooks/useUI';
import { CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export const UIExamples = () => {
  const { success, error, warning, info, openModal } = useUI();

  const handleSuccess = () => {
    success('Sukces!', 'Aukcja została utworzona pomyślnie.');
  };

  const handleError = () => {
    error('Błąd', 'Nie udało się połączyć z serwerem.');
  };

  const handleWarning = () => {
    warning('Uwaga', 'Twoja sesja wygaśnie za 5 minut.');
  };

  const handleInfo = () => {
    info('Informacja', 'Nowe funkcje zostały dodane.');
  };

  const openConfirmModal = () => {
    openModal({
      type: 'default',
      title: 'Potwierdzenie usunięcia',
      content: (
        <div className="p-6">
          <p className="text-white/80">Czy na pewno chcesz usunąć tę aukcję? Tej operacji nie można cofnąć.</p>
          <div className="flex gap-3 mt-6">
            <Button 
              onClick={() => {
                success('Usunięto', 'Aukcja została usunięta.');
              }}
              variant="destructive"
            >
              Usuń
            </Button>
            <Button variant="outline" onClick={() => {}}>
              Anuluj
            </Button>
          </div>
        </div>
      ),
      size: 'md'
    });
  };

  const openSuccessModal = () => {
    openModal({
      type: 'default',
      title: 'Gratulacje!',
      content: (
        <div className="p-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <p className="text-white/80">Twoja aukcja przyciągnęła wielu kupujących.</p>
        </div>
      ),
      size: 'sm'
    });
  };

  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Przykłady UI Komponentów</h2>
      
      {/* Toast Examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Powiadomienia (Toast)</h3>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleSuccess} className="bg-green-600 hover:bg-green-700">
            Sukces
          </Button>
          <Button onClick={handleError} className="bg-red-600 hover:bg-red-700">
            Błąd
          </Button>
          <Button onClick={handleWarning} className="bg-yellow-600 hover:bg-yellow-700">
            Ostrzeżenie
          </Button>
          <Button onClick={handleInfo} className="bg-blue-600 hover:bg-blue-700">
            Informacja
          </Button>
        </div>
      </div>

      {/* Modal Examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Okna Modalne</h3>
        <div className="flex flex-wrap gap-3">
          <Button onClick={openConfirmModal} variant="outline">
            Modal Potwierdzenia
          </Button>
          <Button onClick={openSuccessModal} variant="outline">
            Modal Sukcesu
          </Button>
        </div>
      </div>
    </div>
  );
};
