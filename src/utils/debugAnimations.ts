/**
 * DEBUG ANIMATIONS - Awwwards Level Diagnostics
 * Uruchom w konsoli: window.debugAnimations()
 */

interface DebugResult {
  name: string;
  status: 'OK' | 'WARN' | 'FAIL';
  message: string;
  details?: any;
}

export const debugAnimations = () => {
  const results: DebugResult[] = [];
  
  console.log('%c🔍 ANIMATION DEBUG START', 'background: #d4af37; color: #000; padding: 10px; font-size: 16px; font-weight: bold;');
  console.log('');

  // 1. Check Lenis
  const lenis = (window as any).lenis;
  if (lenis) {
    results.push({
      name: 'Lenis Smooth Scroll',
      status: 'OK',
      message: `Lenis aktywny, velocity: ${lenis.velocity?.toFixed(2) || 0}`,
      details: { 
        isScrolling: lenis.isScrolling,
        direction: lenis.direction,
        progress: lenis.progress 
      }
    });
  } else {
    results.push({
      name: 'Lenis Smooth Scroll',
      status: 'FAIL',
      message: 'Lenis NIE jest aktywny! Smooth scroll wyłączony.'
    });
  }

  // 2. Check GSAP
  const gsap = (window as any).gsap;
  if (gsap) {
    const scrollTriggers = (window as any).ScrollTrigger?.getAll() || [];
    results.push({
      name: 'GSAP',
      status: 'OK',
      message: `GSAP aktywny, ScrollTriggers: ${scrollTriggers.length}`,
      details: { version: gsap.version, triggers: scrollTriggers.length }
    });
  } else {
    results.push({
      name: 'GSAP',
      status: 'FAIL',
      message: 'GSAP NIE jest dostępny globalnie!'
    });
  }

  // 3. Check Framer Motion elements
  const motionElements = document.querySelectorAll('[style*="transform"]');
  const framerElements = document.querySelectorAll('[data-framer-component-type]');
  results.push({
    name: 'Framer Motion Elements',
    status: motionElements.length > 0 ? 'OK' : 'WARN',
    message: `Elementy z transform: ${motionElements.length}, Framer components: ${framerElements.length}`,
  });

  // 4. Check Hero animations
  const heroBlurSpots = document.querySelectorAll('.hero-blur');
  const heroSection = document.querySelector('section.min-h-screen');
  results.push({
    name: 'Hero Section',
    status: heroBlurSpots.length > 0 ? 'OK' : 'FAIL',
    message: `Blur spots: ${heroBlurSpots.length}, Hero section: ${heroSection ? 'TAK' : 'NIE'}`,
  });

  // 5. Check reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasReducedClass = document.documentElement.classList.contains('reduced-motion');
  results.push({
    name: 'Reduced Motion',
    status: prefersReducedMotion ? 'WARN' : 'OK',
    message: prefersReducedMotion 
      ? '⚠️ REDUCED MOTION WŁĄCZONE - animacje wyłączone!'
      : 'Reduced motion wyłączone - animacje powinny działać',
    details: { prefersReducedMotion, hasReducedClass }
  });

  // 6. Check WebGL/Audio lazy loading
  const webglCanvas = document.querySelector('canvas');
  const audioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
  results.push({
    name: 'WebGL/Audio',
    status: webglCanvas ? 'OK' : 'WARN',
    message: `Canvas: ${webglCanvas ? 'TAK' : 'NIE (lazy-loaded)'}, AudioContext: ${audioContext ? 'dostępny' : 'brak'}`,
  });

  // 7. Check CSS animations
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    const computedStyle = getComputedStyle(scrollIndicator);
    const animation = computedStyle.animation || computedStyle.getPropertyValue('animation');
    results.push({
      name: 'Scroll Indicator Animation',
      status: animation && animation !== 'none' ? 'OK' : 'WARN',
      message: `Animation: ${animation || 'brak'}`,
    });
  }

  // 8. Check Performance Toggle
  const perfToggle = document.querySelector('[aria-label*="efekty"]');
  results.push({
    name: 'Performance Toggle',
    status: perfToggle ? 'OK' : 'WARN',
    message: perfToggle ? 'Toggle widoczny' : 'Toggle niewidoczny (może być reduced motion)',
  });

  // 9. Check GPU acceleration
  const gpuElements = document.querySelectorAll('[style*="translateZ"], [style*="translate3d"]');
  results.push({
    name: 'GPU Acceleration',
    status: gpuElements.length > 0 ? 'OK' : 'WARN',
    message: `Elementy z GPU acceleration: ${gpuElements.length}`,
  });

  // 10. Check scroll velocity CSS variable
  const scrollVelocity = getComputedStyle(document.documentElement).getPropertyValue('--scroll-velocity');
  results.push({
    name: 'Scroll Velocity Tracking',
    status: scrollVelocity ? 'OK' : 'WARN',
    message: `--scroll-velocity: ${scrollVelocity || 'nie ustawione'}`,
  });

  // Print results
  console.log('%c📊 WYNIKI DIAGNOSTYKI:', 'font-size: 14px; font-weight: bold; color: #d4af37;');
  console.log('');
  
  results.forEach(r => {
    const icon = r.status === 'OK' ? '✅' : r.status === 'WARN' ? '⚠️' : '❌';
    const color = r.status === 'OK' ? '#4ade80' : r.status === 'WARN' ? '#fbbf24' : '#ef4444';
    console.log(`%c${icon} ${r.name}`, `color: ${color}; font-weight: bold;`);
    console.log(`   ${r.message}`);
    if (r.details) {
      console.log('   Details:', r.details);
    }
  });

  console.log('');
  console.log('%c🔍 ANIMATION DEBUG END', 'background: #d4af37; color: #000; padding: 10px; font-size: 16px; font-weight: bold;');

  // Return summary
  const failCount = results.filter(r => r.status === 'FAIL').length;
  const warnCount = results.filter(r => r.status === 'WARN').length;
  
  if (failCount > 0) {
    console.log('%c❌ PROBLEMY WYKRYTE! Zobacz powyżej.', 'color: #ef4444; font-size: 14px; font-weight: bold;');
  } else if (warnCount > 0) {
    console.log('%c⚠️ Ostrzeżenia - niektóre funkcje mogą nie działać optymalnie.', 'color: #fbbf24; font-size: 14px;');
  } else {
    console.log('%c✅ Wszystko OK!', 'color: #4ade80; font-size: 14px; font-weight: bold;');
  }

  return { results, failCount, warnCount };
};

