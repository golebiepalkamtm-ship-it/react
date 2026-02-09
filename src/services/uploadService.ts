import apiClient from './api';
import { supabase } from '@/lib/supabase';

const resolveToken = async (token: string | null): Promise<string> => {
  if (token) return token;
  if (!supabase) throw new Error('Authentication required');
  const { data } = await supabase.auth.getSession();
  const sessionToken = data.session?.access_token;
  if (!sessionToken) throw new Error('Authentication required');
  return sessionToken;
};

export const uploadService = {
  async uploadImage(file: File, token: string | null): Promise<{ url: string; path: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const authToken = await resolveToken(token);
    return apiClient.postFormData<{ url: string; path: string }>('/upload/image', formData, authToken);
  },

  async uploadDocument(file: File, token: string | null): Promise<{ url: string; path: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const authToken = await resolveToken(token);
    return apiClient.postFormData<{ url: string; path: string }>('/upload/document', formData, authToken);
  },

  async uploadVideo(file: File, token: string | null): Promise<{ url: string; path: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const authToken = await resolveToken(token);
    return apiClient.postFormData<{ url: string; path: string }>('/upload/video', formData, authToken);
  }
};

export default uploadService;
