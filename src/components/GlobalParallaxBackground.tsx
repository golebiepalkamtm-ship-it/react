/**
 * GLOBAL PARALLAX BACKGROUND
 * Animated background with parallax effect applied globally
 */

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

const GlobalParallaxBackground = () => {
  const [enabled, setEnabled] = useState(true);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setEnabled(!media.matches && window.innerWidth >= 768);
    update();
    media.addEventListener('change', update);
    window.addEventListener('resize', update);
    return () => {
      media.removeEventListener('change', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const { scrollYProgress } = useScroll();

  // Parallax transforms for different layers
  const bgY1 = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const bgY2 = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const bgY3 = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const starsY = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const opacity1 = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.6, 0.2]);
  const opacity2 = useTransform(scrollYProgress, [0, 0.5, 1], [0.2, 0.4, 0.15]);
  const scale1 = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.1, 1.2]);
  const rotate1 = useTransform(scrollYProgress, [0, 1], [0, 45]);
  const rotate2 = useTransform(scrollYProgress, [0, 1], [0, -30]);

  if (!enabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {/* Golden orb - left side */}
      <motion.div
        className="absolute -left-32 top-1/4 w-96 h-96 rounded-full"
        style={{
          y: bgY1,
          opacity: opacity1,
          scale: scale1,
          rotate: rotate1,
          background: 'radial-gradient(circle, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0.08) 40%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Navy orb - right side */}
      <motion.div
        className="absolute -right-48 top-1/3 w-[500px] h-[500px] rounded-full"
        style={{
          y: bgY2,
          opacity: opacity2,
          rotate: rotate2,
          background: 'radial-gradient(circle, rgba(15,23,80,0.4) 0%, rgba(20,30,100,0.2) 40%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Glow - center top */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 -top-20 w-[600px] h-[400px]"
        style={{
          y: bgY3,
          opacity: opacity1,
          background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.15) 0%, rgba(15,23,80,0.1) 40%, transparent 60%)',
          filter: 'blur(30px)',
        }}
      />

      {/* Geometric shapes parallax */}
      <motion.div
        className="absolute left-[10%] top-[60%] w-32 h-32 border border-gold/15 rounded-lg"
        style={{
          y: bgY1,
          rotate: rotate1,
          opacity: 0.3,
        }}
      />
      <motion.div
        className="absolute right-[15%] top-[40%] w-24 h-24 border border-[#1a1a4e]/30 rounded-full"
        style={{
          y: bgY2,
          rotate: rotate2,
          opacity: 0.35,
        }}
      />
      <motion.div
        className="absolute left-[20%] top-[80%] w-16 h-16 border border-gold/10"
        style={{
          y: bgY3,
          rotate: rotate1,
          opacity: 0.2,
        }}
      />
      
      {/* Additional navy accent */}
      <motion.div
        className="absolute left-1/4 top-[50%] w-[400px] h-[400px] rounded-full"
        style={{
          y: bgY2,
          opacity: 0.15,
          background: 'radial-gradient(circle, rgba(20,30,90,0.5) 0%, transparent 60%)',
          filter: 'blur(80px)',
        }}
      />
      
      {/* Gold accent bottom right */}
      <motion.div
        className="absolute right-[5%] bottom-[20%] w-[300px] h-[300px] rounded-full"
        style={{
          y: bgY1,
          opacity: 0.2,
          scale: scale1,
          background: 'radial-gradient(circle, rgba(212,175,55,0.25) 0%, transparent 60%)',
          filter: 'blur(50px)',
        }}
      />

      {/* Irregular gradient overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none" style={{
        background: `linear-gradient(120deg, rgba(212,175,55,0.10) 0%, rgba(20,30,90,0.08) 18%, rgba(15,23,80,0.12) 32%, rgba(212,175,55,0.18) 45%, rgba(20,30,90,0.09) 60%, rgba(212,175,55,0.13) 75%, transparent 100%)`,
        maskImage: `radial-gradient(ellipse 120% 100% at 50% 100%, #000 80%, transparent 100%)`,
        WebkitMaskImage: `radial-gradient(ellipse 120% 100% at 50% 100%, #000 80%, transparent 100%)`,
      }} />
    </div>
  );
};

export default GlobalParallaxBackground;
