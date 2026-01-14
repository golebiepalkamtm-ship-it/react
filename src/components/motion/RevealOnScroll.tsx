import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { fadeInUp, getVariants } from "@/lib/motion-config";
import type { Variants } from "framer-motion";

interface RevealOnScrollProps {
  children: ReactNode;
  /** Animation variants (defaults to fadeInUp) */
  variants?: Variants;
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
  variants = fadeInUp,
  threshold = 0.1,
  margin = "0px",
  once = true,
  className = "",
  delay = 0,
}: RevealOnScrollProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    threshold,
    margin,
    once,
  });

  const safeVariants = getVariants(variants);

  // Add delay to the transition if specified
  const variantsWithDelay: Variants = {
    hidden: safeVariants.hidden,
    visible: {
      ...safeVariants.visible,
      transition: {
        ...(safeVariants.visible?.transition as object),
        delay,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variantsWithDelay}
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

