import type { Variants, Transition } from "framer-motion";
import { springConfig, easing, prefersReducedMotion } from "./motion-config";

/**
 * Page Transition System
 * 
 * Zaawansowany system animacji przejść między stronami.
 * Obsługuje różne style animacji, kierunki i efekty specjalne.
 */

// ============================================================================
// TYPY
// ============================================================================

export type PageTransitionType = 
  | "fade"           // Proste zanikanie
  | "slide"          // Przesunięcie w kierunku
  | "slideUp"        // Przesunięcie z dołu do góry
  | "slideDown"      // Przesunięcie z góry na dół
  | "slideLeft"      // Przesunięcie z prawej na lewą
  | "slideRight"     // Przesunięcie z lewej na prawą
  | "scale"          // Skalowanie
  | "scaleRotate"    // Skalowanie z obrotem
  | "flip"           // Obrót 3D
  | "flipX"          // Obrót w osi X
  | "flipY"          // Obrót w osi Y
  | "reveal"         // Ujawnienie (clip-path)
  | "revealUp"       // Ujawnienie od dołu
  | "revealDown"     // Ujawnienie od góry
  | "curtain"        // Efekt kurtyny
  | "zoom"           // Zoom in/out
  | "blur"           // Rozmycie
  | "morph"          // Morphing
  | "parallax"       // Efekt paralaksy
  | "cinematic"      // Kinowy efekt
  | "elegant";       // Elegancki fade + scale

export type TransitionDirection = "forward" | "backward";

// ============================================================================
// KONFIGURACJE PRZEJŚĆ
// ============================================================================

const transitionDurations = {
  fast: 0.3,
  normal: 0.5,
  slow: 0.7,
  cinematic: 1.0,
} as const;

const transitionEase = {
  smooth: [0.4, 0, 0.2, 1] as const,
  snappy: [0.34, 1.56, 0.64, 1] as const,
  elegant: [0.22, 1, 0.36, 1] as const,
  bounce: [0.68, -0.55, 0.265, 1.55] as const,
} as const;

// ============================================================================
// WARIANTY ANIMACJI
// ============================================================================

/**
 * Fade - Proste zanikanie
 */
export const fadeTransition: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: transitionDurations.normal,
      ease: transitionEase.smooth,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: transitionDurations.fast,
      ease: transitionEase.smooth,
    },
  },
};

/**
 * Slide Up - Przesunięcie z dołu
 */
export const slideUpTransition: Variants = {
  initial: {
    opacity: 0,
    y: 100,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: transitionDurations.normal,
      ease: transitionEase.elegant,
    },
  },
  exit: {
    opacity: 0,
    y: -50,
    transition: {
      duration: transitionDurations.fast,
      ease: transitionEase.smooth,
    },
  },
};

/**
 * Slide Down - Przesunięcie z góry
 */
export const slideDownTransition: Variants = {
  initial: {
    opacity: 0,
    y: -100,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: transitionDurations.normal,
      ease: transitionEase.elegant,
    },
  },
  exit: {
    opacity: 0,
    y: 50,
    transition: {
      duration: transitionDurations.fast,
      ease: transitionEase.smooth,
    },
  },
};

/**
 * Slide Left - Przesunięcie z prawej
 */
export const slideLeftTransition: Variants = {
  initial: {
    opacity: 0,
    x: 100,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: transitionDurations.normal,
      ease: transitionEase.elegant,
    },
  },
  exit: {
    opacity: 0,
    x: -100,
    transition: {
      duration: transitionDurations.fast,
      ease: transitionEase.smooth,
    },
  },
};

/**
 * Slide Right - Przesunięcie z lewej
 */
export const slideRightTransition: Variants = {
  initial: {
    opacity: 0,
    x: -100,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: transitionDurations.normal,
      ease: transitionEase.elegant,
    },
  },
  exit: {
    opacity: 0,
    x: 100,
    transition: {
      duration: transitionDurations.fast,
      ease: transitionEase.smooth,
    },
  },
};

/**
 * Scale - Skalowanie
 */
export const scaleTransition: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: transitionDurations.normal,
      ease: transitionEase.snappy,
    },
  },
  exit: {
    opacity: 0,
    scale: 1.1,
    transition: {
      duration: transitionDurations.fast,
      ease: transitionEase.smooth,
    },
  },
};

/**
 * Scale Rotate - Skalowanie z obrotem
 */
