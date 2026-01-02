import type { CreateAuctionRequest } from '@/types/auction';

// Example auction data for development / testing
export const exampleAuction: CreateAuctionRequest = {
  title: 'Przykładowy Champion - Złoty Orzeł',
  description: 'Przykładowy opis aukcji: wyśmienite pochodzenie, doskonała kondycja, sprawdzone rodowody.',
  startingPrice: 1000,
  buyNowPrice: 5000,
  category: 'pigeons',
  sex: 'male',
  location: 'Lubań, Polska',
  images: ['/placeholder.svg'],
  endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  pigeon: {
    ringNumber: 'PL-2025-00001',
    bloodline: 'Janssen Brothers',
    budowa: 'Silna, atletyczna',
    eyeColor: 'Pomarańczowy',
    color: 'Niebieski',
    vitality: 'Wysoka',
    endurance: 'Wysoka',
  },
  documents: [],
};
