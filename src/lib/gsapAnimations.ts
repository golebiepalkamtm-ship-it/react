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

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
    
    gsap.fromTo(charElements, 
      {
        opacity: 0,
        y: 50,
        rotateX: -40,
      },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.6,
        ease: 'back.out(1.7)',
        stagger: 0.02,
        scrollTrigger: {
          trigger: title,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
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
      },
      {
        scale: 1,
        y: '15%',
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
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
    y: 60,
    scale: 0.95,
  });
  
  ScrollTrigger.batch(items, {
    onEnter: (batch) => {
      batch.forEach(item => item.classList.add('animating'));
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.2,
        onComplete: () => {
          batch.forEach(item => item.classList.remove('animating'));
        },
      });
    },
    onLeaveBack: (batch) => {
      batch.forEach(item => item.classList.add('animating'));
      gsap.to(batch, {
        opacity: 0,
        y: 60,
        scale: 0.95,
        duration: 0.4,
        stagger: 0.1,
        onComplete: () => {
          batch.forEach(item => item.classList.remove('animating'));
        },
      });
    },
    start: 'top 85%',
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
      scrub: 0.5,
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
      y: 40,
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
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
      yPercent: 100,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.05,
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
 * INIT ALL - Główna funkcja inicjalizująca
 * ============================================================================
 */
export const initAllAnimations = () => {
  console.log('🎬 [GSAP] Initializing all animations...');
  
  initHeroTextSplit();
  initImageParallax();
  initBatchCardReveal();
  initDepthParallax();
  initSectionFadeIn();
  initHeadingReveals();
  
  console.log('✅ [GSAP] All animations initialized');
};