// Test animacji na żywo
export const testAnimations = () => {
  console.log('%c🎬 TEST ANIMACJI NA ŻYWO', 'background: #3b82f6; color: #fff; padding: 10px; font-size: 16px;');
  
  const gsap = (window as any).gsap;
  if (!gsap) {
    console.error('GSAP nie jest dostępny!');
    return;
  }

  // Test 1: Animate hero blur spots
  const blurSpots = document.querySelectorAll('.hero-blur-spot');
  if (blurSpots.length > 0) {
    console.log('🔵 Animuję blur spots...');
    gsap.to(blurSpots, {
      scale: 1.5,
      opacity: 0.8,
      duration: 1,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut',
      onComplete: () => console.log('✅ Blur spots animation complete')
    });
  }

  // Test 2: Animate stats
  const stats = document.querySelectorAll('.grid > div');
  if (stats.length > 0) {
    console.log('🔵 Animuję stats cards...');
    gsap.to(stats, {
      y: -20,
      stagger: 0.1,
      duration: 0.5,
      yoyo: true,
      repeat: 1,
      ease: 'power2.out',
      onComplete: () => console.log('✅ Stats animation complete')
    });
  }

  // Test 3: Flash gold color
  const goldElements = document.querySelectorAll('.text-gold, .bg-gold');
  if (goldElements.length > 0) {
    console.log('🔵 Flash gold elements...');
    gsap.to(goldElements, {
      filter: 'brightness(1.5)',
      duration: 0.3,
      yoyo: true,
      repeat: 3,
      ease: 'power1.inOut',
      onComplete: () => {
        gsap.set(goldElements, { filter: 'none' });
        console.log('✅ Gold flash complete');
      }
    });
  }

  console.log('%c🎬 Testy uruchomione - obserwuj stronę!', 'color: #3b82f6;');
};

// Force enable all effects
export const forceEnableEffects = () => {
  console.log('%c⚡ FORCE ENABLE EFFECTS', 'background: #22c55e; color: #fff; padding: 10px;');
  
  // Remove reduced motion class
  document.documentElement.classList.remove('reduced-motion');
  
  // Trigger Lenis if available
  const lenis = (window as any).lenis;
  if (lenis) {
    lenis.start();
    console.log('✅ Lenis started');
  }
  
  // Refresh ScrollTrigger
  const ScrollTrigger = (window as any).ScrollTrigger;
  if (ScrollTrigger) {
    ScrollTrigger.refresh();
    console.log('✅ ScrollTrigger refreshed');
  }

  // Click performance toggle if it exists and effects are off
  const toggle = document.querySelector('[aria-label*="Włącz efekty"]') as HTMLButtonElement;
  if (toggle) {
    toggle.click();
    console.log('✅ Performance toggle clicked');
  }

  console.log('✅ Effects force-enabled!');
};

// Expose to window
if (typeof window !== 'undefined') {
  (window as any).debugAnimations = debugAnimations;
  (window as any).testAnimations = testAnimations;
  (window as any).forceEnableEffects = forceEnableEffects;
  
  console.log('%c🛠️ Debug tools loaded!', 'color: #d4af37; font-weight: bold;');
  console.log('Dostępne komendy:');
  console.log('  • window.debugAnimations() - diagnostyka');
  console.log('  • window.testAnimations() - test animacji na żywo');
  console.log('  • window.forceEnableEffects() - wymuś włączenie efektów');
}
