export type AchievementEntry = {
  region: string;
  category: string;
  position: string;
  points: string;
  count: string;
};

export type AchievementSeason = {
  year: string;
  achievements: AchievementEntry[];
};

/**
 * Pełna historia osiągnięć hodowli.
 * Struktura pozostaje kompatybilna z TimelineSection (rok + lista osiągnięć).
 */
export const achievementsHistory: AchievementSeason[] = [
  {
    year: "2024",
    achievements: [
      { region: "Oddział Kwisa 0489", category: "A", position: "MISTRZ Pałka MTM", points: "124.53", count: "18" },
      { region: "Oddział Kwisa 0489", category: "B", position: "MISTRZ Pałka MTM", points: "245.78", count: "15" }
    ],
  },
  {
    year: "2023",
    achievements: [
      { region: "Oddział Kwisa 0489", category: "A", position: "MISTRZ Pałka MTM", points: "184.75", count: "18" },
      { region: "Oddział Kwisa 0489", category: "B", position: "I V-ce MISTRZ Pałka MTM", points: "286.13", count: "15" }
    ],
  },
  {
    year: "2020",
    achievements: [
      { region: "Oddział Kwisa 0489", category: "A", position: "Mistrz", points: "69.22", count: "18" },
      { region: "Oddział Kwisa 0489", category: "B", position: "Mistrz", points: "82.03", count: "15" },
      { region: "Oddział Kwisa 0489", category: "C", position: "Mistrz", points: "561.95", count: "9" },
      { region: "Oddział Kwisa 0489", category: "D", position: "Mistrz", points: "713.20", count: "42" },
      { region: "Okręg Jelenia Góra (wyniki nieuznane / anulowane)", category: "A", position: "3 Przodownik", points: "69.22", count: "18" },
      { region: "Okręg Jelenia Góra (wyniki nieuznane / anulowane)", category: "B", position: "I V-ce Mistrz", points: "81.30", count: "15" },
      { region: "Okręg Jelenia Góra (wyniki nieuznane / anulowane)", category: "C", position: "2 Przodownik", points: "561.95", count: "9" },
      { region: "Okręg Jelenia Góra (wyniki nieuznane / anulowane)", category: "D", position: "Mistrz", points: "713.20", count: "42" },
      { region: "Region V (nieuznane)", category: "A", position: "I V-ce Mistrz", points: "63.82", count: "18" },
      { region: "Region V (nieuznane)", category: "B", position: "I V-ce Mistrz", points: "70.75", count: "15" },
      { region: "Region V (nieuznane)", category: "C", position: "12 Przodownik", points: "561.95", count: "9" },
      { region: "Region V (nieuznane)", category: "D", position: "7 Przodownik", points: "713.20", count: "42" },
      { region: "MP (nieuznane)", category: "A", position: "I V-ce Mistrz", points: "63.82", count: "18" },
      { region: "MP (nieuznane)", category: "B", position: "I V-ce Mistrz", points: "70.75", count: "15" },
      { region: "MP (nieuznane)", category: "C", position: "~70 Przodownik", points: "561.95", count: "9" },
      { region: "MP (nieuznane)", category: "D", position: "~50 Przodownik", points: "713.20", count: "42" }
    ],
  },
  {
    year: "2019",
    achievements: [
      { region: "Oddział Kwisa 0489", category: "A", position: "Mistrz", points: "82.76", count: "-" },
      { region: "Oddział Kwisa 0489", category: "B", position: "Mistrz", points: "130.64", count: "-" },
      { region: "Oddział Kwisa 0489", category: "Młode GMP", position: "1 miejsce", points: "931.51", count: "-" },
      { region: "Oddział Kwisa 0489", category: "Młode Derby", position: "7 miejsce", points: "591.85", count: "-" },
      { region: "Oddział Kwisa 0489", category: "Młode 5 gołębi", position: "1 miejsce", points: "181.10", count: "-" },
      { region: "Oddział Kwisa 0489", category: "Młode Total", position: "1 miejsce", points: "109.88", count: "-" }
    ],
  },
  {
    year: "2018",
    achievements: [
      { region: "Oddział Kwisa 0489", category: "A", position: "Mistrz", points: "29.38", count: "18" },
      { region: "Oddział Kwisa 0489", category: "B", position: "Mistrz", points: "35.74", count: "15" },
      { region: "Oddział Kwisa 0489", category: "Total", position: "XIII Przodownik", points: "942.69", count: "43" },
      { region: "Oddział Kwisa 0489", category: "Młode 5 gołębi", position: "57 miejsce", points: "239.98", count: "5" },
      { region: "Oddział Kwisa 0489", category: "Młode Główna", position: "59 miejsce", points: "109.32", count: "4" }
    ],
  },
  {
    year: "2017",
    achievements: [
      { region: "Oddział Kwisa 0489", category: "A", position: "1 Przodownik", points: "348.53", count: "20" },
      { region: "Oddział Kwisa 0489", category: "B", position: "1 Przodownik", points: "153.39", count: "16" }
    ],
  },
  {
    year: "2015",
    achievements: [
      { region: "Oddział Łużyce Lubań 0446", category: "A", position: "I Mistrz", points: "86.77", count: "20" },
      { region: "Oddział Łużyce Lubań 0446", category: "B", position: "I Mistrz", points: "237.95", count: "16" },
      { region: "Oddział Łużyce Lubań 0446", category: "C", position: "I Mistrz", points: "199.65", count: "9" },
      { region: "Oddział Łużyce Lubań 0446", category: "D", position: "I Mistrz", points: "520.82", count: "45" },
      { region: "Okręg Jelenia Góra", category: "A", position: "Mistrz", points: "86.77", count: "20" },
      { region: "Region V", category: "A", position: "Mistrz", points: "86.77", count: "20" },
      { region: "MP", category: "A", position: "Mistrz", points: "86.77", count: "20" },
      { region: "MP", category: "B", position: "1 Przodownik", points: "71.68", count: "16" }
    ],
  },
  {
    year: "2014",
    achievements: [
      { region: "Oddział Łużyce Lubań 0446", category: "A", position: "I Mistrz", points: "116.13", count: "20" },
      { region: "Oddział Łużyce Lubań 0446", category: "B", position: "I Mistrz", points: "661.38", count: "16" },
      { region: "Oddział Łużyce Lubań 0446", category: "C", position: "5 Przodownik", points: "362.76", count: "9" },
      { region: "Oddział Łużyce Lubań 0446", category: "D", position: "I Mistrz", points: "557.24", count: "-" },
      { region: "Oddział Łużyce Lubań 0446", category: "H", position: "I Mistrz", points: "577.48", count: "-" },
      { region: "Oddział Łużyce Lubań 0446", category: "Roczne", position: "I Mistrz", points: "239.29", count: "20" },
      { region: "Oddział Łużyce Lubań 0446", category: "Lotniki", position: "2 Przodownik", points: "524.88", count: "-" },
      { region: "Okręg Jelenia Góra", category: "A", position: "I Mistrz", points: "116.13", count: "20" },
      { region: "Okręg Jelenia Góra", category: "B", position: "I Mistrz", points: "661.38", count: "16" },
      { region: "Region V", category: "A", position: "Mistrz", points: "116.13", count: "20" },
      { region: "Region V", category: "B", position: "Mistrz", points: "661.38", count: "16" },
      { region: "MP", category: "A", position: "Mistrz", points: "116.13", count: "20" },
      { region: "MP", category: "B", position: "Mistrz", points: "661.38", count: "16" },
      { region: "MP", category: "Klasa Sport A", position: "22 Miejsce", points: "-", count: "20" }
    ],
  },
  {
    year: "2013",
    achievements: [
      { region: "Oddział Łużyce Lubań 0446", category: "A", position: "Mistrz", points: "66.43", count: "20" },
      { region: "Oddział Łużyce Lubań 0446", category: "B", position: "Mistrz", points: "87.62", count: "16" },
      { region: "Oddział Łużyce Lubań 0446", category: "C", position: "1 Przodownik", points: "525.46", count: "9" },
      { region: "Oddział Łużyce Lubań 0446", category: "D", position: "Mistrz", points: "679.51", count: "45" },
      { region: "Oddział Łużyce Lubań 0446", category: "GMO", position: "II Wicemistrz", points: "1373.93", count: "32" },
      { region: "Oddział Łużyce Lubań 0446", category: "H", position: "Mistrz", points: "338.68", count: "18" },
      { region: "Oddział Łużyce Lubań 0446", category: "Roczne", position: "3 Przodownik", points: "1025.61", count: "28" },
      { region: "Oddział Łużyce Lubań 0446", category: "Total młodzi", position: "I Wicemistrz", points: "562.03", count: "25" },
      { region: "Oddział Łużyce Lubań 0446", category: "5 najlepszych młodzi", position: "Mistrz", points: "1139.02", count: "21" },
      { region: "Okręg Jelenia Góra", category: "A", position: "Mistrz", points: "-", count: "20" },
      { region: "Okręg Jelenia Góra", category: "B", position: "Mistrz", points: "-", count: "16" },
      { region: "Okręg Jelenia Góra", category: "H", position: "Mistrz", points: "-", count: "18" },
      { region: "Okręg Jelenia Góra", category: "Roczne", position: "I Wicemistrz", points: "-", count: "20" },
      { region: "Region V", category: "A", position: "I Wicemistrz", points: "-", count: "20" },
      { region: "Region V", category: "B", position: "1 Przodownik", points: "-", count: "16" },
      { region: "Region V", category: "Roczne", position: "1 Przodownik", points: "-", count: "20" },
      { region: "Region V", category: "D", position: "3 Przodownik", points: "-", count: "45" },
      { region: "Region V", category: "GMP", position: "68 Przodownik", points: "1381.43", count: "-" },
      { region: "MP", category: "A", position: "II Wicemistrz", points: "66.43", count: "20" },
      { region: "MP", category: "B", position: "13 Przodownik", points: "685.69", count: "16" },
      { region: "MP", category: "Roczne", position: "9 Przodownik", points: "227.84", count: "20" }
    ],
  },
  {
    year: "2012",
    achievements: [
      { region: "Oddział Łużyce Lubań 0446", category: "A", position: "I Mistrz", points: "575.76", count: "20" },
      { region: "Oddział Łużyce Lubań 0446", category: "B", position: "I Mistrz", points: "160.25", count: "16" },
      { region: "Oddział Łużyce Lubań 0446", category: "C", position: "II Wicemistrz", points: "119.72", count: "9" },
      { region: "Oddział Łużyce Lubań 0446", category: "M Maraton", position: "I Mistrz", points: "103.06", count: "-" },
      { region: "Oddział Łużyce Lubań 0446", category: "D", position: "I Mistrz", points: "855.28", count: "-" },
      { region: "Oddział Łużyce Lubań 0446", category: "GMO", position: "I Mistrz", points: "1409.58", count: "-" },
      { region: "Oddział Łużyce Lubań 0446", category: "H", position: "I Mistrz", points: "887.54", count: "-" },
      { region: "Oddział Łużyce Lubań 0446", category: "Roczne", position: "I Mistrz", points: "413.58", count: "20" },
      { region: "Oddział Łużyce Lubań 0446", category: "Olimpijskie", position: "I Mistrz", points: "646.45", count: "-" },
      { region: "Oddział Łużyce Lubań 0446", category: "Total dorośli", position: "I Mistrz", points: "1080.51", count: "-" },
      { region: "Oddział Łużyce Lubań 0446", category: "Total młodzi", position: "II Wicemistrz", points: "150.62", count: "-" },
      { region: "MP", category: "Maraton", position: "8 Przodownik", points: "648.45", count: "-" },
      { region: "MP", category: "Olimpijskie", position: "68 Przodownik", points: "847.37", count: "-" }
    ],
  },
  {
    year: "2011",
    achievements: [
      { region: "Oddział Łużyce Lubań 0446", category: "Total dorosłych", position: "Mistrz", points: "611.73", count: "70" },
      { region: "Oddział Łużyce Lubań 0446", category: "A", position: "Mistrz", points: "161.32", count: "20" },
      { region: "Oddział Łużyce Lubań 0446", category: "B", position: "Mistrz", points: "51.32", count: "16" },
      { region: "Oddział Łużyce Lubań 0446", category: "C", position: "Mistrz", points: "84.07", count: "9" },
      { region: "Oddział Łużyce Lubań 0446", category: "M", position: "Mistrz", points: "59.36", count: "6" },
      { region: "Oddział Łużyce Lubań 0446", category: "D", position: "Mistrz", points: "296.71", count: "-" },
      { region: "Oddział Łużyce Lubań 0446", category: "H", position: "Mistrz", points: "588.92", count: "18" },
      { region: "Oddział Łużyce Lubań 0446", category: "Roczne", position: "Mistrz", points: "534.49", count: "20" },
      { region: "Okręg Jelenia Góra", category: "A", position: "I V-ce MISTRZ", points: "161.32", count: "20" },
      { region: "Okręg Jelenia Góra", category: "B", position: "MISTRZ", points: "51.32", count: "16" },
      { region: "Okręg Jelenia Góra", category: "C", position: "MISTRZ", points: "84.07", count: "9" },
      { region: "Okręg Jelenia Góra", category: "D", position: "MISTRZ", points: "296.71", count: "45" },
      { region: "Okręg Jelenia Góra", category: "E", position: "II V-ce MISTRZ", points: "81.60", count: "6" },
      { region: "Okręg Jelenia Góra", category: "F", position: "I V-ce MISTRZ", points: "243.05", count: "15" },
      { region: "Okręg Jelenia Góra", category: "G", position: "1. Przodownik", points: "1583.79", count: "34" },
      { region: "Okręg Jelenia Góra", category: "H", position: "II V-ce MISTRZ", points: "588.92", count: "18" },
      { region: "Generalne", category: "", position: "I V-ce MISTRZ", points: "1417.76", count: "32" },
      { region: "Region V", category: "A", position: "3 Przodownik", points: "161.32", count: "20" },
      { region: "Region V", category: "B", position: "Mistrz", points: "51.32", count: "16" }
    ],
  },
  {
    year: "2010",
    achievements: [
      { region: "Oddział Łużyce Lubań 0446", category: "A", position: "I V-ce MISTRZ*", points: "293.79", count: "20" },
      { region: "Oddział Łużyce Lubań 0446", category: "B", position: "MISTRZ*", points: "62.47", count: "16" },
      { region: "Oddział Łużyce Lubań 0446", category: "H", position: "I V-ce MISTRZ*", points: "975.71", count: "18" },
      { region: "Oddział Łużyce Lubań 0446", category: "Młode", position: "MISTRZ*", points: "245.86", count: "15" },
      { region: "Oddział Łużyce Lubań 0446", category: "Roczne", position: "MISTRZ*", points: "1692.16", count: "34" },
      { region: "Okręg Jelenia Góra", category: "A", position: "I V-ce MISTRZ", points: "293.79", count: "20" },
      { region: "Okręg Jelenia Góra", category: "B", position: "MISTRZ", points: "62.47", count: "16" },
      { region: "Okręg Jelenia Góra", category: "H", position: "II V-ce MISTRZ", points: "975.71", count: "18" },
      { region: "Okręg Jelenia Góra", category: "Młode", position: "MISTRZ", points: "245.86", count: "15" },
      { region: "Okręg Jelenia Góra", category: "Roczne", position: "1. Przodownik", points: "1692.16", count: "34" }
    ],
  },
  {
    year: "2009",
    achievements: [
      { region: "Oddział Łużyce Lubań 0446", category: "A", position: "MISTRZ*", points: "82.33", count: "20" },
      { region: "Oddział Łużyce Lubań 0446", category: "B", position: "MISTRZ*", points: "81.43", count: "16" },
      { region: "Oddział Łużyce Lubań 0446", category: "C", position: "II/III V-ce MISTRZ*", points: "348.08", count: "9" },
      { region: "Oddział Łużyce Lubań 0446", category: "M", position: "I V-ce MISTRZ*", points: "130.47", count: "6" },
      { region: "Oddział Łużyce Lubań 0446", category: "Młode", position: "I V-ce MISTRZ*", points: "160.61", count: "15" },
      { region: "Okręg Jelenia Góra", category: "A", position: "MISTRZ", points: "82.33", count: "20" },
      { region: "Oddział Łużyce Lubań 0446", category: "B", position: "MISTRZ", points: "81.43", count: "16" },
      { region: "Okręg Jelenia Góra", category: "C", position: "16. Przodownik", points: "348.08", count: "9" },
      { region: "Okręg Jelenia Góra", category: "M", position: "1. Przodownik", points: "130.47", count: "6" },
      { region: "Okręg Jelenia Góra", category: "Młode", position: "I V-ce MISTRZ", points: "160.61", count: "15" },
      { region: "Generalne", category: "", position: "I V-ce MISTRZ", points: "1401.99", count: "32" }
    ],
  },
  {
    year: "2008",
    achievements: [
      { region: "Oddział Lubań 092", category: "A", position: "Mistrz", points: "49.88", count: "20" },
      { region: "Oddział Lubań 092", category: "B", position: "Mistrz", points: "158.27", count: "16" },
      { region: "Oddział Lubań 092", category: "GMP", position: "I Wicemistrz", points: "49.88", count: "-" },
      { region: "Okręg Jelenia Góra", category: "A", position: "Mistrz", points: "49.88", count: "20" },
      { region: "Okręg Jelenia Góra", category: "B", position: "II Wicemistrz", points: "158.27", count: "16" },
      { region: "Okręg Jelenia Góra", category: "GMP", position: "I Wicemistrz", points: "49.88", count: "-" },
      { region: "Region V", category: "A", position: "Mistrz", points: "49.88", count: "20" },
      { region: "Region V", category: "B", position: "XX Przodownik", points: "158.27", count: "16" },
      { region: "Region V", category: "GMP", position: "I Wicemistrz", points: "49.88", count: "-" },
      { region: "Region V", category: "GMP", position: "20 Przodownik", points: "158.27", count: "-" },
      { region: "MP", category: "A", position: "3 Przodownik", points: "49.88", count: "20" }
    ],
  },
  {
    year: "2007",
    achievements: [
      { region: "Oddział Lubań", category: "A", position: "Mistrz", points: "78.06", count: "20" },
      { region: "Oddział Lubań", category: "GMO", position: "II Wicemistrz", points: "-", count: "-" },
      { region: "Okręg Jelenia Góra", category: "A", position: "Mistrz", points: "78.06", count: "20" },
      { region: "Region V", category: "A", position: "II Przodownik", points: "78.06", count: "20" },
      { region: "MP", category: "A", position: "I Przodownik", points: "78.06", count: "20" }
    ],
  },
  {
    year: "2006",
    achievements: [
      { region: "Oddział Lubań", category: "A", position: "Mistrz", points: "240.15", count: "20" },
      { region: "Oddział Lubań", category: "B", position: "Mistrz", points: "183.25", count: "16" },
      { region: "Oddział Lubań", category: "GMO", position: "Mistrz", points: "82.77", count: "15" },
      { region: "Okręg Jelenia Góra", category: "A", position: "Mistrz", points: "199.28", count: "20" },
      { region: "Okręg Jelenia Góra", category: "B", position: "II Przodownik", points: "367.51", count: "16" },
      { region: "Okręg Jelenia Góra", category: "GMO", position: "I Wicemistrz", points: "82.77", count: "15" },
      { region: "Region V", category: "A", position: "18 Przodownik", points: "240.15", count: "20" },
      { region: "Region V", category: "B", position: "24 Przodownik", points: "183.25", count: "16" },
      { region: "Region V", category: "GMO", position: "3 Przodownik", points: "82.77", count: "15" },
      { region: "MP", category: "GMO", position: "VI Przodownik", points: "82.77", count: "15" }
    ],
  },
  {
    year: "2005",
    achievements: [
      { region: "Oddział Lubań", category: "A", position: "Mistrz", points: "90.65", count: "20" },
      { region: "Oddział Lubań", category: "B", position: "Mistrz", points: "66.96", count: "16" },
      { region: "Oddział Lubań", category: "GMO", position: "I Wicemistrz", points: "-", count: "-" },
      { region: "Okręg Jelenia Góra", category: "A", position: "Mistrz", points: "90.65", count: "20" },
      { region: "Okręg Jelenia Góra", category: "B", position: "Mistrz", points: "66.96", count: "16" },
      { region: "Okręg Jelenia Góra", category: "GMO", position: "I Przodownik", points: "-", count: "-" },
      { region: "Region V", category: "A", position: "II Wicemistrz", points: "90.65", count: "20" },
      { region: "MP", category: "A", position: "I Przodownik", points: "90.65", count: "20" },
      { region: "MP", category: "B", position: "V Przodownik", points: "66.96", count: "16" }
    ],
  },
  {
    year: "2004",
    achievements: [
      { region: "Oddział Lubań", category: "A", position: "Mistrz", points: "180.91", count: "20" },
      { region: "Oddział Lubań", category: "B", position: "Mistrz", points: "196.07", count: "16" },
      { region: "Oddział Lubań", category: "GMO", position: "I Wicemistrz", points: "-", count: "-" },
      { region: "Okręg Jelenia Góra", category: "A", position: "Mistrz", points: "180.91", count: "20" },
      { region: "Okręg Jelenia Góra", category: "B", position: "I Przodownik", points: "196.07", count: "16" },
      { region: "Okręg Jelenia Góra", category: "GMO", position: "I Przodownik", points: "-", count: "-" },
      { region: "Region V", category: "A", position: "18 Przodownik", points: "180.91", count: "20" },
      { region: "Region V", category: "D", position: "35 Przodownik", points: "839.32", count: "-" },
      { region: "MP", category: "A", position: "32 Przodownik", points: "180.91", count: "20" }
    ],
  },
  {
    year: "2003",
    achievements: [
      { region: "Oddział Lubań", category: "A", position: "Mistrz", points: "203.54", count: "20" },
      { region: "Oddział Lubań", category: "B", position: "Mistrz", points: "217.78", count: "16" },
      { region: "Oddział Lubań", category: "C", position: "Mistrz", points: "71.99", count: "9" },
      { region: "Oddział Lubań", category: "GMO", position: "Mistrz", points: "462.22", count: "-" },
      { region: "Okręg Jelenia Góra", category: "A", position: "Mistrz", points: "203.54", count: "20" },
      { region: "Okręg Jelenia Góra", category: "B", position: "I Wicemistrz", points: "217.78", count: "16" },
      { region: "Okręg Jelenia Góra", category: "C", position: "Mistrz", points: "71.99", count: "9" },
      { region: "Okręg Jelenia Góra", category: "GMO", position: "VI Przodownik", points: "462.22", count: "-" },
      { region: "Region V", category: "A", position: "10 Przodownik", points: "203.54", count: "20" },
      { region: "Region V", category: "B", position: "49 Przodownik", points: "217.78", count: "16" },
      { region: "Region V", category: "C", position: "2 Miejsce", points: "971.99", count: "-" },
      { region: "Region V", category: "D", position: "II Przodownik", points: "-", count: "-" },
      { region: "Region V", category: "GMP", position: "11 Przodownik", points: "1066.26", count: "-" },
      { region: "MP", category: "C", position: "13 Przodownik", points: "71.99", count: "9" },
      { region: "MP", category: "GMP", position: "28 Przodownik", points: "1066.26", count: "-" }
    ],
  },
  {
    year: "2002",
    achievements: [
      { region: "Oddział Lubań", category: "A", position: "Mistrz", points: "501.52", count: "20" },
      { region: "Oddział Lubań", category: "GMO", position: "II Wicemistrz", points: "40", count: "-" },
      { region: "Okręg Jelenia Góra", category: "A", position: "Mistrz", points: "501.52", count: "20" },
      { region: "Okręg Jelenia Góra", category: "GMO", position: "Mistrz", points: "40", count: "-" },
      { region: "Region V", category: "A", position: "50 Przodownik", points: "501.52", count: "20" },
      { region: "Region V", category: "B", position: "II Przodownik", points: "168.11", count: "16" }
    ],
  },
  {
    year: "2001",
    achievements: [
      { region: "Oddział Lubań", category: "A", position: "Mistrz", points: "235.77", count: "20" },
      { region: "Oddział Lubań", category: "B", position: "I Wicemistrz", points: "503.62", count: "16" },
      { region: "Oddział Lubań", category: "GMO", position: "Mistrz", points: "-", count: "-" },
      { region: "Okręg Jelenia Góra", category: "A", position: "I Wicemistrz", points: "235.77", count: "20" },
      { region: "Okręg Jelenia Góra", category: "B", position: "IX Przodownik", points: "503.62", count: "16" },
      { region: "Okręg Jelenia Góra", category: "GMO", position: "I Wicemistrz", points: "-", count: "-" }
    ],
  },
];
