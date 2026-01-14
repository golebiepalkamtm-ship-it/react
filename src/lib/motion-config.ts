import type { Variants, Transition } from "framer-motion";

/**
 * Motion Configuration System
 * 
 * A comprehensive animation system inspired by Linear's fluid, professional feel.
 * All animations respect prefers-reduced-motion for accessibility.
 */

// ============================================================================
// EASING FUNCTIONS
// ============================================================================

export const easing = {
  /** Sleek, professional cubic-bezier for smooth transitions */
  sleek: [0.4, 0, 0.2, 1] as [number, number, number, number],
  /** Snappy entrance with slight overshoot */
  snappy: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
  /** Smooth exit */
  smooth: [0.4, 0, 0.6, 1] as [number, number, number, number],
  /** Linear for precise control */
  linear: [0, 0, 1, 1] as [number, number, number, number],
} as const;

// ============================================================================
// SPRING CONFIGURATIONS
// ============================================================================

export const springConfig = {
  /** Default snappy spring (mass: 1, stiffness: 100, damping: 20) */
  default: {
    type: "spring" as const,
    stiffness: 100,
    damping: 20,
    mass: 1,
  },
  /** Gentler spring for subtle animations */
  gentle: {
    type: "spring" as const,
    stiffness: 80,
    damping: 25,
    mass: 1,
  },
  /** Snappier spring for quick interactions */
  snappy: {
    type: "spring" as const,
    stiffness: 120,
    damping: 18,
    mass: 0.9,
  },
  /** Bouncy spring for playful interactions */
  bouncy: {
    type: "spring" as const,
    stiffness: 150,
    damping: 15,
    mass: 0.8,
  },
} as const;

// ============================================================================
// TRANSITION PRESETS
// ============================================================================

export const transitions: Record<string, Transition> = {
  /** Default spring transition */
  default: springConfig.default,
  /** Gentle spring transition */
  gentle: springConfig.gentle,
  /** Snappy spring transition */
  snappy: springConfig.snappy,
  /** Bouncy spring transition */
  bouncy: springConfig.bouncy,
  /** Quick fade transition */
  quick: {
    duration: 0.2,
    ease: easing.sleek,
  },
  /** Standard fade transition */
  standard: {
    duration: 0.3,
    ease: easing.sleek,
  },
  /** Slow fade transition */
  slow: {
    duration: 0.5,
    ease: easing.smooth,
  },
};

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

/**
 * Fade in with upward motion (20px Y offset)
 */
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: springConfig.default,
  },
};

/**
 * Fade in with downward motion
 */
export const fadeInDown: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: springConfig.default,
  },
};

/**
 * Fade in from left
 */
export const fadeInLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: springConfig.default,
  },
};

/**
 * Fade in from right
 */
export const fadeInRight: Variants = {
  hidden: {
    opacity: 0,
    x: 20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: springConfig.default,
  },
};

/**
 * Simple fade in
 */
export const fadeIn: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: springConfig.default,
  },
};

/**
 * Scale in animation
 */
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springConfig.default,
  },
};

/**
 * Scale in with slight bounce
 */
export const scaleInBounce: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springConfig.bouncy,
  },
};

/**
 * Reveal animation (clip-path style reveal)
 */
export const reveal: Variants = {
  hidden: {
    opacity: 0,
    clipPath: "inset(0% 0% 100% 0%)",
  },
  visible: {
    opacity: 1,
    clipPath: "inset(0% 0% 0% 0%)",
    transition: {
      ...springConfig.default,
      clipPath: {
        duration: 0.4,
        ease: easing.sleek,
      },
    },
  },
};

/**
 * Stagger container variant (for parent elements)
 */
export const staggerContainer: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

/**
 * Stagger item variant (for child elements)
 */
export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: springConfig.default,
  },
};

/**
 * Page transition variants (for route changes)
 */
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: springConfig.default,
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: easing.smooth,
    },
  },
};

// ============================================================================
// MICRO-INTERACTION VARIANTS
// ============================================================================

/**
 * Button hover and tap interactions
 */
export const buttonMicro: Variants = {
  rest: {
    scale: 1,
    transition: springConfig.gentle,
  },
  hover: {
    scale: 1.02,
    transition: springConfig.snappy,
  },
  tap: {
    scale: 0.98,
    transition: springConfig.snappy,
  },
};

/**
 * Card hover interactions
 */
export const cardMicro: Variants = {
  rest: {
    scale: 1,
    y: 0,
    transition: springConfig.gentle,
  },
  hover: {
    scale: 1.02,
    y: -4,
    transition: springConfig.snappy,
  },
  tap: {
    scale: 0.98,
    transition: springConfig.snappy,
  },
};

/**
 * Icon micro-interactions
 */
export const iconMicro: Variants = {
  rest: {
    scale: 1,
    rotate: 0,
    transition: springConfig.gentle,
  },
  hover: {
    scale: 1.1,
    transition: springConfig.snappy,
  },
  tap: {
    scale: 0.9,
    transition: springConfig.snappy,
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/**
 * Get transition with reduced motion support
 */
export const getTransition = (transition: Transition): Transition => {
  if (prefersReducedMotion()) {
    return {
      duration: 0.01,
      ease: "linear",
    };
  }
  return transition;
};

/**
 * Get variants with reduced motion support
 */
export const getVariants = (variants: Variants): Variants => {
  if (prefersReducedMotion()) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.01 } },
    };
  }
  return variants;
};

// ============================================================================
// EXPORTS
// ============================================================================

export const motionConfig = {
  easing,
  springConfig,
  transitions,
  variants: {
    fadeInUp,
    fadeInDown,
    fadeInLeft,
    fadeInRight,
    fadeIn,
    scaleIn,
    scaleInBounce,
    reveal,
    staggerContainer,
    staggerItem,
    pageTransition,
    buttonMicro,
    cardMicro,
    iconMicro,
  },
  utils: {
    prefersReducedMotion,
    getTransition,
    getVariants,
  },
} as const;

