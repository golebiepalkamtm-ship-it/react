import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useScroll } from "framer-motion";
import { Award, Medal, Trophy } from "lucide-react";
import { gsap, ScrollTrigger } from '@/lib/gsapConfig';

type TimelineEvent = {
  year: number;
  title: string;
  achievements: string[];
  highlight?: string;
};

const timelineEvents: TimelineEvent[] = [
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
      "Oddział Łużyce Lubań 0446 – Kat A: MISTRZ* (82.33 coeff, 20 con)",
      "Oddział Łużyce Lubań 0446 – Kat B: MISTRZ* (81.43 coeff, 16 con)",
      "Oddział Łużyce Lubań 0446 – Kat C: II/III V-ce MISTRZ* (348.08 coeff, 9 con)",
      "Oddział Łużyce Lubań 0446 – Kat M: I V-ce MISTRZ* (130.47 coeff, 6 con)",
      "Oddział Łużyce Lubań 0446 – Kat Młode: I V-ce MISTRZ* (160.61 coeff, 15 con)",
      "Okręg Jelenia Góra – Kat A: MISTRZ (82.33 coeff, 20 con)",
      "Okręg Jelenia Góra – Kat B: MISTRZ (81.43 coeff, 16 con)",
      "Okręg Jelenia Góra – Kat C: 16. Przodownik (348.08 coeff, 9 con)",
      "Okręg Jelenia Góra – Kat M: 1. Przodownik (130.47 coeff, 6 con)",
      "Okręg Jelenia Góra – Kat Młode: I V-ce MISTRZ (160.61 coeff, 15 con)",
      "Generalne – I V-ce MISTRZ (1401.99 coeff, 32 con)",
    ],
    highlight: "11 osiągnięć",
  },
  {
    year: 2010,
    title: "Sezon 2010",
    achievements: [
      "Oddział Łużyce Lubań 0446 – Kat A: I V-ce MISTRZ* (293.79 coeff, 20 con)",
      "Oddział Łużyce Lubań 0446 – Kat B: MISTRZ* (62.47 coeff, 16 con)",
      "Oddział Łużyce Lubań 0446 – Kat H: I V-ce MISTRZ* (975.71 coeff, 18 con)",
      "Oddział Łużyce Lubań 0446 – Kat Młode: MISTRZ* (245.86 coeff, 15 con)",
      "Oddział Łużyce Lubań 0446 – Kat Roczne: MISTRZ* (1692.16 coeff, 34 con)",
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
      "Oddział Kwisa 0489 – Kat A: Mistrz (82.76 coeff)",
      "Oddział Kwisa 0489 – Kat B: Mistrz (130.64 coeff)",
      "Oddział Kwisa 0489 – Kat Młode GMP: 1 miejsce (931.51 pkt)",
      "Oddział Kwisa 0489 – Kat Młode Derby: 7 miejsce (591.85 pkt, 2752.677 coeff)",
      "Oddział Kwisa 0489 – Kat Młode 5 gołębi: 1 miejsce (181.10 pkt, 2807.786 coeff)",
      "Oddział Kwisa 0489 – Kat Młode Total: 1 miejsce (109.88 pkt, 73.7% coeff)",
    ],
    highlight: "6 osiągnięć",
  },
  {
    year: 2020,
    title: "Sezon 2020",
    achievements: [
      "Oddział Kwisa 0489 – Kat A: Mistrz (69.22 coeff, 18 con)",
      "Oddział Kwisa 0489 – Kat B: Mistrz (82.03 coeff, 15 con)",
      "Oddział Kwisa 0489 – Kat C: Mistrz (561.95 coeff, 9 con)",
      "Oddział Kwisa 0489 – Kat D: Mistrz (713.20 coeff, 42 con)",
      "Okręg Jelenia Góra (nieuznane) – Kat A: 3 Przodownik (69.22 coeff, 18 con)",
      "Okręg Jelenia Góra (nieuznane) – Kat B: I V-ce Mistrz (81.30 coeff, 15 con)",
      "Okręg Jelenia Góra (nieuznane) – Kat C: 2 Przodownik (561.95 coeff, 9 con)",
      "Okręg Jelenia Góra (nieuznane) – Kat D: Mistrz (713.20 coeff, 42 con)",
      "Region V (nieuznane) – Kat A: I V-ce Mistrz (63.82 coeff, 18 con)",
      "Region V (nieuznane) – Kat B: I V-ce Mistrz (70.75 coeff, 15 con)",
      "Region V (nieuznane) – Kat C: 12 Przodownik (561.95 coeff, 9 con)",
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
];

const StatsHeader = ({
  mistrz,
  wicemistrz,
  przodownik,
}: {
  mistrz: number;
  wicemistrz: number;
  przodownik: number;
}) => {
  const stats = [
    {
      label: "Mistrz",
      value: mistrz,
      icon: Trophy,
      color: "text-gold",
      bgColor: "from-gold/20 to-gold-dark/5",
      borderColor: "border-gold/30",
      glowColor: "shadow-gold/20",
    },
    {
      label: "Wicemistrz",
      value: wicemistrz,
      icon: Medal,
      color: "text-gray-300",
      bgColor: "from-gray-300/20 to-gray-500/5",
      borderColor: "border-gray-300/30",
      glowColor: "shadow-gray-300/20",
    },
    {
      label: "Przodownik",
      value: przodownik,
      icon: Award,
      color: "text-amber-600",
      bgColor: "from-amber-600/20 to-amber-800/5",
      borderColor: "border-amber-600/30",
      glowColor: "shadow-amber-600/20",
    },
  ];

  return (
    <motion.div
      className="flex flex-wrap justify-center gap-4 md:gap-8 mb-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          className={`relative flex items-center gap-3 px-5 py-3 md:px-6 md:py-4 rounded-2xl border ${stat.borderColor} bg-gradient-to-br ${stat.bgColor} backdrop-blur-md shadow-lg ${stat.glowColor}`}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 + index * 0.15 }}
          whileHover={{
            scale: 1.05,
            boxShadow: "0 0 30px hsl(var(--primary) / 0.3)",
          }}
        >
          <motion.div
            className="relative"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }}
          >
            <stat.icon className={`w-6 h-6 md:w-8 md:h-8 ${stat.color}`} />
            <motion.div
              className={`absolute inset-0 ${stat.color} blur-md opacity-50`}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>

          <div className="flex flex-col">
            <motion.span
              className="text-2xl md:text-3xl font-bold text-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 + index * 0.2 }}
            >
              {stat.value}
            </motion.span>
            <span className="text-xs md:text-sm text-muted-foreground font-medium">
              {stat.label}
            </span>
          </div>

          <motion.div
            className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{ duration: 3, repeat: Infinity, delay: index * 0.5, repeatDelay: 2 }}
          >
            <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  );
};

