import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface TextRevealProps {
  children: string;
  className?: string;
  highlightColor?: string;
}

const TextReveal: React.FC<TextRevealProps> = ({
  children,
  className = '',
  highlightColor = 'rgb(212, 175, 55)',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.9', 'start 0.25'],
  });

  const words = children.split(' ');

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <p className="flex flex-wrap">
        {words.map((word, i) => {
          const start = i / words.length;
          const end = start + 1 / words.length;
          return (
            <Word 
              key={`word-${i}`} 
              progress={scrollYProgress} 
              range={[start, end]}
              highlightColor={highlightColor}
            >
              {word}
            </Word>
          );
        })}
      </p>
    </div>
  );
};

interface WordProps {
  children: string;
  progress: any;
  range: [number, number];
  highlightColor: string;
}

const Word: React.FC<WordProps> = ({ children, progress, range, highlightColor }) => {
  const opacity = useTransform(progress, range, [0.2, 1]);
  const color = useTransform(
    progress,
    range,
    ['rgb(156, 163, 175)', highlightColor]
  );

  return (
    <span className="relative mr-2 mt-1">
      <motion.span
        style={{ opacity, color }}
        className="transition-colors duration-300"
      >
        {children}
      </motion.span>
    </span>
  );
};

export default TextReveal;
