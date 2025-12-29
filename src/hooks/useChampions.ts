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
  image: string;
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

  useEffect(() => {
    const loadChampions = async () => {
      try {
        setLoading(true);
        
        // Pobierz manifest
        const manifestRes = await fetch('/champions/manifest.json');
        if (!manifestRes.ok) {
          throw new Error('Nie można załadować manifestu championów');
        }
        const manifest: Manifest = await manifestRes.json();
        
        // Pobierz dane każdego championa
        const championsData: Champion[] = [];
        
        for (const item of manifest.champions) {
          try {
            // Użyj obrazka z manifestu - bezpośrednia ścieżka (serwer obsługuje spacje w URL)
            const imagePath = `/champions/${item.id}/gallery/${item.image}`;
            
            // Pobierz data.json (opcjonalne)
            let data: ChampionData | null = null;
            try {
              const dataRes = await fetch(`/champions/${item.id}/data.json`);
              if (dataRes.ok) {
                data = await dataRes.json();
              }
            } catch {
              // Brak data.json - użyjemy domyślnych wartości
            }
            
            // Wyciągnij ringNumber z nazwy pliku obrazu (np. "PL-0446-12-328_2KK.jpg" -> "PL-0446-12-328")
            const ringFromImage = item.image.split('_')[0].replace(/t$/i, '').replace(/\.jpg$/i, '').replace(/\.png$/i, '').toUpperCase();
            
            // Ścieżka do rodowodu
            const pedigreePath = item.pedigree ? `/champions/${item.id}/pedigree/${item.pedigree}` : undefined;
            
            // Tworzymy obiekt Champion
            const champion: Champion = {
              id: String(item.id),
              name: data?.name || `Champion ${item.id}`,
              title: data?.achievements?.[0] || 'Champion',
              breed: data?.bloodline || 'Unknown',
              year: data?.birthDate ? new Date(data.birthDate).getFullYear() : 2020,
              achievements: data?.achievements || [],
              records: [data?.ringNumber || ringFromImage, data?.weight ? `${data.weight}g` : ''].filter(Boolean),
              description: data?.description || '',
              image: imagePath,
              color: data?.color || 'Unknown',
              ringNumber: (data?.ringNumber || ringFromImage).toUpperCase(),
              gender: data?.gender,
              weight: data?.weight,
              breeder: data?.breeder,
              pedigree: pedigreePath,
            };
            
            championsData.push(champion);
          } catch (err) {
            console.warn(`Nie można załadować championa ${item.id}:`, err);
          }
        }
        
        setChampions(championsData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Błąd ładowania');
        console.error('Błąd ładowania championów:', err);
      } finally {
        setLoading(false);
      }
    };

    loadChampions();
  }, []);

  return { champions, loading, error, refetch: () => {} };
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
    image: "/champions/1/gallery/DV-02906-11-98t_OLIMP (1).jpg",
    color: "Blue"
  },
];

export default useChampions;
