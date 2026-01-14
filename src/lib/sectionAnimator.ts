// client-only: observe <section> elements and add entrance animation class when in view
function observeSection(el: Element, observer: IntersectionObserver) {
  el.classList.add('section-hidden');
  observer.observe(el);
}

function initSectionAnimator() {
  if (typeof window === 'undefined') return;
  if (!('IntersectionObserver' in window)) {
    // fallback: reveal all sections
    document.querySelectorAll('section').forEach((s) => s.classList.remove('section-hidden'));
    return;
  }

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      const el = entry.target as HTMLElement;
      if (entry.isIntersecting) {
        el.classList.add('animate-fade-up');
        el.classList.remove('section-hidden');
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  // initial attach to existing sections
  document.querySelectorAll('section').forEach((s) => observeSection(s, io));

  // watch for dynamically added sections
  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((n) => {
        if (!(n instanceof Element)) return;
        if (n.tagName.toLowerCase() === 'section') observeSection(n, io);
        // also handle sections inside added subtrees
        if ('querySelectorAll' in n) {
          (n as Element).querySelectorAll('section').forEach((s) => observeSection(s, io));
        }
      });
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });
}

// Auto-init on DOMContentLoaded
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSectionAnimator);
  } else {
    initSectionAnimator();
  }
}

export default initSectionAnimator;
