import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface HoloCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  glareOpacity?: number;
  borderRadius?: number;
}

const HoloCard: React.FC<HoloCardProps> = ({
  children,
  className = '',
  intensity = 15,
  glareOpacity = 0.3,
  borderRadius = 16,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(mouseY, [0, 1], [intensity, -intensity]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-intensity, intensity]), {
    stiffness: 300,
    damping: 30,
  });

  const glareX = useTransform(mouseX, [0, 1], ['-50%', '150%']);
  const glareY = useTransform(mouseY, [0, 1], ['-50%', '150%']);

  const rainbowX = useTransform(mouseX, [0, 1], ['0%', '100%']);
  const rainbowY = useTransform(mouseY, [0, 1], ['0%', '100%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative ${className}`}
      style={{
        perspective: 1000,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          borderRadius,
        }}
        className="relative w-full h-full"
      >
        {/* Main content */}
        <div 
          className="relative z-10 w-full h-full overflow-hidden"
          style={{ borderRadius }}
        >
          {children}
        </div>

        {/* Holographic rainbow gradient overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            borderRadius,
            background: `linear-gradient(
              135deg,
              rgba(255, 0, 128, 0.1) 0%,
              rgba(255, 128, 0, 0.1) 14%,
              rgba(255, 255, 0, 0.1) 28%,
              rgba(0, 255, 128, 0.1) 42%,
              rgba(0, 128, 255, 0.1) 57%,
              rgba(128, 0, 255, 0.1) 71%,
              rgba(255, 0, 128, 0.1) 85%,
              rgba(255, 128, 0, 0.1) 100%
            )`,
            backgroundSize: '200% 200%',
            backgroundPosition: useTransform(
              [rainbowX, rainbowY],
              ([x, y]) => `${x} ${y}`
            ),
            opacity: isHovered ? 0.6 : 0,
            mixBlendMode: 'color-dodge',
            transition: 'opacity 0.3s ease',
          }}
        />

        {/* Radial glare effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-30"
          style={{
            borderRadius,
            background: useTransform(
              [glareX, glareY],
              ([x, y]) => `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,${glareOpacity}) 0%, transparent 50%)`
            ),
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        />

        {/* Shimmer line effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-40 overflow-hidden"
          style={{ borderRadius }}
        >
          <motion.div
            className="absolute w-[200%] h-[20px]"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              transform: 'rotate(-45deg)',
              top: '50%',
              left: '-50%',
            }}
            animate={isHovered ? {
              left: ['−50%', '150%'],
            } : {}}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 2,
              ease: 'easeInOut',
            }}
          />
        </motion.div>

        {/* Border glow */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius,
            boxShadow: isHovered 
              ? '0 0 20px rgba(212, 175, 55, 0.3), inset 0 0 20px rgba(212, 175, 55, 0.1)'
              : 'none',
            transition: 'box-shadow 0.3s ease',
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export default HoloCard;
