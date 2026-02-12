// Framer Motion animations
export { SectionReveal, StaggerContainer, StaggerItem, FadeIn, SlideIn } from './ScrollAnimations';
export { ScrollReveal } from './ScrollReveal';
export { default as AnimatedSections } from './AnimatedSections';

// GSAP scroll animations
export {
  GsapFadeInUp,
  GsapSlideInLeft,
  GsapSlideInRight,
  GsapScaleIn,
  GsapParallax,
  GsapStaggeredList,
  GsapPinElement,
  GsapTextReveal,
  GsapCountUp,
  GsapRotateIn,
  GsapBlurIn,
} from './GsapScrollAnimations';

// Hooks
export { useGsapScroll, useGsapTimeline, gsapUtils } from '../../hooks/useGsapScroll';

// Living Web Animation System
export { SmoothScrollProvider, useLenis } from './SmoothScrollProvider';
export { SplitText } from './SplitText';
export { LottieScroll } from './LottieScroll';
export { ParallaxSection, ParallaxLayer } from './ParallaxSection';
export { PinnedSection } from './PinnedSection';
export { RevealOnScroll } from './RevealOnScroll';
export { HorizontalScroll } from './HorizontalScroll';

// Premium Animation System - Awwwards Level
export { VideoBackground, VideoReveal } from './VideoBackground';
export { 
  AdvancedParallax, 
  DepthLayer, 
  ParallaxImage, 
  FloatingElement 
} from './AdvancedParallax';
export { 
  MagneticElement, 
  CursorFollower, 
  HoverScale 
} from './MagneticCursor';
export { 
  PremiumTextReveal, 
  TypewriterText, 
  CountUp, 
  GradientText 
} from './PremiumTextReveal';
export {
  SeamlessSection,
  PinnedReveal,
  HorizontalScrollSection,
  HorizontalPanel,
  ColorTransitionSection,
  ProgressIndicator,
} from './SeamlessTransitions';
