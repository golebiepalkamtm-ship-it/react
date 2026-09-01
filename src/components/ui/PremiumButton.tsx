import React, { useRef, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PremiumButtonProps extends ButtonProps {
  shimmer?: boolean;
  magnetic?: boolean;
  magneticStrength?: number;
  wrapperClassName?: string;
}

export const PremiumButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
  (
    {
      className,
      children,
      shimmer = true,
      magnetic = true,
      magneticStrength = 0.2, // Jak mocno przyciąga
      wrapperClassName,
      ...props
    },
    ref
  ) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    // Magnetic physics
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
    const springX = useSpring(x, springConfig);
    const springY = useSpring(y, springConfig);

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!magnetic || !buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      // Obliczamy środek przycisku
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Odległość kursora od środka przycisku
      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;

      x.set(distanceX * magneticStrength);
      y.set(distanceY * magneticStrength);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      x.set(0);
      y.set(0);
    };

    return (
      <motion.div
        style={{ x: springX, y: springY }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        className={cn("inline-block", wrapperClassName)}
      >
        <Button
          ref={(node) => {
            // Merge refs
            (buttonRef as any).current = node;
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              (ref as any).current = node;
            }
          }}
          className={cn("relative overflow-hidden group transition-all duration-300", className)}
          {...props}
        >
          <span className="relative z-10 flex items-center justify-center w-full">
            {children}
          </span>
          
          {/* Shimmer effect */}
          {shimmer && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_100%] group-hover:animate-shimmer pointer-events-none z-0 mix-blend-overlay" />
          )}
        </Button>
      </motion.div>
    );
  }
);

PremiumButton.displayName = "PremiumButton";
