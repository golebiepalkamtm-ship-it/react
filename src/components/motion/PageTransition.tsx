import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useOutlet } from "react-router-dom";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { getPageTransition, type PageTransitionType } from "@/lib/page-transitions";
import { usePageTransition } from "@/contexts/PageTransitionContext";
import { prefersReducedMotion } from "@/lib/motion-config";

interface PageTransitionProps {
  children?: ReactNode;
  /** Typ animacji przejścia */
  transitionType?: PageTransitionType;
  /** Additional className */
  className?: string;
  /** Czy scrollować na górę po zmianie strony */
  scrollToTop?: boolean;
}

/**
 * PageTransition Component
 * 
 * Zaawansowany komponent obsługujący animacje przejść między stronami.
 * Wspiera wiele typów animacji: fade, slide, scale, flip, reveal, curtain, zoom, blur, cinematic, elegant, parallax, morph.
 * 
 * @example
 * ```tsx
 * // Użycie podstawowe (domyślnie 'elegant')
 * <PageTransition>
 *   <Routes>
 *     <Route path="/" element={<HomePage />} />
 *   </Routes>
 * </PageTransition>
 * 
 * // Z określonym typem przejścia
 * <PageTransition transitionType="cinematic">
 *   <Routes>...</Routes>
 * </PageTransition>
 * 
 * // Z PageTransitionProvider dla dynamicznej zmiany
 * <PageTransitionProvider defaultTransition="elegant">
 *   <PageTransition>
 *     <Routes>...</Routes>
 *   </PageTransition>
 * </PageTransitionProvider>
 * ```
 */
export const PageTransition = ({
  children,
  transitionType,
  className = "",
  scrollToTop = true,
}: PageTransitionProps) => {
  const location = useLocation();
  const outlet = useOutlet();
  
  // Próbuj użyć kontekstu, ale jeśli nie istnieje, użyj prop lub domyślne
  const pageTransitionContext = usePageTransition();
  
  // Określ aktywny typ przejścia
  const activeTransitionType = transitionType || pageTransitionContext.getActiveTransition();
  
  // Pobierz warianty animacji
  const variants = prefersReducedMotion() 
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.1 } },
        exit: { opacity: 0, transition: { duration: 0.1 } },
      }
    : getPageTransition(activeTransitionType);

  // Use outlet if no children provided (for layout usage)
  const content = children ?? outlet;

  // Scroll to top on route change
  useEffect(() => {
    if (scrollToTop) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    // Wyczyść jednorazowe przejście po zmianie strony
    pageTransitionContext.clearNextTransition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, scrollToTop]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        className={`page-transition-wrapper ${className}`}
        style={{
          width: '100%',
          minHeight: '100vh',
        }}
      >
        {content}
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Komponent do opakowania pojedynczej strony z własną animacją
 */
interface AnimatedPageProps {
  children: ReactNode;
  transitionType?: PageTransitionType;
  className?: string;
}

export const AnimatedPage = ({
  children,
  transitionType = 'elegant',
  className = '',
}: AnimatedPageProps) => {
  const variants = getPageTransition(transitionType);

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

