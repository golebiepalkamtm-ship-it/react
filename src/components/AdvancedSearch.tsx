import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Save, Heart, Clock, TrendingUp } from 'lucide-react';
import { searchService, type AdvancedSearchFilters, type SavedSearch } from '@/services/searchService';
import { useAuth } from '@/contexts/AuthContext';

interface AdvancedSearchProps {
  onSearch: (filters: AdvancedSearchFilters) => void;
  initialFilters?: Partial<AdvancedSearchFilters>;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onSearch, initialFilters = {} }) => {
  const { session } = useAuth();
  const [filters, setFilters] = useState<AdvancedSearchFilters>({
    search: '',
    status: 'all',
    category: 'all',
    gender: 'all',
    priceRange: {},
    ringNumber: '',
    eyeColor: '',
    pigeonColor: '',
    breeder: '',
    sortBy: 'newest',
    limit: 20,
    page: 1,
    ...initialFilters,
  });
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Pobranie zapisanych wyszukiwań
  useEffect(() => {
    if (session) {
      searchService.getSavedSearches(session.access_token).then(setSavedSearches);
    }
  }, [session]);

  // Sugestie wyszukiwania
  useEffect(() => {
    let cancelled = false;
    const q = filters.search;
    if (!q || q.length < 2) return;

    searchService.getSuggestions(q).then((items) => {
      if (cancelled) return;
      setSuggestions(items);
    });

    return () => {
      cancelled = true;
    };
  }, [filters.search]);

  const handleFilterChange = (key: keyof AdvancedSearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset page when filters change
    }));
  };

  const handleNestedFilterChange = (parent: keyof AdvancedSearchFilters, child: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as any),
        [child]: value,
      },
      page: 1,
    }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleSaveSearch = async () => {
    if (!session || !searchName.trim()) return;

    try {
      await searchService.saveSearch({
        name: searchName.trim(),
        filters,
        isActive: true,
      }, session.access_token);
      
      // Odśwież listę zapisanych wyszukiwań
      const updated = await searchService.getSavedSearches(session.access_token);
      setSavedSearches(updated);
      
      setShowSaveDialog(false);
      setSearchName('');
    } catch (error) {
      console.error('Error saving search:', error);
    }
  };

  const handleLoadSavedSearch = (savedSearch: SavedSearch) => {
    setFilters(savedSearch.filters);
    onSearch(savedSearch.filters);
    setShowSavedSearches(false);
  };

  const handleDeleteSavedSearch = async (searchId: string) => {
    if (!session) return;

    try {
      await searchService.deleteSavedSearch(searchId, session.access_token);
      setSavedSearches(prev => prev.filter(s => s.id !== searchId));
    } catch (error) {
      console.error('Error deleting saved search:', error);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      category: 'all',
      gender: 'all',
      priceRange: {},
      ringNumber: '',
      eyeColor: '',
      pigeonColor: '',
      breeder: '',
      sortBy: 'newest',
      limit: 20,
      page: 1,
    });
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'page' || key === 'limit') return false;
    if (key === 'priceRange') {
      return Object.entries(value as any).some(([, v]) => v !== undefined && v !== '');
    }
    return value !== undefined && value !== '' && value !== 'all';
  }).length;

  const suggestionsToShow = filters.search && filters.search.length >= 2 ? suggestions : [];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Główne pole wyszukiwania */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Szukaj gołębi, hodowców, linii..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          {/* Sugestie */}
          {suggestionsToShow.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
              {suggestionsToShow.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleFilterChange('search', suggestion)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Szukaj
        </button>
        
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeFiltersCount > 0 
              ? 'bg-orange-100 text-orange-700 border border-orange-300' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filtry {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </button>

        {session && (
          <button
            onClick={() => setShowSavedSearches(!showSavedSearches)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Heart className="w-4 h-4 mr-2" />
            Zapisane
          </button>
        )}
      </div>

      {/* Zaawansowane filtry */}
      {showAdvanced && (
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Wszystkie</option>
                <option value="active">Aktywne</option>
                <option value="ended">Zakończone</option>
                <option value="cancelled">Anulowane</option>
              </select>
            </div>

            {/* Kategoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategoria</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Wszystkie</option>
                <option value="racing">Wyścigowe</option>
                <option value="breeding">Hodowlane</option>
                <option value="show">Wystawowe</option>
              </select>
            </div>

            {/* Płeć */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Płeć</label>
              <select
                value={filters.gender}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Wszystkie</option>
                <option value="male">Samce</option>
                <option value="female">Samice</option>
              </select>
            </div>

            {/* Zakres cenowy */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cena (zł)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Od"
                  min="0"
                  value={filters.priceRange?.min || ''}
                  onChange={(e) => handleNestedFilterChange('priceRange', 'min', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Do"
                  min="0"
                  value={filters.priceRange?.max || ''}
                  onChange={(e) => handleNestedFilterChange('priceRange', 'max', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Sortowanie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sortuj</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Najnowsze</option>
                <option value="ending-soon">Kończące się</option>
                <option value="price-low">Cena rosnąco</option>
                <option value="price-high">Cena malejąco</option>
              </select>
            </div>

            {/* Dodatkowe pola */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Numer obrączki</label>
              <input
                type="text"
                placeholder="Numer obrączki"
                value={filters.ringNumber}
                onChange={(e) => handleFilterChange('ringNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kolor oczu</label>
              <input
                type="text"
                placeholder="Kolor oczu"
                value={filters.eyeColor}
                onChange={(e) => handleFilterChange('eyeColor', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kolor gołębia</label>
              <input
                type="text"
                placeholder="Kolor gołębia"
                value={filters.pigeonColor}
                onChange={(e) => handleFilterChange('pigeonColor', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hodowca</label>
              <input
                type="text"
                placeholder="Nazwa hodowcy"
                value={filters.breeder}
                onChange={(e) => handleFilterChange('breeder', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Akcje */}
          <div className="flex gap-4 mt-4 pt-4 border-t border-gray-200">
            {session && (
              <button
                onClick={() => setShowSaveDialog(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                Zapisz wyszukiwanie
              </button>
            )}
            
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4 mr-2" />
              Wyczyść filtry
            </button>
          </div>
        </div>
      )}

      {/* Zapisane wyszukiwania */}
      {showSavedSearches && (
        <div className="border-t border-gray-200 pt-4">
          <h3 className="font-semibold text-gray-900 mb-3">Zapisane wyszukiwania</h3>
          {savedSearches.length === 0 ? (
            <p className="text-gray-500">Brak zapisanych wyszukiwań</p>
          ) : (
            <div className="space-y-2">
              {savedSearches.map((savedSearch) => (
                <div key={savedSearch.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{savedSearch.name}</h4>
                    <p className="text-sm text-gray-500">
                      {searchService.getFilterLabels(savedSearch.filters).map(label => label.value).join(', ')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLoadSavedSearch(savedSearch)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                    >
                      Załaduj
                    </button>
                    <button
                      onClick={() => handleDeleteSavedSearch(savedSearch.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                    >
                      Usuń
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dialog zapisywania wyszukiwania */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Zapisz wyszukiwanie</h3>
            <input
              type="text"
              placeholder="Nazwa wyszukiwania"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />
            <div className="flex gap-4">
              <button
                onClick={handleSaveSearch}
                disabled={!searchName.trim()}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                Zapisz
              </button>
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setSearchName('');
                }}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
