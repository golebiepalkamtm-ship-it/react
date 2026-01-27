import { useRef, useState, useEffect, useMemo } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import TimelineCard from "./TimelineCard";
import ProgressBar from "./ProgressBar";
import ParticlesBackground from "./ParticlesBackground";
import StatsHeader from "./StatsHeader";
import { useParallax } from "./hooks/useParallax";

const timelineEvents = [
  {
    year: 2001,
    title: "Sezon 2001",
    achievements: [
      "Oddział Lubań – Kat A: Mistrz (235.77 coeff, 20 con)",
      "Oddział Lubań – Kat B: I Wicemistrz (503.62 coeff, 16 con)",
      "Oddział Lubań – Kat GMO: Mistrz",
      "Okręg Jelenia Góra – Kat A: I Wicemistrz (235.77 coeff, 20 con)",
      "Okręg Jelenia Góra – Kat B: IX Przodownik (503.62 coeff, 16 con)",
      "Okręg Jelenia Góra – Kat GMO: I Wicemistrz",
    ],
    highlight: "6 osiągnięć",
  },
  {
    year: 2002,
    title: "Sezon 2002",
    achievements: [
      "Oddział Lubań – Kat A: Mistrz (501.52 coeff, 20 con)",
      "Oddział Lubań – Kat GMO: II Wicemistrz (40 coeff)",
      "Okręg Jelenia Góra – Kat A: Mistrz (501.52 coeff, 20 con)",
      "Okręg Jelenia Góra – Kat GMO: Mistrz (40 coeff)",
      "Region V – Kat A: 50 Przodownik (501.52 coeff, 20 con)",
      "Region V – Kat B: II Przodownik (168.11 coeff, 16 con)",
    ],
    highlight: "6 osiągnięć",
  },
  {
    year: 2003,
    title: "Sezon 2003",
    achievements: [
      "Oddział Lubań – Kat A: Mistrz (203.54 coeff, 20 con)",
      "Oddział Lubań – Kat B: Mistrz (217.78 coeff, 16 con)",
      "Oddział Lubań – Kat C: Mistrz (71.99 coeff, 9 con)",
      "Oddział Lubań – Kat GMO: Mistrz (462.22 coeff)",
      "Okręg Jelenia Góra – Kat A: Mistrz (203.54 coeff, 20 con)",
      "Okręg Jelenia Góra – Kat B: I Wicemistrz (217.78 coeff, 16 con)",
      "Okręg Jelenia Góra – Kat C: Mistrz (71.99 coeff, 9 con)",
      "Okręg Jelenia Góra – Kat GMO: VI Przodownik (462.22 coeff)",
      "Region V – Kat A: 10 Przodownik (203.54 coeff, 20 con)",
      "Region V – Kat B: 49 Przodownik (217.78 coeff, 16 con)",
      "Region V – Kat C: 2 Miejsce (971.99 coeff)",
      "Region V – Kat D: II Przodownik",
      "Region V – Kat GMP: 11 Przodownik (1066.26 coeff)",
      "MP – Kat C: 13 Przodownik (71.99 coeff, 9 con)",
      "MP – Kat GMP: 28 Przodownik (1066.26 coeff)",
    ],
    highlight: "15 osiągnięć",
  },
  {
    year: 2004,
    title: "Sezon 2004",
    achievements: [
      "Oddział Lubań – Kat A: Mistrz (180.91 coeff, 20 con)",
      "Oddział Lubań – Kat B: Mistrz (196.07 coeff, 16 con)",
      "Oddział Lubań – Kat GMO: I Wicemistrz",
      "Okręg Jelenia Góra – Kat A: Mistrz (180.91 coeff, 20 con)",
      "Okręg Jelenia Góra – Kat B: I Przodownik (196.07 coeff, 16 con)",
      "Okręg Jelenia Góra – Kat GMO: I Przodownik",
      "Region V – Kat A: 18 Przodownik (180.91 coeff, 20 con)",
      "Region V – Kat D: 35 Przodownik (839.32 coeff)",
      "MP – Kat A: 32 Przodownik (180.91 coeff, 20 con)",
    ],
    highlight: "9 osiągnięć",
  },
  {
    year: 2005,
    title: "Sezon 2005",
    achievements: [
      "Oddział Lubań – Kat A: Mistrz (90.65 coeff, 20 con)",
      "Oddział Lubań – Kat B: Mistrz (66.96 coeff, 16 con)",
      "Oddział Lubań – Kat GMO: I Wicemistrz",
      "Okręg Jelenia Góra – Kat A: Mistrz (90.65 coeff, 20 con)",
      "Okręg Jelenia Góra – Kat B: Mistrz (66.96 coeff, 16 con)",
      "Okręg Jelenia Góra – Kat GMO: I Przodownik",
      "Region V – Kat A: II Wicemistrz (90.65 coeff, 20 con)",
      "MP – Kat A: I Przodownik (90.65 coeff, 20 con)",
      "MP – Kat B: V Przodownik (66.96 coeff, 16 con)",
    ],
    highlight: "9 osiągnięć",
  },
  {
    year: 2006,
    title: "Sezon 2006",
    achievements: [
      "Oddział Lubań – Kat A: Mistrz (240.15 coeff, 20 con)",
      "Oddział Lubań – Kat B: Mistrz (183.25 coeff, 16 con)",
      "Oddział Lubań – Kat GMO: Mistrz (82.77 coeff, 15 con)",
      "Okręg Jelenia Góra – Kat A: Mistrz (199.28 coeff, 20 con)",
      "Okręg Jelenia Góra – Kat B: II Przodownik (367.51 coeff, 16 con)",
      "Okręg Jelenia Góra – Kat GMO: I Wicemistrz (82.77 coeff, 15 con)",
      "Region V – Kat A: 18 Przodownik (240.15 coeff, 20 con)",
      "Region V – Kat B: 24 Przodownik (183.25 coeff, 16 con)",
      "Region V – Kat GMO: 3 Przodownik (82.77 coeff, 15 con)",
      "MP – Kat GMO: VI Przodownik (82.77 coeff, 15 con)",
    ],
    highlight: "10 osiągnięć",
  },
  {
    year: 2007,
    title: "Sezon 2007",
    achievements: [
      "Oddział Lubań – Kat A: Mistrz (78.06 coeff, 20 con)",
      "Oddział Lubań – Kat GMO: II Wicemistrz",
      "Okręg Jelenia Góra – Kat A: Mistrz (78.06 coeff, 20 con)",
      "Region V – Kat A: II Przodownik (78.06 coeff, 20 con)",
      "MP – Kat A: I Przodownik (78.06 coeff, 20 con)",
    ],
    highlight: "5 osiągnięć",
  },
  {
    year: 2008,
    title: "Sezon 2008",
    achievements: [
      "Oddział Lubań 092 – Kat A: Mistrz (49.88 coeff, 20 con)",
      "Oddział Lubań 092 – Kat B: Mistrz (158.27 coeff, 16 con)",
      "Oddział Lubań 092 – Kat GMP: I Wicemistrz (49.88 coeff)",
      "Okręg Jelenia Góra – Kat A: Mistrz (49.88 coeff, 20 con)",
      "Okręg Jelenia Góra – Kat B: II Wicemistrz (158.27 coeff, 16 con)",
      "Okręg Jelenia Góra – Kat GMP: I Wicemistrz (49.88 coeff)",
      "Region V – Kat A: Mistrz (49.88 coeff, 20 con)",
      "Region V – Kat B: XX Przodownik (158.27 coeff, 16 con)",
      "Region V – Kat GMP: I Wicemistrz (49.88 coeff)",
      "Region V – Kat GMP: 20 Przodownik (158.27 coeff)",
      "MP – Kat A: 3 Przodownik (49.88 coeff, 20 con)",
    ],
    highlight: "11 osiągnięć",
  },
  {
    year: 2009,
    title: "Sezon 2009",
    achievements: [
      "Oddział Lubań 092 – Kat A: Mistrz (307.39 coeff, 20 con)",
      "Oddział Lubań 092 – Kat B: Mistrz (183.18 coeff, 16 con)",
      "Oddział Lubań 092 – Kat GMP: I Wicemistrz",
      "Okręg Jelenia Góra – Kat A: Mistrz (307.39 coeff, 20 con)",
      "Okręg Jelenia Góra – Kat B: Mistrz (183.18 coeff, 16 con)",
      "Okręg Jelenia Góra – Kat GMP: I Wicemistrz",
      "Region V – Kat A: I Wicemistrz (307.39 coeff, 20 con)",
      "Region V – Kat B: III Przodownik (183.18 coeff, 16 con)",
      "Region V – Kat GMP: I Wicemistrz",
      "MP – Kat A: 5 Przodownik (307.39 coeff, 20 con)",
      "MP – Kat B: 15 Przodownik (183.18 coeff, 16 con)",
    ],
    highlight: "11 osiągnięć",
  },
  {
    year: 2010,
    title: "Sezon 2010",
    achievements: [
      "Oddział Łużyce Lubań 0446 – Kat A: I V-ce MISTRZ (293.79 coeff, 20 con)",
      "Oddział Łużyce Lubań 0446 – Kat B: MISTRZ (62.47 coeff, 16 con)",
      "Oddział Łużyce Lubań 0446 – Kat H: II V-ce MISTRZ (975.71 coeff, 18 con)",
      "Oddział Łużyce Lubań 0446 – Kat Młode: MISTRZ (245.86 coeff, 15 con)",
      "Oddział Łużyce Lubań 0446 – Kat Roczne: 1. Przodownik (1692.16 coeff, 34 con)",
      "Okręg Jelenia Góra – Kat A: I V-ce MISTRZ (293.79 coeff, 20 con)",
      "Okręg Jelenia Góra – Kat B: MISTRZ (62.47 coeff, 16 con)",
      "Okręg Jelenia Góra – Kat H: II V-ce MISTRZ (975.71 coeff, 18 con)",
      "Okręg Jelenia Góra – Kat Młode: MISTRZ (245.86 coeff, 15 con)",
      "Okręg Jelenia Góra – Kat Roczne: 1. Przodownik (1692.16 coeff, 34 con)",
    ],
    highlight: "10 osiągnięć",
  },
  {
    year: 2011,
    title: "Sezon 2011",
    achievements: [
      "Oddział Łużyce Lubań 0446 – Kat Total dorosłych: Mistrz (611.73 coeff, 70 con)",
      "Oddział Łużyce Lubań 0446 – Kat A: Mistrz (161.32 coeff, 20 con)",
      "Oddział Łużyce Lubań 0446 – Kat B: Mistrz (51.32 coeff, 16 con)",
      "Oddział Łużyce Lubań 0446 – Kat C: Mistrz (84.07 coeff, 9 con)",
      "Oddział Łużyce Lubań 0446 – Kat M: Mistrz (59.36 coeff, 6 con)",
      "Oddział Łużyce Lubań 0446 – Kat D: Mistrz (296.71 coeff)",
      "Oddział Łużyce Lubań 0446 – Kat H: Mistrz (588.92 coeff, 18 con)",
      "Oddział Łużyce Lubań 0446 – Kat Roczne: Mistrz (534.49 coeff, 20 con)",
      "Okręg Jelenia Góra – Kat A: I V-ce MISTRZ (161.32 coeff, 20 con)",
      "Okręg Jelenia Góra – Kat B: MISTRZ (51.32 coeff, 16 con)",
      "Okręg Jelenia Góra – Kat C: MISTRZ (84.07 coeff, 9 con)",
      "Okręg Jelenia Góra – Kat D: MISTRZ (296.71 coeff, 45 con)",
      "Okręg Jelenia Góra – Kat E: II V-ce MISTRZ (81.60 coeff, 6 con)",
      "Okręg Jelenia Góra – Kat F: I V-ce MISTRZ (243.05 coeff, 15 con)",
      "Okręg Jelenia Góra – Kat G: 1. Przodownik (1583.79 coeff, 34 con)",
      "Okręg Jelenia Góra – Kat H: II V-ce MISTRZ (588.92 coeff, 18 con)",
      "Generalne – I V-ce MISTRZ (1417.76 coeff, 32 con)",
      "Region V – Kat A: 3 Przodownik (161.32 coeff, 20 con)",
      "Region V – Kat B: Mistrz (51.32 coeff, 16 con)",
    ],
    highlight: "19 osiągnięć",
  },
  {
    year: 2012,
    title: "Sezon 2012",
    achievements: [
      "Oddział Łużyce Lubań 0446 – Kat A: I Mistrz (575.76 coeff, 20 con)",
      "Oddział Łużyce Lubań 0446 – Kat B: I Mistrz (160.25 coeff, 16 con)",
      "Oddział Łużyce Lubań 0446 – Kat C: II Wicemistrz (119.72 coeff, 9 con)",
      "Oddział Łużyce Lubań 0446 – Kat M Maraton: I Mistrz (103.06 coeff)",
      "Oddział Łużyce Lubań 0446 – Kat D: I Mistrz (855.28 coeff)",
      "Oddział Łużyce Lubań 0446 – Kat GMO: I Mistrz (1409.58 coeff)",
      "Oddział Łużyce Lubań 0446 – Kat H: I Mistrz (887.54 coeff)",
      "Oddział Łużyce Lubań 0446 – Kat Roczne: I Mistrz (413.58 coeff, 20 con)",
      "Oddział Łużyce Lubań 0446 – Kat Olimpijskie: I Mistrz (646.45 coeff)",
      "Oddział Łużyce Lubań 0446 – Kat Total dorośli: I Mistrz (1080.51 coeff)",
      "Oddział Łużyce Lubań 0446 – Kat Total młodzi: II Wicemistrz (150.62 coeff)",
      "MP – Kat Maraton: 8 Przodownik (648.45 coeff)",
      "MP – Kat Olimpijskie: 68 Przodownik (847.37 coeff)",
    ],
    highlight: "13 osiągnięć",
  },
  {
    year: 2013,
    title: "Sezon 2013",
    achievements: [
      "Oddział Łużyce Lubań 0446 – Kat A: Mistrz (66.43 coeff, 20 con)",
      "Oddział Łużyce Lubań 0446 – Kat B: Mistrz (87.62 coeff, 16 con)",
      "Oddział Łużyce Lubań 0446 – Kat C: 1 Przodownik (525.46 coeff, 9 con)",
      "Oddział Łużyce Lubań 0446 – Kat D: Mistrz (679.51 coeff, 45 con)",
      "Oddział Łużyce Lubań 0446 – Kat GMO: II Wicemistrz (1373.93 coeff, 32 con)",
      "Oddział Łużyce Lubań 0446 – Kat H: Mistrz (338.68 coeff, 18 con)",
      "Oddział Łużyce Lubań 0446 – Kat Roczne: 3 Przodownik (1025.61 coeff, 28 con)",
      "Oddział Łużyce Lubań 0446 – Kat Total młodzi: I Wicemistrz (562.03 coeff, 25 con)",
      "Oddział Łużyce Lubań 0446 – Kat 5 najlepszych młodzi: Mistrz (1139.02 coeff, 21 con)",
      "Okręg Jelenia Góra – Kat A: Mistrz (20 con)",
      "Okręg Jelenia Góra – Kat B: Mistrz (16 con)",
      "Okręg Jelenia Góra – Kat H: Mistrz (18 con)",
      "Okręg Jelenia Góra – Kat Roczne: I Wicemistrz (20 con)",
      "Region V – Kat A: I Wicemistrz (20 con)",
      "Region V – Kat B: 1 Przodownik (16 con)",
      "Region V – Kat Roczne: 1 Przodownik (20 con)",
      "Region V – Kat D: 3 Przodownik (45 con)",
      "Region V – Kat GMP: 68 Przodownik (1381.43 coeff)",
      "MP – Kat A: II Wicemistrz (66.43 coeff, 20 con)",
      "MP – Kat B: 13 Przodownik (685.69 coeff, 16 con)",
      "MP – Kat Roczne: 9 Przodownik (227.84 coeff, 20 con)",
    ],
    highlight: "21 osiągnięć",
  },
  {
    year: 2014,
    title: "Sezon 2014",
    achievements: [
      "Oddział Łużyce Lubań 0446 – Kat A: I Mistrz (116.13 coeff, 20 con)",
      "Oddział Łużyce Lubań 0446 – Kat B: I Mistrz (661.38 coeff, 16 con)",
      "Oddział Łużyce Lubań 0446 – Kat C: 5 Przodownik (362.76 coeff, 9 con)",
      "Oddział Łużyce Lubań 0446 – Kat D: I Mistrz (557.24 coeff)",
      "Oddział Łużyce Lubań 0446 – Kat H: I Mistrz (577.48 coeff)",
      "Oddział Łużyce Lubań 0446 – Kat Roczne: I Mistrz (239.29 coeff, 20 con)",
      "Oddział Łużyce Lubań 0446 – Kat Lotniki: 2 Przodownik (524.88 coeff)",
      "Okręg Jelenia Góra – Kat A: I Mistrz (116.13 coeff, 20 con)",
      "Okręg Jelenia Góra – Kat B: I Mistrz (661.38 coeff, 16 con)",
      "Region V – Kat A: Mistrz (116.13 coeff, 20 con)",
      "Region V – Kat B: Mistrz (661.38 coeff, 16 con)",
      "MP – Kat A: Mistrz (116.13 coeff, 20 con)",
      "MP – Kat B: Mistrz (661.38 coeff, 16 con)",
      "MP – Kat Klasa Sport A: 22 Miejsce (20 con)",
    ],
    highlight: "14 osiągnięć",
  },
  {
    year: 2015,
    title: "Sezon 2015",
    achievements: [
      "Oddział Łużyce Lubań 0446 – Kat A: I Mistrz (86.77 coeff, 20 con)",
      "Oddział Łużyce Lubań 0446 – Kat B: I Mistrz (237.95 coeff, 16 con)",
      "Oddział Łużyce Lubań 0446 – Kat C: I Mistrz (199.65 coeff, 9 con)",
      "Oddział Łużyce Lubań 0446 – Kat D: I Mistrz (520.82 coeff, 45 con)",
      "Okręg Jelenia Góra – Kat A: Mistrz (86.77 coeff, 20 con)",
      "Region V – Kat A: Mistrz (86.77 coeff, 20 con)",
      "MP – Kat A: Mistrz (86.77 coeff, 20 con)",
      "MP – Kat B: 1 Przodownik (71.68 coeff, 16 con)",
    ],
    highlight: "8 osiągnięć",
  },
  {
    year: 2017,
    title: "Sezon 2017",
    achievements: [
      "Oddział Kwisa 0489 – Kat A: 1 Przodownik (348.53 coeff, 20 con)",
      "Oddział Kwisa 0489 – Kat B: 1 Przodownik (153.39 coeff, 16 con)",
    ],
    highlight: "2 osiągnięcia",
  },
  {
    year: 2018,
    title: "Sezon 2018",
    achievements: [
      "Oddział Kwisa 0489 – Kat A: Mistrz (29.38 coeff, 18 con)",
      "Oddział Kwisa 0489 – Kat B: Mistrz (35.74 coeff, 15 con)",
      "Oddział Kwisa 0489 – Kat Total: XIII Przodownik (942.69 coeff, 43 con)",
      "Oddział Kwisa 0489 – Kat Młode 5 gołębi: 57 miejsce (239.98 pkt, 1018.135 coeff, 5 con)",
      "Oddział Kwisa 0489 – Kat Młode Główna: 59 miejsce (109.32 pkt, 15.4 knk/km, 4 con)",
    ],
    highlight: "5 osiągnięć",
  },
  {
    year: 2019,
    title: "Sezon 2019",
    achievements: [
      "Oddział Kwisa 0489 – Kat A: Mistrz Pałka MTM (183.13 coeff, 18 con)",
      "Oddział Kwisa 0489 – Kat B: I V-ce Mistrz Pałka MTM (286.13 coeff, 15 con)",
      "Oddział Kwisa 0489 – Kat C: II V-ce Mistrz Pałka MTM (121.78 coeff, 9 con)",
      "Oddział Kwisa 0489 – Kat D: Mistrz Pałka MTM (591.04 coeff, 42 con)",
      "Oddział Kwisa 0489 – Kat Młode Główna: I V-ce Mistrz Pałka MTM (874.13 pkt, 24 con)",
      "Oddział Kwisa 0489 – Kat Młode 5 gołębi: Mistrz Pałka MTM (931.14 pkt, 25 con)",
      "Okręg Jelenia Góra – Kat A: 1 Przodownik (183.13 coeff, 18 con)",
      "Okręg Jelenia Góra – Kat B: 3 Przodownik (286.13 coeff, 15 con)",
      "Okręg Jelenia Góra – Kat C: 1 Przodownik (121.78 coeff, 9 con)",
      "Okręg Jelenia Góra – Kat D: 1 Przodownik (591.04 coeff, 42 con)",
      "Okręg Jelenia Góra – Kat Młode Główna: 4 Przodownik (874.13 pkt, 24 con)",
      "Region V (nieuznane) – Kat A: I V-ce Mistrz (63.82 coeff, 18 con)",
      "Region V (nieuznane) – Kat B: I V-ce Mistrz (70.75 coeff, 15 con)",
      "Region V (nieuznane) – Kat C: 6 Przodownik (561.95 coeff, 9 con)",
      "Region V (nieuznane) – Kat D: 7 Przodownik (713.20 coeff, 42 con)",
      "MP (nieuznane) – Kat A: I V-ce Mistrz (63.82 coeff, 18 con)",
      "MP (nieuznane) – Kat B: I V-ce Mistrz (70.75 coeff, 15 con)",
      "MP (nieuznane) – Kat C: ~70 Przodownik (561.95 coeff, 9 con)",
      "MP (nieuznane) – Kat D: ~50 Przodownik (713.20 coeff, 42 con)",
    ],
    highlight: "16 osiągnięć",
  },
  {
    year: 2023,
    title: "Sezon 2023",
    achievements: [
      "Oddział Kwisa 0489 – Kat A: MISTRZ Pałka MTM (184.75 coeff, 18 con)",
      "Oddział Kwisa 0489 – Kat B: I V-ce MISTRZ Pałka MTM (286.13 coeff, 15 con)",
    ],
    highlight: "2 osiągnięcia",
  },
  {
    year: 2024,
    title: "Sezon 2024",
    achievements: [
      "Oddział Kwisa 0489 – Kat A: MISTRZ Pałka MTM (124.53 coeff, 18 con)",
      "Oddział Kwisa 0489 – Kat B: MISTRZ Pałka MTM (245.78 coeff, 15 con)",
    ],
    highlight: "2 osiągnięcia",
  },
] as const;

