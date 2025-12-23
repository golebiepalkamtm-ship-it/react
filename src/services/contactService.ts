import apiClient from './api';

export interface ContactFormData {
  fullName: string;
  email: string;
  subject: string;
  message: string;
}

interface ContactResponse {
  message: string;
}

export const contactService = {
  /**
   * Wyślij formularz kontaktowy
   */
  async submitContactForm(data: ContactFormData): Promise<ContactResponse> {
    return apiClient.post<ContactResponse>('/contact', data);
  },
};

export default contactService;
