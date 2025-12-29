(function () {
  const isProd = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production';
  const logger = {
    log: isProd ? () => {} : (...args) => console.log(...args),
    error: (...args) => console.error(...args),
  };

  function init() {
    try {
      // Sprawdź czy document istnieje przed użyciem
      if (typeof document === 'undefined' || !document) {
        logger.log('Document not available - modal disabled');
        return;
      }

      var openBtn = document.querySelector('[data-share-open]');
      var closeBtn = document.querySelector('[data-share-close]');
      var modal = document.querySelector('[data-share-modal]');

      if (!openBtn || !closeBtn || !modal) {
        logger.log('Share modal elements not found - modal disabled');
        return;
      }

      // Dodaj event listenery z lepszym sprawdzaniem błędów
      try {
        if (openBtn && openBtn instanceof Element && typeof openBtn.addEventListener === 'function') {
          openBtn.addEventListener('click', function () {
            if (modal && modal instanceof Element) {
              modal.classList.add('is-open');
            }
          });
        }

        if (closeBtn && closeBtn instanceof Element && typeof closeBtn.addEventListener === 'function') {
          closeBtn.addEventListener('click', function () {
            if (modal && modal instanceof Element) {
              modal.classList.remove('is-open');
            }
          });
        }

        if (typeof document.addEventListener === 'function') {
          document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal && modal instanceof Element) {
              modal.classList.remove('is-open');
            }
          });
        }
      } catch (err) {
        logger.error('Failed to attach share modal listeners safely', err);
      }
    } catch (error) {
      logger.error('Share modal initialization error:', error);
      return;
    }
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  } else {
    // Fallback dla przypadków gdzie document nie jest dostępny
    setTimeout(init, 100);
  }
})();
