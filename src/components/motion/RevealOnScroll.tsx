import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { fadeInUp, getVariants } from "@/lib/motion-config";
import type { Variants } from "framer-motion";

interface RevealOnScrollProps {
  children: ReactNode;
  /** Animation variants (defaults to fadeInUp) */
  variants?: Variants;
  /** Direction for simple animations (overrides variants if provided) */
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade';
  /** Viewport threshold (0-1) */
  threshold?: number;
  /** Amount of margin from viewport edge */
  margin?: string;
  /** Once: animate only once, always: animate every time it enters viewport */
  once?: boolean;
  /** Additional className */
  className?: string;
  /** Custom delay in seconds */
  delay?: number;
  /** Duration in seconds */
  duration?: number;
  /** Y offset for custom animations */
  y?: number;
  /** Scale for custom animations */
  scale?: number;
  /** Opacity range [start, end] */
  opacity?: [number, number];
  /** Enable blur effect */
  blur?: boolean;
}

/**
 * RevealOnScroll Component (also exported as Reveal)
 * 
 * Triggers animations when elements enter the viewport using useInView.
 * Perfect for scroll-triggered reveals with smooth spring animations.
 * 
 * @example
 * ```tsx
 * <RevealOnScroll>
 *   <h1>This will fade in when scrolled into view</h1>
 * </RevealOnScroll>
 * 
 * <RevealOnScroll variants={fadeInLeft} delay={0.2}>
 *   <p>Custom animation with delay</p>
 * </RevealOnScroll>
 * ```
 */
export const RevealOnScroll = ({
  children,
  variants,
  direction,
  threshold = 0.1,
  margin = "0px",
  once = true,
  className = "",
  delay = 0,
  duration = 0.6,
  y,
  scale,
  opacity,
  blur = false,
}: RevealOnScrollProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    threshold,
    margin,
    once,
  });

  // If direction is provided, use simple direction-based variants
  let finalVariants: Variants;
  
  if (direction) {
    const directionVariants: Record<string, Variants> = {
      up: {
        hidden: { opacity: 0, y: y ?? 60 },
        visible: { opacity: 1, y: 0 }
      },
      down: {
        hidden: { opacity: 0, y: y ? -y : -60 },
        visible: { opacity: 1, y: 0 }
      },
      left: {
        hidden: { opacity: 0, x: 60 },
        visible: { opacity: 1, x: 0 }
      },
      right: {
        hidden: { opacity: 0, x: -60 },
        visible: { opacity: 1, x: 0 }
      },
      scale: {
        hidden: { opacity: 0, scale: scale ?? 0.8 },
        visible: { opacity: 1, scale: 1 }
      },
      fade: {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
      }
    };
    finalVariants = directionVariants[direction];
  } else if (y !== undefined || scale !== undefined || opacity || blur) {
    // Custom animation props
    finalVariants = {
      hidden: {
        opacity: opacity?.[0] ?? 0,
        y: y ?? 0,
        scale: scale ?? 1,
        filter: blur ? 'blur(10px)' : 'blur(0px)'
      },
      visible: {
        opacity: opacity?.[1] ?? 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)'
      }
    };
  } else {
    // Use provided variants or default
    const baseVariants = variants || fadeInUp;
    finalVariants = getVariants(baseVariants);
  }

  // Add delay and duration to the transition
  const variantsWithTransition: Variants = {
    hidden: finalVariants.hidden,
    visible: {
      ...finalVariants.visible,
      transition: {
        duration,
        delay,
        ease: [0.32, 0.72, 0, 1],
        ...(finalVariants.visible?.transition as object || {}),
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variantsWithTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Alias for RevealOnScroll for convenience
 */
export const Reveal = RevealOnScroll;

