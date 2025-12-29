import { motion } from "framer-motion";

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

        {/* Content Card */}
        <motion.div
          className={`rounded-2xl border border-white/25 bg-black/80 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] shadow-lg p-6 md:p-8 w-full md:w-[60%] lg:w-[50%] relative z-10 transition-[border-color,box-shadow] duration-200 hover:border-gold/40 hover:shadow-[0_0_0_1px_rgba(255,215,128,0.14),0_0_26px_rgba(255,215,128,0.12)] ${isEven ? 'md:ml-auto' : 'md:mr-auto'} ${isActive ? 'tunnel-card-active' : ''}`}
        >
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