/**
 * GSAP ANIMATION DIAGNOSTIC SCRIPT
 * Identifies why GSAP animations are not working
 */

export const runGSAPDiagnostic = () => {
  console.log('\n🔍 ===== GSAP ANIMATION DIAGNOSTIC START =====\n');
  
  const results: any = {
    timestamp: new Date().toISOString(),
    environment: {},
    elements: {},
    styles: {},
    scrollTriggers: {},
    gsap: {},
    conflicts: []
  };

  // 1. ENVIRONMENT CHECK
  console.log('📋 1. ENVIRONMENT CHECK');
  results.environment = {
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    isDev: import.meta.env.DEV,
    userAgent: navigator.userAgent,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollY: window.scrollY
    }
  };
  console.log('  ✓ Reduced Motion:', results.environment.reducedMotion);
  console.log('  ✓ Dev Mode:', results.environment.isDev);
  console.log('  ✓ Viewport:', results.environment.viewport);

  // 2. ELEMENT EXISTENCE CHECK
  console.log('\n📋 2. ELEMENT EXISTENCE CHECK');
  const section = document.querySelector('#about') as HTMLElement;
  const leftContent = section?.querySelector('div > div > div:first-child') as HTMLElement;
  const cards = section?.querySelectorAll('.feature-card') || [];
  
  results.elements = {
    section: !!section,
    leftContent: !!leftContent,
    cardsCount: cards.length,
    sectionPosition: section?.getBoundingClientRect()
  };
  console.log('  ✓ Section exists:', results.elements.section);
  console.log('  ✓ Left content exists:', results.elements.leftContent);
  console.log('  ✓ Cards found:', results.elements.cardsCount);
  console.log('  ✓ Section position:', results.elements.sectionPosition);

  if (!section || !leftContent || cards.length === 0) {
    console.error('❌ CRITICAL: Elements not found! Cannot proceed.');
    return results;
  }

  // 3. COMPUTED STYLES CHECK
  console.log('\n📋 3. COMPUTED STYLES CHECK');
  const leftStyles = window.getComputedStyle(leftContent);
  const card0Styles = window.getComputedStyle(cards[0] as HTMLElement);
  
  results.styles = {
    leftContent: {
      opacity: leftStyles.opacity,
      transform: leftStyles.transform,
      visibility: leftStyles.visibility,
      display: leftStyles.display,
      willChange: leftStyles.willChange
    },
    firstCard: {
      opacity: card0Styles.opacity,
      transform: card0Styles.transform,
      visibility: card0Styles.visibility,
      display: card0Styles.display
    }
  };
  
  console.log('  ✓ Left content opacity:', results.styles.leftContent.opacity);
  console.log('  ✓ Left content transform:', results.styles.leftContent.transform);
  console.log('  ✓ First card opacity:', results.styles.firstCard.opacity);
  console.log('  ✓ First card transform:', results.styles.firstCard.transform);

  // 4. INLINE STYLES CHECK
  console.log('\n📋 4. INLINE STYLES CHECK');
  results.styles.leftContentInline = leftContent.style.cssText;
  results.styles.firstCardInline = (cards[0] as HTMLElement).style.cssText;
  console.log('  ✓ Left content inline:', leftContent.style.cssText || '(none)');
  console.log('  ✓ First card inline:', (cards[0] as HTMLElement).style.cssText || '(none)');

  // 5. CSS CLASSES CHECK
  console.log('\n📋 5. CSS CLASSES CHECK');
  results.styles.leftContentClasses = Array.from(leftContent.classList);
  results.styles.firstCardClasses = Array.from((cards[0] as HTMLElement).classList);
  console.log('  ✓ Left content classes:', results.styles.leftContentClasses);
  console.log('  ✓ First card classes:', results.styles.firstCardClasses);

  // 6. GSAP GLOBAL STATE
  console.log('\n📋 6. GSAP GLOBAL STATE');
  const gsap = (window as any).gsap;
  const ScrollTrigger = (window as any).ScrollTrigger;
  
  if (gsap) {
    results.gsap = {
      version: gsap.version,
      globalTimeline: gsap.globalTimeline?.getChildren()?.length || 0,
      config: {
        force3D: gsap.config().force3D,
        nullTargetWarn: gsap.config().nullTargetWarn,
        autoSleep: gsap.config().autoSleep
      }
    };
    console.log('  ✓ GSAP version:', gsap.version);
    console.log('  ✓ Active animations:', results.gsap.globalTimeline);
    console.log('  ✓ GSAP config:', results.gsap.config);
  } else {
    console.error('❌ GSAP not found on window!');
  }

  // 7. SCROLLTRIGGER STATE
  console.log('\n📋 7. SCROLLTRIGGER STATE');
  if (ScrollTrigger) {
    const triggers = ScrollTrigger.getAll();
    results.scrollTriggers = {
      count: triggers.length,
      triggers: triggers.map((st: any) => ({
        id: st.vars.id,
        trigger: st.trigger?.id || st.trigger?.className,
        start: st.start,
        end: st.end,
        progress: st.progress,
        isActive: st.isActive,
        enabled: st.enabled
      }))
    };
    console.log('  ✓ ScrollTriggers count:', results.scrollTriggers.count);
    results.scrollTriggers.triggers.forEach((t: any, i: number) => {
      console.log(`  ✓ Trigger ${i}:`, t);
    });
  } else {
    console.error('❌ ScrollTrigger not found!');
  }

  // 8. FRAMER MOTION CONFLICT CHECK
  console.log('\n📋 8. FRAMER MOTION CONFLICT CHECK');
  const hasMotionDiv = leftContent.hasAttribute('data-framer-motion-id') || 
                       leftContent.parentElement?.hasAttribute('data-framer-motion-id');
  const hasMotionStyle = leftContent.style.cssText.includes('--framer') ||
                         leftContent.parentElement?.style.cssText.includes('--framer');
  
  results.conflicts.push({
    type: 'Framer Motion',
    found: hasMotionDiv || hasMotionStyle,
    details: {
      hasMotionAttribute: hasMotionDiv,
      hasMotionStyle: hasMotionStyle
    }
  });
  console.log('  ✓ Framer Motion attributes:', hasMotionDiv);
  console.log('  ✓ Framer Motion styles:', hasMotionStyle);

  // 9. CSS SPECIFICITY CONFLICT CHECK
  console.log('\n📋 9. CSS SPECIFICITY CHECK');
  const testOpacity = () => {
    const original = leftContent.style.opacity;
    leftContent.style.opacity = '0.5';
    const computed = window.getComputedStyle(leftContent).opacity;
    leftContent.style.opacity = original;
    return computed === '0.5';
  };
  
  const canSetOpacity = testOpacity();
  results.conflicts.push({
    type: 'CSS Override',
    found: !canSetOpacity,
    details: { canSetInlineOpacity: canSetOpacity }
  });
  console.log('  ✓ Can set inline opacity:', canSetOpacity);

  // 10. ANIMATION PROPERTY CHECK
  console.log('\n📋 10. CSS ANIMATIONS/TRANSITIONS CHECK');
  results.styles.leftContentAnimation = {
    animation: leftStyles.animation,
    transition: leftStyles.transition,
    transitionProperty: leftStyles.transitionProperty
  };
  console.log('  ✓ CSS animation:', leftStyles.animation);
  console.log('  ✓ CSS transition:', leftStyles.transition);

  // 11. LENIS SMOOTH SCROLL CHECK
  console.log('\n📋 11. LENIS SMOOTH SCROLL CHECK');
  const hasLenisClass = document.documentElement.classList.contains('lenis');
  const lenisInstance = (window as any).lenis;
  results.environment.lenis = {
    hasClass: hasLenisClass,
    hasInstance: !!lenisInstance,
    scrollBehavior: document.documentElement.style.scrollBehavior
  };
  console.log('  ✓ Lenis class on <html>:', hasLenisClass);
  console.log('  ✓ Lenis instance:', !!lenisInstance);
  console.log('  ✓ Scroll behavior:', results.environment.lenis.scrollBehavior);

  // 12. SUMMARY & RECOMMENDATIONS
  console.log('\n📋 12. DIAGNOSIS SUMMARY');
  const issues: string[] = [];
  
  if (results.environment.reducedMotion) {
    issues.push('⚠️ REDUCED MOTION is enabled - may affect animations');
  }
  
  if (results.styles.leftContent.opacity !== '0') {
    issues.push(`❌ Left content opacity is ${results.styles.leftContent.opacity} (should be 0)`);
  }
  
  if (results.styles.firstCard.opacity !== '0') {
    issues.push(`❌ First card opacity is ${results.styles.firstCard.opacity} (should be 0)`);
  }
  
  if (results.scrollTriggers.count === 0) {
    issues.push('❌ No ScrollTriggers found!');
  }
  
  const aboutTrigger = results.scrollTriggers.triggers?.find((t: any) => t.id === 'about-section-reveal');
  if (!aboutTrigger) {
    issues.push('❌ AboutSection ScrollTrigger not found!');
  } else if (aboutTrigger.progress > 0) {
    issues.push(`⚠️ AboutSection trigger already at progress ${aboutTrigger.progress} (animation already played)`);
  }
  
  if (results.conflicts.find((c: any) => c.type === 'Framer Motion' && c.found)) {
    issues.push('⚠️ Framer Motion detected - may conflict with GSAP');
  }
  
  if (!canSetOpacity) {
    issues.push('❌ Cannot set inline opacity - CSS override issue');
  }

  console.log('\n🔍 ISSUES FOUND:', issues.length);
  issues.forEach(issue => console.log('  ', issue));

  // RECOMMENDATIONS
  console.log('\n💡 RECOMMENDATIONS:');
  if (results.environment.reducedMotion) {
    console.log('  1. Disable Reduced Motion in Windows Settings');
    console.log('     Settings → Ease of Access → Display → Show animations: ON');
  }
  
  if (aboutTrigger && aboutTrigger.progress > 0) {
    console.log('  2. Scroll to top and refresh page:');
    console.log('     window.scrollTo(0, 0); location.reload();');
  }
  
  if (results.styles.leftContent.opacity !== '0') {
    console.log('  3. Check for CSS rules overriding opacity');
    console.log('     Inspect element in DevTools → Computed → opacity');
  }
  
  if (results.conflicts.find((c: any) => c.type === 'Framer Motion' && c.found)) {
    console.log('  4. Remove Framer Motion from AboutSection component');
  }

  console.log('\n🔍 ===== DIAGNOSTIC COMPLETE =====\n');
  console.log('📊 Full report saved to window.__gsapDiagnostic');
  (window as any).__gsapDiagnostic = results;
  
  return results;
};

// Auto-run diagnostic when imported
if (typeof window !== 'undefined') {
  // Expose diagnostic function globally
  (window as any).runGSAPDiagnostic = runGSAPDiagnostic;
  
  // Wait for DOM and GSAP to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(runGSAPDiagnostic, 2000);
    });
  } else {
    setTimeout(runGSAPDiagnostic, 2000);
  }
}

export default runGSAPDiagnostic;
