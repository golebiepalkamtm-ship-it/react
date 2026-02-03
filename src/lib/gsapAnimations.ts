/**
 * ============================================================================
 * GSAP Animation System - Professional Parallax & Reveals
 * ============================================================================
 * 
 * Implementacja na poziomie Awwwards z wykorzystaniem:
 * - GSAP 3.x + ScrollTrigger
 * - Lenis smooth scroll (sync przez ticker)
 * 
 * KLUCZOWE KONCEPTY:
 * 
 * 1. scrub: Wiąże postęp animacji z pozycją scrolla
 *    - true = natychmiastowe śledzenie
 *    - 0.5-2 = opóźnienie w sekundach (płynniejsze)
 * 
 * 2. start/end: Definiują kiedy animacja się zaczyna/kończy
 *    - "top bottom" = góra elementu dotyka dołu viewportu
 *    - "top 80%" = góra elementu jest na 80% wysokości viewportu
 * 
 * 3. toggleActions: "onEnter onLeave onEnterBack onLeaveBack"
 *    - play, pause, resume, reset, restart, complete, reverse, none
 */

import { gsap, ScrollTrigger } from '@/lib/gsapConfig';

/**
 * ============================================================================
 * 1. HERO TEXT SPLIT - Animacja liter z back.out ease
 * ============================================================================
 * 
 * Dzieli tekst na pojedyncze znaki i animuje je z efektem "bounce".
 * Używa ease: "back.out(1.7)" dla nowoczesnego, sprężystego efektu.
 * 
 * Użycie: <h1 data-split-text>Twój tekst</h1>
 */
export const initHeroTextSplit = () => {
  const heroTitles = document.querySelectorAll('[data-split-text]');
  
  console.log('🔤 initHeroTextSplit: found', heroTitles.length, 'elements');
  
  heroTitles.forEach((title) => {
    if (title.getAttribute('data-animated') === 'true') return;
    
    const text = title.textContent || '';
    const chars = text.split('');
    
    title.innerHTML = chars.map((char) => 
      char === ' ' 
        ? '<span class="char" style="display: inline-block;">&nbsp;</span>'
        : `<span class="char" style="display: inline-block; opacity: 0;">${char}</span>`
    ).join('');
    
    const charElements = title.querySelectorAll('.char');
    
    console.log('🔤 Animating', charElements.length, 'characters');
    
    // Premium hero animation - widoczna z dużym efektem
    gsap.fromTo(charElements, 
      {
        opacity: 0,
        y: 120,
        rotateX: -90,
        rotateY: 10,
        scale: 0.5,
        transformOrigin: '50% 100% -50',
        filter: 'blur(10px)',
      },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: 1.8,
        ease: 'expo.out',
        stagger: {
          amount: 1.2,
          from: 'start',
          ease: 'power3.out'
        },
        delay: 0.6, // Dłuższe opóźnienie żeby użytkownik zobaczył start
      }
    );
    
    title.setAttribute('data-animated', 'true');
  });
};

/**
 * ============================================================================
 * 2. IMAGE PARALLAX - Scale 1.3 -> 1.0 z ruchem Y
 * ============================================================================
 * 
 * Obrazy w kontenerach skalują się z 1.3 do 1.0 podczas scrollowania.
 * Tworzy efekt głębi i "cinematic reveal".
 * 
 * Użycie: 
 * <div data-parallax-container style="overflow: hidden;">
 *   <img data-parallax-image src="..." />
 * </div>
 */
export const initImageParallax = () => {
  const containers = document.querySelectorAll('[data-parallax-container]');
  
  containers.forEach((container) => {
    const image = container.querySelector('[data-parallax-image]') as HTMLElement;
    if (!image) return;
    
    image.style.willChange = 'transform';
    
    gsap.fromTo(image,
      { 
        scale: 1.3,
        y: '-15%',
        filter: 'brightness(0.7)',
      },
      {
        scale: 1,
        y: '15%',
        filter: 'brightness(1)',
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5, // Bardziej płynna interpolacja
        },
      }
    );
  });
};

/**
 * ============================================================================
 * 3. BATCH CARD REVEAL - Staggered reveal z 0.2s delay
 * ============================================================================
 * 
 * Karty w gridzie pojawiają się sekwencyjnie z opóźnieniem 0.2s.
 * Używa ScrollTrigger.batch() dla optymalnej wydajności.
 * 
 * Użycie:
 * <div data-reveal-container>
 *   <div data-reveal-item>Card 1</div>
 *   <div data-reveal-item>Card 2</div>
 * </div>
 */
