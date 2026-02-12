/**
 * Scroll Metrics - Pomiar sekcji i długości scrola
 */

export interface SectionMetrics {
  name: string;
  element: HTMLElement;
  top: number;
  bottom: number;
  height: number;
  viewportHeight: number;
  scrollProgress: number;
}

export interface ScrollMetrics {
  totalHeight: number;
  viewportHeight: number;
  scrollableHeight: number;
  currentScroll: number;
  scrollProgress: number;
  sections: SectionMetrics[];
}

/**
 * Zmierz wszystkie sekcje na stronie
 */
export const measureSections = (): ScrollMetrics => {
  const sections = document.querySelectorAll('[data-section]');
  const viewportHeight = window.innerHeight;
  const totalHeight = document.documentElement.scrollHeight;
  const scrollableHeight = totalHeight - viewportHeight;
  const currentScroll = window.scrollY;
  const scrollProgress = scrollableHeight > 0 ? currentScroll / scrollableHeight : 0;

  const sectionMetrics: SectionMetrics[] = Array.from(sections).map((section) => {
    const element = section as HTMLElement;
    const rect = element.getBoundingClientRect();
    const top = rect.top + currentScroll;
    const bottom = top + rect.height;
    const sectionScrollProgress = (currentScroll - top) / rect.height;

    return {
      name: element.getAttribute('data-section') || 'unknown',
      element,
      top,
      bottom,
      height: rect.height,
      viewportHeight,
      scrollProgress: Math.max(0, Math.min(1, sectionScrollProgress)),
    };
  });

  return {
    totalHeight,
    viewportHeight,
    scrollableHeight,
    currentScroll,
    scrollProgress,
    sections: sectionMetrics,
  };
};

/**
 * Wyświetl metryki w konsoli (debug)
 */
export const logScrollMetrics = () => {
  const metrics = measureSections();
  
  console.log('%c📏 SCROLL METRICS', 'background: #4CAF50; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
  console.log('');
  console.log('📊 Ogólne metryki:');
  console.log(`  Total Height: ${metrics.totalHeight}px`);
  console.log(`  Viewport Height: ${metrics.viewportHeight}px`);
  console.log(`  Scrollable Height: ${metrics.scrollableHeight}px`);
  console.log(`  Current Scroll: ${metrics.currentScroll}px`);
  console.log(`  Scroll Progress: ${(metrics.scrollProgress * 100).toFixed(2)}%`);
  console.log('');
  console.log('📍 Sekcje:');
  
  metrics.sections.forEach((section, index) => {
    console.log(`  ${index + 1}. ${section.name.toUpperCase()}`);
    console.log(`     Top: ${section.top}px`);
    console.log(`     Bottom: ${section.bottom}px`);
    console.log(`     Height: ${section.height}px`);
    console.log(`     Progress: ${(section.scrollProgress * 100).toFixed(2)}%`);
    console.log('');
  });

  return metrics;
};

/**
 * Expose do window dla debug
 */
if (typeof window !== 'undefined') {
  (window as any).measureScrollMetrics = logScrollMetrics;
  console.log('🛠️ Scroll metrics loaded! Use: window.measureScrollMetrics()');
}
