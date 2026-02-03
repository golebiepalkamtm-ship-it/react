/**
 * Motion Components
 * 
 * A comprehensive animation system using Framer Motion.
 * All components respect prefers-reduced-motion for accessibility.
 */

export { PageTransition } from "./PageTransition";
export { PageTransitionOverlay } from "./PageTransitionOverlay";
export { GSAPPageTransition, usePageTransition } from "./GSAPPageTransition";
export { RevealOnScroll, Reveal } from "./RevealOnScroll";
export { StaggeredList, StaggeredItem } from "./StaggeredList";

// Re-export motion config for convenience
export * from "@/lib/motion-config";

