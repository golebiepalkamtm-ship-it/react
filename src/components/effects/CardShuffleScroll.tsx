import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';

interface ShuffleCardProps {
  child: React.ReactNode;
  index: number;
  totalCards: number;
  spreadAngle: number;
  spreadDistance: number;
  smoothProgress: MotionValue<number>;
  cardClassName: string;
}

const ShuffleCard: React.FC<ShuffleCardProps> = ({
  child,
  index,
  totalCards,
  spreadAngle,
  spreadDistance,
  smoothProgress,
  cardClassName,
}) => {
  const centerIndex = (totalCards - 1) / 2;
  const offset = index - centerIndex;
  const baseRotation = offset * spreadAngle;
  const baseX = offset * spreadDistance;

  const rotation = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    [baseRotation * 2, baseRotation, 0]
  );

  const x = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    [baseX * 1.5, baseX, 0]
  );

  const y = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    [Math.abs(offset) * 50, Math.abs(offset) * 20, 0]
  );

  const scale = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    [0.8, 0.9, 1]
  );

  const opacity = useTransform(
    smoothProgress,
    [0, 0.3, 1],
    [0.5, 0.8, 1]
  );

  return (
    <motion.div
      className={`absolute ${cardClassName}`}
      style={{
        rotate: rotation,
        x,
        y,
        scale,
        opacity,
        zIndex: totalCards - Math.abs(offset),
        transformOrigin: 'center bottom',
      }}
    >
      {child}
    </motion.div>
  );
};

interface CardShuffleScrollProps {
  children: React.ReactNode[];
  className?: string;
  cardClassName?: string;
  spreadAngle?: number;
  spreadDistance?: number;
}

const CardShuffleScroll: React.FC<CardShuffleScrollProps> = ({
  children,
  className = '',
  cardClassName = '',
  spreadAngle = 15,
  spreadDistance = 100,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
  });

  const totalCards = React.Children.count(children);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="sticky top-1/2 -translate-y-1/2 flex items-center justify-center">
        {React.Children.map(children, (child, index) => (
          <ShuffleCard
            key={index}
            child={child}
            index={index}
            totalCards={totalCards}
            spreadAngle={spreadAngle}
            spreadDistance={spreadDistance}
            smoothProgress={smoothProgress}
            cardClassName={cardClassName}
          />
        ))}
      </div>
    </div>
  );
};

export default CardShuffleScroll;
