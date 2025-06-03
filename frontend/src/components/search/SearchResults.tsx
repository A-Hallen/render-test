import React, { useRef, useEffect } from 'react';
import { SearchablePageItem } from '../../services/SearchService'; 
import { FileText } from 'lucide-react';

interface SearchResultsProps {
  results: SearchablePageItem[];
  isLoading: boolean;
  showResults: boolean;
  query: string;
  onClose: () => void;
  onNavigate: (route: string) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ 
  results, 
  isLoading, 
  showResults, 
  query, 
  onClose,
  onNavigate 
}) => {
  const searchResultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target as Node)) {
        const searchInput = document.querySelector('input[aria-label="Buscar en la aplicación"]');
        if (searchInput && !searchInput.contains(event.target as Node)) {
          onClose();
        }
      }
    };

    if (showResults) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showResults, onClose]);

  if (!showResults || query.trim() === '') {
    return null;
  }

  const handleResultClick = (route: string) => {
    onNavigate(route);
  };

  if (isLoading) {
    return (
      <div ref={searchResultsRef} className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4">
        <p className="text-gray-500">Buscando...</p>
      </div>
    );
  }

  if (results.length === 0 && !isLoading) {
    return (
      <div ref={searchResultsRef} className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4">
        <p className="text-gray-500">No se encontraron páginas.</p>
      </div>
    );
  }

  return (
    <div ref={searchResultsRef} className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      <div className="p-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase px-2 py-1">
          Páginas
        </h3>
        <ul>
          {results.map((item: SearchablePageItem) => (
            <li key={item.id}>
              <button
                onClick={() => handleResultClick(item.route)}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md flex items-center space-x-3 transition-colors duration-150 ease-in-out"
              >
                <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div className="flex-grow">
                  <p className="text-sm font-medium text-gray-800">{item.title}</p>
                  {item.description && (
                    <p className="text-xs text-gray-500">{item.description}</p>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
