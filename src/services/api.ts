import { logger } from '@/lib/logger';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL
  || import.meta.env.VITE_API_URL
  || (typeof window !== 'undefined' ? `${window.location.origin}/api` : 'http://localhost:8001/api');

interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | undefined>;
  signal?: AbortSignal;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | undefined>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`, window.location.origin);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) url.searchParams.append(key, String(value));
      });
    }
    return url.toString();
  }

  private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const { params, ...fetchConfig } = config;
    const url = this.buildUrl(endpoint, params);
    
    logger.debug('API Request:', url);

    // Pobierz CSRF token z cookie
    const getCSRFToken = (): string | undefined => {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'csrf-token') {
          return value;
        }
      }
      return undefined;
    };

    const response = await fetch(url, {
      ...fetchConfig,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(fetchConfig.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(fetchConfig.method) && {
          'X-CSRF-Token': getCSRFToken()
        }),
        ...fetchConfig.headers,
      },
      signal: fetchConfig.signal,
    });
    
    logger.debug('API Response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      logger.error('API Error:', error);
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    logger.debug('API Response data:', data);
    return data;
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | undefined>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  async getWithToken<T>(endpoint: string, params?: Record<string, string | number | undefined>, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
      params,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async post<T>(endpoint: string, data?: unknown, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async put<T>(endpoint: string, data?: unknown, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async delete<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async patch<T>(endpoint: string, data?: unknown, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async postFormData<T>(endpoint: string, formData: FormData, token?: string): Promise<T> {
    const url = this.buildUrl(endpoint);
    
    // Pobierz CSRF token z cookie
    const getCSRFToken = (): string | undefined => {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'csrf-token') {
          return value;
        }
      }
      return undefined;
    };

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-Token': getCSRFToken(),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Metoda do pobierania CSRF token
  async getCSRFToken(): Promise<{ csrfToken: string }> {
    return this.get<{ csrfToken: string }>('/csrf-token');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
