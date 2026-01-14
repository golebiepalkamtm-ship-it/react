(function () {
  // Share modal v20250113-v7 - enhanced null checks
  function init() {
    try {
      // Sprawdź czy jesteśmy w przeglądarce
      if (typeof window === 'undefined' || typeof document === 'undefined' || !document) {
        console.log('Share modal: Not in browser environment');
        return;
      }

      // Sprawdź czy DOM jest gotowy
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
        return;
      }

      // Funkcja do otwierania modala
      function openModal() {
        try {
          var modal = document.querySelector('[data-share-modal]');
          if (modal && modal instanceof Element) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            setTimeout(function() {
              if (modal) {
                modal.classList.remove('opacity-0');
                var modalContent = modal.querySelector('[data-share-modal] > div');
                if (modalContent) {
                  modalContent.classList.remove('scale-95');
                  modalContent.classList.add('scale-100');
                }
              }
            }, 50);
          }
        } catch (error) {
          console.log('Share modal open error:', error);
        }
      }

      // Funkcja do zamykania modala
      function closeModal() {
        try {
          var modal = document.querySelector('[data-share-modal]');
          if (modal && modal instanceof Element) {
            modal.classList.add('opacity-0');
            var modalContent = modal.querySelector('[data-share-modal] > div');
            if (modalContent) {
              modalContent.classList.add('scale-95');
              modalContent.classList.remove('scale-100');
            }
            setTimeout(function() {
              if (modal) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
              }
            }, 300);
          }
        } catch (error) {
          console.log('Share modal close error:', error);
        }
      }

      // Event delegation dla przycisków
      if (document && document.addEventListener && typeof document.addEventListener === 'function') {
        document.addEventListener('click', function (e) {
          var target = e.target;

          // Sprawdź czy kliknięto przycisk otwierający
          if (target && target.closest && target.closest('[data-share-open]')) {
            e.preventDefault();
            openModal();
            return;
          }

          // Sprawdź czy kliknięto przycisk zamykający
          if (target && target.closest && target.closest('[data-share-close]')) {
            e.preventDefault();
            closeModal();
            return;
          }

          // Sprawdź czy kliknięto poza modalem (backdrop)
          if (target && target.closest && target.closest('[data-share-modal]') && !target.closest('[data-share-modal] > div')) {
            closeModal();
            return;
          }
        });

        // Obsługa klawisza Escape
        document.addEventListener('keydown', function (e) {
          if (e.key === 'Escape') {
            var modal = document.querySelector('[data-share-modal]');
            if (modal && modal instanceof Element && !modal.classList.contains('hidden')) {
              closeModal();
            }
          }
        });
      }
    } catch (_error) {
      console.log('Share modal initialization error:', _error);
    }
  }

  // Uruchom po pełnym załadowaniu DOM
  if (typeof document !== 'undefined' && document) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      // DOM już załadowany, uruchom teraz
      setTimeout(init, 100);
    }
  }
})();
