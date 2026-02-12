/**
 * COMPREHENSIVE ANIMATION DEBUGGER
 * 
 * Skonsolidowany debug tool do diagnozy wszystkich animacji
 * Użycie: window.fullAnimationDebug()
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface AnimationReport {
  timestamp: string;
  gsap: {
    version: string;
    scrollTriggers: {
      total: number;
      active: number;
      disabled: number;
      details: Array<{
        id: string;
        trigger: string;
        start: string;
        end: string;
        scrub: boolean | number;
        isActive: boolean;
        progress: number;
      }>;
    };
    timelines: {
      total: number;
      active: number;
    };
  };
  lenis: {
    exists: boolean;
    isScrolling: boolean;
    velocity: number;
    direction: number;
    progress: number;
  };
  sections: {
    hero: {
      found: boolean;
      visible: boolean;
      elements: {
        badge: { found: boolean; opacity: number; transform: string };
        title: { found: boolean; opacity: number; hasChars: boolean; charCount: number };
        description: { found: boolean; opacity: number; clipPath: string };
        button: { found: boolean; opacity: number };
        stats: { found: boolean; count: number; visibleCount: number };
      };
    };
    about: {
      found: boolean;
      visible: boolean;
      elements: {
        badge: { found: boolean; opacity: number };
        title: { found: boolean; opacity: number; hasChars: boolean; charCount: number };
        paragraphs: { found: boolean; count: number; visibleCount: number };
        cards: { found: boolean; count: number; visibleCount: number };
      };
    };
    carousel: {
      found: boolean;
      visible: boolean;
    };
    press: {
      found: boolean;
      visible: boolean;
      elements: {
        badge: { found: boolean; opacity: number };
        title: { found: boolean; opacity: number };
        cards: { found: boolean; count: number; visibleCount: number };
      };
    };
    contact: {
      found: boolean;
      visible: boolean;
      elements: {
        title: { found: boolean; opacity: number };
        cards: { found: boolean; count: number; visibleCount: number };
      };
    };
  };
  performance: {
    scrollPosition: number;
    viewportHeight: number;
    documentHeight: number;
    fps: number;
    reducedMotion: boolean;
  };
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

function getElementOpacity(el: Element | null): number {
  if (!el) return 0;
  const computed = window.getComputedStyle(el as HTMLElement);
  return parseFloat(computed.opacity);
}

function getElementTransform(el: Element | null): string {
  if (!el) return 'none';
  const computed = window.getComputedStyle(el as HTMLElement);
  return computed.transform;
}

function getElementClipPath(el: Element | null): string {
  if (!el) return 'none';
  const computed = window.getComputedStyle(el as HTMLElement);
  return computed.clipPath || 'none';
}

function isElementVisible(el: Element | null): boolean {
  if (!el) return false;
  const rect = (el as HTMLElement).getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}

export function fullAnimationDebug(): AnimationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // GSAP Analysis
  const triggers = ScrollTrigger.getAll();
  const activeTriggers = triggers.filter(t => t.isActive);
  const disabledTriggers = triggers.filter(t => !t.isActive);

  const triggerDetails = triggers.map(t => ({
    id: t.vars.id || 'unnamed',
    trigger: t.trigger ? (t.trigger as HTMLElement).getAttribute('data-section') || (t.trigger as HTMLElement).className : 'unknown',
    start: t.vars.start as string || 'unknown',
    end: t.vars.end as string || 'unknown',
    scrub: t.vars.scrub !== undefined ? t.vars.scrub : false,
    isActive: t.isActive,
    progress: t.progress,
  }));

  // Lenis Analysis
  const lenisInstance = (window as any).lenis;
  const lenisData = {
    exists: !!lenisInstance,
    isScrolling: lenisInstance?.isScrolling || false,
    velocity: lenisInstance?.velocity || 0,
    direction: lenisInstance?.direction || 0,
    progress: lenisInstance?.progress || 0,
  };

  if (!lenisInstance) {
    errors.push('Lenis nie jest zainicjowany');
  }

  // Hero Section Analysis
  const heroSection = document.querySelector('[data-section="hero"]');
  const heroData = {
    found: !!heroSection,
    visible: isElementVisible(heroSection),
    elements: {
      badge: {
        found: false,
        opacity: 0,
        transform: 'none',
      },
      title: {
        found: false,
        opacity: 0,
        hasChars: false,
        charCount: 0,
      },
      description: {
        found: false,
        opacity: 0,
        clipPath: 'none',
      },
      button: {
        found: false,
        opacity: 0,
      },
      stats: {
        found: false,
        count: 0,
        visibleCount: 0,
      },
    },
  };

  if (heroSection) {
    const badge = heroSection.querySelector('.inline-flex');
    if (badge) {
      heroData.elements.badge = {
        found: true,
        opacity: getElementOpacity(badge),
        transform: getElementTransform(badge),
      };
    }

    const title = heroSection.querySelector('h1');
    if (title) {
      const chars = title.querySelectorAll('.char-reveal');
      heroData.elements.title = {
        found: true,
        opacity: getElementOpacity(title),
        hasChars: chars.length > 0,
        charCount: chars.length,
      };
    }

    const description = heroSection.querySelector('p');
    if (description) {
      heroData.elements.description = {
        found: true,
        opacity: getElementOpacity(description),
        clipPath: getElementClipPath(description),
      };
    }

    const button = heroSection.querySelector('a');
    if (button) {
      heroData.elements.button = {
        found: true,
        opacity: getElementOpacity(button),
      };
    }

    const stats = heroSection.querySelectorAll('.hero-stat-item');
    heroData.elements.stats = {
      found: stats.length > 0,
      count: stats.length,
      visibleCount: Array.from(stats).filter(s => getElementOpacity(s) > 0.5).length,
    };
  } else {
    errors.push('Hero section nie znaleziona');
  }

  // About Section Analysis
  const aboutSection = document.querySelector('#about');
  const aboutData = {
    found: !!aboutSection,
    visible: isElementVisible(aboutSection),
    elements: {
      badge: {
        found: false,
        opacity: 0,
      },
      title: {
        found: false,
        opacity: 0,
        hasChars: false,
        charCount: 0,
      },
      paragraphs: {
        found: false,
        count: 0,
        visibleCount: 0,
      },
      cards: {
        found: false,
        count: 0,
        visibleCount: 0,
      },
    },
  };

  if (aboutSection) {
    const badge = aboutSection.querySelector('.inline-block.px-4');
    if (badge) {
      aboutData.elements.badge = {
        found: true,
        opacity: getElementOpacity(badge),
      };
    }

    const title = aboutSection.querySelector('h2');
    if (title) {
      const chars = title.querySelectorAll('.char-reveal');
      aboutData.elements.title = {
        found: true,
        opacity: getElementOpacity(title),
        hasChars: chars.length > 0,
        charCount: chars.length,
      };
      
      if (chars.length === 0) {
        warnings.push('About title: brak character-reveal spans - animacja może nie działać');
      }
    }

    const paragraphs = aboutSection.querySelectorAll('p');
    const visibleParas = Array.from(paragraphs).filter(p => getElementOpacity(p) > 0.5);
    aboutData.elements.paragraphs = {
      found: paragraphs.length > 0,
      count: paragraphs.length,
      visibleCount: visibleParas.length,
    };

    const cards = aboutSection.querySelectorAll('.relative.group');
    const visibleCards = Array.from(cards).filter(c => getElementOpacity(c) > 0.5);
    aboutData.elements.cards = {
      found: cards.length > 0,
      count: cards.length,
      visibleCount: visibleCards.length,
    };

    if (cards.length > 0 && visibleCards.length === 0 && isElementVisible(aboutSection)) {
      warnings.push('About cards: wszystkie niewidoczne mimo że sekcja jest w viewport');
    }
  } else {
    errors.push('About section nie znaleziona');
  }

  // Carousel Analysis
  const carouselSection = document.querySelector('.section-surface');
  const carouselData = {
    found: !!carouselSection,
    visible: isElementVisible(carouselSection),
  };

  // Press Section Analysis
  const pressSection = document.querySelector('#press-section');
  const pressData = {
    found: !!pressSection,
    visible: isElementVisible(pressSection),
    elements: {
      badge: {
        found: false,
        opacity: 0,
      },
      title: {
        found: false,
        opacity: 0,
      },
      cards: {
        found: false,
        count: 0,
        visibleCount: 0,
      },
    },
  };

  if (pressSection) {
    const badge = pressSection.querySelector('.inline-block.px-4');
    if (badge) {
      pressData.elements.badge = {
        found: true,
        opacity: getElementOpacity(badge),
      };
    }

    const title = pressSection.querySelector('h2');
    if (title) {
      pressData.elements.title = {
        found: true,
        opacity: getElementOpacity(title),
      };
    }

    const cards = pressSection.querySelectorAll('.press-card');
    const visibleCards = Array.from(cards).filter(c => getElementOpacity(c) > 0.5);
    pressData.elements.cards = {
      found: cards.length > 0,
      count: cards.length,
      visibleCount: visibleCards.length,
    };
  }

  // Contact Section Analysis
  const contactSection = document.querySelector('#contact');
  const contactData = {
    found: !!contactSection,
    visible: isElementVisible(contactSection),
    elements: {
      title: {
        found: false,
        opacity: 0,
      },
      cards: {
        found: false,
        count: 0,
        visibleCount: 0,
      },
    },
  };

  if (contactSection) {
    const title = contactSection.querySelector('h2');
    if (title) {
      contactData.elements.title = {
        found: true,
        opacity: getElementOpacity(title),
      };
    }

    const cards = contactSection.querySelectorAll('.relative.w-full.h-full');
    const visibleCards = Array.from(cards).filter(c => getElementOpacity(c) > 0.5);
    contactData.elements.cards = {
      found: cards.length > 0,
      count: cards.length,
      visibleCount: visibleCards.length,
    };
  }

  // Performance Analysis
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    warnings.push('Prefers-reduced-motion: reduce - animacje mogą być ograniczone');
  }

  // Recommendations
  if (triggers.length === 0) {
    errors.push('KRYTYCZNE: Brak ScrollTriggers - animacje nie są zarejestrowane');
    recommendations.push('Sprawdź czy komponenty są zamontowane i czy gsap.context() działa');
  }

  if (triggers.length > 0 && activeTriggers.length === 0) {
    warnings.push('ScrollTriggers istnieją ale żaden nie jest aktywny');
    recommendations.push('Scrolluj stronę aby aktywować triggery lub sprawdź start/end positions');
  }

  if (heroData.elements.title.found && !heroData.elements.title.hasChars) {
    warnings.push('Hero title: brak character spans - animacja character-by-character nie zadziała');
    recommendations.push('Sprawdź czy useEffect w HeroPremium wykonał się poprawnie');
  }

  if (aboutData.elements.title.found && !aboutData.elements.title.hasChars) {
    warnings.push('About title: brak character spans - animacja character-by-character nie zadziała');
    recommendations.push('Sprawdź czy useLayoutEffect w AboutSection wykonał się poprawnie');
  }

  const report: AnimationReport = {
    timestamp: new Date().toISOString(),
    gsap: {
      version: gsap.version,
      scrollTriggers: {
        total: triggers.length,
        active: activeTriggers.length,
        disabled: disabledTriggers.length,
        details: triggerDetails,
      },
      timelines: {
        total: gsap.globalTimeline.getChildren().length,
        active: gsap.globalTimeline.getChildren().filter((t: any) => t.isActive()).length,
      },
    },
    lenis: lenisData,
    sections: {
      hero: heroData,
      about: aboutData,
      carousel: carouselData,
      press: pressData,
      contact: contactData,
    },
    performance: {
      scrollPosition: window.scrollY,
      viewportHeight: window.innerHeight,
      documentHeight: document.documentElement.scrollHeight,
      fps: 60, // Placeholder
      reducedMotion: prefersReducedMotion,
    },
    errors,
    warnings,
    recommendations,
  };

  // Console output
  console.clear();
  console.log('%c🔍 COMPREHENSIVE ANIMATION DEBUG REPORT', 'font-size: 20px; font-weight: bold; color: #D4AF37;');
  console.log('%c' + new Date().toLocaleString(), 'color: #888;');
  console.log('');

  // GSAP Status
  console.log('%c📊 GSAP STATUS', 'font-size: 16px; font-weight: bold; color: #4CAF50;');
  console.log(`Version: ${report.gsap.version}`);
  console.log(`ScrollTriggers: ${report.gsap.scrollTriggers.total} total, ${report.gsap.scrollTriggers.active} active`);
  console.log(`Timelines: ${report.gsap.timelines.total} total, ${report.gsap.timelines.active} active`);
  console.log('');

  // Lenis Status
  console.log('%c🎢 LENIS STATUS', 'font-size: 16px; font-weight: bold; color: #2196F3;');
  console.log(`Exists: ${report.lenis.exists ? '✅' : '❌'}`);
  console.log(`Velocity: ${report.lenis.velocity.toFixed(2)}`);
  console.log(`Progress: ${(report.lenis.progress * 100).toFixed(1)}%`);
  console.log('');

  // Sections Status
  console.log('%c🎬 SECTIONS STATUS', 'font-size: 16px; font-weight: bold; color: #FF9800;');
  
  console.log('%cHERO:', 'font-weight: bold;');
  console.log(`  Found: ${heroData.found ? '✅' : '❌'}, Visible: ${heroData.visible ? '✅' : '❌'}`);
  console.log(`  Badge opacity: ${heroData.elements.badge.opacity.toFixed(2)}`);
  console.log(`  Title opacity: ${heroData.elements.title.opacity.toFixed(2)}, Chars: ${heroData.elements.title.charCount}`);
  console.log(`  Description opacity: ${heroData.elements.description.opacity.toFixed(2)}`);
  console.log(`  Stats: ${heroData.elements.stats.visibleCount}/${heroData.elements.stats.count} visible`);
  console.log('');

  console.log('%cABOUT:', 'font-weight: bold;');
  console.log(`  Found: ${aboutData.found ? '✅' : '❌'}, Visible: ${aboutData.visible ? '✅' : '❌'}`);
  console.log(`  Badge opacity: ${aboutData.elements.badge.opacity.toFixed(2)}`);
  console.log(`  Title opacity: ${aboutData.elements.title.opacity.toFixed(2)}, Chars: ${aboutData.elements.title.charCount}`);
  console.log(`  Paragraphs: ${aboutData.elements.paragraphs.visibleCount}/${aboutData.elements.paragraphs.count} visible`);
  console.log(`  Cards: ${aboutData.elements.cards.visibleCount}/${aboutData.elements.cards.count} visible`);
  console.log('');

  console.log('%cPRESS:', 'font-weight: bold;');
  console.log(`  Found: ${pressData.found ? '✅' : '❌'}, Visible: ${pressData.visible ? '✅' : '❌'}`);
  console.log(`  Cards: ${pressData.elements.cards.visibleCount}/${pressData.elements.cards.count} visible`);
  console.log('');

  console.log('%cCONTACT:', 'font-weight: bold;');
  console.log(`  Found: ${contactData.found ? '✅' : '❌'}, Visible: ${contactData.visible ? '✅' : '❌'}`);
  console.log(`  Cards: ${contactData.elements.cards.visibleCount}/${contactData.elements.cards.count} visible`);
  console.log('');

  // ScrollTrigger Details
  if (triggerDetails.length > 0) {
    console.log('%c📍 SCROLLTRIGGER DETAILS', 'font-size: 16px; font-weight: bold; color: #9C27B0;');
    console.table(triggerDetails);
    console.log('');
  }

  // Errors
  if (errors.length > 0) {
    console.log('%c❌ ERRORS', 'font-size: 16px; font-weight: bold; color: #F44336;');
    errors.forEach(err => console.log(`  • ${err}`));
    console.log('');
  }

  // Warnings
  if (warnings.length > 0) {
    console.log('%c⚠️ WARNINGS', 'font-size: 16px; font-weight: bold; color: #FF9800;');
    warnings.forEach(warn => console.log(`  • ${warn}`));
    console.log('');
  }

  // Recommendations
  if (recommendations.length > 0) {
    console.log('%c💡 RECOMMENDATIONS', 'font-size: 16px; font-weight: bold; color: #4CAF50;');
    recommendations.forEach(rec => console.log(`  • ${rec}`));
    console.log('');
  }

  console.log('%cFull report available in return value', 'color: #888; font-style: italic;');

  return report;
}

// Expose to window
declare global {
  interface Window {
    fullAnimationDebug: () => AnimationReport;
  }
}

if (typeof window !== 'undefined') {
  window.fullAnimationDebug = fullAnimationDebug;
  console.log('🔍 Animation Debugger loaded! Use: window.fullAnimationDebug()');
}
