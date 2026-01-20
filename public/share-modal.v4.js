(function () {
  'use strict';
  
  if (typeof document === 'undefined' || !document || typeof window === 'undefined') return;

  var isInitialized = false;

  function openModal() {
    var modal = document.querySelector('[data-share-modal]');
    if (!modal) return;
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    requestAnimationFrame(function() {
      modal.classList.remove('opacity-0');
      var modalContent = modal.querySelector('[data-share-modal] > div');
      if (modalContent) {
        modalContent.classList.remove('scale-95');
        modalContent.classList.add('scale-100');
      }
    });
  }

  function closeModal() {
    var modal = document.querySelector('[data-share-modal]');
    if (!modal) return;
    
    modal.classList.add('opacity-0');
    var modalContent = modal.querySelector('[data-share-modal] > div');
    if (modalContent) {
      modalContent.classList.add('scale-95');
      modalContent.classList.remove('scale-100');
    }
    
    setTimeout(function() {
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
    var modal = document.querySelector('[data-share-modal]');
    if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
      closeModal();
    }
  }

  function init() {
    if (isInitialized || !document || !document.body) return;
    isInitialized = true;

    try {
      document.addEventListener('click', handleClick);
      document.addEventListener('keydown', handleKeydown);
    } catch (e) {
      console.error('Share modal init error:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
