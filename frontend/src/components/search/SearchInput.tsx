import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { SearchResults } from './SearchResults';
import { pageSearchService, SearchablePageItem } from '../../services/SearchService';

export const SearchInput: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchablePageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResultsDropdown, setShowResultsDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const performSearch = useCallback(async (searchTerm: string) => {
    if (searchTerm.trim() === '') {
      setResults([]);
      setShowResultsDropdown(false);
      return;
    }
    setIsLoading(true);
    setShowResultsDropdown(true);
    // Simulate API call delay or direct search
    // await new Promise(resolve => setTimeout(resolve, 100)); // Optional delay
    const searchResults = pageSearchService.search(searchTerm);
    setResults(searchResults);
    setIsLoading(false);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setShowResultsDropdown(false);
  }, []);

  const navigateToResult = useCallback((route: string) => {
    navigate(route);
    clearSearch();
  }, [navigate, clearSearch]);
  
  // Handle input change with debounce
  useEffect(() => {
    if (query.trim() === '') {
      clearSearch();
      return;
    }
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300); // 300ms debounce
    return () => clearTimeout(timer);
  }, [query, performSearch, clearSearch]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  // Handle key down for Enter (search) and Escape (clear)
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      performSearch(query);
    }
    if (event.key === 'Escape') {
      clearSearch();
      if (inputRef.current) {
        inputRef.current.blur(); // Remove focus
      }
    }
  };

  // Clear search input
  const handleClearInput = () => {
    clearSearch();
    if (inputRef.current) {
      inputRef.current.focus(); // Keep focus on input after clearing
    }
  };
  
  const handleFocus = () => {
    if (query.trim() !== '' && results.length > 0) {
        setShowResultsDropdown(true);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        placeholder="Buscar páginas..."
        className="pl-10 pr-10 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        aria-label="Buscar en la aplicación"
      />
      {query && (
        <button 
          onClick={handleClearInput}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          aria-label="Limpiar búsqueda"
        >
          <X className="h-5 w-5" />
        </button>
      )}
      <SearchResults 
        results={results}
        isLoading={isLoading}
        showResults={showResultsDropdown}
        query={query}
        onClose={() => setShowResultsDropdown(false)}
        onNavigate={navigateToResult}
      />
    </div>
  );
};
