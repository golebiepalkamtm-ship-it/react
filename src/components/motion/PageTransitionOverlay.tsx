import { motion, AnimatePresence, Variants } from "framer-motion";
import { useLocation, useOutlet } from "react-router-dom";
import type { ReactNode } from "react";
import { useState, useEffect, useRef } from "react";

/**
 * Premium Page Transition Overlay
 * 
 * Efektowna animacja przejścia między stronami z overlay reveal effect.
 * Inspirowana stylem Awwwards i premium brandów.
 */

// Kolory overlaya dla różnych sekcji
const overlayColors = {
  "/": "#B8860B", // Dark Gold dla strony głównej
  "/auctions": "#1a1a2e", // Ciemny granat dla aukcji
  "/champions": "#B8860B", // Złoty dla champions
  "/press": "#2d2d44", // Ciemny fiolet dla prasy
  "/contact": "#1a1a2e", // Ciemny dla kontaktu
  default: "#0a0a0f", // Domyślny ciemny
} as const;

const getOverlayColor = (pathname: string): string => {
  for (const [path, color] of Object.entries(overlayColors)) {
    if (pathname === path || pathname.startsWith(`${path}/`)) {
      return color;
    }
  }
  return overlayColors.default;
};

// Warianty dla overlay reveal
const overlayVariants: Variants = {
  initial: {
    scaleY: 0,
    originY: 1,
  },
  enter: {
    scaleY: 1,
    originY: 1,
    transition: {
      duration: 0.5,
      ease: [0.76, 0, 0.24, 1], // Custom cubic-bezier
    },
  },
  exit: {
    scaleY: 0,
    originY: 0,
    transition: {
      duration: 0.5,
      ease: [0.76, 0, 0.24, 1],
      delay: 0.1,
    },
  },
};

// Warianty dla logo/tekstu na overlay
const logoVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
    y: 20,
  },
  enter: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.33, 1, 0.68, 1],
      delay: 0.2,
    },
  },
  exit: {
    opacity: 0,
    scale: 1.1,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.33, 1, 0.68, 1],
    },
  },
};

// Warianty dla contentu strony
const pageContentVariants: Variants = {
  initial: {
    opacity: 0,
    y: 40,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.33, 1, 0.68, 1],
      delay: 0.3,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.33, 1, 0.68, 1],
    },
  },
};

// Shimmer effect na overlay
const shimmerVariants: Variants = {
  initial: {
    x: "-100%",
  },
  animate: {
    x: "100%",
    transition: {
      duration: 0.8,
      ease: "easeInOut",
      delay: 0.3,
    },
  },
};

interface PageTransitionOverlayProps {
  children?: ReactNode;
  showLogo?: boolean;
  className?: string;
}

export const PageTransitionOverlay = ({
  children,
  showLogo = true,
  className = "",
}: PageTransitionOverlayProps) => {
  const location = useLocation();
  const outlet = useOutlet();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevPathRef = useRef(location.pathname);
  
  const content = children ?? outlet;
  const overlayColor = getOverlayColor(location.pathname);

  useEffect(() => {
    if (location.pathname !== prevPathRef.current) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        prevPathRef.current = location.pathname;
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  return (
    <>
      {/* Overlay element - pokazuje się podczas przejścia */}
      <AnimatePresence mode="wait">
        {isTransitioning && (
          <motion.div
            key="overlay"
            className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
            style={{ backgroundColor: overlayColor }}
            variants={overlayVariants}
            initial="initial"
            animate="enter"
            exit="exit"
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
            />
            
            {/* Logo / Text na overlay */}
            {showLogo && (
              <motion.div
                variants={logoVariants}
                initial="initial"
                animate="enter"
                exit="exit"
                className="flex flex-col items-center gap-4"
              >
                {/* Animated pigeon icon */}
                <motion.svg
                  width="80"
                  height="80"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="text-gold"
                  strokeWidth="1.5"
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <path d="M12 4c-1 0-2 .5-2.5 1.5L8 8H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h3l3 3 3-3h3a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-3l-1.5-2.5C12 4.5 13 4 12 4z" />
                </motion.svg>
                
                <motion.span
                  className="text-xl font-light tracking-[0.3em] text-white/80"
                  initial={{ opacity: 0, letterSpacing: "0.5em" }}
                  animate={{ opacity: 1, letterSpacing: "0.3em" }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  CHAMPION PIGEONS
                </motion.span>
                
                {/* Loading dots */}
                <div className="flex gap-1.5 mt-4">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-gold"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.15,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          variants={pageContentVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className={className}
        >
          {content}
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default PageTransitionOverlay;
