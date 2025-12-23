import apiClient from './api';

export interface Champion {
  id: string;
  name: string;
  ringNumber: string;
  achievements: string[];
  bloodline: string;
  image: string;
  images: string[];
  pedigreeImages?: string[];
  description?: string;
}

export const championsService = {
  /**
   * Pobierz wszystkich czempionów
   */
  async getChampions(): Promise<Champion[]> {
    try {
      return await apiClient.get<Champion[]>('/champions');
    } catch (err) {
      // Fallback for local/dev when backend is not running.
      // This also makes images work immediately (they are served from Vite /public).
      console.warn('Champions API unavailable, falling back to /data/champions.json', err);

      const res = await fetch('/data/champions.json', { cache: 'no-store' });
      if (!res.ok) {
        throw err;
      }

      const raw = (await res.json()) as Array<Partial<Champion>>;
      return raw.map((c, idx) => ({
        id: c.id ?? String(idx + 1),
        name: c.name ?? 'Champion',
        ringNumber: c.ringNumber ?? '',
        achievements: c.achievements ?? [],
        bloodline: c.bloodline ?? '',
        image: c.image ?? '/placeholder.svg',
        images: c.images ?? [],
        pedigreeImages: c.pedigreeImages ?? [],
        description: c.description,
      }));
    }
  },

  /**
   * Pobierz czempiona po ID
   */
  async getChampionById(id: string): Promise<Champion | undefined> {
    const champions = await this.getChampions();
    return champions.find(c => c.id === id);
  },
};

export default championsService;
