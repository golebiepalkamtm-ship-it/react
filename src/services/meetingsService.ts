import apiClient from './api';

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
    const response = await fetch('/api/breeder-meetings', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    return response.json();
  },
};

export default meetingsService;
