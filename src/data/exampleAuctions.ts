import type { CreateAuctionRequest } from '@/types/auction';

export const exampleAuctions: CreateAuctionRequest[] = [
  {
    title: 'Przykładowy Champion - Złoty Orzeł',
    description:
      'Przykładowy opis aukcji: wyśmienite pochodzenie, doskonała kondycja, sprawdzone rodowody.',
    startingPrice: 1000,
    buyNowPrice: 5000,
    category: 'pigeons',
    sex: 'male',
    location: 'Lubań, Polska',
    images: ['/champions/7/gallery/pl-0446-12-1046_c.jpg'],
    endTime: (() => { const d = new Date(); d.setHours(20, 0, 0, 0); return d.toISOString(); })(),
    pigeon: {
      ringNumber: 'PL-0446-12-1046',
      bloodline: 'Janssen Brothers',
      budowa: 'Silna, atletyczna',
      eyeColor: 'Pomarańczowy',
      color: 'Niebieski',
      vitality: 'Wysoka',
      endurance: 'Wysoka',
    },
    documents: ['/champions/7/pedigree/PL-0446-12-1046.1.jpg'],
  },
  {
    title: 'Hodowlana Perła - Srebrna Gwiazda',
    description:
      'Młoda hodowlana z doskonałymi genami, idealna do hodowli. Regularnie badana, gotowa do wysyłki.',
    startingPrice: 800,
    buyNowPrice: 3000,
    category: 'pigeons',
    sex: 'female',
    location: 'Wrocław, Polska',
    images: ['/champions/15/gallery/pl-0446-16-2255_c.jpg'],
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    pigeon: {
      ringNumber: 'PL-0446-16-2255',
      bloodline: 'Van Loon',
      budowa: 'Smukła',
      eyeColor: 'Brązowy',
      color: 'Szary',
      vitality: 'Średnia',
      endurance: 'Wysoka',
    },
    documents: ['/champions/15/pedigree/PL-0446-16-2255.1.jpg'],
  },
];

export default exampleAuctions;
