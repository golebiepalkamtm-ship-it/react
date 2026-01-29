(function () {
  'use strict';

  var doc = (typeof document !== 'undefined' && document) ? document : null;
  var win = (typeof window !== 'undefined' && window) ? window : null;
  if (!doc || !win) return;

  var isInitialized = false;

  function openModal() {
    var modal = doc.querySelector('[data-share-modal]');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    win.requestAnimationFrame(function () {
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
    var add = doc.addEventListener ? doc.addEventListener.bind(doc) : null;
    var remove = doc.removeEventListener ? doc.removeEventListener.bind(doc) : null;
    if (!add || !remove) return;
    try {
      // Remove old listeners if any to prevent duplicates
      remove('click', handleClick);
      remove('keydown', handleKeydown);
      
      add('click', handleClick);
      add('keydown', handleKeydown);
      isInitialized = true;
    } catch (err) {
      console.error('Share modal init error:', err);
    }
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', function onReady() {
      init();
    }, { once: true });
  } else {
    init();
  }
})();
