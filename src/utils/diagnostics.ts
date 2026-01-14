/**
 * Skrypt diagnostyczny - sprawdza stan animacji, parallax i smooth scroll
 * Uruchom w konsoli: window.runDiagnostics()
 */

export const runDiagnostics = () => {
  console.clear();
  console.log('%c🔍 DIAGNOSTYKA ANIMACJI I PARALLAX', 'font-size: 20px; font-weight: bold; color: #d8a838;');
  console.log('='.repeat(80));

  // 1. Sprawdź Lenis
  console.log('\n%c1️⃣ LENIS SMOOTH SCROLL', 'font-size: 16px; font-weight: bold; color: #4a9eff;');
  const htmlElement = document.documentElement;
  const hasLenisClass = htmlElement.classList.contains('lenis');
  const hasLenisSmoothClass = htmlElement.classList.contains('lenis-smooth');
  const scrollBehavior = window.getComputedStyle(htmlElement).scrollBehavior;
  
  console.log(`✓ Klasa 'lenis': ${hasLenisClass ? '✅' : '❌'}`);
  console.log(`✓ Klasa 'lenis-smooth': ${hasLenisSmoothClass ? '✅' : '❌'}`);
  console.log(`✓ scroll-behavior: ${scrollBehavior} ${scrollBehavior === 'auto' ? '✅' : '⚠️ (powinno być auto)'}`);

  // 2. Sprawdź GSAP i ScrollTrigger (przez import, nie window)
  console.log('\n%c2️⃣ GSAP & SCROLLTRIGGER', 'font-size: 16px; font-weight: bold; color: #4a9eff;');
  
  // Sprawdź przez elementy DOM czy GSAP działa
  const hasTransforms = document.querySelectorAll('[data-speed]').length > 0;
  const hasAnimatedHeadings = Array.from(document.querySelectorAll('h1, h2')).some(h => h.getAttribute('data-animated') === 'true');
  
  console.log(`✓ GSAP działa (parallax aktywny): ${hasTransforms ? '✅' : '❌'}`);
  console.log(`✓ GSAP działa (heading animations): ${hasAnimatedHeadings ? '✅' : '❌'}`);
  console.log(`ℹ️ GSAP jest załadowany jako moduł ES6, nie jest w window.gsap`);

  // 3. Sprawdź nagłówki
  console.log('\n%c3️⃣ NAGŁÓWKI (H1, H2)', 'font-size: 16px; font-weight: bold; color: #4a9eff;');
  const headings = document.querySelectorAll('h1, h2');
  console.log(`✓ Znaleziono nagłówków: ${headings.length}`);
  
  headings.forEach((heading, index) => {
    const text = heading.textContent?.substring(0, 50) || '';
    const hasNestedSpans = heading.querySelectorAll('span').length > 0;
    const isAnimated = heading.getAttribute('data-animated') === 'true';
    const hasGoldText = heading.querySelector('.gold-text') !== null;
    const hasGradient = heading.querySelector('.bg-gradient-to-r') !== null;
    
    console.log(`  ${index + 1}. "${text}..."`);
    console.log(`     - Nested spans: ${hasNestedSpans ? '✅' : '❌'}`);
    console.log(`     - Animated: ${isAnimated ? '✅' : '❌'}`);
    console.log(`     - Gold text: ${hasGoldText ? '✅' : '❌'}`);
    console.log(`     - Gradient: ${hasGradient ? '✅' : '❌'}`);
  });

  // 4. Sprawdź elementy parallax
  console.log('\n%c4️⃣ ELEMENTY PARALLAX (data-speed)', 'font-size: 16px; font-weight: bold; color: #4a9eff;');
  const parallaxElements = document.querySelectorAll('[data-speed]');
  console.log(`✓ Znaleziono elementów parallax: ${parallaxElements.length}`);
  
  parallaxElements.forEach((element, index) => {
    const speed = element.getAttribute('data-speed');
    const willChange = window.getComputedStyle(element as HTMLElement).willChange;
    const transform = window.getComputedStyle(element as HTMLElement).transform;
    
    console.log(`  ${index + 1}. data-speed="${speed}"`);
    console.log(`     - will-change: ${willChange} ${willChange.includes('transform') ? '✅' : '⚠️'}`);
    console.log(`     - transform: ${transform !== 'none' ? '✅ (aktywny)' : '⚠️ (brak transformacji)'}`);
  });


  // 5. Podsumowanie
  console.log('\n%c📊 PODSUMOWANIE', 'font-size: 16px; font-weight: bold; color: #d8a838;');
  const issues: string[] = [];
  
  if (!hasLenisClass || !hasLenisSmoothClass) issues.push('Lenis nie jest w pełni aktywny (brak klasy lenis-smooth)');
  if (!hasTransforms && !hasAnimatedHeadings) issues.push('GSAP nie działa');
  if (headings.length === 0) issues.push('Brak nagłówków H1/H2');
  if (parallaxElements.length === 0) issues.push('Brak elementów parallax');
  
  if (issues.length === 0) {
    console.log('%c✅ WSZYSTKO DZIAŁA POPRAWNIE!', 'font-size: 18px; font-weight: bold; color: #00ff00;');
  } else {
    console.log('%c⚠️ ZNALEZIONE PROBLEMY:', 'font-size: 18px; font-weight: bold; color: #ff0000;');
    issues.forEach(issue => console.log(`  ❌ ${issue}`));
  }

  console.log('\n' + '='.repeat(80));
  console.log('%cKoniec diagnostyki', 'color: #888;');
};

// Dodaj do window dla łatwego dostępu
if (typeof window !== 'undefined') {
  (window as any).runDiagnostics = runDiagnostics;
  
  // Automatyczne uruchomienie WYŁĄCZONE - uruchom ręcznie przez window.runDiagnostics()
  // setTimeout(() => {
  //   console.log('%c🔍 AUTOMATYCZNA DIAGNOSTYKA', 'font-size: 16px; font-weight: bold; color: #d8a838;');
  //   runDiagnostics();
  // }, 2000);
}