export const scaleRotateTransition: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
    rotate: -10,
  },
  animate: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      duration: transitionDurations.normal,
      ease: transitionEase.snappy,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    rotate: 10,
    transition: {
      duration: transitionDurations.fast,
      ease: transitionEase.smooth,
    },
  },
};

/**
 * Flip X - Obrót w osi X (3D)
 */
export const flipXTransition: Variants = {
  initial: {
    opacity: 0,
    rotateX: 90,
    transformPerspective: 1000,
  },
  animate: {
    opacity: 1,
    rotateX: 0,
    transition: {
      duration: transitionDurations.slow,
      ease: transitionEase.elegant,
    },
  },
  exit: {
    opacity: 0,
    rotateX: -90,
    transition: {
      duration: transitionDurations.fast,
      ease: transitionEase.smooth,
    },
  },
};

/**
 * Flip Y - Obrót w osi Y (3D)
 */
export const flipYTransition: Variants = {
  initial: {
    opacity: 0,
    rotateY: 90,
    transformPerspective: 1000,
  },
  animate: {
    opacity: 1,
    rotateY: 0,
    transition: {
      duration: transitionDurations.slow,
      ease: transitionEase.elegant,
    },
  },
  exit: {
    opacity: 0,
    rotateY: -90,
    transition: {
      duration: transitionDurations.fast,
      ease: transitionEase.smooth,
    },
  },
};

/**
 * Reveal Up - Ujawnienie od dołu (clip-path)
 */
export const revealUpTransition: Variants = {
  initial: {
    clipPath: "inset(100% 0% 0% 0%)",
    opacity: 0,
  },
  animate: {
    clipPath: "inset(0% 0% 0% 0%)",
    opacity: 1,
    transition: {
      duration: transitionDurations.slow,
      ease: transitionEase.elegant,
    },
  },
  exit: {
    clipPath: "inset(0% 0% 100% 0%)",
    opacity: 0,
    transition: {
      duration: transitionDurations.fast,
      ease: transitionEase.smooth,
    },
  },
};

/**
 * Reveal Down - Ujawnienie od góry (clip-path)
 */
export const revealDownTransition: Variants = {
  initial: {
    clipPath: "inset(0% 0% 100% 0%)",
    opacity: 0,
  },
  animate: {
    clipPath: "inset(0% 0% 0% 0%)",
    opacity: 1,
    transition: {
      duration: transitionDurations.slow,
      ease: transitionEase.elegant,
    },
  },
  exit: {
    clipPath: "inset(100% 0% 0% 0%)",
    opacity: 0,
    transition: {
      duration: transitionDurations.fast,
      ease: transitionEase.smooth,
    },
  },
};

/**
 * Curtain - Efekt kurtyny (z obu stron)
 */
export const curtainTransition: Variants = {
  initial: {
    clipPath: "inset(0% 50% 0% 50%)",
    opacity: 0,
  },
  animate: {
    clipPath: "inset(0% 0% 0% 0%)",
    opacity: 1,
    transition: {
      duration: transitionDurations.slow,
      ease: transitionEase.elegant,
    },
  },
  exit: {
    clipPath: "inset(0% 50% 0% 50%)",
    opacity: 0,
    transition: {
      duration: transitionDurations.fast,
      ease: transitionEase.smooth,
    },
  },
};

/**
 * Zoom - Efekt przybliżenia
 */
export const zoomTransition: Variants = {
  initial: {
    opacity: 0,
    scale: 0.5,
    filter: "blur(10px)",
  },
  animate: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: transitionDurations.normal,
      ease: transitionEase.snappy,
    },
  },
  exit: {
    opacity: 0,
    scale: 1.5,
    filter: "blur(10px)",
    transition: {
      duration: transitionDurations.fast,
      ease: transitionEase.smooth,
    },
  },
};

/**
 * Blur - Efekt rozmycia
 */
export const blurTransition: Variants = {
  initial: {
    opacity: 0,
    filter: "blur(20px)",
    scale: 1.05,
  },
  animate: {
    opacity: 1,
    filter: "blur(0px)",
    scale: 1,
    transition: {
      duration: transitionDurations.normal,
      ease: transitionEase.smooth,
    },
  },
  exit: {
    opacity: 0,
    filter: "blur(20px)",
    scale: 0.95,
    transition: {
      duration: transitionDurations.fast,
      ease: transitionEase.smooth,
    },
  },
};

/**
 * Cinematic - Kinowy efekt (fade + zoom + blur)
 */
