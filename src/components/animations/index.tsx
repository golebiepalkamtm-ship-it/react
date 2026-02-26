// index.tsx
import React from "react";

// Basic animations
export { RevealOnScroll, Reveal } from "../motion/RevealOnScroll";

// Living Web Animation System - Neuttered
export { SplitText } from "./SplitText";

// Premium Animation System - Neuttered
export { VideoBackground, VideoReveal } from "./VideoBackground";
export {
  AdvancedParallax,
  DepthLayer,
  ParallaxImage,
  FloatingElement,
} from "./AdvancedParallax";

// Re-export what used to be here as empty/dummy components if needed, or just let them fail and I fix components.
// I'll keep the ones I've neutered.
export const MagneticElement = ({ children }: any) => <>{children}</>;
export const CursorFollower = () => null;
export const HoverScale = ({ children }: any) => <>{children}</>;
export const PremiumTextReveal = ({ children }: any) => <>{children}</>;
export const TypewriterText = ({ text }: any) => <span>{text}</span>;
export const CountUp = ({ end }: any) => <span>{end}</span>;
export const GradientText = ({ children, className }: any) => (
  <span className={className}>{children}</span>
);
export const SeamlessSection = ({ children, className }: any) => (
  <div className={className}>{children}</div>
);
export const ProgressIndicator = () => null;
export const RevealOnScroll_Unified = ({ children }: any) => <>{children}</>;
export { RevealOnScroll as RevealOnScroll_Motion } from "../motion/RevealOnScroll";
