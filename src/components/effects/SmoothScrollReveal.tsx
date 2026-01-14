import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef, ReactNode } from 'react';

interface SmoothScrollRevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  scale?: number;
  opacity?: [number, number];
  blur?: boolean;
  className?: string;
}

export const SmoothScrollReveal = ({ 
  children, 
  delay = 0,
  y = 100,
  scale = 0.95,
  opacity = [0, 1],
  blur = false,
  className = '' 
}: SmoothScrollRevealProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once: true, 
    margin: "-10% 0px -10% 0px" 
  });

  return (
    <motion.div
      ref={ref}
      initial={{ 
        opacity: opacity[0], 
        y, 
        scale,
        filter: blur ? 'blur(10px)' : 'blur(0px)'
      }}
      animate={isInView ? { 
        opacity: opacity[1], 
        y: 0, 
        scale: 1,
        filter: 'blur(0px)'
      } : {}}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface ParallaxScrollProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export const ParallaxScroll = ({ 
  children, 
  speed = 0.5,
  className = '' 
}: ParallaxScrollProps) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100 * speed, -100 * speed]);

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