const years = timelineEvents.map((e) => e.year);

const TimeTunnel = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useParallax();

  const stats = useMemo(() => {
    let mistrz = 0;
    let wicemistrz = 0;
    let przodownik = 0;

    timelineEvents.forEach((event) => {
      event.achievements.forEach((achievement) => {
        if (achievement.includes("Mistrz") || achievement.includes("MISTRZ")) mistrz++;
        if (achievement.includes("Wicemistrz") || achievement.includes("V-ce MISTRZ") || achievement.includes("V-ce Mistrz")) wicemistrz++;
        if (achievement.includes("Przodownik")) przodownik++;
      });
    });

    return { mistrz, wicemistrz, przodownik };
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const perspectiveZ = useTransform(smoothProgress, [0, 1], [0, -500]);
  const tunnelOpacity = useTransform(
    smoothProgress,
    [0, 0.1, 0.9, 1],
    [0, 1, 1, 0]
  );

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

  return (
    <div ref={containerRef} className="relative min-h-[400vh] achievements-tunnel overflow-hidden">
      {/* Fixed Background - Original implementation */}
      <div className="fixed inset-0 bg-tunnel grid-overlay -z-10" />

      {/* Particles Background - Restored */}
      <ParticlesBackground />
      
      {/* Parallax Background Layers - Enhanced with depth classes from original */}
      <div className="fixed inset-0 -z-8 pointer-events-none overflow-hidden">
        <div
          className="parallax-slow parallax-layer-deep mouse-parallax absolute w-[600px] h-[600px] rounded-full blur-3xl opacity-20"
          data-depth="0.2"
          style={{
            background:
              "radial-gradient(circle, hsl(var(--primary) / 0.4) 0%, transparent 70%)",
            top: "10%",
            left: "10%",
          }}
        />
        <div
          className="parallax-slow mouse-parallax absolute w-[800px] h-[800px] rounded-full blur-3xl opacity-10"
          data-depth="0.15"
          style={{
            background:
              "radial-gradient(circle, hsl(var(--glow-secondary) / 0.3) 0%, transparent 70%)",
            bottom: "10%",
            right: "5%",
          }}
        />
      </div>

      <ProgressBar years={years} activeIndex={activeIndex} />

      <div className="relative z-10 pt-32 pb-32 px-4 md:px-16 lg:px-24 max-w-7xl mx-auto">
        <motion.div 
          className="hero-section text-center mb-24"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h1 className="hero-title text-5xl md:text-7xl font-display font-bold text-white mb-8 leading-tight tracking-tight glow-text uppercase">
            HISTORIA OSIĄGNIĘĆ
          </h1>
          <p className="hero-subtitle text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Przewijaj czas i odkryj historię sukcesów od 2001 roku
          </p>

          <StatsHeader
            mistrz={stats.mistrz}
            wicemistrz={stats.wicemistrz}
            przodownik={stats.przodownik}
          />

          <motion.div
            className="scroll-indicator mt-12 flex flex-col items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
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

        <div className="relative">
          {/* Tunnel Rings - Restored with original transform perspective */}
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none -z-5"
            style={{ perspective: "1000px" }}
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="tunnel-ring absolute inset-0 border rounded-full"
                style={{
                  scale: 1 + i * 0.5,
                  opacity: 0.35 - i * 0.1,
                  rotateX: 60,
                  willChange: "transform",
                  borderColor: "hsl(45 100% 50% / 0.8)",
                  boxShadow:
                    i === 0
                      ? "0 0 40px hsl(45 100% 50% / 0.6)"
                      : "0 0 26px hsl(45 100% 50% / 0.4)",
                }}
                animate={{
                  scale: [1 + i * 0.5, 1.2 + i * 0.5, 1 + i * 0.5],
                }}
                transition={{
                  scale: {
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
              />
            ))}
          </div>

          <div className="space-y-32">
            {timelineEvents.map((event, index) => (
              <TimelineCard
                key={event.year}
                event={event}
                index={index}
                isActive={activeIndex === index}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:hidden z-50">
        <motion.div
          className="glass-card px-4 py-2 flex items-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.5 }}
        >
          <span className="font-display text-lg text-amber-400 glow-text">
            {years[activeIndex]}
          </span>
          <div className="w-24 h-1 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full progress-glow progress-fill"
              style={{
                width: `${((activeIndex + 1) / years.length) * 100}%`,
              }}
              transition={{
                duration: 0.3,
                ease: [0.33, 1, 0.68, 1],
              }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TimeTunnel;
