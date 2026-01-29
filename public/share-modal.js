(function () {
  'use strict';

  var doc = (typeof document === 'object' && document) ? document : null;
  var win = (typeof window === 'object' && window) ? window : null;
  if (!doc || !win) return;

  var isInitialized = false;
  var raf = win.requestAnimationFrame || function (cb) { win.setTimeout(cb, 16); };

  function openModal() {
    var modal = doc.querySelector('[data-share-modal]');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    raf(function () {
      modal.classList.remove('opacity-0');
      var modalContent = modal.querySelector('[data-share-modal] > div');
      if (modalContent) {
        modalContent.classList.remove('scale-95');
        modalContent.classList.add('scale-100');
      }
    });
  }

  function closeModal() {
    var modal = doc.querySelector('[data-share-modal]');
    if (!modal) return;
    modal.classList.add('opacity-0');
    var modalContent = modal.querySelector('[data-share-modal] > div');
    if (modalContent) {
      modalContent.classList.add('scale-95');
      modalContent.classList.remove('scale-100');
    }
    win.setTimeout(function () {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }, 300);
  }

  function handleClick(e) {
    var target = e.target;
    if (!target || !target.closest) return;
    if (target.closest('[data-share-open]')) {
      e.preventDefault();
      openModal();
    } else if (target.closest('[data-share-close]')) {
      e.preventDefault();
      closeModal();
    } else if (target.closest('[data-share-modal]') && !target.closest('[data-share-modal] > div')) {
      closeModal();
    }
  }

  function handleKeydown(e) {
    var modal = doc.querySelector('[data-share-modal]');
    if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
      closeModal();
    }
  }

  function init() {
    if (isInitialized || !doc || !doc.body) return;
    try {
      doc.addEventListener('click', handleClick, false);
      doc.addEventListener('keydown', handleKeydown, false);
      isInitialized = true;
    } catch (err) {
      try {
        if (win && typeof win.addEventListener === 'function') {
          win.addEventListener('click', handleClick, false);
          win.addEventListener('keydown', handleKeydown, false);
          isInitialized = true;
        }
      } catch (_) {}
    }
  }

  if (doc && typeof doc.addEventListener === 'function') {
    if (doc.readyState === 'loading') {
      doc.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
      init();
    }
  } else if (win && typeof win.addEventListener === 'function') {
    win.addEventListener('load', init, { once: true });
  }
})();
