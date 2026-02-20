import React, { useRef, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";
import { fadeInUp, getVariants } from "@/lib/motion-config";
import type { Variants, UseInViewOptions } from "framer-motion";

interface RevealOnScrollProps {
  children: ReactNode;
  /** Animation variants (defaults to fadeInUp) */
  variants?: Variants;
  /** Direction for simple animations (overrides variants if provided) */
  direction?: "up" | "down" | "left" | "right" | "scale" | "fade";
  /** Viewport threshold (0-1) */
  threshold?: number;
  /** Amount of margin from viewport edge */
  margin?: UseInViewOptions["margin"];
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
  /** Alias for y offset (for compatibility) */
  distance?: number;
  /** Scale for custom animations */
  scale?: number;
  /** Opacity range [start, end] */
  opacity?: [number, number];
  /** Enable blur effect */
  blur?: boolean;
  /** Stagger delay for children in seconds */
  stagger?: number;
}

/**
 * RevealOnScroll Component (also exported as Reveal)
 *
 * Triggers animations when elements enter the viewport using useInView.
 * Perfect for scroll-triggered reveals with smooth spring animations.
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
  distance,
  scale,
  opacity,
  blur = false,
  stagger = 0,
}: RevealOnScrollProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    amount: threshold,
    margin: margin as any,
    once,
  });

  // Decide on final Y offset
  const finalY = y ?? distance ?? 60;

  // If direction is provided, use simple direction-based variants
  let finalVariants: Variants;

  if (direction) {
    const directionVariants: Record<string, Variants> = {
      up: {
        hidden: { opacity: 0, y: finalY },
        visible: { opacity: 1, y: 0 },
      },
      down: {
        hidden: { opacity: 0, y: -finalY },
        visible: { opacity: 1, y: 0 },
      },
      left: {
        hidden: { opacity: 0, x: finalY },
        visible: { opacity: 1, x: 0 },
      },
      right: {
        hidden: { opacity: 0, x: -finalY },
        visible: { opacity: 1, x: 0 },
      },
      scale: {
        hidden: { opacity: 0, scale: scale ?? 0.8 },
        visible: { opacity: 1, scale: 1 },
      },
      fade: {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      },
    };
    finalVariants = directionVariants[direction];
  } else if (
    y !== undefined ||
    distance !== undefined ||
    scale !== undefined ||
    opacity ||
    blur
  ) {
    // Custom animation props
    finalVariants = {
      hidden: {
        opacity: opacity?.[0] ?? 0,
        y: finalY,
        scale: scale ?? 1,
        filter: blur ? "blur(10px)" : "blur(0px)",
      },
      visible: {
        opacity: opacity?.[1] ?? 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
      },
    };
  } else {
    // Use provided variants or default
    const baseVariants = variants || fadeInUp;
    finalVariants = getVariants(baseVariants);
  }

  // Add delay, duration and stagger to the transition
  const variantsWithTransition: Variants = {
    hidden: finalVariants.hidden,
    visible: {
      ...(finalVariants.visible as any),
      transition: {
        duration,
        delay,
        ease: [0.32, 0.72, 0, 1],
        staggerChildren: stagger,
        delayChildren: delay,
        ...(finalVariants.visible &&
        typeof finalVariants.visible === "object" &&
        "transition" in finalVariants.visible
          ? (finalVariants.visible as any).transition
          : {}),
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
      {stagger > 0
        ? React.Children.map(children, (child) => (
            <motion.div variants={finalVariants}>{child}</motion.div>
          ))
        : children}
    </motion.div>
  );
};

/**
 * Alias for RevealOnScroll for convenience
 */
export const Reveal = RevealOnScroll;
