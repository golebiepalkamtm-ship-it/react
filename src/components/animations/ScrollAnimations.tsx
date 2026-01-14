import { motion } from 'framer-motion';
import React from 'react';

// PROSTE, DZIAŁAJĄCE ANIMACJE SCROLL

// Animacja sekcji z efektem "reveal" od dołu
export const SectionReveal = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: false, amount: 0.3 }}
    transition={{
      duration: 0.6,
      delay,
      ease: "easeOut"
    }}
  >
    {children}
  </motion.div>
);

// Animacja staggered dla listy elementów
export const StaggerContainer = ({ children, staggerDelay = 0.1 }: { children: React.ReactNode; staggerDelay?: number }) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: false, amount: 0.2 }}
    variants={{
      visible: {
        transition: {
          staggerChildren: staggerDelay,
        },
      },
    }}
  >
    {children}
  </motion.div>
);

// Item dla StaggerContainer
export const StaggerItem = ({ children, index = 0 }: { children: React.ReactNode; index?: number }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 30 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.5,
          ease: "easeOut",
        },
      },
    }}
  >
    {children}
  </motion.div>
);

// Animacja z efektem "slide in" z boku
export const SlideIn = ({ 
  children, 
  direction = 'left', 
  delay = 0 
}: { 
  children: React.ReactNode; 
  direction?: 'left' | 'right'; 
  delay?: number;
}) => (
  <motion.div
    initial={{ 
      opacity: 0, 
      x: direction === 'left' ? -50 : 50
    }}
    whileInView={{ 
      opacity: 1, 
      x: 0
    }}
    viewport={{ once: false, amount: 0.3 }}
    transition={{
      duration: 0.6,
      delay,
      ease: "easeOut"
    }}
  >
    {children}
  </motion.div>
);

// Animacja z efektem "scale up"
export const ScaleUp = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: false, amount: 0.3 }}
    transition={{
      duration: 0.5,
      delay,
      ease: "easeOut"
    }}
  >
    {children}
  </motion.div>
);

// Animacja z efektem "fade in" - prosty fade
export const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: false, amount: 0.3 }}
    transition={{
      duration: 0.6,
      delay,
      ease: "easeOut"
    }}
  >
    {children}
  </motion.div>
);

// Animacja z efektem "rotate in"
export const RotateIn = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: false, amount: 0.3 }}
    transition={{
      duration: 0.6,
      delay,
      ease: "easeOut"
    }}
  >
    {children}
  </motion.div>
);

// USUNIĘTO NIEDZIAŁAJĄCE PARALLAX KOMPONENTY
// Pozostawiono tylko proste, działające animacje whileInView