export const initBatchCardReveal = () => {
  const items = gsap.utils.toArray<HTMLElement>('[data-reveal-item]');
  
  if (items.length === 0) return;
  
  gsap.set(items, { 
    opacity: 0, 
    y: 80,
    scale: 0.92,
    skewY: 3,
    clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
    filter: 'blur(8px)',
  });
  
  ScrollTrigger.batch(items, {
    onEnter: (batch) => {
      batch.forEach(item => item.classList.add('animating'));
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        scale: 1,
        skewY: 0,
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        filter: 'blur(0px)',
        duration: 1.6,
        ease: 'expo.out',
        stagger: {
          amount: 0.8,
          from: 'start',
          grid: 'auto',
          ease: 'power2.inOut'
        },
        onComplete: () => {
          batch.forEach(item => {
            item.classList.remove('animating');
            item.style.clipPath = 'none'; // Cleanup dla performance
          });
        },
      });
    },
    onLeaveBack: (batch) => {
      batch.forEach(item => item.classList.add('animating'));
      gsap.to(batch, {
        opacity: 0,
        y: 60,
        scale: 0.95,
        skewY: 2,
        duration: 0.6,
        ease: 'power2.in',
        stagger: {
          amount: 0.3,
          from: 'end'
        },
        onComplete: () => {
          batch.forEach(item => item.classList.remove('animating'));
        },
      });
    },
    start: 'top 85%',
    interval: 0.1, // Optymalizacja batchingu
  });
};

/**
 * ============================================================================
 * 4. DEPTH PARALLAX - Elementy z różną prędkością
 * ============================================================================
 * 
 * Elementy z data-speed poruszają się z różną prędkością.
 * speed < 1 = wolniej (dalej)
 * speed > 1 = szybciej (bliżej)
 * 
 * Użycie: <div data-speed="0.5">Tło</div>
 *         <div data-speed="1.5">Pierwszy plan</div>
 */
export const initDepthParallax = () => {
  const elements = gsap.utils.toArray<HTMLElement>('[data-speed]');
  
  elements.forEach((element) => {
    const speed = parseFloat(element.dataset.speed || '1');
    
    // Add animating class during animation
    const scrollTrigger = {
      trigger: element,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 2, // Wyższa wartość = bardziej płynna, "masłowata" kontrola
      invalidateOnRefresh: true,
      onEnter: () => element.classList.add('animating'),
      onLeave: () => element.classList.remove('animating'),
      onEnterBack: () => element.classList.add('animating'),
      onLeaveBack: () => element.classList.remove('animating'),
    };
    
    gsap.to(element, {
      y: () => {
        const scrollDistance = window.innerHeight + element.offsetTop;
        return -(scrollDistance * (speed - 1) * 0.5);
      },
      ease: 'none',
      scrollTrigger,
    });
  });
};

/**
 * ============================================================================
 * 5. SECTION FADE IN - Proste fade-in sekcji
 * ============================================================================
 */
export const initSectionFadeIn = () => {
  const sections = gsap.utils.toArray<HTMLElement>('[data-fade-in]');
  
  sections.forEach((section) => {
    gsap.from(section, {
      opacity: 0,
      y: 100,
      rotateX: -5,
      scale: 0.96,
      duration: 1.8,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        end: 'top 20%',
        scrub: 1.2,
      },
    });
  });
};

/**
 * ============================================================================
 * 6. HEADING WORD REVEAL - Słowa pojawiają się sekwencyjnie
 * ============================================================================
 */
export const initHeadingReveals = () => {
  const headings = gsap.utils.toArray<HTMLElement>('[data-word-reveal]');
  
  console.log('📝 initHeadingReveals: found', headings.length, 'elements');
  
  headings.forEach((heading) => {
    if (heading.getAttribute('data-animated') === 'true') return;
    
    const words = heading.textContent?.split(' ') || [];
    
    heading.innerHTML = words.map((word) => 
      `<span class="word" style="display: inline-block; overflow: hidden;">
        <span style="display: inline-block;">${word}</span>
      </span>`
    ).join(' ');
    
    const wordSpans = heading.querySelectorAll('.word > span');
    
    // Add animating class to spans during animation
    gsap.from(wordSpans, {
      yPercent: 120,
      opacity: 0,
      skewY: 7,
      rotateX: -45,
      duration: 1.2,
      ease: 'expo.out',
      stagger: {
        amount: 0.6,
        from: 'start',
        ease: 'power2.out'
      },
      onStart: () => {
        wordSpans.forEach(span => span.classList.add('animating'));
      },
      onComplete: () => {
        wordSpans.forEach(span => span.classList.remove('animating'));
      },
      scrollTrigger: {
        trigger: heading,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    });
    
    heading.setAttribute('data-animated', 'true');
  });
};

/**
 * ============================================================================
 * UTILITY FUNCTIONS
 * ============================================================================
 */

export const refreshScrollTrigger = () => {
  ScrollTrigger.refresh();
};

export const killScrollTrigger = () => {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
};

/**
 * ============================================================================
 * 7. CINEMATIC IMAGE REVEAL - Clip-path reveal od środka
 * ============================================================================
 * 
 * Obrazy odkrywają się z centrum z efektem "curtain reveal".
 * Użycie: <img data-clip-reveal src="..." />
 */
export const initClipReveal = () => {
  const images = gsap.utils.toArray<HTMLElement>('[data-clip-reveal]');
  
  images.forEach((image) => {
    gsap.fromTo(image,
      {
        clipPath: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)',
        scale: 1.2,
        filter: 'brightness(0.4) saturate(0.5)',
      },
      {
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        scale: 1,
        filter: 'brightness(1) saturate(1)',
        duration: 2,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: image,
          start: 'top 75%',
          end: 'top 25%',
          scrub: 1.5,
        },
        onComplete: () => {
          // Cleanup dla performance
          gsap.set(image, { clipPath: 'none' });
        }
      }
    );
  });
};

