export interface Pigeon {
  id: string;
  name: string;
  title: string;
  breed: string;
  year: number;
  achievements: string[];
  records: string[];
  description: string;
  image: string;
  color: string;
}

export const pigeons: Pigeon[] = [
  {
    id: "1",
    name: "Bolt",
    title: "Mistrz Europy 2023",
    breed: "Janssen",
    year: 2019,
    achievements: ["1. miejsce Barcelona 2023", "1. miejsce Marsylia 2022", "Najszybszy gołąb sezonu"],
    records: ["1,247 km/h", "Dystans: 1,100 km"],
    description: "Legendarny champion, niepokonany w długodystansowych lotach. Jego niesamowita wytrzymałość i precyzyjna nawigacja uczyniły go ikoną hodowli.",
    image: "https://images.unsplash.com/photo-1555169062-013468b47731?w=800&q=80",
    color: "Niebieski"
  },
  {
    id: "2", 
    name: "Aurora",
    title: "Królowa Prędkości",
    breed: "Van Loon",
    year: 2020,
    achievements: ["2x Złoty Medal", "Rekord Polski 2022", "Champion hodowli 2023"],
    records: ["1,312 km/h", "Dystans: 850 km"],
    description: "Niezwykle elegancka samica o wyjątkowej prędkości. Aurora łączy piękno z atletycznymi zdolnościami, zdobywając serca hodowców.",
    image: "https://images.unsplash.com/photo-1551085254-e96b210db58a?w=800&q=80",
    color: "Czerwony"
  },
  {
    id: "3",
    name: "Imperator",
    title: "Król Dystansu",
    breed: "Meulemans",
    year: 2018,
    achievements: ["5x Champion Narodowy", "Legenda Hodowli", "Hall of Fame 2021"],
    records: ["1,189 km/h", "Dystans: 1,350 km"],
    description: "Patriarcha hodowli, ojciec wielu championów. Jego geny dominują w najlepszych hodowlach Europy.",
    image: "https://images.unsplash.com/photo-1544923246-77307dd628b0?w=800&q=80",
    color: "Szary"
  },
  {
    id: "4",
    name: "Diament",
    title: "Wschodząca Gwiazda",
    breed: "Koopman",
    year: 2021,
    achievements: ["Debiutant Roku 2023", "3x Złoto w sezonie", "Nadzieja hodowli"],
    records: ["1,298 km/h", "Dystans: 720 km"],
    description: "Młody fenomen z nieograniczonym potencjałem. Diament błyszczy przy każdym starcie, obiecując świetlaną przyszłość.",
    image: "https://images.unsplash.com/photo-1606567595334-d39972c85dfd?w=800&q=80",
    color: "Biały"
  },
  {
    id: "5",
    name: "Storm",
    title: "Pogromca Wiatrów",
    breed: "Houben",
    year: 2019,
    achievements: ["Mistrz trudnych warunków", "4x Zwycięzca", "Żelazny Champion"],
    records: ["1,156 km/h", "Dystans: 980 km"],
    description: "Nieustępliwy wojownik, najlepszy w najtrudniejszych warunkach pogodowych. Jego determinacja jest legendarna.",
    image: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800&q=80",
    color: "Ciemny"
  },
  {
    id: "6",
    name: "Feniks",
    title: "Odrodzony Mistrz",
    breed: "Geerinckx",
    year: 2020,
    achievements: ["Comeback roku 2023", "2x Champion po kontuzji", "Inspiracja hodowców"],
    records: ["1,234 km/h", "Dystans: 890 km"],
    description: "Po poważnej kontuzji powrócił silniejszy niż kiedykolwiek. Historia Feniksa inspiruje całą społeczność hodowców.",
    image: "https://images.unsplash.com/photo-1547974996-050bf23b6196?w=800&q=80",
    color: "Złoty"
  }
];
