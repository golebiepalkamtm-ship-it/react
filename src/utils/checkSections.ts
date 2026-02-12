/**
 * Check which sections are actually rendered in DOM
 */

export const checkSections = () => {
  console.log('%c🔍 CHECKING SECTIONS', 'background: #FF5722; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
  console.log('');

  const sections = [
    { name: 'HeroPremium', selector: '[class*="hero"]' },
    { name: 'AboutSection', selector: '[class*="about"]' },
    { name: 'Carousel3D', selector: '[id="champions"]' },
    { name: 'FeaturesSectionPremium', selector: '[class*="features"]' },
    { name: 'PressSection', selector: '[class*="press"]' },
    { name: 'CTASectionPremium', selector: '[class*="cta"]' },
    { name: 'ContactSection', selector: '[class*="contact"]' },
    { name: 'Footer', selector: 'footer' },
  ];

  sections.forEach((section, index) => {
    const elements = document.querySelectorAll(section.selector);
    const visible = Array.from(elements).filter((el) => {
      const rect = (el as HTMLElement).getBoundingClientRect();
      const style = window.getComputedStyle(el as HTMLElement);
      return rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    });

    if (visible.length > 0) {
      console.log(`✅ ${index + 1}. ${section.name}: ${visible.length} element(s) visible`);
      visible.forEach((el) => {
        const rect = (el as HTMLElement).getBoundingClientRect();
        const style = window.getComputedStyle(el as HTMLElement);
        console.log(`   Height: ${rect.height}px, Opacity: ${style.opacity}, Display: ${style.display}`);
      });
    } else {
      console.log(`❌ ${index + 1}. ${section.name}: NOT FOUND or INVISIBLE`);
      if (elements.length > 0) {
        console.log(`   Found ${elements.length} element(s) but all invisible:`);
        elements.forEach((el) => {
          const rect = (el as HTMLElement).getBoundingClientRect();
          const style = window.getComputedStyle(el as HTMLElement);
          console.log(`   Height: ${rect.height}px, Opacity: ${style.opacity}, Display: ${style.display}, Visibility: ${style.visibility}`);
        });
      }
    }
  });

  console.log('');
  console.log('📊 All divs with data-reveal:');
  const reveals = document.querySelectorAll('[data-reveal]');
  reveals.forEach((el, i) => {
    const style = window.getComputedStyle(el as HTMLElement);
    const rect = (el as HTMLElement).getBoundingClientRect();
    console.log(`  ${i + 1}. data-reveal="${el.getAttribute('data-reveal')}" - Opacity: ${style.opacity}, Height: ${rect.height}px`);
  });
};

if (typeof window !== 'undefined') {
  (window as any).checkSections = checkSections;
  console.log('🛠️ Section checker loaded! Use: window.checkSections()');
}
