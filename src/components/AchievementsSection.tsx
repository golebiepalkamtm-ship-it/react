import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import TimelineCard from "./TimelineCard";
import ProgressBar from "./ProgressBar";

const timelineEvents = [
  {
    year: 2001,
    title: "Sezon 2001",
    achievements: [
      "Oddział Lubań – A Mistrz (235,77 pkt)",
      "Oddział Lubań – B I Wicemistrz (503,62 pkt)",
      "Oddział Lubań – GMO Mistrz",
      "Okręg Jelenia Góra – A I Wicemistrz (235,77 pkt)",
      "Okręg Jelenia Góra – B IX Przodownik (503,62 pkt)",
      "Okręg Jelenia Góra – GMO I Wicemistrz",
    ],
    highlight: "6 osiągnięć",
  },
  {
    year: 2002,
    title: "Sezon 2002",
    achievements: [
      "Oddział Lubań – A Mistrz (501,52 pkt)",
      "Oddział Lubań – GMO II Wicemistrz (40 pkt)",
      "Okręg Jelenia Góra – A Mistrz (501,52 pkt)",
      "Okręg Jelenia Góra – GMO Mistrz (40 pkt)",
      "Region V – A 50 Przodownik (501,52 pkt)",
      "Region V – B II Przodownik (168,11 pkt)",
    ],
    highlight: "6 osiągnięć",
  },
  {
    year: 2003,
    title: "Sezon 2003",
    achievements: [
      "Oddział Lubań – A Mistrz (203,54 pkt)",
      "Oddział Lubań – B Mistrz (217,78 pkt)",
      "Oddział Lubań – C Mistrz (71,99 pkt)",
      "Oddział Lubań – GMO Mistrz (462,22 pkt)",
      "Okręg Jelenia Góra – A Mistrz (203,54 pkt)",
      "Okręg Jelenia Góra – B I Wicemistrz (217,78 pkt)",
      "Okręg Jelenia Góra – C Mistrz (71,99 pkt)",
      "Okręg Jelenia Góra – GMO VI Przodownik (462,22 pkt)",
      "Region V – A 10 Przodownik (203,54 pkt)",
      "Region V – B 49 Przodownik (217,78 pkt)",
      "Region V – C 2 Miejsce (971,99 pkt)",
      "Region V – D II Przodownik",
      "Region V – GMP 11 Przodownik (1066,26 pkt)",
      "MP – C 13 Przodownik (71,99 pkt)",
      "MP – GMP 28 Przodownik (1066,26 pkt)",
    ],
    highlight: "15 osiągnięć",
  },
  {
    year: 2004,
    title: "Sezon 2004",
    achievements: [
      "Oddział Lubań – A Mistrz (180,91 pkt)",
      "Oddział Lubań – B Mistrz (196,07 pkt)",
      "Oddział Lubań – GMO I Wicemistrz",
      "Okręg Jelenia Góra – A Mistrz (180,91 pkt)",
      "Okręg Jelenia Góra – B I Przodownik (196,07 pkt)",
      "Okręg Jelenia Góra – GMO I Przodownik",
      "Region V – A 18 Przodownik (180,91 pkt)",
      "Region V – D 35 Przodownik (839,32 pkt)",
      "MP – A 32 Przodownik (180,91 pkt)",
    ],
    highlight: "9 osiągnięć",
  },
  {
    year: 2005,
    title: "Sezon 2005",
    achievements: [
      "Oddział Lubań – A Mistrz (90,65 pkt)",
      "Oddział Lubań – B Mistrz (66,96 pkt)",
      "Oddział Lubań – GMO I Wicemistrz",
      "Okręg Jelenia Góra – A Mistrz (90,65 pkt)",
      "Okręg Jelenia Góra – B Mistrz (66,96 pkt)",
      "Okręg Jelenia Góra – GMO I Przodownik",
      "Region V – A II Wicemistrz (90,65 pkt)",
      "MP – A I Przodownik (90,65 pkt)",
      "MP – B V Przodownik (66,96 pkt)",
    ],
    highlight: "9 osiągnięć",
  },
  {
    year: 2006,
    title: "Sezon 2006",
    achievements: [
      "Oddział Lubań – A Mistrz (240,15 pkt)",
      "Oddział Lubań – B Mistrz (183,25 pkt)",
      "Oddział Lubań – GMO Mistrz (82,77 pkt)",
      "Okręg Jelenia Góra – A Mistrz (199,28 pkt)",
      "Okręg Jelenia Góra – B II Przodownik (367,51 pkt)",
      "Okręg Jelenia Góra – GMO I Wicemistrz (82,77 pkt)",
      "Region V – A 18 Przodownik (240,15 pkt)",
      "Region V – B 24 Przodownik (183,25 pkt)",
      "Region V – GMO 3 Przodownik (82,77 pkt)",
      "MP – GMO VI Przodownik (82,77 pkt)",
    ],
    highlight: "10 osiągnięć",
  },
  {
    year: 2007,
    title: "Sezon 2007",
    achievements: [
      "Oddział Lubań – A Mistrz (78,06 pkt)",
      "Oddział Lubań – GMO II Wicemistrz",
      "Okręg Jelenia Góra – A Mistrz (78,06 pkt)",
      "Region V – A II Przodownik (78,06 pkt)",
      "MP – A I Przodownik (78,06 pkt)",
    ],
    highlight: "5 osiągnięć",
  },
  {
    year: 2008,
    title: "Sezon 2008",
    achievements: [
      "Oddział Lubań – A Mistrz (49,88 pkt)",
      "Oddział Lubań – B Mistrz (158,27 pkt)",
      "Okręg Jelenia Góra – A Mistrz (49,88 pkt)",
      "Okręg Jelenia Góra – B II Wicemistrz (158,27 pkt)",
      "Region V – A Mistrz (49,88 pkt)",
      "Region V – B XX Przodownik (158,27 pkt)",
      "Region V – GMP I Wicemistrz (49,88 pkt)",
      "Region V – GMP 20 Przodownik (158,27 pkt)",
      "MP – A 3 Przodownik (49,88 pkt)",
    ],
    highlight: "9 osiągnięć",
  },
  {
    year: 2009,
    title: "Sezon 2009",
    achievements: [
      "Ogólnopolski – GMP 148 Przodownik (1401,99 pkt)",
    ],
    highlight: "1 osiągnięcie",
  },
  {
    year: 2011,
    title: "Sezon 2011",
    achievements: [
      "Oddział – Total dorosłych Mistrz (611,73 pkt)",
      "Oddział – A Mistrz (161,32 pkt)",
      "Oddział – B Mistrz (51,32 pkt)",
      "Oddział – C Mistrz (84,07 pkt)",
      "Oddział – M Mistrz (59,36 pkt)",
      "Oddział – D Mistrz (296,71 pkt)",
      "Oddział – H Mistrz (588,92 pkt)",
      "Oddział – Roczne Mistrz (534,49 pkt)",
      "Okręg – A Mistrz",
      "Okręg – B Mistrz",
      "Okręg – C Mistrz",
      "Okręg – D Mistrz",
      "Okręg – M Mistrz",
      "Region V – B Mistrz",
      "Region V – D Mistrz",
    ],
    highlight: "15 osiągnięć",
  },
  {
    year: 2012,
    title: "Sezon 2012",
    achievements: [
      "MP – Maraton 8 Przodownik (648,45 pkt)",
      "MP – Olimpijskie 68 Przodownik (847,37 pkt)",
      "Oddział – A I Mistrz (575,76 pkt)",
      "Oddział – B I Mistrz (160,25 pkt)",
      "Oddział – C II Wicemistrz (119,72 pkt)",
      "Oddział – M Maraton I Mistrz (103,06 pkt)",
      "Oddział – D I Mistrz (855,28 pkt)",
      "Oddział – GMO I Mistrz (1409,58 pkt)",
      "Oddział – H I Mistrz (887,54 pkt)",
      "Oddział – Roczne I Mistrz (413,58 pkt)",
      "Oddział – Olimpijskie I Mistrz (646,45 pkt)",
      "Oddział – Total dorośli I Mistrz (1080,51 pkt)",
      "Oddział – Total młodzi II Wicemistrz (150,62 pkt)",
    ],
    highlight: "13 osiągnięć",
  },
  {
    year: 2013,
    title: "Sezon 2013",
    achievements: [
      "MP – B 13 Przodownik (685,69 pkt)",
      "MP – A II Wicemistrz (66,43 pkt)",
      "MP – Roczne 9 Przodownik (227,84 pkt)",
      "Region V – GMP 68 Przodownik (1381,43 pkt)",
      "Oddział – A Mistrz (66,43 pkt)",
      "Oddział – B Mistrz (87,62 pkt)",
      "Oddział – C 1 Przodownik (525,46 pkt)",
      "Oddział – D Mistrz (679,51 pkt)",
      "Oddział – GMO II Wicemistrz (1373,93 pkt)",
      "Oddział – H Mistrz (338,68 pkt)",
      "Oddział – Roczne 3 Przodownik (1025,61 pkt)",
      "Oddział – Total młodzi I Wicemistrz (562,03 pkt)",
      "Oddział – 5 najlepszych młodzi Mistrz (1139,02 pkt)",
      "Okręg – A Mistrz",
      "Okręg – B Mistrz",
      "Okręg – H Mistrz",
      "Okręg – Roczne I Wicemistrz",
      "Region V – A I Wicemistrz",
      "Region V – B 1 Przodownik",
      "Region V – Roczne 1 Przodownik",
      "Region V – D 3 Przodownik",
    ],
    highlight: "21 osiągnięć",
  },
  {
    year: 2014,
    title: "Sezon 2014",
    achievements: [
      "MP – B Mistrz (661,38 pkt)",
      "MP – A Mistrz (116,13 pkt)",
      "MP – Klasa Sport A 22 Miejsce",
      "Oddział – A I Mistrz (116,13 pkt)",
      "Oddział – B I Mistrz (78,35 pkt)",
      "Oddział – C 5 Przodownik (362,76 pkt)",
      "Oddział – D I Mistrz (557,24 pkt)",
      "Oddział – H I Mistrz (577,48 pkt)",
      "Oddział – Roczne I Mistrz (239,29 pkt)",
      "Oddział – Lotniki 2 Przodownik (524,88 pkt)",
    ],
    highlight: "10 osiągnięć",
  },
  {
    year: 2015,
    title: "Sezon 2015",
    achievements: [
      "MP – A Mistrz (86,77 pkt)",
      "MP – B 1 Przodownik (71,68 pkt)",
      "Oddział – A I Mistrz (83,22 pkt)",
      "Oddział – B I Mistrz (237,95 pkt)",
      "Oddział – C I Mistrz (199,65 pkt)",
      "Oddział – D I Mistrz (520,82 pkt)",
    ],
    highlight: "6 osiągnięć",
  },
  {
    year: 2017,
    title: "Sezon 2017",
    achievements: [
      "MP – GMP 54 Przodownik (148,16 pkt)",
      "Oddział – A 1 Przodownik (348,53 pkt)",
      "Oddział – B 1 Przodownik (153,39 pkt)",
    ],
    highlight: "3 osiągnięcia",
  },
  {
    year: 2018,
    title: "Sezon 2018",
    achievements: [
      "MP – A I Wicemistrz (25,94 pkt)",
      "Oddział – Total 16 Przodownik (XIII) (942,69 pkt)",
      "Oddział – A I Mistrz (29,38 pkt)",
      "Oddział – B I Mistrz (35,74 pkt)",
    ],
    highlight: "4 osiągnięcia",
  },
  {
    year: 2019,
    title: "Sezon 2019",
    achievements: [
      "Oddział – A I Mistrz (82,76 pkt)",
      "Oddział – B I Mistrz (130,64 pkt)",
    ],
    highlight: "2 osiągnięcia",
  },
  {
    year: 2021,
    title: "Sezon 2021",
    achievements: [
      "MP – A 61 Przodownik (249,85 pkt)",
    ],
    highlight: "1 osiągnięcie",
  },
  {
    year: 2024,
    title: "Sezon 2024",
    achievements: [
      "MP – A 13 Przodownik (85,05 pkt)",
    ],
    highlight: "1 osiągnięcie",
  },
];

const AchievementsSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Perspective transforms for tunnel effect
  const perspectiveZ = useTransform(smoothProgress, [0, 1], [0, -500]);
  const tunnelOpacity = useTransform(smoothProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

  // Update active index based on scroll
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (value) => {
      const newIndex = Math.min(
        Math.floor(value * timelineEvents.length),
        timelineEvents.length - 1
      );
      setActiveIndex(newIndex);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  const years = timelineEvents.map((e) => e.year);

  return (
    <section
      id="achievements"
      ref={containerRef}
      className="achievements-tunnel relative isolate min-h-[400vh] overflow-x-hidden bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
    >
      {/* Fixed Background - Dark Navy */}
      <div className="fixed inset-0 bg-tunnel grid-overlay -z-10 pointer-events-none" />
      
      {/* Radial Glow Effect - Gold */}
      <motion.div
        className="fixed inset-0 -z-5 pointer-events-none"
        style={{ opacity: tunnelOpacity }}
      >
        <div className="absolute inset-0 tunnel-gold-glow" />
      </motion.div>

      {/* Progress Bar */}
      <ProgressBar 
        years={years} 
        activeIndex={activeIndex}
      />

      {/* Tunnel Rings (fixed background layer; does not push content down) */}
      <div className="fixed inset-0 overflow-hidden tunnel-perspective pointer-events-none z-2">
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{ z: perspectiveZ }}
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute border border-primary/10 rounded-full"
              style={{
                width: `${(i + 1) * 30}%`,
                height: `${(i + 1) * 30}%`,
                transform: `translateZ(${i * -100}px)`,
              }}
              animate={{
                opacity: [0.1, 0.3, 0.1],
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* Timeline Content */}
      <div className="relative z-10 pt-32 md:pt-36 lg:pt-40 pb-24 md:pb-28 lg:pb-32 px-4 md:px-16 lg:px-24 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-8 md:mb-10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <motion.h1 
            className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 glow-text"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            HISTORIA OSIĄGNIĘĆ
          </motion.h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Przewijaj czas i odkryj historię sukcesów od 2001 roku
          </p>
          
          {/* Scroll Indicator */}
          <motion.div 
            className="mt-4 flex flex-col items-center gap-2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-sm text-muted-foreground">Przewijaj aby odkryć</span>
            <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
              <motion.div 
                className="w-1.5 h-3 bg-primary rounded-full"
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Timeline Cards */}
        {timelineEvents.map((event, index) => (
          <TimelineCard
            key={event.year}
            event={event}
            index={index}
            isActive={index === activeIndex}
          />
        ))}

        {/* Footer */}
        <motion.div 
          className="text-center pt-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <p className="font-display text-2xl text-muted-foreground">
            Historia trwa...
          </p>
        </motion.div>
      </div>

      {/* Mobile Progress Indicator */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:hidden z-50">
        <div className="glass-card px-4 py-2 flex items-center gap-3">
          <span className="font-display text-lg text-primary glow-text">
            {years[activeIndex]}
          </span>
          <div className="w-24 h-1 rounded-full bg-muted overflow-hidden">
            <motion.div 
              className="h-full progress-glow"
              style={{ width: `${((activeIndex + 1) / years.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AchievementsSection;
