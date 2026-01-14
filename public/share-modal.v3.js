(function () {
  // Cichy tryb - nie loguj nic do konsoli - v20250113-v4 (lepsze debugowanie)
  function init() {
    try {
      if (typeof document === 'undefined' || !document) return;

      var openBtn = document.querySelector('[data-share-open]');
      var closeBtn = document.querySelector('[data-share-close]');
      var modal = document.querySelector('[data-share-modal]');

      // Debug: sprawdź co znaleziono
      console.log('Share modal debug:', { 
        openBtn: !!openBtn, 
        closeBtn: !!closeBtn, 
        modal: !!modal,
        openBtnType: openBtn?.constructor.name,
        closeBtnType: closeBtn?.constructor.name,
        modalType: modal?.constructor.name
      });

      // Wyjdź, jeśli elementy nie istnieją lub nie są elementami DOM
      if (!openBtn || !closeBtn || !modal) {
        console.log('Share modal: brakuje elementów, pomijam');
        return;
      }
      if (!(openBtn instanceof Element) || !(closeBtn instanceof Element) || !(modal instanceof Element)) {
        console.log('Share modal: elementy nie są DOM Element, pomijam');
        return;
      }

      try {
        if (openBtn && typeof openBtn.addEventListener === 'function') {
          openBtn.addEventListener('click', function () {
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
          });
        }

        if (closeBtn && typeof closeBtn.addEventListener === 'function') {
          closeBtn.addEventListener('click', function () {
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
          });
        }

        if (typeof document.addEventListener === 'function') {
          document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal && modal instanceof Element && !modal.classList.contains('hidden')) {
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
          });
        }
      } catch (_err) {
        // ciche zignorowanie
      }
    } catch (_error) {
      return;
    }
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      setTimeout(init, 100);
    }
  }
})();
