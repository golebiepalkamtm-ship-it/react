(function () {
  // Share modal v20250113-v7 - wzmocnione guardy na document/null
  function init() {
    try {
      const doc = typeof document !== 'undefined' ? document : null;
      if (!doc || typeof doc.addEventListener !== 'function' || typeof doc.querySelector !== 'function') return;

      // Funkcja do otwierania modala
      function openModal() {
        var modal = doc.querySelector('[data-share-modal]');
        if (modal && modal instanceof Element) {
          modal.classList.remove('hidden');
          modal.classList.add('flex');
          setTimeout(() => {
            if (modal) {
              modal.classList.remove('opacity-0');
              const modalContent = modal.querySelector('[data-share-modal] > div');
              if (modalContent) {
                modalContent.classList.remove('scale-95');
                modalContent.classList.add('scale-100');
              }
            }
          }, 10);
        }
      }

      // Funkcja do zamykania modala
      function closeModal() {
        var modal = doc.querySelector('[data-share-modal]');
        if (modal && modal instanceof Element) {
          modal.classList.add('opacity-0');
          const modalContent = modal.querySelector('[data-share-modal] > div');
          if (modalContent) {
            modalContent.classList.add('scale-95');
            modalContent.classList.remove('scale-100');
          }
          setTimeout(() => {
            if (modal) {
              modal.classList.add('hidden');
              modal.classList.remove('flex');
            }
          }, 300);
        }
      }

      // Event delegation dla przycisków
      if (doc && typeof doc.addEventListener === 'function') {
        doc.addEventListener('click', function (e) {
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
        doc.addEventListener('keydown', function (e) {
          if (e.key === 'Escape') {
            var modal = doc.querySelector('[data-share-modal]');
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
  const doc = typeof document !== 'undefined' ? document : null;
  if (doc) {
    if (doc.readyState === 'loading') {
      doc.addEventListener('DOMContentLoaded', init);
    } else {
      // DOM już załadowany, uruchom teraz
      setTimeout(init, 100);
    }
  }
})();
