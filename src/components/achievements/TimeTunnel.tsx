/**
 * TimeTunnel — Ultra-Luxury Cinematic Timeline
 * 
 * Orchestrates the complete experience:
 * - Split-text hero entrance
 * - Lenis smooth scrolling + GSAP parallax
 * - Aurora background + noise texture
 * - Luxury glass cards with medal system
 */

import { useRef, useState, useEffect, useMemo } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import TimelineCard from "./TimelineCard";
import ProgressBar from "./ProgressBar";
import ParticlesBackground from "./ParticlesBackground";
import StatsHeader from "./StatsHeader";
import useLenis from "@/hooks/useLenis";
import useParallax from "@/hooks/useParallax";

// --- DATA (unchanged) ---
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

const TimeTunnel = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useLenis();
  useParallax();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const stats = useMemo(() => {
    let mistrz = 0, wicemistrz = 0, przodownik = 0;
    timelineEvents.forEach((event) => {
      event.achievements.forEach((a) => {
        if (a.includes("Mistrz")) mistrz++;
        if (a.includes("Wicemistrz")) wicemistrz++;
        if (a.includes("Przodownik")) przodownik++;
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
    restDelta: 0.001,
  });

  const perspectiveZ = useTransform(smoothProgress, [0, 1], [0, -500]);
  const tunnelOpacity = useTransform(smoothProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

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

  // Split text for hero title
  const titleChars = "HISTORIA OSIĄGNIĘĆ".split("");

  return (
    <div ref={containerRef} className="relative min-h-[400vh]">
      {/* Background */}
      <div className="fixed inset-0 -z-10" style={{
        background: 'linear-gradient(175deg, hsl(230, 50%, 10%) 0%, hsl(225, 55%, 8%) 30%, hsl(220, 60%, 7%) 60%, hsl(225, 55%, 6%) 100%)'
      }} />

      {/* Parallax orbs */}
      <div className="fixed inset-0 -z-8 pointer-events-none overflow-hidden">
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, hsl(45 38% 47% / 0.4) 0%, transparent 70%)',
            filter: 'blur(80px)',
            top: '10%', left: '10%',
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-25"
          style={{
            background: 'radial-gradient(circle, hsl(45 38% 47% / 0.3) 0%, transparent 70%)',
            filter: 'blur(100px)',
            top: '40%', right: '5%',
          }}
        />
        <div
          className="absolute w-[350px] h-[350px] rounded-full opacity-35"
          style={{
            background: 'radial-gradient(circle, hsl(45 38% 47% / 0.5) 0%, transparent 70%)',
            filter: 'blur(60px)',
            bottom: '20%', left: '20%',
          }}
        />
        {/* Floating dots */}
        {[
          { top: '15%', left: '25%', size: 4, depth: 0.6 },
          { top: '35%', right: '30%', size: 3, depth: 0.7 },
          { top: '55%', left: '15%', size: 5, depth: 0.5 },
          { top: '75%', right: '20%', size: 2, depth: 0.8 },
        ].map((dot, i) => (
          <div
            key={i}
            className="float-parallax parallax-layer-front mouse-parallax absolute rounded-full bg-primary/30"
            data-depth={dot.depth}
            data-invert={i % 2 === 1 ? "true" : undefined}
            style={{
              width: dot.size,
              height: dot.size,
              top: dot.top,
              left: dot.left,
              right: (dot as any).right,
            }}
          />
        ))}
      </div>

      <ParticlesBackground />

      {/* Radial center glow */}
      <motion.div
        className="fixed inset-0 -z-5 pointer-events-none"
        style={{ opacity: tunnelOpacity }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.08) 0%, transparent 55%)',
          }}
        />
      </motion.div>

      <ProgressBar years={years} activeIndex={activeIndex} />

      {/* Tunnel rings - REMOVED */}
      <div className="fixed top-0 left-0 right-0 h-screen overflow-hidden tunnel-perspective pointer-events-none">
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{ z: perspectiveZ }}
        >
          {/* Rings removed */}
        </motion.div>
      </div>

      {/* Timeline Content */}
      <div className="relative z-10 pt-20 pb-[50vh] px-4 md:px-16 lg:px-24 max-w-7xl mx-auto">
        
        {/* ==========================================
         * HERO SECTION — Cinematic Split-Text Entrance
         * ========================================== */}
        <motion.div
          className="hero-section text-center mb-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Luxury overline */}
          <motion.div
            className="mb-8 flex items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="luxury-divider w-24 h-[3px] bg-yellow-500 shadow-[0_0_25px_rgba(255,215,0,1)]" />
            <span className="text-sm md:text-base tracking-[0.4em] uppercase text-yellow-400 font-black drop-shadow-[0_0_15px_rgba(255,215,0,1)] shadow-gold">
              2001 — 2024
            </span>
            <div className="luxury-divider w-24 h-[3px] bg-yellow-500 shadow-[0_0_25px_rgba(255,215,0,1)]" />
          </motion.div>

          {/* Split-text title — each char animates individually */}
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-none text-gold">
            {titleChars.map((char, i) => (
              <motion.span
                key={i}
                className="split-char"
                initial={{ 
                  opacity: 0, 
                  y: 80, 
                  rotateX: 90,
                }}
                animate={isLoaded ? { 
                  opacity: 1, 
                  y: 0, 
                  rotateX: 0,
                } : {}}
                transition={{
                  duration: 0.8,
                  delay: 0.5 + i * 0.035,
                  ease: [0.16, 1, 0.3, 1], // expo.out
                }}
                style={{
                  color: char === " " ? "transparent" : undefined,
                  width: char === " " ? "0.3em" : undefined,
                }}
              >
                <span className="text-gold">
                  {char === " " ? "\u00A0" : char}
                </span>
              </motion.span>
            ))}
          </h1>

          {/* Subtitle */}
          <motion.p
            className="hero-subtitle text-gold/70 text-base md:text-lg lg:text-xl max-w-xl mx-auto mb-12 font-light tracking-wide"
            initial={{ opacity: 0, y: 30 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            Przewijaj czas i odkryj historię sukcesów
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <StatsHeader
              mistrz={stats.mistrz}
              wicemistrz={stats.wicemistrz}
              przodownik={stats.przodownik}
            />
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="scroll-indicator mt-16 flex flex-col items-center gap-3"
            initial={{ opacity: 0 }}
            animate={isLoaded ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 2 }}
          >
            <span className="text-xs tracking-[0.3em] uppercase text-yellow-400 font-extrabold drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]">
              Scroll
            </span>
            <div className="w-[2px] h-16 relative overflow-hidden bg-yellow-900/30 rounded-full">
              <motion.div
                className="w-full bg-yellow-400 shadow-[0_0_15px_rgba(255,215,0,1)]"
                style={{ height: "50%" }}
                animate={{ y: ["-100%", "200%"] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: [0.16, 1, 0.3, 1],
                  repeatDelay: 0.2,
                }}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Timeline Cards */}
        {timelineEvents.map((event, index) => (
          <div key={event.year}>
            <TimelineCard
              event={event}
              index={index}
              isActive={index === activeIndex}
            />
          </div>
        ))}

        {/* Footer */}
        <motion.div
          className="footer-section text-center pt-24 pb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="luxury-divider w-32 mx-auto mb-8"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
          />
          <motion.p
            className="footer-text font-serif text-2xl md:text-3xl text-muted-foreground italic"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
          >
            Historia trwa...
          </motion.p>
        </motion.div>
      </div>

      {/* Mobile Progress */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 lg:hidden z-50">
        <motion.div
          className="glass-card px-5 py-2.5 flex items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 2 }}
        >
          <span className="font-display text-base text-primary glow-text">
            {years[activeIndex]}
          </span>
          <div className="w-20 h-[2px] rounded-full bg-border/30 overflow-hidden">
            <motion.div
              className="h-full progress-glow"
              animate={{ width: `${((activeIndex + 1) / years.length) * 100}%` }}
              transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TimeTunnel;
