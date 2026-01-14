import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface GlowingBorderProps {
  children: React.ReactNode;
  className?: string;
  borderRadius?: number;
  glowColor?: string;
  borderWidth?: number;
}

const GlowingBorder: React.FC<GlowingBorderProps> = ({
  children,
  className = '',
  borderRadius = 16,
  glowColor = 'rgba(212, 175, 55, 0.8)',
  borderWidth = 2,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 500, damping: 30 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const background = useTransform(
    [smoothX, smoothY],
    ([x, y]) => `radial-gradient(circle at ${x}px ${y}px, ${glowColor} 0%, transparent 50%)`
  );

  return (
    <motion.div
      ref={containerRef}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      style={{ borderRadius }}
    >
      {/* Animated border gradient */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius,
          padding: borderWidth,
          background,
          WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />

      {/* Static gradient border fallback */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          borderRadius,
          padding: borderWidth,
          background: `linear-gradient(135deg, ${glowColor}, transparent, ${glowColor})`,
          WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />

      {/* Content */}
      <div className="relative" style={{ borderRadius }}>
        {children}
      </div>
    </motion.div>
  );
};

export default GlowingBorder;
