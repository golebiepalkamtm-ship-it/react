import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useOutlet } from "react-router-dom";
import type { ReactNode } from "react";
import { pageTransition, getVariants } from "@/lib/motion-config";

interface PageTransitionProps {
  children?: ReactNode;
  /** Custom transition variants */
  variants?: typeof pageTransition;
  /** Additional className */
  className?: string;
}

/**
 * PageTransition Component
 * 
 * Handles exit/enter animations between routes using AnimatePresence.
 * Can be used in two ways:
 * 1. As a wrapper around Routes (with children prop)
 * 2. As an Outlet wrapper in a layout (without children, uses useOutlet)
 * 
 * @example
 * ```tsx
 * // Method 1: Wrap Routes
 * <PageTransition>
 *   <Routes>
 *     <Route path="/" element={<HomePage />} />
 *   </Routes>
 * </PageTransition>
 * 
 * // Method 2: Use in layout with Outlet
 * function Layout() {
 *   return (
 *     <div>
 *       <Header />
 *       <PageTransition />
 *     </div>
 *   );
 * }
 * ```
 */
export const PageTransition = ({
  children,
  variants = pageTransition,
  className = "",
}: PageTransitionProps) => {
  const location = useLocation();
  const outlet = useOutlet();
  const safeVariants = getVariants(variants);

  // Use outlet if no children provided (for layout usage)
  const content = children ?? outlet;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={safeVariants}
        className={className}
      >
        {content}
      </motion.div>
    </AnimatePresence>
  );
};