const TimelineCard = ({ event, index, isActive }: { event: TimelineEvent; index: number; isActive: boolean }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLSpanElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const isEven = index % 2 === 0;

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { stiffness: 150, damping: 15, mass: 0.1 };
  const rotateXMouse = useSpring(useTransform(mouseY, [-0.5, 0.5], [18, -18]), springConfig);
  const rotateYMouse = useSpring(useTransform(mouseX, [-0.5, 0.5], [-18, 18]), springConfig);
  
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

  useEffect(() => {
    if (!containerRef.current || !cardRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          end: "top 25%",
          toggleActions: "play none none reverse",
        }
      });

      tl.fromTo(cardRef.current, 
        {
          opacity: 0,
          scale: 0.75,
          y: 120,
          rotateX: isEven ? -30 : 30,
          rotateY: isEven ? 40 : -40,
          transformPerspective: 1200,
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          rotateX: 0,
          rotateY: 0,
          duration: 1.4,
          ease: "power4.out",
        }
      );

      if (yearRef.current) {
        tl.fromTo(yearRef.current,
          {
            opacity: 0,
            x: isEven ? -100 : 100,
            scale: 0.4,
            rotateZ: isEven ? -10 : 10,
          },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            rotateZ: 0,
            duration: 1,
            ease: "back.out(2)",
          },
          "-=1"
        );
      }

      if (contentRef.current) {
        const items = contentRef.current.querySelectorAll('li');
        tl.fromTo(items,
          {
            opacity: 0,
            x: -40,
            y: 25,
            scale: 0.9,
          },
          {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.06,
            ease: "power3.out",
          },
          "-=0.6"
        );
      }

      gsap.to(cardRef.current, {
        y: -40,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 2,
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, [isEven, index]);

  return (
    <div
      ref={containerRef}
      className="tunnel-card relative mb-24 md:mb-32"
    >
      <div className="flex flex-col items-center gap-4 md:flex-row md:justify-center md:gap-8" style={{ perspective: "1400px", transformStyle: "preserve-3d" }}>
        
        <motion.div
          className={`hidden md:flex items-center justify-center shrink-0 ${isEven ? "md:order-3" : "md:order-3"}`}
        >
          <span
            ref={yearRef}
            className="year-ghost text-[6rem] lg:text-[9rem] font-display font-black leading-none text-primary/20"
            style={{ textShadow: "0 0 30px rgba(255,215,0,0.35), 0 0 60px rgba(255,215,0,0.2)" }}
          >
            {event.year}
          </span>
        </motion.div>

        <motion.div
          ref={cardRef}
          className={`relative w-full md:w-[52%] lg:w-[46%] max-w-[600px] ${isEven ? "md:order-1" : "md:order-5"}`}
          style={{ 
            transformStyle: "preserve-3d",
            rotateX: isHovered ? rotateXMouse : 0,
            rotateY: isHovered ? rotateYMouse : 0,
            zIndex: isEven ? 100 + (index * 5) : 50 + (index * 3),
          }}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
        >
          {/* 3D Card with thickness - Back face (shadow) */}
          <div 
            className="absolute inset-0 rounded-3xl bg-black"
            style={{ 
              transform: `translateZ(${isEven ? '-85px' : '-70px'})`,
              filter: "blur(30px)",
              opacity: 0.95,
            }}
          />
          
          {/* 3D Card edges - Left (jasne złoto) */}
          <div 
            className="absolute left-0 top-[24px] bottom-[24px] w-[35px]"
            style={{ 
              transform: `rotateY(-90deg) translateZ(${isEven ? '15px' : '10px'})`,
              transformOrigin: "left",
              background: `
                linear-gradient(180deg, 
                  rgba(220,180,100,1) 0%, 
                  rgba(238,200,85,1) 12%,
                  rgba(255,235,150,1) 25%,
                  rgba(255,245,200,1) 40%,
                  rgba(255,250,220,1) 50%,
                  rgba(255,245,200,1) 60%,
                  rgba(255,235,150,1) 75%,
                  rgba(238,200,85,1) 88%,
                  rgba(220,180,100,1) 100%
                )
              `,
              borderRadius: "0 20px 20px 0",
              boxShadow: "inset -4px 0 20px rgba(255,235,150,0.3), inset 4px 0 25px rgba(255,245,200,0.5)",
            }}
          >
            {/* Polyskujący akcent na lewym boku 3D */}
            <motion.div
              className="absolute inset-y-[15%] right-[10px] w-[4px]"
              style={{
                background: 'linear-gradient(180deg, transparent 0%, rgba(255,245,200,1) 50%, transparent 100%)',
                boxShadow: '0 0 20px rgba(255,235,150,1)',
              }}
              animate={{
                opacity: [0.6, 1, 0.6],
              }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          
          {/* 3D Card edges - Right (jasne złoto) */}
          <div 
            className="absolute right-0 top-[24px] bottom-[24px] w-[35px]"
            style={{ 
              transform: `rotateY(90deg) translateZ(${isEven ? '15px' : '10px'})`,
              transformOrigin: "right",
              background: `
                linear-gradient(180deg, 
                  rgba(220,180,100,1) 0%, 
                  rgba(238,200,85,1) 12%,
                  rgba(255,235,150,1) 25%,
                  rgba(255,245,200,1) 40%,
                  rgba(255,250,220,1) 50%,
                  rgba(255,245,200,1) 60%,
                  rgba(255,235,150,1) 75%,
                  rgba(238,200,85,1) 88%,
                  rgba(220,180,100,1) 100%
                )
              `,
              borderRadius: "20px 0 0 20px",
              boxShadow: "inset 4px 0 20px rgba(255,235,150,0.3), inset -4px 0 25px rgba(255,245,200,0.5)",
            }}
          >
            {/* Polyskujący akcent na prawym boku 3D */}
            <motion.div
              className="absolute inset-y-[15%] left-[10px] w-[4px]"
              style={{
                background: 'linear-gradient(180deg, transparent 0%, rgba(255,245,200,1) 50%, transparent 100%)',
                boxShadow: '0 0 20px rgba(255,235,150,1)',
              }}
              animate={{
                opacity: [0.6, 1, 0.6],
              }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1.75 }}
            />
          </div>
          
          {/* 3D Card edges - Top (jasne złoto) */}
          <div 
            className="absolute top-0 left-[24px] right-[24px] h-[35px]"
            style={{ 
              transform: `rotateX(90deg) translateZ(${isEven ? '15px' : '10px'})`,
              transformOrigin: "top",
              background: `
                linear-gradient(90deg, 
                  rgba(220,180,100,1) 0%, 
                  rgba(238,200,85,1) 12%,
                  rgba(255,235,150,1) 25%,
                  rgba(255,245,200,1) 40%,
                  rgba(255,250,220,1) 50%,
                  rgba(255,245,200,1) 60%,
                  rgba(255,235,150,1) 75%,
                  rgba(238,200,85,1) 88%,
                  rgba(220,180,100,1) 100%
                )
              `,
              borderRadius: "0 0 20px 20px",
              boxShadow: "inset 0 -4px 20px rgba(255,235,150,0.3), inset 0 4px 25px rgba(255,245,200,0.5)",
            }}
          >
            {/* Polyskujący akcent na górnym boku 3D */}
            <motion.div
              className="absolute inset-x-[15%] bottom-[10px] h-[4px]"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,245,200,1) 50%, transparent 100%)',
                boxShadow: '0 0 20px rgba(255,235,150,1)',
              }}
              animate={{
                opacity: [0.6, 1, 0.6],
              }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.875 }}
            />
          </div>
          
          {/* 3D Card edges - Bottom (jasne złoto) */}
          <div 
            className="absolute bottom-0 left-[24px] right-[24px] h-[35px]"
            style={{ 
              transform: `rotateX(-90deg) translateZ(${isEven ? '15px' : '10px'})`,
              transformOrigin: "bottom",
              background: `
                linear-gradient(90deg, 
                  rgba(220,180,100,1) 0%, 
                  rgba(238,200,85,1) 12%,
                  rgba(255,235,150,1) 25%,
                  rgba(255,245,200,1) 40%,
                  rgba(255,250,220,1) 50%,
                  rgba(255,245,200,1) 60%,
                  rgba(255,235,150,1) 75%,
                  rgba(238,200,85,1) 88%,
                  rgba(220,180,100,1) 100%
                )
              `,
              borderRadius: "20px 20px 0 0",
              boxShadow: "inset 0 4px 20px rgba(255,235,150,0.3), inset 0 -4px 25px rgba(255,245,200,0.5)",
            }}
          >
            {/* Polyskujący akcent na dolnym boku 3D */}
            <motion.div
              className="absolute inset-x-[15%] top-[10px] h-[4px]"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,245,200,1) 50%, transparent 100%)',
                boxShadow: '0 0 20px rgba(255,235,150,1)',
              }}
              animate={{
                opacity: [0.6, 1, 0.6],
              }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 2.625 }}
            />
          </div>
          
          {/* Main card front face with gradient border */}
          <div
            className="relative overflow-visible rounded-[50px] p-[6px]"
            style={{
              transform: `translateZ(${isEven ? '85px' : '70px'})`,
              background: 'linear-gradient(135deg, rgba(180,140,70,1) 0%, rgba(220,180,100,1) 25%, rgba(255,215,120,1) 50%, rgba(220,180,100,1) 75%, rgba(180,140,70,1) 100%)',
              boxShadow: `
                0 ${isEven ? '25px' : '20px'} ${isEven ? '80px' : '70px'} rgba(0,0,0,0.9),
                0 10px 40px rgba(0,0,0,0.8),
                0 0 40px rgba(220,180,100,0.5),
                0 0 60px rgba(255,215,120,0.4)
              `,
            }}
          >
          {/* Polyskujące boki powierzchni przedniej - lewy */}
          <motion.div
            className="absolute left-[6px] top-[6px] bottom-[6px] w-[3px] pointer-events-none z-30"
            style={{
              background: 'linear-gradient(180deg, transparent 0%, rgba(120,90,40,0.75) 30%, rgba(139,105,49,0.8) 50%, rgba(120,90,40,0.75) 70%, transparent 100%)',
              boxShadow: '0 0 12px rgba(120,85,35,0.45)',
              borderRadius: '44px 0 0 44px',
            }}
            animate={{
              opacity: [0.4, 0.9, 0.4],
            }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Polyskujące boki - prawy */}
          <motion.div
            className="absolute right-[6px] top-[6px] bottom-[6px] w-[3px] pointer-events-none z-30"
            style={{
              background: 'linear-gradient(180deg, transparent 0%, rgba(115,85,35,0.7) 30%, rgba(130,95,42,0.75) 50%, rgba(115,85,35,0.7) 70%, transparent 100%)',
              boxShadow: '0 0 12px rgba(115,85,35,0.35)',
              borderRadius: '0 44px 44px 0',
            }}
            animate={{
              opacity: [0.5, 0.95, 0.5],
            }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1.75 }}
          />
          
          {/* Polyskujące boki - górny */}
          <motion.div
            className="absolute top-[6px] left-[6px] right-[6px] h-[3px] pointer-events-none z-30"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(110,80,32,0.65) 30%, rgba(125,90,38,0.75) 50%, rgba(110,80,32,0.65) 70%, transparent 100%)',
              boxShadow: '0 0 10px rgba(110,80,32,0.35)',
              borderRadius: '44px 44px 0 0',
            }}
            animate={{
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.875 }}
          />
          
          {/* Polyskujące boki - dolny */}
          <motion.div
            className="absolute bottom-[6px] left-[6px] right-[6px] h-[3px] pointer-events-none z-30"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(105,75,28,0.6) 30%, rgba(120,85,35,0.7) 50%, rgba(105,75,28,0.6) 70%, transparent 100%)',
              boxShadow: '0 0 10px rgba(105,75,28,0.3)',
              borderRadius: '0 0 44px 44px',
            }}
            animate={{
              opacity: [0.5, 0.85, 0.5],
            }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 2.625 }}
          />
          
          {/* Subtelny blask matowej powierzchni */}
          <motion.div
            className="absolute inset-[6px] rounded-[44px] pointer-events-none z-20"
            animate={{
              opacity: isHovered ? 0.2 : 0,
            }}
            style={{
              background: 'radial-gradient(circle at center, rgba(140,100,35,0.25) 0%, transparent 60%)',
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Szkło - intensywny górny lewy refleks */}
          <div
            className="absolute top-[6px] left-[6px] w-[65%] h-[65%] rounded-[44px] pointer-events-none z-24"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.25) 20%, rgba(255,245,200,0.15) 40%, transparent 60%)',
              filter: 'blur(50px)',
              opacity: 0.9,
            }}
          />

          {/* Szkło - środkowy refleks */}
          <div
            className="absolute top-[20%] left-[15%] w-[50%] h-[40%] rounded-[44px] pointer-events-none z-24"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.3) 0%, transparent 50%)',
              filter: 'blur(60px)',
              opacity: 0.7,
            }}
          />

          {/* Szkło - dolny refleks */}
          <div
            className="absolute bottom-[6px] right-[6px] w-[50%] h-[50%] rounded-[44px] pointer-events-none z-24"
            style={{
              background: 'radial-gradient(ellipse at bottom right, rgba(255,255,255,0.25) 0%, rgba(255,235,150,0.1) 30%, transparent 60%)',
              filter: 'blur(45px)',
              opacity: 0.8,
            }}
          />
          
          <div
            className="relative overflow-hidden p-8 md:p-10 rounded-[44px]"
            style={{
              background: 'linear-gradient(135deg, rgba(101,67,33,0.92) 0%, rgba(85,56,28,0.9) 40%, rgba(72,48,24,0.92) 100%)',
              boxShadow: `
                inset 0 0 50px rgba(139,105,49,0.25),
                inset 0 0 25px rgba(0,0,0,0.3),
                inset 0 2px 5px rgba(120,85,35,0.2)
              `,
              backdropFilter: 'blur(10px) saturate(1.3) brightness(1.05) contrast(1.1)',
              WebkitBackdropFilter: 'blur(10px) saturate(1.3) brightness(1.05) contrast(1.1)',
            }}
          >
          <div ref={contentRef}>
            <div className="md:hidden mb-4">
              <span className="font-display text-5xl font-bold text-primary/30">{event.year}</span>
            </div>

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

            <h3 
              className="text-2xl md:text-3xl font-semibold text-foreground mb-4 leading-tight"
              style={{ 
                transform: "translateZ(40px)", 
                transformStyle: "preserve-3d",
                textShadow: '0 2px 8px rgba(0,0,0,0.7), 0 1px 2px rgba(0,0,0,0.9)'
              }}
            >
              {event.title}
            </h3>

            <ul className="space-y-2 text-sm md:text-base text-muted-foreground" style={{ 
              transform: "translateZ(20px)",
              textShadow: '0 1px 4px rgba(0,0,0,0.6)'
            }}>
              {event.achievements.map((achievement, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2"
                  style={{ transform: `translateZ(${10 + i * 2}px)` }}
                >
                  <motion.span
                    className="text-primary mt-1 text-xs drop-shadow-[0_0_6px_rgba(255,215,0,0.6)]"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
                  >
                    ●
                  </motion.span>
                  <span className="drop-shadow-sm">{achievement}</span>
                </li>
              ))}
            </ul>

            <motion.div
              className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-primary via-glow-secondary to-transparent rounded-full"
              style={{ boxShadow: "0 0 20px hsl(var(--primary) / 0.5), 0 0 40px hsl(var(--primary) / 0.3)" }}
              initial={{ width: "0%" }}
              whileInView={{ width: "100%" }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          </div>
          </div>
          </div>
        </motion.div>

        {/* Connector line between card and year */}
        <div className={`hidden md:flex items-center shrink-0 ${isEven ? "md:order-2" : "md:order-4"}`}>
          <motion.div
            className="w-16 h-[2px] progress-glow rounded-full"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
};

