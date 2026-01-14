import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface ParallaxFloatProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  floatRange?: number;
  rotateRange?: number;
}

const ParallaxFloat: React.FC<ParallaxFloatProps> = ({
  children,
  className = '',
  intensity = 20,
  floatRange = 10,
  rotateRange = 5,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { stiffness: 150, damping: 20 };

  const x = useSpring(
    useTransform(mouseX, [0, 1], [-intensity, intensity]),
    springConfig
  );
  const y = useSpring(
    useTransform(mouseY, [0, 1], [-intensity, intensity]),
    springConfig
  );

  const floatY = useSpring(
    useTransform(mouseY, [0, 1], [-floatRange, floatRange]),
    springConfig
  );

  const rotateX = useSpring(
    useTransform(mouseY, [0, 1], [rotateRange, -rotateRange]),
    springConfig
  );
  const rotateY = useSpring(
    useTransform(mouseX, [0, 1], [-rotateRange, rotateRange]),
    springConfig
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const normalizedX = (e.clientX - rect.left) / rect.width;
    const normalizedY = (e.clientY - rect.top) / rect.height;
    mouseX.set(normalizedX);
    mouseY.set(normalizedY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <motion.div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          x,
          y: floatY,
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default ParallaxFloat;
