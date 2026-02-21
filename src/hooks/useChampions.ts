/**
 * Hook do dynamicznego ładowania championów z folderu public/champions/
 * Skanuje manifest.json i pobiera dane każdego championa
 */
import { useState, useEffect } from 'react';

export interface Champion {
  id: string;
  name: string;
  title: string;
  breed: string;
  year: number;
  achievements: string[];
  records: string[];
  description: string;
  images: string[];
  color: string;
  ringNumber?: string;
  gender?: string;
  weight?: number;
  breeder?: string;
  pedigree?: string;
}

interface ChampionData {
  name: string;
  ringNumber: string;
  bloodline: string;
  gender: string;
  birthDate: string;
  color: string;
  weight?: number;
  breeder?: string;
  description: string;
  achievements: string[];
}

interface ManifestItem {
  id: number;
  image: string;
  images?: string[];
  pedigree?: string;
}

interface Manifest {
  champions: ManifestItem[];
  lastUpdated: string;
}

export const useChampions = () => {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const loadChampions = async () => {
      try {
        setLoading(true);
        const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
        const path = (p: string) => `${base}/${p.replace(/^\/+/, '')}`;
        const fallbackImage = path('/back.png');

        const manifestRes = await fetch(path('/champions/manifest.json'), { cache: 'no-store', signal: controller.signal });
        if (!manifestRes.ok) {
          throw new Error('Nie można załadować manifestu championów');
        }
        const manifest: Manifest = await manifestRes.json();
        
        // Pobierz dane każdego championa
        const championsData: Champion[] = await Promise.all(
          manifest.champions.map(async (item) => {
            try {
              const imagePath = path(`/champions/${item.id}/gallery/${encodeURIComponent(item.image)}`);
              
              const imagePaths = item.images
                ? item.images.map(img => path(`/champions/${item.id}/gallery/${encodeURIComponent(img)}`))
                : [imagePath];
              const uniqueImages = Array.from(new Set(imagePaths.filter(Boolean)));
              const finalImages = uniqueImages.length > 0 ? uniqueImages : [fallbackImage];
              
              let data: ChampionData | null = null;
              try {
                const dataRes = await fetch(path(`/champions/${item.id}/data.json`), { cache: 'no-store', signal: controller.signal });
                if (dataRes.ok) {
                  data = await dataRes.json();
                }
              } catch { void 0; }
              
              const ringFromImage = item.image.split('_')[0].replace(/t$/i, '').replace(/\.jpg$/i, '').replace(/\.png$/i, '').toUpperCase();
              
              const pedigreePath = item.pedigree ? path(`/champions/${item.id}/pedigree/${encodeURIComponent(item.pedigree)}`) : undefined;
              
              const champion: Champion = {
                id: String(item.id),
                name: data?.name || `Champion ${item.id}`,
                title: data?.achievements?.[0] || 'Champion',
                breed: data?.bloodline || 'Unknown',
                year: data?.birthDate ? new Date(data.birthDate).getFullYear() : 2020,
                achievements: data?.achievements || [],
                records: [data?.ringNumber || ringFromImage, data?.weight ? `${data.weight}g` : ''].filter(Boolean),
                description: data?.description || '',
                images: finalImages,
                color: data?.color || 'Unknown',
                ringNumber: (data?.ringNumber || ringFromImage).toUpperCase(),
                gender: data?.gender,
                weight: data?.weight,
                breeder: data?.breeder,
                pedigree: pedigreePath,
              };
              
              return champion;
            } catch (err) {
              console.warn(`Nie można załadować championa ${item.id}:`, err);
              return null;
            }
          })
        ).then((list) => list.filter(Boolean) as Champion[]);
        
        setChampions(championsData);
        setError(null);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'Błąd ładowania');
        console.error('Błąd ładowania championów:', err);
      } finally {
        setLoading(false);
      }
    };

    loadChampions();
    return () => controller.abort();
  }, [reloadKey]);

  return { champions, loading, error, refetch: () => setReloadKey((k) => k + 1) };
};

// Statyczny fallback dla SSR lub szybkiego pierwszego renderowania
export const getStaticChampions = (): Champion[] => [
  {
    id: "1",
    name: "Thunder Storm",
    title: "Mistrz Olimpijski 2011",
    breed: "Janssen",
    year: 2011,
    achievements: ["Mistrz Olimpijski 2011", "1. miejsce - Barcelona 2011"],
    records: ["DV-02906-11-98", "480g"],
    description: "Wybitny champion, mistrz olimpijski.",
    images: ["/champions/1/gallery/DV-02906-11-98t_OLIMP (1).jpg"],
    color: "Blue"
  },
];

export default useChampions;
