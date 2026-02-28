import { supabase } from "@/lib/supabase";

export type Reference = {
  id: string;
  breeder_name: string;
  location: string;
  rating: number;
  opinion: string;
  experience?: string;
  achievements?: string;
  pigeon_name?: string;
  images?: string[];
  is_approved?: boolean;
  created_at?: string;
};

export type CreateReferenceRequest = {
  breeder_name: string;
  location: string;
  rating: number;
  experience?: string;
  testimonial?: string;
  opinion?: string;
  achievements?: unknown;
  pigeon_name?: string;
  images?: string[];
};

export type UpdateReferenceRequest = Partial<CreateReferenceRequest> & {
  is_approved?: boolean;
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

  // Handle both camelCase and snake_case from DB responses
  const created_at =
    typeof input?.createdAt === 'string'
      ? input.createdAt
      : typeof input?.created_at === 'string'
        ? input.created_at
        : new Date().toISOString();

  const breeder_name =
    typeof input?.breederName === 'string'
      ? input.breederName
      : typeof input?.breeder_name === 'string'
        ? input.breeder_name
        : '';

  const pigeon_name =
    typeof input?.pigeonName === 'string'
      ? input.pigeonName
      : typeof input?.pigeon_name === 'string'
        ? input.pigeon_name
        : undefined;

  const is_approved =
    typeof input?.isApproved === 'boolean'
      ? input.isApproved
      : typeof input?.is_approved === 'boolean'
        ? input.is_approved
        : true;

  return {
    id: typeof input?.id === 'string' && input.id.length > 0 ? input.id : makeId(),
    breeder_name,
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
    pigeon_name,
    images,
    is_approved,
    created_at,
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
    let remote: Reference[] = [];

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('references')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          remote = data.map(normalizeReference);
        } else if (error) {
          console.warn('Supabase references fetch error:', error.message);
          try {
            const resp = await fetch('/api/references');
            if (resp.ok) {
              const d = await resp.json();
              if (Array.isArray(d)) remote = d.map(normalizeReference);
            }
          } catch (e) {
            console.error('Internal references API fallback failed:', e);
          }
        }
      } catch (err) {
        console.error('Supabase fetch failed:', err);
      }
    } else {
      try {
        const resp = await fetch('/api/references');
        if (resp.ok) {
          const d = await resp.json();
          if (Array.isArray(d)) remote = d.map(normalizeReference);
        }
      } catch (e) { /* ignore */ }
    }

    const merged = [...local, ...remote];
    const seen = new Set<string>();
    const deduped = merged.filter(ref => (seen.has(ref.id) ? false : (seen.add(ref.id), true)));
    deduped.sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime());
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
        // Use snake_case column names matching the actual DB schema (Prisma @map)
        const { data, error } = await supabase
          .from('references')
          .insert([
            {
              id: created.id,
              breeder_name: created.breeder_name,
              location: created.location,
              experience: created.experience,
              opinion: created.opinion,
              rating: created.rating,
              achievements: created.achievements,
              pigeon_name: created.pigeon_name,
              images: created.images ?? [],
              is_approved: created.is_approved ?? true,
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

  async updateReference(id: string, payload: UpdateReferenceRequest): Promise<Reference> {
    // update local cache
    const local = readLocalReferences();
    const idx = local.findIndex((r) => r.id === id);
    const mergedLocal =
      idx >= 0
        ? normalizeReference({ ...local[idx], ...payload, id })
        : normalizeReference({ ...payload, id });
    writeLocalReferences([mergedLocal, ...local.filter((r) => r.id !== id)]);

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('references')
          .update({
            breeder_name: payload.breeder_name,
            location: payload.location,
            experience: payload.experience,
            opinion: payload.opinion ?? payload.testimonial,
            rating: payload.rating,
            achievements: payload.achievements,
            pigeon_name: payload.pigeon_name,
            images: payload.images,
            is_approved:
              typeof payload.is_approved === 'boolean' ? payload.is_approved : undefined,
          })
          .eq('id', id)
          .select('*')
          .single();

        if (!error && data) {
          return normalizeReference(data);
        }
      } catch (err) {
        console.error('Supabase update reference failed', err);
      }
    }

    // fallback
    return mergedLocal;
  },

  async deleteReference(id: string): Promise<void> {
    const local = readLocalReferences().filter((r) => r.id !== id);
    writeLocalReferences(local);

    if (supabase) {
      try {
        const { error } = await supabase.from('references').delete().eq('id', id);
        if (error) console.warn('Supabase delete reference error:', error.message);
      } catch (err) {
        console.error('Supabase delete reference failed', err);
      }
    }
  },
};

export default referenceService;
