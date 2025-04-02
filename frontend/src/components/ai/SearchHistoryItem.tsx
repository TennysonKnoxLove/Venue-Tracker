import React from 'react';
import { AISearchQuery } from '../../types';

interface SearchHistoryItemProps {
  searchQuery: AISearchQuery;
  onClick: () => void;
}

const SearchHistoryItem: React.FC<SearchHistoryItemProps> = ({ 
  searchQuery, 
  onClick 
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="list-item cursor-pointer" onClick={onClick}>
      <div className="w-10 flex items-center justify-center">
        <span className="text-xl">🔍</span>
      </div>
      <div className="flex-grow px-2">
        <div className="font-medium">
          {searchQuery.city}, {searchQuery.state}
        </div>
        <div className="text-xs text-gray-600">
          {searchQuery.radius} mile radius • 
          {searchQuery.results && searchQuery.results.length 
            ? ` ${searchQuery.results.length} venues found` 
            : ' No results'
          }
        </div>
      </div>
      <div className="w-32 text-right text-xs text-gray-600">
        {formatDate(searchQuery.created_at)}
      </div>
    </div>
  );
};

export default SearchHistoryItem; 