'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface Text3DProps {
  children: ReactNode;
  className?: string;
  variant?: 'gradient' | 'glow' | 'neon' | 'shimmer';
  intensity?: 'low' | 'medium' | 'high';
  animate?: boolean;
  hover?: boolean;
}

export function Text3D({
  children,
  className = '',
  variant = 'gradient',
  intensity = 'medium',
  animate = true,
  hover = true,
}: Text3DProps) {
  const variantClasses = {
    gradient: 'text-gradient',
    glow: 'text-glow',
    neon: 'neon-glow',
    shimmer: 'animate-shimmer3D',
  };

  const intensityMap = {
    low: { scale: 1.02 },
    medium: { scale: 1.05 },
    high: { scale: 1.08 },
  };

  const currentIntensity = intensityMap[intensity];

  return (
    <motion.span
      initial={animate ? { opacity: 0, y: 20 } : {}}
      animate={
        animate
          ? {
              opacity: 1,
              y: 0,
            }
          : {}
      }
      whileHover={
        hover
          ? {
              scale: currentIntensity.scale,
              transition: { duration: 0.3, type: 'spring', stiffness: 300 },
            }
          : {}
      }
      transition={{
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1] as const,
      }}
      className={`
        ${variantClasses[variant]}
        ${hover ? 'hover-3d-tilt' : ''}
        transform-3d perspective-1000
        ${className}
      `}
    >
      {children}
    </motion.span>
  );
}
