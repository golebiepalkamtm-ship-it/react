import { gsap, ScrollTrigger } from '@/lib/gsapConfig';

/**
 * ============================================================================
 * NEW GSAP Animation System - Premium Polish (Soft Rise & Blur)
 * ============================================================================
 */


/**
 * ============================================================================
 * 1. HERO TEXT SPLIT - Premium Cinematic Reveal
 * ============================================================================
 */
export const initHeroTextSplit = () => {
  const elements = document.querySelectorAll('[data-split-text]');

  elements.forEach((el) => {
    if (el.getAttribute('data-animated') === 'true') return;

    // Split text into words for better performance and look
    const text = el.textContent || '';
    const words = text.split(' ');
    el.innerHTML = words.map(word =>
      `<span class="premium-word-overflow" style="display: inline-block; overflow: hidden; vertical-align: top; padding-bottom: 0.1em; margin-bottom: -0.1em;">
        <span class="premium-word-content" style="display: inline-block; will-change: transform;">${word}&nbsp;</span>
      </span>`
    ).join('');

    const wordContents = el.querySelectorAll('.premium-word-content');

    gsap.fromTo(wordContents,
      {
        y: "130%",
        rotateX: -30,
        opacity: 0,
        filter: 'blur(15px)',
      },
      {
        y: "0%",
        rotateX: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 2.4, // Longer, more luxurious duration
        ease: "expo.out",
        stagger: {
          amount: 0.8,
          from: "start"
        },
        delay: 0.2,
      }
    );

    el.setAttribute('data-animated', 'true');
  });
};

/**
 * ============================================================================
 * 2. IMAGE REVEAL - Soft Rise & Blur Parallax
 * ============================================================================
 */
export const initImageParallax = () => {
  const containers = document.querySelectorAll('[data-parallax-container]');

  containers.forEach((container) => {
    const image = container.querySelector('[data-parallax-image]') as HTMLElement;
    if (!image) return;

    gsap.fromTo(image,
      {
        scale: 1.25,
        filter: 'blur(10px) brightness(0.8)',
        y: '-10%',
      },
      {
        scale: 1,
        filter: 'blur(0px) brightness(1)',
        y: '10%',
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.8,
        },
      }
    );
  });
};

/**
 * ============================================================================
 * 3. BATCH REVEAL - staggered cards reveal
 * ============================================================================
 */
export const initBatchCardReveal = () => {
  const items = gsap.utils.toArray<HTMLElement>('[data-reveal-item]');
  if (items.length === 0) return;

  ScrollTrigger.batch(items, {
    onEnter: (batch) => {
      gsap.fromTo(batch,
        {
          opacity: 0,
          y: 60,
          filter: 'blur(15px)',
          scale: 0.95,
        },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          scale: 1,
          duration: 1.4,
          ease: "expo.out",
          stagger: 0.1,
          overwrite: true,
        }
      );
    },
    start: "top 85%",
  });
};

/**
 * ============================================================================
 * 4. SECTION REVEAL - Cinema Style Dramatic Entrance
 * ============================================================================
 */
export const initSectionReveal = () => {
  const sections = document.querySelectorAll('[data-section-reveal]');

  sections.forEach((section) => {
    gsap.fromTo(section,
      {
        opacity: 0,
        y: 120,
        scale: 0.92,
        filter: 'blur(20px)',
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: 2.2,
        ease: "expo.out",
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  });
};

/**
 * ============================================================================
 * 5. STAGGERED LIST/GRID REVEAL - Lusion Sequence
 * ============================================================================
 */
export const initStaggeredReveal = () => {
  const containers = document.querySelectorAll('[data-stagger-container]');

  containers.forEach((container) => {
    const items = container.querySelectorAll('[data-stagger-item]');
    if (items.length === 0) return;

    gsap.fromTo(items,
      {
        opacity: 0,
        y: 50,
        filter: 'blur(10px)',
        scale: 0.95,
      },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        scale: 1,
        duration: 1.6,
        ease: "expo.out",
        stagger: 0.15,
        scrollTrigger: {
          trigger: container,
          start: 'top 80%',
        }
      }
    );
  });
};

/**
 * ============================================================================
 * INIT ALL - Unified Activation
 * ============================================================================
 */
export const initAllAnimations = () => {
  console.log('🎬 [GSAP Premium] Activating ultra-smooth system...');

  initHeroTextSplit();
  initImageParallax();
  initBatchCardReveal();
  initSectionReveal();
  initStaggeredReveal();

  // Refresh ScrollTrigger to ensure correct positions
  ScrollTrigger.refresh();

  console.log('✅ [GSAP Premium] Soft Rise & Blur active');
};

export const refreshScrollTrigger = () => ScrollTrigger.refresh();
export const killScrollTrigger = () => ScrollTrigger.getAll().forEach(st => st.kill());

// Utility shells for compatibility
export const initDepthParallax = () => { };
export const initSectionFadeIn = () => { };
export const initHeadingReveals = () => { };
export const initClipReveal = () => { };
export const initSliceReveal = () => { };
export const initMagneticElements = () => { };
export const initScrollScale = () => { };
