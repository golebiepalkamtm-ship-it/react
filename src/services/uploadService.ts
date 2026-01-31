import apiClient from './api';

export const uploadService = {
  async uploadImage(file: File, token: string | null): Promise<{ url: string; path: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.postFormData<{ url: string; path: string }>('/upload/image', formData, token || undefined);
  },

  async uploadDocument(file: File, token: string | null): Promise<{ url: string; path: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.postFormData<{ url: string; path: string }>('/upload/document', formData, token || undefined);
  },

  async uploadVideo(file: File, token: string | null): Promise<{ url: string; path: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.postFormData<{ url: string; path: string }>('/upload/video', formData, token || undefined);
  }
};

export default uploadService;
