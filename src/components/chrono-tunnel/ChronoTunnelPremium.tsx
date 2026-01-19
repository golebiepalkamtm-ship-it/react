import { useRef, useState, useMemo, useEffect, lazy, Suspense } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from "framer-motion";
import { Trophy, Medal, Award, ChevronDown } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const WebGLTunnel = lazy(() => import("./WebGLTunnel"));

interface YearData {
  year: number;
  title: string;
  achievements: string[];
  highlight: string;
}

const timelineData: YearData[] = [
  {
    year: 2024,
    title: "Sezon 2024",
    achievements: [
      "Oddział Kwisa 0489 – Kat A: MISTRZ Pałka MTM (124.53 coeff, 18 con)",
      "Oddział Kwisa 0489 – Kat B: MISTRZ Pałka MTM (245.78 coeff, 15 con)",
    ],
    highlight: "2 osiągnięcia",
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
    year: 2017,
    title: "Sezon 2017",
    achievements: [
      "Oddział Kwisa 0489 – Kat A: 1 Przodownik (348.53 coeff, 20 con)",
      "Oddział Kwisa 0489 – Kat B: 1 Przodownik (153.39 coeff, 16 con)",
    ],
    highlight: "2 osiągnięcia",
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
];

const getPositionIcon = (achievement: string) => {
  const lower = achievement.toLowerCase();
  if (lower.includes("mistrz polski") || lower.includes("mistrz regionu")) {
    return <Trophy className="w-5 h-5 text-gold drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]" />;
  }
  if (lower.includes("mistrz") && !lower.includes("wicemistrz") && !lower.includes("v-ce")) {
    return <Trophy className="w-4 h-4 text-gold/90" />;
  }
  if (lower.includes("wicemistrz") || lower.includes("v-ce")) {
    return <Medal className="w-4 h-4 text-gold/70" />;
  }
  return <Award className="w-4 h-4 text-gold/50" />;
};

const isSpecialAchievement = (achievement: string) => {
  const lower = achievement.toLowerCase();
  return lower.includes("mistrz polski") || lower.includes("mistrz regionu") || 
         (lower.includes("mp") && lower.includes("mistrz") && !lower.includes("wicemistrz") && !lower.includes("v-ce"));
};

interface TimelineCardProps {
  yearData: YearData;
  index: number;
  isActive: boolean;
  progress: number;
}

function TimelineCard({ yearData, index, isActive, progress }: TimelineCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 0.5, 1], [150, 0, -150]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.8, 1, 1, 0.8]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [25, 0, -25]);
  const z = useTransform(scrollYProgress, [0, 0.5, 1], [-200, 0, -200]);

  const isChampion = yearData.achievements.some(a => {
    const lower = a.toLowerCase();
    return (lower.includes("mp") && lower.includes("mistrz") && !lower.includes("wicemistrz") && !lower.includes("v-ce")) ||
           lower.includes("mistrz polski") || lower.includes("mistrz regionu");
  });

  return (
    <motion.div
      ref={cardRef}
      style={{ y, opacity, scale, rotateX, z }}
      className="relative mb-32 md:mb-40 preserve-3d"
    >
      <div className={`
        relative overflow-hidden rounded-2xl border backdrop-blur-xl
        ${isChampion 
          ? 'border-gold/60 bg-gradient-to-br from-gold-dark/50 via-zinc-900/90 to-gold-dark/40 shadow-[0_0_80px_rgba(212,175,55,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]' 
          : 'border-gold/30 bg-gradient-to-br from-zinc-800/95 via-zinc-900/95 to-zinc-800/95 shadow-[0_0_40px_rgba(212,175,55,0.15),inset_0_1px_0_rgba(255,255,255,0.05)]'
        }
      `}>
        {isChampion && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] animate-spin-slow">
              <div className="absolute inset-0 bg-gradient-conic from-gold/30 via-transparent to-gold/30" />
            </div>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/20 pointer-events-none" />
        
        <motion.div 
          className="absolute -top-10 left-1/2 -translate-x-1/2 w-[120%] h-32 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, ${isChampion ? 'rgba(212,175,55,0.5)' : 'rgba(212,175,55,0.35)'} 0%, transparent 60%)`,
          }}
          animate={{
            opacity: [0.7, 1, 0.7],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

        <div className="relative p-6 md:p-10">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <motion.div 
              className={`
                font-display text-4xl md:text-6xl font-black
                ${isChampion 
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-gold-light via-gold to-gold-light drop-shadow-[0_0_30px_rgba(212,175,55,0.7)]' 
                  : 'text-transparent bg-clip-text bg-gradient-to-r from-gold-light via-gold to-gold-light drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]'
                }
              `}
              animate={isActive ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {yearData.year}
            </motion.div>
            
            <div className="flex items-center gap-2 flex-wrap">
              {isChampion && (
                <motion.span 
                  className="px-3 py-1.5 text-xs font-bold rounded-full bg-gold/30 text-gold-light border border-gold/50 shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                  animate={{ 
                    boxShadow: ['0 0 15px rgba(212,175,55,0.3)', '0 0 30px rgba(212,175,55,0.6)', '0 0 15px rgba(212,175,55,0.3)']
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  MISTRZ POLSKI
                </motion.span>
              )}
              <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-white/10 text-white/80 border border-white/20">
                {yearData.highlight}
              </span>
            </div>
          </div>

          <div className="grid gap-2">
            {yearData.achievements.map((achievement, i) => (
              <motion.div 
                key={i}
                className={`
                  flex items-start gap-3 p-3 rounded-lg transition-colors
                  ${isSpecialAchievement(achievement)
                    ? 'bg-gold/10 border border-gold/20'
                    : 'bg-white/5 hover:bg-white/10'
                  }
                `}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                viewport={{ once: true }}
              >
                <div className="mt-0.5 flex-shrink-0">{getPositionIcon(achievement)}</div>
                <span className={`
                  text-sm md:text-base leading-relaxed
                  ${isSpecialAchievement(achievement)
                    ? 'text-gold-light font-medium'
                    : 'text-white/90'
                  }
                `}>
                  {achievement}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        />
      </div>
    </motion.div>
  );
}

interface StatsDisplayProps {
  mistrz: number;
  wicemistrz: number;
  przodownik: number;
}

function StatsDisplay({ mistrz, wicemistrz, przodownik }: StatsDisplayProps) {
  return (
    <motion.div 
      className="flex flex-wrap justify-center gap-6 md:gap-12"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      {[
        { label: "Mistrz", value: mistrz, icon: Trophy, color: "from-gold-light to-gold" },
        { label: "Wicemistrz", value: wicemistrz, icon: Medal, color: "from-gray-300 to-gray-400" },
        { label: "Przodownik", value: przodownik, icon: Award, color: "from-amber-600 to-amber-700" },
      ].map((stat, i) => (
        <motion.div 
          key={stat.label}
          className="text-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.7 + i * 0.1, type: "spring" }}
        >
          <div className={`
            inline-flex items-center justify-center w-16 h-16 rounded-full mb-2
            bg-gradient-to-br ${stat.color} shadow-lg
          `}>
            <stat.icon className="w-8 h-8 text-black/80" />
          </div>
          <div className="font-display text-3xl md:text-4xl font-bold text-white">
            {stat.value}
          </div>
          <div className="text-white/50 text-sm uppercase tracking-wider">
            {stat.label}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

export default function ChronoTunnelPremium() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [webglLoaded, setWebglLoaded] = useState(false);

  const items = useMemo(() => {
    return [...timelineData].sort((a, b) => a.year - b.year);
  }, []);

  const stats = useMemo(() => {
    let mistrz = 0;
    let wicemistrz = 0;
    let przodownik = 0;

    timelineData.forEach((event) => {
      event.achievements.forEach((achievement) => {
        const lower = achievement.toLowerCase();
        if (lower.includes("mistrz") && !lower.includes("wicemistrz") && !lower.includes("v-ce")) {
          mistrz++;
        }
        if (lower.includes("wicemistrz") || lower.includes("v-ce mistrz")) {
          wicemistrz++;
        }
        if (lower.includes("przodownik") || lower.includes("miejsce")) {
          przodownik++;
        }
      });
    });

    return { mistrz, wicemistrz, przodownik };
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, { 
    stiffness: 80, 
    damping: 25,
    mass: 0.5
  });

  const [scrollValue, setScrollValue] = useState(0);

  useMotionValueEvent(smoothProgress, "change", (v) => {
    setScrollValue(v);
    const idx = Math.min(items.length - 1, Math.max(0, Math.round(v * (items.length - 1))));
    setCurrentIndex(idx);
  });

  useEffect(() => {
    const timer = setTimeout(() => setWebglLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const progressFillScale = useTransform(smoothProgress, [0, 1], [0, 1]);
  const indicatorTop = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[600vh] bg-black"
      id="chrono-tunnel"
    >
      <div className="fixed inset-0 z-0">
        {webglLoaded && (
          <Suspense fallback={
            <div className="absolute inset-0 bg-gradient-radial from-gold-dark/20 via-black to-black" />
          }>
            <WebGLTunnel scrollProgress={scrollValue} />
          </Suspense>
        )}
      </div>

      <div className="fixed inset-0 z-5 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-60" />
      </div>

      <div className="sticky top-0 h-screen flex items-center justify-center z-10 pointer-events-none">
        <motion.div 
          className="text-center px-4"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.h1 
            className="font-display text-3xl md:text-4xl lg:text-5xl font-black mb-6"
            style={{
              background: 'linear-gradient(135deg, #fff 0%, #d4af37 50%, #fff 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              textShadow: '0 0 60px rgba(212,175,55,0.5)',
            }}
          >
            HISTORIA SUKCESÓW
          </motion.h1>
          <motion.p 
            className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Ponad 20 lat dominacji w hodowli gołębi pocztowych
          </motion.p>
          
          <StatsDisplay {...stats} />

          <motion.div 
            className="mt-16 flex flex-col items-center gap-2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-white/40 text-sm uppercase tracking-widest">Przewijaj</span>
            <ChevronDown className="w-6 h-6 text-gold/60" />
          </motion.div>
        </motion.div>
      </div>

      <div className="relative z-20 pt-[120vh] pb-[50vh]">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="perspective-1000 preserve-3d">
            {items.map((yearData, index) => (
              <TimelineCard
                key={yearData.year}
                yearData={yearData}
                index={index}
                isActive={index === currentIndex}
                progress={scrollValue}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 hidden lg:block">
        <div className="relative h-[60vh]">
          <div className="absolute left-1/2 -translate-x-1/2 h-full w-px bg-white/10" />
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 h-full w-px bg-gradient-to-b from-gold to-gold-dark origin-top"
            style={{ scaleY: progressFillScale }}
          />
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gold shadow-[0_0_20px_rgba(212,175,55,0.8)]"
            style={{ top: indicatorTop }}
          />
          
          <div className="absolute left-8 top-0 bottom-0 flex flex-col justify-between py-2">
            {items.filter((_, i) => i % 3 === 0).map((item, idx) => (
              <motion.div
                key={item.year}
                className={`text-xs transition-all duration-300 ${
                  items[currentIndex]?.year === item.year
                    ? 'text-gold font-bold'
                    : 'text-white/30'
                }`}
              >
                {item.year}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 lg:hidden">
        <motion.div 
          className="flex items-center gap-4 px-6 py-3 rounded-full bg-black/80 backdrop-blur-xl border border-white/10"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <span className="font-display text-2xl font-bold text-gold">
            {items[currentIndex]?.year}
          </span>
          <div className="w-24 h-1 rounded-full bg-white/10 overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-gold to-gold-dark"
              style={{ width: `${scrollValue * 100}%` }}
            />
          </div>
        </motion.div>
      </div>

      <motion.div 
        className="relative z-20 text-center py-32"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <p className="font-display text-3xl md:text-4xl text-white/30">
          Historia trwa...
        </p>
      </motion.div>
    </section>
  );
}
