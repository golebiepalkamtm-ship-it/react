import apiClient from './api';

export interface Reference {
  id: string;
  breederName?: string;
  author?: string;
  location?: string;
  pigeonName?: string;
  experience?: string;

  /**
   * Legacy/simple string fields (some backends store achievements as stringified JSON)
   */
  achievements?: string;

  /** Opinion text (either `opinion`, `testimonial`, or `content` depending on source) */
  opinion?: string;
  testimonial?: string;
  content?: string;

  rating: number;
  images?: string[];
  createdAt: string;
  avatarUrl?: string;
  isApproved?: boolean;
}

export interface CreateReferenceRequest {
  breederName: string;
  location?: string;
  pigeonName?: string;
  experience?: string;
  achievements?: string;
  opinion: string;
  rating: number;
  images?: string[];
}

const LS_KEY = 'mtm.references.local';

const safeParseJson = <T>(input: unknown, fallback: T): T => {
  if (typeof input !== 'string') return fallback;
  try {
    return JSON.parse(input) as T;
  } catch {
    return fallback;
  }
};

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Nie udało się odczytać pliku obrazu'));
    reader.readAsDataURL(file);
  });
};

const normalizeReference = (ref: Partial<Reference>, idx: number): Reference => {
  const createdAt = ref.createdAt ?? new Date().toISOString();
  const rating = typeof ref.rating === 'number' ? ref.rating : 5;

  // Normalize opinion field from multiple possible keys
  const opinion = ref.opinion ?? ref.testimonial ?? ref.content ?? '';

  return {
    id: ref.id ?? `local_${idx}_${createdAt}`,
    breederName: ref.breederName ?? ref.author ?? 'Anonimowy hodowca',
    author: ref.author,
    location: ref.location,
    pigeonName: ref.pigeonName,
    experience: ref.experience,
    achievements: ref.achievements,
    opinion,
    testimonial: ref.testimonial,
    content: ref.content,
    rating,
    images: ref.images ?? (ref.avatarUrl ? [ref.avatarUrl] : []),
    createdAt,
    avatarUrl: ref.avatarUrl,
    isApproved: ref.isApproved,
  };
};

const loadLocalReferences = (): Reference[] => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const arr = safeParseJson<Reference[]>(raw, []);
    return Array.isArray(arr) ? arr.map((r, i) => normalizeReference(r, i)) : [];
  } catch {
    return [];
  }
};

const saveLocalReference = (ref: Reference) => {
  const current = loadLocalReferences();
  const next = [ref, ...current];
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  } catch {
    // ignore quota
  }
};

export const referencesService = {
  /**
   * Pobierz wszystkie referencje
   */
  async getReferences(): Promise<Reference[]> {
    // 1) Prefer API
    try {
      const data = await apiClient.get<Reference[]>('/references');
      const normalized = (data ?? []).map((r, i) => normalizeReference(r, i));
      const local = loadLocalReferences();
      return [...local, ...normalized].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } catch (err) {
      // If API is unavailable, do not inject static mock data from `/data/references.json`.
      // Return only locally saved references (e.g. created via the UI) to avoid showing
      // canned/mock references bundled with the app.
      console.warn('References API unavailable; returning local saved references only', err);
      return loadLocalReferences();
    }
  },

  /**
   * Dodaj nową referencję
   */
  async addReference(data: CreateReferenceRequest): Promise<Reference> {
    try {
      const saved = await apiClient.post<Reference>('/references', data);
      return normalizeReference(saved, 0);
    } catch (err) {
      // No backend? Save locally.
      const localRef: Reference = normalizeReference(
        {
          ...data,
          createdAt: new Date().toISOString(),
        },
        0,
      );
      saveLocalReference(localRef);
      return localRef;
    }
  },

  /**
   * Dodaj referencję z FormData (dla uploadu plików)
   */
  async addReferenceWithFiles(formData: FormData): Promise<Reference> {
    // 1) Prefer real backend upload if available
    try {
      const response = await fetch('/api/references', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }
      const saved = (await response.json()) as Reference;
      return normalizeReference(saved, 0);
    } catch (err) {
      // 2) No backend? Convert to a local reference (store image as data URL)
      console.warn('References upload failed; falling back to local save', err);

      const rawData = formData.get('data');
      const image = formData.get('image');

      const parsed = typeof rawData === 'string' ? safeParseJson<Record<string, unknown>>(rawData, {}) : {};

      // Map AddReferenceForm fields -> CreateReferenceRequest
      const breederName = String(parsed.breederName ?? '');
      const location = parsed.location ? String(parsed.location) : undefined;
      const experience = parsed.experience ? String(parsed.experience) : undefined;
      const rating = Number(parsed.rating ?? 5);
      const opinion = String(parsed.testimonial ?? parsed.opinion ?? '');

      // Derive pigeonName and achievements text from the achievements array if present
      const achievementsArr = Array.isArray(parsed.achievements) ? (parsed.achievements as any[]) : [];
      const pigeonName = achievementsArr[0]?.pigeon ? String(achievementsArr[0].pigeon) : undefined;

      // Store achievements as string (compatible with existing server/data file format)
      let achievements: string | undefined;
      if (achievementsArr.length > 0) {
        try {
          achievements = JSON.stringify(
            achievementsArr
              .flatMap(a => (Array.isArray(a?.results) ? a.results : []))
              .filter(Boolean),
          );
        } catch {
          achievements = undefined;
        }
      }

      let images: string[] | undefined;
      if (image instanceof File && image.size > 0) {
        const dataUrl = await fileToDataUrl(image);
        images = [dataUrl];
      }

      return this.addReference({
        breederName,
        location,
        pigeonName,
        experience,
        achievements,
        opinion,
        rating: Number.isFinite(rating) ? Math.max(1, Math.min(5, rating)) : 5,
        images,
      });
    }
  },
};

export default referencesService;
