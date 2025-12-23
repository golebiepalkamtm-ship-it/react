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
  const glowTargetRef = useRef<HTMLDivElement>(null);
  
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

  const updateGlowVars = (el: HTMLElement, clientX: number, clientY: number) => {
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const px = Math.max(0, Math.min((100 / rect.width) * x, 100));
    const py = Math.max(0, Math.min((100 / rect.height) * y, 100));

    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = x - cx;
    const dy = y - cy;

    // angle in degrees (matches CodePen: +90 and normalize)
    let angle = 0;
    if (dx !== 0 || dy !== 0) {
      angle = (Math.atan2(dy, dx) * (180 / Math.PI)) + 90;
      if (angle < 0) angle += 360;
    }

    // closeness to edge in [0..1]
    let kx = Infinity;
    let ky = Infinity;
    if (dx !== 0) kx = cx / Math.abs(dx);
    if (dy !== 0) ky = cy / Math.abs(dy);
    const edge = Math.max(0, Math.min((1 / Math.min(kx, ky)), 1));
    const pointerD = edge * 100;

    el.style.setProperty("--pointer-x", `${px.toFixed(3)}%`);
    el.style.setProperty("--pointer-y", `${py.toFixed(3)}%`);
    el.style.setProperty("--pointer-°", `${angle.toFixed(3)}deg`);
    el.style.setProperty("--pointer-d", `${pointerD.toFixed(3)}`);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = glowTargetRef.current;
    if (!el) return;
    updateGlowVars(el, e.clientX, e.clientY);
  };

  const onPointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = glowTargetRef.current;
    if (!el) return;
    updateGlowVars(el, e.clientX, e.clientY);
  };

  const onPointerLeave = () => {
    const el = glowTargetRef.current;
    if (!el) return;
    // Fade out the effect quickly
    el.style.setProperty("--pointer-d", "0");
  };

  return (
    <motion.div
      ref={cardRef}
      style={{ y, opacity, scale, rotateX, z }}
      className="tunnel-card relative mb-24 md:mb-32"
    >
      <div className={`flex items-center gap-8 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
        {/* Year watermark removed to avoid overlapping decorations on other sections */}

        {/* Content Card */}
        <motion.div
          className={`glass-card p-6 md:p-8 w-full md:w-[60%] lg:w-[50%] relative z-10
            ${isEven ? 'md:ml-auto' : 'md:mr-auto'} ${isActive ? 'tunnel-card-active' : ''} edge-glow-card`}
          ref={glowTargetRef}
          onPointerMove={onPointerMove}
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
          whileHover={{
            y: -6,
            scale: 1,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <span className="edge-glow" aria-hidden="true" />
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
                </motion.div>
              </li>
            ))}
          </ul>

          {/* Decorative Line */}
          <motion.div 
            className="absolute bottom-0 left-0 h-0.5 bg-linear-to-r from-primary via-[hsl(var(--glow-secondary))] to-transparent"
            initial={{ width: "0%" }}
            whileInView={{ width: "100%" }}
            transition={{ duration: 1, delay: 0.2 }}
          />
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