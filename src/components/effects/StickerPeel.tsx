import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

interface StickerPeelProps {
  children: React.ReactNode;
  className?: string;
  peelIntensity?: number;
}

const StickerPeel: React.FC<StickerPeelProps> = ({
  children,
  className = '',
  peelIntensity = 30,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { stiffness: 300, damping: 30 };

  const rotateX = useSpring(
    useTransform(mouseY, [0, 1], [peelIntensity, -peelIntensity]),
    springConfig
  );
  const rotateY = useSpring(
    useTransform(mouseX, [0, 1], [-peelIntensity, peelIntensity]),
    springConfig
  );

  const peelProgress = useSpring(isHovered ? 1 : 0, springConfig);

  const shadowX = useTransform(mouseX, [0, 1], [10, -10]);
  const shadowY = useTransform(mouseY, [0, 1], [10, -10]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
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
      className={`relative cursor-pointer ${className}`}
      style={{ perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Shadow layer */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-black/20 blur-xl"
        style={{
          x: shadowX,
          y: shadowY,
          scale: useTransform(peelProgress, [0, 1], [0.95, 1.05]),
          opacity: useTransform(peelProgress, [0, 1], [0.3, 0.6]),
        }}
      />

      {/* Main sticker */}
      <motion.div
        className="relative"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          transformOrigin: 'center center',
        }}
      >
        {/* Peel corner effect */}
        <motion.div
          className="absolute -top-1 -right-1 w-16 h-16 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.1) 50%)',
            opacity: peelProgress,
            transform: useTransform(
              peelProgress,
              [0, 1],
              ['rotate(0deg) scale(0)', 'rotate(-10deg) scale(1)']
            ),
            transformOrigin: 'bottom left',
          }}
        />

        {/* Content */}
        <motion.div
          style={{
            boxShadow: useTransform(
              peelProgress,
              [0, 1],
              [
                '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 30px rgba(212, 175, 55, 0.1)',
              ]
            ),
          }}
          className="relative rounded-2xl overflow-hidden"
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default StickerPeel;
