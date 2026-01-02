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

      var openBtns = Array.from(document.querySelectorAll('[data-share-open]'));
      var closeBtns = Array.from(document.querySelectorAll('[data-share-close]'));
      var modal = document.querySelector('[data-share-modal]');

      if (!modal || (openBtns.length === 0 && closeBtns.length === 0)) {
        logger.log('Share modal elements not found - modal disabled');
        return;
      }

      // Obsłuż wiele przycisków i dodatkowo zabezpiecz przed null.
      try {
        openBtns.forEach(function (btn) {
          if (btn && typeof btn.addEventListener === 'function') {
            btn.addEventListener('click', function () {
              if (modal && typeof modal.classList !== 'undefined') {
                modal.classList.add('is-open');
              }
            });
          }
        });

        closeBtns.forEach(function (btn) {
          if (btn && typeof btn.addEventListener === 'function') {
            btn.addEventListener('click', function () {
              if (modal && typeof modal.classList !== 'undefined') {
                modal.classList.remove('is-open');
              }
            });
          }
        });

        if (typeof document.addEventListener === 'function') {
          document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal && typeof modal.classList !== 'undefined') {
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
