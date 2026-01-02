import apiClient from './api';
import { supabase } from '@/lib/supabase';

export interface Meeting {
  id: string;
  name?: string;
  breederName?: string;
  date?: string;
  location?: string;
  description?: string;
  images: string[];
  highlights?: string[];
}

export interface CreateMeetingRequest {
  title: string;
  description?: string;
  location?: string;
  date?: string;
}

export const meetingsService = {
  /**
   * Pobierz wszystkie spotkania z hodowcami
   */
  async getMeetings(): Promise<Meeting[]> {
    return apiClient.get<Meeting[]>('/breeder-meetings');
  },

  /**
   * Pobierz spotkanie po ID
   */
  async getMeetingById(id: string): Promise<Meeting | undefined> {
    const meetings = await this.getMeetings();
    return meetings.find(m => m.id === id);
  },

  /**
   * Dodaj spotkanie z FormData (dla uploadu plików)
   */
  async addMeetingWithFiles(formData: FormData): Promise<Meeting> {
    const title = String(formData.get('title') ?? '').trim();
    const description = formData.get('description') ? String(formData.get('description')) : undefined;
    const location = formData.get('location') ? String(formData.get('location')) : undefined;
    const date = formData.get('date') ? String(formData.get('date')) : undefined;

    const files: File[] = [];
    const imagesField = formData.getAll('images');
    for (const item of imagesField) {
      if (item instanceof File && item.size > 0) files.push(item);
    }

    const fileToDataUrl = (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Nie udało się odczytać pliku obrazu'));
        reader.readAsDataURL(file);
      });

    const images = await Promise.all(
      files.map(async (f) => ({
        fileName: f.name,
        dataUrl: await fileToDataUrl(f),
      })),
    );

    let token: string | undefined;
    try {
      const { data } = await supabase?.auth?.getSession?.() ?? { data: null };
      token = data?.session?.access_token;
    } catch {
      token = undefined;
    }

    return apiClient.post<Meeting>(
      '/breeder-meetings',
      {
        title,
        description,
        location,
        date,
        images,
      },
      token
    );
  },
};

export default meetingsService;
