import { motion } from "framer-motion";
import { Children, type ReactNode } from "react";
import {
  staggerContainer,
  staggerItem,
  getVariants,
} from "@/lib/motion-config";
import type { Variants } from "framer-motion";

interface StaggeredListProps {
  children: ReactNode;
  /** Container variants (defaults to staggerContainer) */
  containerVariants?: Variants;
  /** Item variants (defaults to staggerItem) */
  itemVariants?: Variants;
  /** Delay between each child animation in seconds */
  staggerDelay?: number;
  /** Initial delay before starting animations */
  delayChildren?: number;
  /** Additional className for container */
  className?: string;
  /** HTML element to render as */
  as?: keyof JSX.IntrinsicElements;
}

/**
 * StaggeredList Component
 * 
 * A parent-child component system that automatically orchestrates
 * the timing of its children with staggered animations.
 * 
 * @example
 * ```tsx
 * <StaggeredList>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </StaggeredList>
 * 
 * <StaggeredList staggerDelay={0.15} delayChildren={0.2}>
 *   {items.map(item => <Card key={item.id} data={item} />)}
 * </StaggeredList>
 * ```
 */
export const StaggeredList = ({
  children,
  containerVariants = staggerContainer,
  itemVariants = staggerItem,
  staggerDelay = 0.1,
  delayChildren = 0.05,
  className = "",
  as = "div",
}: StaggeredListProps) => {
  const safeContainerVariants = getVariants(containerVariants);
  const safeItemVariants = getVariants(itemVariants);

  // Merge custom stagger timing
  const mergedContainerVariants: Variants = {
    ...safeContainerVariants,
    visible: {
      ...safeContainerVariants.visible,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      },
    },
  };

  const MotionComponent = motion[as] as typeof motion.div;

  // Handle children - wrap each child in a motion div if needed
  const childrenArray = Children.toArray(children);

  return (
    <MotionComponent
      initial="hidden"
      animate="visible"
      variants={mergedContainerVariants}
      className={className}
    >
      {childrenArray.map((child, index) => {
        // If child is already a motion component with variants, use it as-is
        if (
          typeof child === "object" &&
          child !== null &&
          "type" in child &&
          typeof child.type === "object" &&
          child.type !== null &&
          "displayName" in child.type &&
          child.type.displayName === "StaggeredItem"
        ) {
          return child;
        }

        // Otherwise, wrap in motion div
        return (
          <motion.div
            key={index}
            variants={safeItemVariants}
            className="stagger-item"
          >
            {child}
          </motion.div>
        );
      })}
    </MotionComponent>
  );
};

/**
 * StaggeredItem Component
 * 
 * Use this as a direct child of StaggeredList for more control.
 * Automatically inherits animation timing from parent.
 * 
 * @example
 * ```tsx
 * <StaggeredList>
 *   <StaggeredItem>
 *     <Card>Item 1</Card>
 *   </StaggeredItem>
 *   <StaggeredItem>
 *     <Card>Item 2</Card>
 *   </StaggeredItem>
 * </StaggeredList>
 * ```
 */
export const StaggeredItem = ({
  children,
  variants = staggerItem,
  className = "",
  as = "div",
}: {
  children: ReactNode;
  variants?: Variants;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}) => {
  const safeVariants = getVariants(variants);
  const MotionComponent = motion[as] as typeof motion.div;

  return (
    <MotionComponent variants={safeVariants} className={className}>
      {children}
    </MotionComponent>
  );
};

// Set displayName for identification
StaggeredItem.displayName = "StaggeredItem";

