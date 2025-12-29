/**
 * Dane championów gołębi
 * Źródło: public/champions/
 */

export interface Champion {
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

export const champions: Champion[] = [
  {
    id: "1",
    name: "Thunder Storm",
    title: "Mistrz Olimpijski 2011",
    breed: "Janssen",
    year: 2011,
    achievements: ["Mistrz Olimpijski 2011", "1. miejsce - Barcelona 2011", "2. miejsce - Tarnów 2010"],
    records: ["DV-02906-11-98", "480g"],
    description: "Wybitny champion, mistrz olimpijski z doskonałymi wynikami w lotach długodystansowych.",
    image: "/champions/1/gallery/DV-02906-11-98t_OLIMP (1).jpg",
    color: "Blue"
  },
  {
    id: "2", 
    name: "Blue Lightning",
    title: "Mistrz Polski 2011",
    breed: "Janssen",
    year: 2011,
    achievements: ["Mistrz Polski 2011", "1. miejsce - Poznań 2011", "3. miejsce - Warszawa 2010"],
    records: ["DV-00987-11-396", "465g"],
    description: "Szybki i wytrzymały champion z doskonałymi predyspozycjami do lotów średniodystansowych.",
    image: "/champions/2/gallery/dv-0987-11-396_c.jpg",
    color: "Blue"
  },
  {
    id: "3",
    name: "Champion DV-07136",
    title: "Król Dystansu",
    breed: "Meulemans",
    year: 2010,
    achievements: ["Champion Narodowy", "Legenda Hodowli"],
    records: ["DV-07136-10-202"],
    description: "Patriarcha hodowli, ojciec wielu championów.",
    image: "/champions/3/gallery/dv-07136-10-202_c.jpg",
    color: "Szary"
  },
  {
    id: "4",
    name: "Champion PL-160651",
    title: "Wschodząca Gwiazda",
    breed: "Koopman",
    year: 2011,
    achievements: ["Debiutant Roku", "3x Złoto w sezonie"],
    records: ["PL-11-160651"],
    description: "Młody fenomen z nieograniczonym potencjałem.",
    image: "/champions/4/gallery/PL-11-160651t_b2 (1).jpg",
    color: "Biały"
  },
  {
    id: "5",
    name: "Champion PL-328",
    title: "Pogromca Wiatrów",
    breed: "Houben",
    year: 2012,
    achievements: ["Mistrz trudnych warunków", "4x Zwycięzca"],
    records: ["PL-0446-12-328"],
    description: "Nieustępliwy wojownik, najlepszy w najtrudniejszych warunkach pogodowych.",
    image: "/champions/5/gallery/PL-0446-12-328_2KK.jpg",
    color: "Ciemny"
  },
  {
    id: "6",
    name: "Champion PL-1016",
    title: "Odrodzony Mistrz",
    breed: "Geerinckx",
    year: 2012,
    achievements: ["Comeback roku", "2x Champion"],
    records: ["PL-0446-12-1016"],
    description: "Po poważnej kontuzji powrócił silniejszy niż kiedykolwiek.",
    image: "/champions/6/gallery/pl-0446-12-1016_c.jpg",
    color: "Złoty"
  }
];
