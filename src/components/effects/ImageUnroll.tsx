import React, { useRef, useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ImageUnrollProps {
  src: string;
  alt?: string;
  className?: string;
  direction?: 'left' | 'right' | 'top' | 'bottom';
}

const ImageUnroll: React.FC<ImageUnrollProps> = ({
  src,
  alt = '',
  className = '',
  direction = 'left',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const clipPathValues = useMemo(() => {
    switch (direction) {
      case 'left':
        return ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'];
      case 'right':
        return ['inset(0 0 0 100%)', 'inset(0 0 0 0%)'];
      case 'top':
        return ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'];
      case 'bottom':
        return ['inset(100% 0 0 0)', 'inset(0% 0 0 0)'];
      default:
        return ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'];
    }
  }, [direction]);

  const clipPath = useTransform(scrollYProgress, [0, 0.5], clipPathValues);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1.2, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <motion.div
        style={{
          scale,
          opacity,
        }}
        className="w-full h-full"
      >
        <motion.img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          style={{ clipPath }}
        />
      </motion.div>
    </div>
  );
};

export default ImageUnroll;
