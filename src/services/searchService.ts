import apiClient from './api';

export interface AdvancedSearchFilters {
  search?: string;
  status?: 'all' | 'active' | 'ended' | 'cancelled';
  category?: string;
  gender?: 'all' | 'male' | 'female';
  priceRange?: {
    min?: number;
    max?: number;
  };
  ringNumber?: string;
  eyeColor?: string;
  pigeonColor?: string;
  breeder?: string;
  sortBy?: 'newest' | 'ending-soon' | 'price-low' | 'price-high';
  limit?: number;
  page?: number;
}

export interface SearchResult {
  auctions: any[];
  total: number;
  page: number;
  totalPages: number;
}

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  filters: AdvancedSearchFilters;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SavedSearchData {
  name: string;
  filters: AdvancedSearchFilters;
  isActive?: boolean;
}

export const searchService = {
  /**
   * Zaawansowane wyszukiwanie aukcji
   */
  async advancedSearch(filters: AdvancedSearchFilters): Promise<SearchResult> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object') {
          Object.entries(value).forEach(([subKey, subValue]) => {
            if (subValue !== undefined && subValue !== null) {
              params.append(`${key}[${subKey}]`, String(subValue));
            }
          });
        } else {
          params.append(key, String(value));
        }
      }
    });

    return apiClient.get<SearchResult>(`/search/advanced?${params.toString()}`);
  },

  /**
   * Pobranie sugestii wyszukiwania (AI-powered)
   */
  async getSuggestions(query: string): Promise<string[]> {
    if (!query || query.length < 2) return [];
    
    return apiClient.get<string[]>(`/search/suggestions?q=${encodeURIComponent(query)}`);
  },

  /**
   * Zapisanie wyszukiwania
   */
  async saveSearch(data: SavedSearchData, token: string): Promise<SavedSearch> {
    return apiClient.post<SavedSearch>('/search/saved', data, token);
  },

  /**
   * Pobranie zapisanych wyszukiwań
   */
  async getSavedSearches(token: string): Promise<SavedSearch[]> {
    return apiClient.getWithToken<SavedSearch[]>('/search/saved', undefined, token);
  },

  /**
   * Usunięcie zapisanego wyszukiwania
   */
  async deleteSavedSearch(searchId: string, token: string): Promise<void> {
    return apiClient.delete(`/search/saved/${searchId}`, token);
  },

  /**
   * Formatowanie filtrów do URL
   */
  formatFiltersForUrl(filters: AdvancedSearchFilters): string {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== 'all') {
        if (typeof value === 'object') {
          Object.entries(value).forEach(([subKey, subValue]) => {
            if (subValue !== undefined && subValue !== null) {
              params.append(`${key}[${subKey}]`, String(subValue));
            }
          });
        } else {
          params.append(key, String(value));
        }
      }
    });

    return params.toString();
  },

  /**
   * Parsowanie filtrów z URL
   */
  parseFiltersFromUrl(urlParams: URLSearchParams): AdvancedSearchFilters {
    const filters: any = {};
    
    for (const [key, value] of urlParams.entries()) {
      // Handle nested objects like age[min]
      if (key.includes('[') && key.includes(']')) {
        const [mainKey, subKey] = key.split(/[\\[\\]]/).filter(Boolean);
        if (!filters[mainKey]) filters[mainKey] = {};
        filters[mainKey][subKey] = value;
      } else {
        filters[key] = value;
      }
    }

    // Convert numeric values
    if (filters.priceRange?.min) filters.priceRange.min = Number(filters.priceRange.min);
    if (filters.priceRange?.max) filters.priceRange.max = Number(filters.priceRange.max);
    if (filters.limit) filters.limit = Number(filters.limit);
    if (filters.page) filters.page = Number(filters.page);

    return filters as AdvancedSearchFilters;
  },

  /**
   * Pobieranie etykiet filtrów do wyświetlenia
   */
  getFilterLabels(filters: AdvancedSearchFilters): Array<{key: string, label: string, value: string}> {
    const labels: Array<{key: string, label: string, value: string}> = [];
    
    if (filters.search) {
      labels.push({ key: 'search', label: 'Szukaj', value: filters.search });
    }
    
    if (filters.category && filters.category !== 'all') {
      labels.push({ key: 'category', label: 'Kategoria', value: filters.category });
    }
    
    if (filters.gender && filters.gender !== 'all') {
      labels.push({ key: 'gender', label: 'Płeć', value: filters.gender === 'male' ? 'Samiec' : 'Samica' });
    }
    
    if (filters.priceRange?.min || filters.priceRange?.max) {
      const priceRange = filters.priceRange.min && filters.priceRange.max
        ? `${filters.priceRange.min} - ${filters.priceRange.max} zł`
        : filters.priceRange.min
        ? `Od ${filters.priceRange.min} zł`
        : `Do ${filters.priceRange.max} zł`;
      labels.push({ key: 'priceRange', label: 'Cena', value: priceRange });
    }
    
    if (filters.ringNumber) {
      labels.push({ key: 'ringNumber', label: 'Nr obrączki', value: filters.ringNumber });
    }
    
    if (filters.eyeColor) {
      labels.push({ key: 'eyeColor', label: 'Kolor oczu', value: filters.eyeColor });
    }
    
    if (filters.pigeonColor) {
      labels.push({ key: 'pigeonColor', label: 'Kolor gołębia', value: filters.pigeonColor });
    }
    
    if (filters.breeder) {
      labels.push({ key: 'breeder', label: 'Hodowca', value: filters.breeder });
    }
    
    return labels;
  }
};

export default searchService;