export const cinematicTransition: Variants = {
  initial: {
    opacity: 0,
    scale: 1.1,
    filter: "blur(8px) brightness(0.5)",
  },
  animate: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px) brightness(1)",
    transition: {
      duration: transitionDurations.cinematic,
      ease: transitionEase.elegant,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    filter: "blur(8px) brightness(0.5)",
    transition: {
      duration: transitionDurations.normal,
      ease: transitionEase.smooth,
    },
  },
};

/**
 * Elegant - Eleganckie przejście (subtelne fade + scale + y)
 */
export const elegantTransition: Variants = {
  initial: {
    opacity: 0,
    y: 30,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: transitionDurations.normal,
      ease: transitionEase.elegant,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 1.02,
    transition: {
      duration: transitionDurations.fast,
      ease: transitionEase.smooth,
    },
  },
};

/**
 * Parallax - Efekt paralaksy
 */
export const parallaxTransition: Variants = {
  initial: {
    opacity: 0,
    y: 100,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: transitionDurations.slow,
      ease: transitionEase.elegant,
      opacity: { duration: 0.3 },
    },
  },
  exit: {
    opacity: 0,
    y: -50,
    scale: 1.05,
    transition: {
      duration: transitionDurations.fast,
      ease: transitionEase.smooth,
    },
  },
};

/**
 * Morph - Efekt morphingu
 */
export const morphTransition: Variants = {
  initial: {
    opacity: 0,
    borderRadius: "50%",
    scale: 0.3,
  },
  animate: {
    opacity: 1,
    borderRadius: "0%",
    scale: 1,
    transition: {
      duration: transitionDurations.slow,
      ease: transitionEase.snappy,
    },
  },
  exit: {
    opacity: 0,
    borderRadius: "50%",
    scale: 0.3,
    transition: {
      duration: transitionDurations.fast,
      ease: transitionEase.smooth,
    },
  },
};

// ============================================================================
// MAPA PRZEJŚĆ
// ============================================================================

export const pageTransitions: Record<PageTransitionType, Variants> = {
  fade: fadeTransition,
  slide: slideUpTransition,
  slideUp: slideUpTransition,
  slideDown: slideDownTransition,
  slideLeft: slideLeftTransition,
  slideRight: slideRightTransition,
  scale: scaleTransition,
  scaleRotate: scaleRotateTransition,
  flip: flipYTransition,
  flipX: flipXTransition,
  flipY: flipYTransition,
  reveal: revealUpTransition,
  revealUp: revealUpTransition,
  revealDown: revealDownTransition,
  curtain: curtainTransition,
  zoom: zoomTransition,
  blur: blurTransition,
  cinematic: cinematicTransition,
  elegant: elegantTransition,
  parallax: parallaxTransition,
  morph: morphTransition,
};

// ============================================================================
// FUNKCJE POMOCNICZE
// ============================================================================

/**
 * Pobiera warianty dla danego typu przejścia
 */
export function getPageTransition(type: PageTransitionType = "elegant"): Variants {
  if (prefersReducedMotion()) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0.1 } },
      exit: { opacity: 0, transition: { duration: 0.1 } },
    };
  }
  return pageTransitions[type] || pageTransitions.elegant;
}

/**
 * Tworzy niestandardowe przejście
 */
export function createCustomTransition(config: {
  initial?: Partial<{
    opacity: number;
    x: number;
    y: number;
    scale: number;
    rotate: number;
    filter: string;
  }>;
  animate?: Partial<{
    opacity: number;
    x: number;
    y: number;
    scale: number;
    rotate: number;
    filter: string;
  }>;
  exit?: Partial<{
    opacity: number;
    x: number;
    y: number;
    scale: number;
    rotate: number;
    filter: string;
  }>;
  duration?: number;
  ease?: readonly [number, number, number, number];
}): Variants {
  const duration = config.duration || transitionDurations.normal;
  const ease = config.ease || transitionEase.elegant;

  return {
    initial: {
      opacity: 0,
      ...config.initial,
    },
    animate: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      rotate: 0,
      ...config.animate,
      transition: {
        duration,
        ease,
      },
    },
    exit: {
      opacity: 0,
      ...config.exit,
      transition: {
        duration: duration * 0.6,
        ease: transitionEase.smooth,
      },
    },
  };
}

// ============================================================================
// EKSPORT DOMYŚLNY
// ============================================================================

export const defaultPageTransition = elegantTransition;

export default {
  transitions: pageTransitions,
  get: getPageTransition,
  create: createCustomTransition,
  default: defaultPageTransition,
};
