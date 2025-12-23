import { useMemo, useRef, useState } from "react";
import type { MotionValue } from "framer-motion";
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import { Trophy, Medal, Award } from "lucide-react";

interface Achievement {
  region: string;
  category: string;
  position: string;
  points: string;
  count: string;
}

interface YearData {
  year: string;
  achievements: Achievement[];
}

function TimeTunnelCard({
  yearData,
  index,
  count,
  progress,
  currentIndex,
}: {
  yearData: YearData;
  index: number;
  count: number;
  progress: MotionValue<number>;
  currentIndex: number;
}) {
  const safeCount = Math.max(count, 1);
  const step = 1 / safeCount;
  const start = index * step;
  const mid = start + step * 0.5;
  const end = start + step;

  // Make non-active cards disappear faster to avoid visual overlap,
  // while still keeping a strong "tunnel" feel.
  const z = useTransform(progress, [start, mid, end], [-900, 0, 260]);
  const y = useTransform(progress, [start, mid, end], [40, 0, -30]);
  const rotateX = useTransform(progress, [start, mid, end], [20, 0, -12]);
  const rotateY = useTransform(progress, [start, mid, end], [-8, 0, 8]);
  const scale = useTransform(progress, [start, mid, end], [0.9, 1, 0.95]);
  const opacity = useTransform(progress, [start, mid, end], [0, 1, 0]);
  const blur = useTransform(progress, [start, mid, end], [8, 0, 10]);
  const filter = useTransform(blur, (v) => `blur(${v}px)`);

  const distance = Math.abs(index - currentIndex);
  const zIndex = 50 - Math.min(40, distance * 5);

  return (
    <div className="relative h-[88vh]">
      <motion.div
        className="sticky top-28 preserve-3d"
        style={{
          z,
          y,
          rotateX,
          rotateY,
          scale,
          opacity,
          zIndex,
          filter,
        }}
      >
        <div className="relative overflow-hidden rounded-2xl border border-border/30 bg-card/20 backdrop-blur-md">
          {/* Removed big year watermark to avoid persistent overlay across sections */}

          <div className="relative p-6 sm:p-8">
            <div className="flex items-baseline justify-between gap-6">
              <h3 className="text-2xl sm:text-3xl font-display text-gradient-gold">Sezon {yearData.year}</h3>
              <div className="text-sm text-foreground/70">{yearData.achievements.length} osiągnięć</div>
            </div>

            <div className="mt-6 space-y-2">
              {yearData.achievements.map((achievement, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <div className="mt-0.5">{getPositionIcon(achievement.position)}</div>
                  <div className="flex-1">
                    <span className="text-foreground font-medium">
                      {achievement.region} – {achievement.category}
                    </span>
                    <span className="text-timeline-gold ml-2">{achievement.position}</span>
                    {achievement.points !== "-" && (
                      <span className="text-foreground/60 ml-2 text-xs">({achievement.points} pkt)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const timelineData: YearData[] = [
  {
    year: "2024",
    achievements: [
      { region: "MP", category: "A", position: "13 Przodownik", points: "85,05", count: "-" }
    ]
  },
  {
    year: "2021",
    achievements: [
      { region: "MP", category: "A", position: "61 Przodownik", points: "249,85", count: "-" }
    ]
  },
  {
    year: "2019",
    achievements: [
      { region: "Oddział", category: "A", position: "I Mistrz", points: "82,76", count: "-" },
      { region: "Oddział", category: "B", position: "I Mistrz", points: "130,64", count: "-" }
    ]
  },
  {
    year: "2018",
    achievements: [
      { region: "MP", category: "A", position: "I Wicemistrz", points: "25,94", count: "20" },
      { region: "Oddział", category: "Total", position: "16 Przodownik (XIII)", points: "942,69", count: "-" },
      { region: "Oddział", category: "A", position: "I Mistrz", points: "29,38", count: "20" },
      { region: "Oddział", category: "B", position: "I Mistrz", points: "35,74", count: "16" }
    ]
  },
  {
    year: "2017",
    achievements: [
      { region: "MP", category: "GMP", position: "54 Przodownik", points: "148,16", count: "-" },
      { region: "Oddział", category: "A", position: "1 Przodownik", points: "348,53", count: "20" },
      { region: "Oddział", category: "B", position: "1 Przodownik", points: "153,39", count: "16" }
    ]
  },
  {
    year: "2015",
    achievements: [
      { region: "MP", category: "A", position: "Mistrz", points: "86,77", count: "20" },
      { region: "MP", category: "B", position: "1 Przodownik", points: "71,68", count: "16" },
      { region: "Oddział", category: "A", position: "I Mistrz", points: "83,22", count: "20" },
      { region: "Oddział", category: "B", position: "I Mistrz", points: "237,95", count: "16" },
      { region: "Oddział", category: "C", position: "I Mistrz", points: "199,65", count: "9" },
      { region: "Oddział", category: "D", position: "I Mistrz", points: "520,82", count: "45" }
    ]
  },
  {
    year: "2014",
    achievements: [
      { region: "MP", category: "B", position: "Mistrz", points: "661,38", count: "16" },
      { region: "MP", category: "A", position: "Mistrz", points: "116,13", count: "20" },
      { region: "MP", category: "Klasa Sport A", position: "22 Miejsce", points: "-", count: "20" },
      { region: "Oddział", category: "A", position: "I Mistrz", points: "116,13", count: "20" },
      { region: "Oddział", category: "B", position: "I Mistrz", points: "78,35", count: "16" },
      { region: "Oddział", category: "C", position: "5 Przodownik", points: "362,76", count: "9" },
      { region: "Oddział", category: "D", position: "I Mistrz", points: "557,24", count: "-" },
      { region: "Oddział", category: "H", position: "I Mistrz", points: "577,48", count: "-" },
      { region: "Oddział", category: "Roczne", position: "I Mistrz", points: "239,29", count: "20" },
      { region: "Oddział", category: "Lotniki", position: "2 Przodownik", points: "524,88", count: "-" }
    ]
  },
  {
    year: "2013",
    achievements: [
      { region: "MP", category: "B", position: "13 Przodownik", points: "685,69", count: "16" },
      { region: "MP", category: "A", position: "II Wicemistrz", points: "66,43", count: "20" },
      { region: "MP", category: "Roczne", position: "9 Przodownik", points: "227,84", count: "20" },
      { region: "Region V", category: "GMP", position: "68 Przodownik", points: "1381,43", count: "-" },
      { region: "Oddział", category: "A", position: "Mistrz", points: "66,43", count: "20" },
      { region: "Oddział", category: "B", position: "Mistrz", points: "87,62", count: "16" },
      { region: "Oddział", category: "C", position: "1 Przodownik", points: "525,46", count: "9" },
      { region: "Oddział", category: "D", position: "Mistrz", points: "679,51", count: "45" },
      { region: "Oddział", category: "GMO", position: "II Wicemistrz", points: "1373,93", count: "32" },
      { region: "Oddział", category: "H", position: "Mistrz", points: "338,68", count: "18" },
      { region: "Oddział", category: "Roczne", position: "3 Przodownik", points: "1025,61", count: "28" },
      { region: "Oddział", category: "Total młodzi", position: "I Wicemistrz", points: "562,03", count: "25" },
      { region: "Oddział", category: "5 najlepszych młodzi", position: "Mistrz", points: "1139,02", count: "21" },
      { region: "Okręg", category: "A", position: "Mistrz", points: "-", count: "20" },
      { region: "Okręg", category: "B", position: "Mistrz", points: "-", count: "16" },
      { region: "Okręg", category: "H", position: "Mistrz", points: "-", count: "18" },
      { region: "Okręg", category: "Roczne", position: "I Wicemistrz", points: "-", count: "20" },
      { region: "Region V", category: "A", position: "I Wicemistrz", points: "-", count: "20" },
      { region: "Region V", category: "B", position: "1 Przodownik", points: "-", count: "16" },
      { region: "Region V", category: "Roczne", position: "1 Przodownik", points: "-", count: "20" },
      { region: "Region V", category: "D", position: "3 Przodownik", points: "-", count: "45" }
    ]
  },
  {
    year: "2012",
    achievements: [
      { region: "MP", category: "Maraton", position: "8 Przodownik", points: "648,45", count: "-" },
      { region: "MP", category: "Olimpijskie", position: "68 Przodownik", points: "847,37", count: "-" },
      { region: "Oddział", category: "A", position: "I Mistrz", points: "575,76", count: "20" },
      { region: "Oddział", category: "B", position: "I Mistrz", points: "160,25", count: "16" },
      { region: "Oddział", category: "C", position: "II Wicemistrz", points: "119,72", count: "9" },
      { region: "Oddział", category: "M Maraton", position: "I Mistrz", points: "103,06", count: "-" },
      { region: "Oddział", category: "D", position: "I Mistrz", points: "855,28", count: "-" },
      { region: "Oddział", category: "GMO", position: "I Mistrz", points: "1409,58", count: "-" },
      { region: "Oddział", category: "H", position: "I Mistrz", points: "887,54", count: "-" },
      { region: "Oddział", category: "Roczne", position: "I Mistrz", points: "413,58", count: "20" },
      { region: "Oddział", category: "Olimpijskie", position: "I Mistrz", points: "646,45", count: "-" },
      { region: "Oddział", category: "Total dorośli", position: "I Mistrz", points: "1080,51", count: "-" },
      { region: "Oddział", category: "Total młodzi", position: "II Wicemistrz", points: "150,62", count: "-" }
    ]
  },
  {
    year: "2011",
    achievements: [
      { region: "Oddział", category: "Total dorosłych", position: "Mistrz", points: "611,73", count: "70" },
      { region: "Oddział", category: "A", position: "Mistrz", points: "161,32", count: "20" },
      { region: "Oddział", category: "B", position: "Mistrz", points: "51,32", count: "16" },
      { region: "Oddział", category: "C", position: "Mistrz", points: "84,07", count: "9" },
      { region: "Oddział", category: "M", position: "Mistrz", points: "59,36", count: "6" },
      { region: "Oddział", category: "D", position: "Mistrz", points: "296,71", count: "-" },
      { region: "Oddział", category: "H", position: "Mistrz", points: "588,92", count: "18" },
      { region: "Oddział", category: "Roczne", position: "Mistrz", points: "534,49", count: "20" },
      { region: "Okręg", category: "A", position: "Mistrz", points: "-", count: "20" },
      { region: "Okręg", category: "B", position: "Mistrz", points: "-", count: "16" },
      { region: "Okręg", category: "C", position: "Mistrz", points: "-", count: "9" },
      { region: "Okręg", category: "D", position: "Mistrz", points: "-", count: "-" },
      { region: "Okręg", category: "M", position: "Mistrz", points: "-", count: "6" },
      { region: "Region V", category: "B", position: "Mistrz", points: "-", count: "16" },
      { region: "Region V", category: "D", position: "Mistrz", points: "-", count: "-" }
    ]
  },
  {
    year: "2009",
    achievements: [
      { region: "Ogólnopolski", category: "GMP", position: "148 Przodownik", points: "1401,99", count: "-" }
    ]
  },
  {
    year: "2008",
    achievements: [
      { region: "Oddział Lubań", category: "A", position: "Mistrz", points: "49,88", count: "20" },
      { region: "Oddział Lubań", category: "B", position: "Mistrz", points: "158,27", count: "16" },
      { region: "Okręg Jelenia Góra", category: "A", position: "Mistrz", points: "49,88", count: "20" },
      { region: "Okręg Jelenia Góra", category: "B", position: "II Wicemistrz", points: "158,27", count: "16" },
      { region: "Region V", category: "A", position: "Mistrz", points: "49,88", count: "20" },
      { region: "Region V", category: "B", position: "XX Przodownik", points: "158,27", count: "16" },
      { region: "Region V", category: "GMP", position: "I Wicemistrz", points: "49,88", count: "-" },
      { region: "Region V", category: "GMP", position: "20 Przodownik", points: "158,27", count: "-" },
      { region: "MP", category: "A", position: "3 Przodownik", points: "49,88", count: "20" }
    ]
  },
  {
    year: "2007",
    achievements: [
      { region: "Oddział Lubań", category: "A", position: "Mistrz", points: "78,06", count: "20" },
      { region: "Oddział Lubań", category: "GMO", position: "II Wicemistrz", points: "-", count: "-" },
      { region: "Okręg Jelenia Góra", category: "A", position: "Mistrz", points: "78,06", count: "20" },
      { region: "Region V", category: "A", position: "II Przodownik", points: "78,06", count: "20" },
      { region: "MP", category: "A", position: "I Przodownik", points: "78,06", count: "20" }
    ]
  },
  {
    year: "2006",
    achievements: [
      { region: "Oddział Lubań", category: "A", position: "Mistrz", points: "240,15", count: "20" },
      { region: "Oddział Lubań", category: "B", position: "Mistrz", points: "183,25", count: "16" },
      { region: "Oddział Lubań", category: "GMO", position: "Mistrz", points: "82,77", count: "15" },
      { region: "Okręg Jelenia Góra", category: "A", position: "Mistrz", points: "199,28", count: "20" },
      { region: "Okręg Jelenia Góra", category: "B", position: "II Przodownik", points: "367,51", count: "16" },
      { region: "Okręg Jelenia Góra", category: "GMO", position: "I Wicemistrz", points: "82,77", count: "15" },
      { region: "Region V", category: "A", position: "18 Przodownik", points: "240,15", count: "20" },
      { region: "Region V", category: "B", position: "24 Przodownik", points: "183,25", count: "16" },
      { region: "Region V", category: "GMO", position: "3 Przodownik", points: "82,77", count: "15" },
      { region: "MP", category: "GMO", position: "VI Przodownik", points: "82,77", count: "15" }
    ]
  },
  {
    year: "2005",
    achievements: [
      { region: "Oddział Lubań", category: "A", position: "Mistrz", points: "90,65", count: "20" },
      { region: "Oddział Lubań", category: "B", position: "Mistrz", points: "66,96", count: "16" },
      { region: "Oddział Lubań", category: "GMO", position: "I Wicemistrz", points: "-", count: "-" },
      { region: "Okręg Jelenia Góra", category: "A", position: "Mistrz", points: "90,65", count: "20" },
      { region: "Okręg Jelenia Góra", category: "B", position: "Mistrz", points: "66,96", count: "16" },
      { region: "Okręg Jelenia Góra", category: "GMO", position: "I Przodownik", points: "-", count: "-" },
      { region: "Region V", category: "A", position: "II Wicemistrz", points: "90,65", count: "20" },
      { region: "MP", category: "A", position: "I Przodownik", points: "90,65", count: "20" },
      { region: "MP", category: "B", position: "V Przodownik", points: "66,96", count: "16" }
    ]
  },
  {
    year: "2004",
    achievements: [
      { region: "Oddział Lubań", category: "A", position: "Mistrz", points: "180,91", count: "20" },
      { region: "Oddział Lubań", category: "B", position: "Mistrz", points: "196,07", count: "16" },
      { region: "Oddział Lubań", category: "GMO", position: "I Wicemistrz", points: "-", count: "-" },
      { region: "Okręg Jelenia Góra", category: "A", position: "Mistrz", points: "180,91", count: "20" },
      { region: "Okręg Jelenia Góra", category: "B", position: "I Przodownik", points: "196,07", count: "16" },
      { region: "Okręg Jelenia Góra", category: "GMO", position: "I Przodownik", points: "-", count: "-" },
      { region: "Region V", category: "A", position: "18 Przodownik", points: "180,91", count: "20" },
      { region: "Region V", category: "D", position: "35 Przodownik", points: "839,32", count: "-" },
      { region: "MP", category: "A", position: "32 Przodownik", points: "180,91", count: "20" }
    ]
  },
  {
    year: "2003",
    achievements: [
      { region: "Oddział Lubań", category: "A", position: "Mistrz", points: "203,54", count: "20" },
      { region: "Oddział Lubań", category: "B", position: "Mistrz", points: "217,78", count: "16" },
      { region: "Oddział Lubań", category: "C", position: "Mistrz", points: "71,99", count: "9" },
      { region: "Oddział Lubań", category: "GMO", position: "Mistrz", points: "462,22", count: "-" },
      { region: "Okręg Jelenia Góra", category: "A", position: "Mistrz", points: "203,54", count: "20" },
      { region: "Okręg Jelenia Góra", category: "B", position: "I Wicemistrz", points: "217,78", count: "16" },
      { region: "Okręg Jelenia Góra", category: "C", position: "Mistrz", points: "71,99", count: "9" },
      { region: "Okręg Jelenia Góra", category: "GMO", position: "VI Przodownik", points: "462,22", count: "-" },
      { region: "Region V", category: "A", position: "10 Przodownik", points: "203,54", count: "20" },
      { region: "Region V", category: "B", position: "49 Przodownik", points: "217,78", count: "16" },
      { region: "Region V", category: "C", position: "2 Miejsce", points: "971,99", count: "-" },
      { region: "Region V", category: "D", position: "II Przodownik", points: "-", count: "-" },
      { region: "Region V", category: "GMP", position: "11 Przodownik", points: "1066,26", count: "-" },
      { region: "MP", category: "C", position: "13 Przodownik", points: "71,99", count: "9" },
      { region: "MP", category: "GMP", position: "28 Przodownik", points: "1066,26", count: "-" }
    ]
  },
  {
    year: "2002",
    achievements: [
      { region: "Oddział Lubań", category: "A", position: "Mistrz", points: "501,52", count: "20" },
      { region: "Oddział Lubań", category: "GMO", position: "II Wicemistrz", points: "40", count: "-" },
      { region: "Okręg Jelenia Góra", category: "A", position: "Mistrz", points: "501,52", count: "20" },
      { region: "Okręg Jelenia Góra", category: "GMO", position: "Mistrz", points: "40", count: "-" },
      { region: "Region V", category: "A", position: "50 Przodownik", points: "501,52", count: "20" },
      { region: "Region V", category: "B", position: "II Przodownik", points: "168,11", count: "16" }
    ]
  },
  {
    year: "2001",
    achievements: [
      { region: "Oddział Lubań", category: "A", position: "Mistrz", points: "235,77", count: "20" },
      { region: "Oddział Lubań", category: "B", position: "I Wicemistrz", points: "503,62", count: "16" },
      { region: "Oddział Lubań", category: "GMO", position: "Mistrz", points: "-", count: "-" },
      { region: "Okręg Jelenia Góra", category: "A", position: "I Wicemistrz", points: "235,77", count: "20" },
      { region: "Okręg Jelenia Góra", category: "B", position: "IX Przodownik", points: "503,62", count: "16" },
      { region: "Okręg Jelenia Góra", category: "GMO", position: "I Wicemistrz", points: "-", count: "-" }
    ]
  }
];

const getPositionIcon = (position: string) => {
  if (position.includes("Mistrz") && !position.includes("Wicemistrz")) {
    return <Trophy className="w-4 h-4 text-timeline-gold" />;
  } else if (position.includes("Wicemistrz")) {
    return <Medal className="w-4 h-4 text-timeline-gold/80" />;
  }
  return <Award className="w-4 h-4 text-timeline-gold/60" />;
};

const TimelineSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const items = useMemo(() => {
    return [...timelineData].sort((a, b) => Number(a.year) - Number(b.year));
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.6 });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (items.length <= 1) return;
    const idx = Math.min(items.length - 1, Math.max(0, Math.round(v * (items.length - 1))));
    setCurrentIndex(idx);
  });

  const progressFillScale = useTransform(progress, [0, 1], [0, 1]);
  const indicatorTop = useTransform(progress, [0, 1], ["0%", "100%"]); 

  return (
    <section
      id="achievements"
      ref={sectionRef}
      className="relative py-20 bg-slate-950"
    >
      {/* Subtle gradient on dark slate */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900/60" />

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_120px] gap-10 items-start">
          {/* Time tunnel */}
          <div className="perspective-1000">
            <div className="preserve-3d">
              {items.map((yearData, index) => (
                <TimeTunnelCard
                  key={yearData.year}
                  yearData={yearData}
                  index={index}
                  count={items.length}
                  progress={progress}
                  currentIndex={currentIndex}
                />
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div className="hidden lg:block sticky top-28 h-[68vh]">
            <div className="relative h-full flex items-stretch justify-center">
              {/* Track */}
              <div className="relative w-8">
                <div className="absolute left-1/2 top-0 -translate-x-1/2 h-full w-px bg-border/40" />
                <motion.div
                  className="absolute left-1/2 top-0 -translate-x-1/2 h-full w-px bg-timeline-gold"
                  style={{ scaleY: progressFillScale, transformOrigin: "top" }}
                />
                <motion.div
                  className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-timeline-gold shadow-[0_0_18px_hsla(var(--glow-color)/0.45)]"
                  style={{ top: indicatorTop }}
                />
              </div>

              {/* Year labels */}
              <div className="ml-4 flex flex-col justify-between py-1">
                {items.map((y, idx) => (
                  <div
                    key={y.year}
                    className={
                      idx === currentIndex
                        ? "text-sm font-semibold text-foreground"
                        : "text-sm text-foreground/45"
                    }
                  >
                    {y.year}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TimelineSection;