/**
 * ============================================================================
 * 8. VERTICAL SLICE REVEAL - Pionowe pasma odkrywające obraz
 * ============================================================================
 * 
 * Obraz odkrywa się jak żaluzje od lewej do prawej.
 * Użycie: <img data-slice-reveal src="..." />
 */
export const initSliceReveal = () => {
  const images = gsap.utils.toArray<HTMLElement>('[data-slice-reveal]');
  
  images.forEach((image) => {
    gsap.fromTo(image,
      {
        clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',
        x: -60,
        skewX: -5,
        filter: 'grayscale(100%) brightness(0.3)',
      },
      {
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        x: 0,
        skewX: 0,
        filter: 'grayscale(0%) brightness(1)',
        duration: 1.8,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: image,
          start: 'top 80%',
          end: 'top 30%',
          scrub: 1.2,
        },
        onComplete: () => {
          gsap.set(image, { clipPath: 'none' });
        }
      }
    );
  });
};

/**
 * ============================================================================
 * 9. MAGNETIC HOVER EFFECT - Element podąża za kursorem
 * ============================================================================
 * 
 * Premium hover effect z subtle magnetic pull.
 * Użycie: <div data-magnetic data-magnetic-strength="0.3">Content</div>
 */
export const initMagneticElements = () => {
  const elements = gsap.utils.toArray<HTMLElement>('[data-magnetic]');
  
  elements.forEach((element) => {
    const strength = parseFloat(element.dataset.magneticStrength || '0.3');
    
    element.addEventListener('mousemove', (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      gsap.to(element, {
        x: x * strength,
        y: y * strength,
        duration: 0.6,
        ease: 'expo.out',
      });
    });
    
    element.addEventListener('mouseleave', () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.8,
        ease: 'expo.out',
      });
    });
  });
};

/**
 * ============================================================================
 * 10. SCROLL-LINKED TEXT SCALE - Tekst skaluje się podczas scrollowania
 * ============================================================================
 * 
 * Nagłówki dynamicznie zmieniają rozmiar z pozycją scrolla.
 * Użycie: <h2 data-scale-scroll>Heading</h2>
 */
export const initScrollScale = () => {
  const headings = gsap.utils.toArray<HTMLElement>('[data-scale-scroll]');
  
  headings.forEach((heading) => {
    gsap.fromTo(heading,
      {
        scale: 1.5,
        opacity: 0.3,
        y: 100,
      },
      {
        scale: 1,
        opacity: 1,
        y: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: heading,
          start: 'top bottom',
          end: 'top center',
          scrub: 1.5,
        },
      }
    );
  });
};

/**
 * ============================================================================
 * INIT ALL - Główna funkcja inicjalizująca
 * ============================================================================
 */
export const initAllAnimations = () => {
  console.log('🎬 [GSAP Premium] Initializing all animations...');
  
  // Debug: sprawdź ile elementów znaleziono
  const splitTexts = document.querySelectorAll('[data-split-text]');
  const wordReveals = document.querySelectorAll('[data-word-reveal]');
  const revealItems = document.querySelectorAll('[data-reveal-item]');
  const magnetics = document.querySelectorAll('[data-magnetic]');
  
  console.log(`📊 Found elements:`, {
    splitTexts: splitTexts.length,
    wordReveals: wordReveals.length,
    revealItems: revealItems.length,
    magnetics: magnetics.length
  });
  
  initHeroTextSplit();
  initImageParallax();
  initBatchCardReveal();
  initDepthParallax();
  initSectionFadeIn();
  initHeadingReveals();
  initClipReveal();
  initSliceReveal();
  initMagneticElements();
  initScrollScale();
  
  console.log('✅ [GSAP Premium] All animations initialized');
};
