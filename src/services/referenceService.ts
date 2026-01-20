import { supabase } from '@/lib/supabase';

export type Reference = {
  id: string;
  breederName: string;
  location: string;
  rating: number;
  opinion: string;
  experience?: string;
  achievements?: string;
  pigeonName?: string;
  images?: string[];
  isApproved?: boolean;
  createdAt?: string;
};

export type CreateReferenceRequest = {
  breederName: string;
  location: string;
  rating: number;
  experience?: string;
  testimonial?: string;
  opinion?: string;
  achievements?: unknown;
  pigeonName?: string;
  images?: string[];
};

const LOCAL_STORAGE_KEY = 'mtm.references.local';

function makeId(): string {
  const uuid = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : null;
  return uuid ?? `ref_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function normalizeReference(input: any): Reference {
  const opinion =
    typeof input?.opinion === 'string'
      ? input.opinion
      : typeof input?.testimonial === 'string'
        ? input.testimonial
        : '';

  const images = Array.isArray(input?.images)
    ? input.images.filter((value: unknown) => typeof value === 'string' && value.length > 0)
    : [];

  const createdAt =
    typeof input?.createdAt === 'string'
      ? input.createdAt
      : typeof input?.created_at === 'string'
        ? input.created_at
        : new Date().toISOString();

  return {
    id: typeof input?.id === 'string' && input.id.length > 0 ? input.id : makeId(),
    breederName: typeof input?.breederName === 'string' ? input.breederName : '',
    location: typeof input?.location === 'string' ? input.location : '',
    rating: typeof input?.rating === 'number' ? input.rating : Number(input?.rating ?? 5) || 5,
    opinion,
    experience: typeof input?.experience === 'string' ? input.experience : undefined,
    achievements:
      typeof input?.achievements === 'string'
        ? input.achievements
        : input?.achievements
          ? JSON.stringify(input.achievements)
          : undefined,
    pigeonName: typeof input?.pigeonName === 'string' ? input.pigeonName : undefined,
    images,
    isApproved: typeof input?.isApproved === 'boolean' ? input.isApproved : true,
    createdAt,
  };
}

function readLocalReferences(): Reference[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeReference);
  } catch {
    return [];
  }
}

function writeLocalReferences(refs: Reference[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(refs));
  } catch {
    // ignore
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Nie udało się odczytać pliku obrazu.'));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

export const referenceService = {
  async getReferences(): Promise<Reference[]> {
    const local = readLocalReferences();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('references')
          .select('*')
          .order('createdAt', { ascending: false });

        if (!error && Array.isArray(data)) {
          const remote = data.map(normalizeReference);
          const merged = [...local, ...remote];
          const seen = new Set<string>();
          const deduped = merged.filter(ref => (seen.has(ref.id) ? false : (seen.add(ref.id), true)));
          deduped.sort(
            (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
          );
          return deduped;
        }
      } catch {
        // fallback below
      }
    }

    const merged = [...local];
    const seen = new Set<string>();
    const deduped = merged.filter(ref => (seen.has(ref.id) ? false : (seen.add(ref.id), true)));
    deduped.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
    return deduped;
  },

  async addReferenceWithFiles(body: FormData): Promise<Reference> {
    let payload: any = {};
    const raw = body.get('data');
    if (typeof raw === 'string') {
      try {
        payload = JSON.parse(raw);
      } catch {
        payload = {};
      }
    }

    const images: string[] = [];
    const image = body.get('image');
    if (image instanceof File && image.size > 0) {
      try {
        images.push(await fileToDataUrl(image));
      } catch {
        // ignore image failures
      }
    }

    const created = normalizeReference({
      ...payload,
      images,
      opinion: payload?.opinion ?? payload?.testimonial,
      testimonial: payload?.testimonial,
      createdAt: new Date().toISOString(),
      isApproved: true,
    });

    const local = readLocalReferences();
    writeLocalReferences([created, ...local]);

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('references')
          .insert([
            {
              id: created.id,
              breederName: created.breederName,
              location: created.location,
              experience: created.experience,
              opinion: created.opinion,
              rating: created.rating,
              achievements: created.achievements,
              pigeonName: created.pigeonName,
              images: created.images ?? [],
              isApproved: created.isApproved ?? true,
              createdAt: created.createdAt,
            },
          ])
          .select()
          .single();

        if (!error && data) {
          return normalizeReference(data);
        }
      } catch {
        // keep local fallback
      }
    }

    return created;
  },
};

export default referenceService;
