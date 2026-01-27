/**
 * TimelineCard Component - Premium Animated Card
 * 
 * Uses Framer Motion for declarative animations with professional easing.
 * GSAP handles the heavy lifting via useParallax hook.
 * 
 * Animation Philosophy:
 * - Cards enter with 3D rotation and blur for depth
 * - Dynamic glow controlled via CSS variables
 * - Staggered achievement reveals for engagement
 */

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef, memo } from "react";

interface TimelineEvent {
  year: number;
  title: string;
  achievements: readonly string[];
  highlight?: string;
}

interface TimelineCardProps {
  event: TimelineEvent;
  index: number;
  isActive: boolean;
}

const TimelineCard = memo(({
  event,
  index,
  isActive
}: TimelineCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const {
    scrollYProgress
  } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  });

  // Spring physics for organic movement
  // Low stiffness + high damping = smooth, weighted feel
  const springConfig = {
    stiffness: 80,
    damping: 25,
    restDelta: 0.001
  };
  const y = useSpring(useTransform(scrollYProgress, [0, 0.5, 1], [80, 0, -80]), springConfig);
  const scale = useSpring(useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.85, 1, 1, 0.9]), springConfig);
  const rotateX = useSpring(useTransform(scrollYProgress, [0, 0.5, 1], [12, 0, -12]), springConfig);
  const isEven = index % 2 === 0;

  return (
    <motion.div 
      ref={cardRef} 
      style={{
        y,
        scale,
        rotateX,
        willChange: "transform"
      }} 
      className="tunnel-card relative mb-24 md:mb-32"
    >
      <div className={`flex items-center gap-8 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
        {/* Year Ghost - Enhanced with mouse-parallax */}
        <motion.div 
          className="hidden md:block absolute inset-0 -z-10 overflow-visible pointer-events-none mouse-parallax" 
          data-depth="0.3" 
          initial={{
            opacity: 0
          }} 
          animate={{
            opacity: isActive ? 1 : 0.4
          }} 
          transition={{
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1]
          }}
        >
          <span className={`year-ghost year-ghost-strong absolute text-[8rem] lg:text-[12rem] font-display font-black leading-none text-amber-400
              ${isEven ? 'left-[10%] text-left' : 'right-[10%] text-right'} top-1/2 -translate-y-1/2`}>
            {event.year}
          </span>
        </motion.div>

        {/* Content Card with Dynamic Glow */}
        <motion.div 
          className={`glass-card p-6 md:p-8 w-full md:w-[60%] lg:w-[50%] relative z-10 overflow-hidden
            ${isEven ? 'md:ml-auto' : 'md:mr-auto'}`} 
          whileHover={{
            scale: 1.02,
            // Glow intensity increases on hover
            "--glow-intensity": 1
          } as any} 
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25
          }}
        >
          {/* Front lighting effect - Animated with scroll */}
          <motion.div 
            className="card-front-light absolute -top-20 left-1/2 -translate-x-1/2 w-[200%] h-40 pointer-events-none" 
            style={{ willChange: "transform, opacity" }}
            animate={{
              opacity: isActive ? [0.5, 0.8, 0.5] : 0.3,
              scale: isActive ? [1, 1.1, 1] : 1
            }} 
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }} 
          />
          
          {/* Side glow effects - Animated pulses */}
          <motion.div 
            className="card-side-glow absolute -left-10 top-1/2 -translate-y-1/2 w-20 h-[80%] pointer-events-none" 
            style={{
              background: 'linear-gradient(90deg, hsl(var(--glow-primary) / 0.4) 0%, transparent 100%)',
              willChange: "opacity"
            }} 
            animate={{
              opacity: isActive ? [0.3, 0.6, 0.3] : 0.15
            }} 
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }} 
          />
          <motion.div 
            className="card-side-glow absolute -right-10 top-1/2 -translate-y-1/2 w-20 h-[80%] pointer-events-none" 
            style={{
              background: 'linear-gradient(-90deg, hsl(var(--glow-primary) / 0.4) 0%, transparent 100%)',
              willChange: "opacity"
            }} 
            animate={{
              opacity: isActive ? [0.4, 0.7, 0.4] : 0.2
            }} 
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }} 
          />

          {/* Mobile Year Badge */}
          <div className="md:hidden mb-4">
            <span className="font-display text-5xl font-bold text-amber-400 drop-shadow-md">
              {event.year}
            </span>
          </div>

          {/* Title with premium animation */}
          <motion.h3 
            className="text-xl md:text-2xl font-semibold text-foreground mb-3 leading-tight" 
            initial={{
              opacity: 0,
              y: 20
            }} 
            whileInView={{
              opacity: 1,
              y: 0
            }} 
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1]
            }} 
            viewport={{
              once: true,
              margin: "-50px"
            }}
          >
            {event.title}
          </motion.h3>

          {/* Achievements List with Staggered Reveal */}
          <motion.ul 
            className="space-y-1.5 text-sm text-muted-foreground"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-30px" }}
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.05
                }
              }
            }}
          >
            {event.achievements.map((achievement, i) => (
              <motion.li 
                key={i} 
                className="achievement-item flex items-start gap-2" 
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 }
                }}
                transition={{
                  duration: 0.4,
                  ease: "easeOut"
                }}
              >
                <span className="text-primary mt-1 text-xs">●</span>
                <span>{achievement}</span>
              </motion.li>
            ))}
          </motion.ul>

          {/* Decorative Bottom Line - Animated draw */}
          <motion.div 
            className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-primary via-glow-secondary to-transparent" 
            initial={{
              width: "0%",
              opacity: 0
            }} 
            whileInView={{
              width: "100%",
              opacity: 1
            }} 
            transition={{
              duration: 0.8,
              delay: 0.3,
              ease: [0.16, 1, 0.3, 1]
            }} 
            viewport={{
              once: true
            }} 
          />
        </motion.div>

        {/* Connection Line (Desktop) */}
        <div className={`hidden md:block absolute top-1/2 -translate-y-1/2 w-16 h-[2px]
          ${isEven ? 'right-[60%] lg:right-[50%]' : 'left-[60%] lg:left-[50%]'}`}>
          <motion.div 
            className="h-full progress-glow rounded-full" 
            initial={{
              scaleX: 0,
              opacity: 0
            }} 
            whileInView={{
              scaleX: 1,
              opacity: 1
            }} 
            transition={{
              duration: 0.6,
              delay: 0.4,
              ease: [0.16, 1, 0.3, 1]
            }} 
            viewport={{
              once: true
            }} 
            style={{
              transformOrigin: isEven ? 'right' : 'left'
            }} 
          />
        </div>
      </div>
    </motion.div>
  );
});

export default TimelineCard;
