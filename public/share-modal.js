(function () {
  'use strict';
  var doc = typeof document === 'object' ? document : null;
  var win = typeof window === 'object' ? window : null;
  if (!doc || !win || typeof doc.addEventListener !== 'function' || typeof win.setTimeout !== 'function') return;
  var raf = win.requestAnimationFrame || function (cb) { return win.setTimeout(cb, 16); };
  var modalSel = '[data-share-modal]';
  var modalContentSel = '[data-share-modal] > div';
  function openModal() {
    var modal = doc.querySelector(modalSel);
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    raf(function () {
      modal.classList.remove('opacity-0');
      var modalContent = modal.querySelector(modalContentSel);
      if (modalContent) {
        modalContent.classList.remove('scale-95');
        modalContent.classList.add('scale-100');
      }
    });
  }
  function closeModal() {
    var modal = doc.querySelector(modalSel);
    if (!modal) return;
    modal.classList.add('opacity-0');
    var modalContent = modal.querySelector(modalContentSel);
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
    var target = e && e.target;
    if (!target || !target.closest) return;
    if (target.closest('[data-share-open]')) {
      e.preventDefault();
      openModal();
    } else if (target.closest('[data-share-close]')) {
      e.preventDefault();
      closeModal();
    } else if (target.closest(modalSel) && !target.closest(modalContentSel)) {
      closeModal();
    }
  }
  function handleKeydown(e) {
    if (!e || e.key !== 'Escape') return;
    var modal = doc.querySelector(modalSel);
    if (modal && !modal.classList.contains('hidden')) {
      closeModal();
    }
  }
  function init() {
    try {
      if (!doc || typeof doc.addEventListener !== 'function' || !doc.querySelector) return;

      // Check if there are any elements that would use the modal
      var hasShareElements = doc.querySelector('[data-share-open], [data-share-close], [data-share-modal]');
      if (!hasShareElements) return;

      doc.removeEventListener('click', handleClick, false);
      doc.removeEventListener('keydown', handleKeydown, false);
      doc.addEventListener('click', handleClick, false);
      doc.addEventListener('keydown', handleKeydown, false);
    } catch (_) {}
  }
  if (doc.readyState === 'loading') {
    try {
      doc.addEventListener('DOMContentLoaded', init, { once: true });
    } catch (_) {
      win && win.setTimeout(init, 0);
    }
  } else {
    init();
  }
})();
