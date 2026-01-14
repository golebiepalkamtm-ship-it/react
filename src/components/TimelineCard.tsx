import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface TimelineEvent {
  year: number;
  title: string;
  achievements: string[];
  highlight?: string;
}

interface TimelineCardProps {
  event: TimelineEvent;
  index: number;
  isActive: boolean;
}

const TimelineCard = ({ event, index, isActive }: TimelineCardProps) => {
  const isEven = index % 2 === 0;
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), {
    stiffness: 150,
    damping: 20,
  });
  
  const lightX = useTransform(mouseX, [-0.5, 0.5], [0, 100]);
  const lightY = useTransform(mouseY, [-0.5, 0.5], [0, 100]);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      className="tunnel-card relative mb-24 md:mb-32"
      initial={{ opacity: 0, y: 26, filter: "blur(12px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 0.85, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={`flex items-center gap-8 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
        {/* Year label (side, not behind the card) */}
        <motion.div
          className="hidden md:flex w-28 lg:w-40 shrink-0 items-center justify-center"
          animate={{ opacity: isActive ? 1 : 0.45 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          aria-hidden="true"
        >
          <span className="year-ghost year-ghost-strong text-[6rem] lg:text-[8rem] font-display font-black leading-none">
            {event.year}
          </span>
        </motion.div>

        {/* Content Card z efektami ChampionCard */}
        <motion.div
          ref={cardRef}
          className={`relative group w-full md:w-[60%] lg:w-[50%] ${isEven ? 'md:ml-auto' : 'md:mr-auto'}`}
          style={{ perspective: '1000px' }}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
        >
          <motion.div
            className={`rounded-2xl border border-white/25 bg-black/80 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] shadow-lg p-6 md:p-8 relative z-10 overflow-hidden ${isActive ? 'tunnel-card-active' : ''}`}
            style={{
              rotateX,
              rotateY,
              transformStyle: 'preserve-3d',
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ scale: { duration: 0.2 } }}
          >
            {/* Dynamic light reflection */}
            <motion.div
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                background: `radial-gradient(circle at ${lightX.get()}% ${lightY.get()}%, rgba(255,255,255,0.15) 0%, transparent 50%)`,
                opacity: isHovered ? 1 : 0,
              }}
            />
            
            {/* Glow border on hover - JASNY */}
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none z-20"
              initial={{ opacity: 0 }}
              animate={{
                opacity: isHovered ? 1 : 0,
                boxShadow: isHovered
                  ? '0 0 30px rgba(150, 150, 200, 0.3), inset 0 0 20px rgba(150, 150, 200, 0.1)'
                  : 'none',
              }}
              transition={{ duration: 0.3 }}
            />
            
            {/* Scanline effect */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 0.15 : 0 }}
            >
              <div 
                className="absolute inset-0"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 2px,
                    rgba(255, 255, 255, 0.03) 2px,
                    rgba(255, 255, 255, 0.03) 4px
                  )`
                }}
              />
            </motion.div>
            <div className="md:hidden mb-4">
              <span className="font-display text-5xl font-bold text-foreground/20">
                {event.year}
              </span>
            </div>

            <div className="flex items-start justify-between gap-4 mb-4">
              <motion.span
                className="hidden md:inline-block font-display text-sm tracking-widest text-muted-foreground"
                animate={isActive ? { opacity: [0.7, 1, 0.7] } : { opacity: 0.7 }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {event.year}
              </motion.span>
              {event.highlight && (
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-gold/10 text-gold border border-gold/25">
                  {event.highlight}
                </span>
              )}
            </div>

            <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-3 leading-tight">
              {event.title}
            </h3>

            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {event.achievements.map((achievement, i) => (
                <li key={i}>
                  <motion.div
                    className="flex items-start gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: i * 0.05,
                      ease: "easeOut"
                    }}
                    viewport={{ once: true, margin: "-50px" }}
                  >
                    <motion.span
                      className="text-gold mt-1 text-xs"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{
                        duration: 0.3,
                        delay: i * 0.05 + 0.2,
                        type: "spring",
                        stiffness: 400
                      }}
                      viewport={{ once: true }}
                    >
                      ●
                    </motion.span>
                    <span>{achievement}</span>
                  </motion.div>
                </li>
              ))}
            </ul>

            <motion.div
              className="absolute bottom-0 left-0 h-0.5 bg-linear-to-r from-gold via-[hsl(var(--glow-secondary))] to-transparent"
              initial={{ width: "0%" }}
              whileInView={{ width: "100%" }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          </motion.div>
        </motion.div>

        {/* Connection Line (Desktop) */}
        <div className={`hidden md:block absolute top-1/2 -translate-y-1/2 w-16 h-0.5
          ${isEven ? 'right-[60%] lg:right-[50%]' : 'left-[60%] lg:left-[50%]'}`}
        >
          <motion.div
            className="h-full progress-glow rounded-full"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ transformOrigin: isEven ? 'right' : 'left' }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default TimelineCard;