const particlePresets = Array.from({ length: 120 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 5 + 1,
  duration: Math.random() * 8 + 4,
  delay: Math.random() * 3,
  offsetX: Math.random() * 150 - 75,
}));

const ParticlesBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-50">
      {particlePresets.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-primary/30"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -300, 0],
            x: [0, particle.offsetX, 0],
            opacity: [0, 1, 0],
            scale: [0.5, 2, 0.5],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

const ChronoTunnel = () => {
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

  const perspectiveZ = useTransform(smoothProgress, [0, 1], [0, -500]);
  const tunnelOpacity = useTransform(smoothProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (value) => {
      const newIndex = Math.min(Math.floor(value * timelineEvents.length), timelineEvents.length - 1);
      setActiveIndex(newIndex);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  const stats = useMemo(() => {
    let mistrz = 0;
    let wicemistrz = 0;
    let przodownik = 0;

    timelineEvents.forEach((event) => {
      event.achievements.forEach((achievement) => {
        if (achievement.includes("Mistrz")) mistrz++;
        if (achievement.includes("Wicemistrz")) wicemistrz++;
        if (achievement.includes("Przodownik")) przodownik++;
      });
    });

    return { mistrz, wicemistrz, przodownik };
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-[400vh]">
      <div className="fixed inset-0 bg-tunnel grid-overlay -z-40" />

      <div className="fixed inset-0 -z-50 pointer-events-none overflow-hidden">
        <div className="float-parallax absolute w-4 h-4 rounded-full bg-primary/40" style={{ top: "15%", left: "25%" }} />
        <div className="float-parallax absolute w-3 h-3 rounded-full bg-primary/30" style={{ top: "35%", right: "30%" }} />
        <div className="float-parallax absolute w-5 h-5 rounded-full bg-glow-secondary/40" style={{ top: "55%", left: "15%" }} />
        <div className="float-parallax absolute w-2 h-2 rounded-full bg-primary/50" style={{ top: "75%", right: "20%" }} />
        <div className="float-parallax absolute w-6 h-6 rounded-full bg-primary/20" style={{ top: "25%", right: "10%" }} />
      </div>

      <ParticlesBackground />

      <div className="relative z-10 pt-32 md:pt-48 pb-20 px-2 md:px-6 lg:px-8 max-w-none">
        {/* Stats Header - Przesunięte na samą górę */}
        <motion.div
          className="text-center mb-24 md:mb-32"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <StatsHeader mistrz={stats.mistrz} wicemistrz={stats.wicemistrz} przodownik={stats.przodownik} />
        </motion.div>

        {timelineEvents.map((event, index) => (
          <div key={event.year} className="timeline-parallax">
            <TimelineCard event={event} index={index} isActive={index === activeIndex} />
          </div>
        ))}

        <motion.div
          className="text-center pt-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <p className="font-display text-2xl text-muted-foreground">Historia trwa...</p>
        </motion.div>
      </div>
    </div>
  );
};

export default ChronoTunnel;
