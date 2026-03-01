// Scroll reveal - unified implementation (moved to motion/)
export { RevealOnScroll, Reveal } from "../motion/RevealOnScroll";
export { default as AnimatedSections } from "./AnimatedSections";

// GSAP scroll animations
export {
  GsapFadeInUp,
  GsapSlideInLeft,
  GsapSlideInRight,
  GsapScaleIn,
  GsapStaggeredList,
  GsapPinElement,
  GsapTextReveal,
  GsapCountUp,
  GsapRotateIn,
  GsapBlurIn,
} from "./GsapScrollAnimations";

// GSAP scroll animations (exports removed as hooks were unused)

// Living Web Animation System
export {
  SmoothScrollProvider,
  useLenis,
  useLenisContext,
} from "./SmoothScrollProvider";
export { SplitText } from "./SplitText";
export { LottieScroll } from "./LottieScroll";
// ParallaxSection removed - use AdvancedParallax instead
export { PinnedSection } from "./PinnedSection";
// RevealOnScroll moved to motion/RevealOnScroll - use unified version
export { HorizontalScroll } from "./HorizontalScroll";

// Premium Animation System - Awwwards Level
export { VideoBackground, VideoReveal } from "./VideoBackground";
export {
  AdvancedParallax,
  DepthLayer,
  ParallaxImage,
  FloatingElement,
} from "./AdvancedParallax";
export { MagneticElement, CursorFollower, HoverScale } from "./MagneticCursor";
export {
  PremiumTextReveal,
  TypewriterText,
  CountUp,
  GradientText,
} from "./PremiumTextReveal";
export {
  SeamlessSection,
  PinnedReveal,
  HorizontalScrollSection,
  HorizontalPanel,
  ColorTransitionSection,
  ProgressIndicator,
} from "./SeamlessTransitions";
