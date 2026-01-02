import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

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
  const cardRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 0.5, 1], [100, 0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.8, 1, 1, 0.8]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [15, 0, -15]);
  const z = useTransform(scrollYProgress, [0, 0.5, 1], [-100, 0, -100]);

  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={cardRef}
      style={{ y, opacity, scale, rotateX, z }}
      className="tunnel-card relative mb-24 md:mb-32"
    >
      <div className={`flex items-center gap-8 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
        {/* Year Ghost */}
        <motion.div 
          className="hidden md:block absolute inset-0 -z-10 overflow-hidden pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isActive ? 1 : 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <span 
            className={`year-ghost absolute text-[12rem] lg:text-[16rem] font-display font-black leading-none
              ${isEven ? '-left-8' : '-right-8'} top-1/2 -translate-y-1/2`}
          >
            {event.year}
          </span>
        </motion.div>

        {/* Content Card */}
        <motion.div
          className={`glass-card p-6 md:p-8 w-full md:w-[60%] lg:w-[50%] relative z-10
            ${isEven ? 'md:ml-auto' : 'md:mr-auto'}`}
          whileHover={{ 
            scale: 1.02,
            boxShadow: "0 0 40px hsl(var(--glow-primary) / 0.3)",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {/* Mobile Year Badge */}
          <div className="md:hidden mb-4">
            <span className="font-display text-5xl font-bold text-primary/30">
              {event.year}
            </span>
          </div>

          {/* Card Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <motion.span 
              className="hidden md:inline-block font-display text-sm tracking-widest text-primary glow-text"
              animate={isActive ? { opacity: [0.7, 1, 0.7] } : { opacity: 0.7 }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {event.year}
            </motion.span>
            {event.highlight && (
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary/20 text-primary border border-primary/30">
                {event.highlight}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-3 leading-tight">
            {event.title}
          </h3>

          {/* Achievements List */}
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {event.achievements.map((achievement, i) => (
              <motion.li 
                key={i} 
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
                  className="text-primary mt-1 text-xs"
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
              </motion.li>
            ))}
          </ul>

          {/* Decorative Line */}
          <motion.div 
            className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-primary via-glow-secondary to-transparent"
            initial={{ width: "0%" }}
            whileInView={{ width: "100%" }}
            transition={{ duration: 1, delay: 0.2 }}
          />
        </motion.div>

        {/* Connection Line (Desktop) */}
        <div className={`hidden md:block absolute top-1/2 -translate-y-1/2 w-16 h-[2px]
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
