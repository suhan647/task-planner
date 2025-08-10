import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';

export function SearchBar() {
  const { state, dispatch } = useTaskContext();
  const [isFocused, setIsFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_SEARCH_QUERY', query: e.target.value });
  }, [dispatch]);

  const clearSearch = useCallback(() => {
    dispatch({ type: 'SET_SEARCH_QUERY', query: '' });
    searchInputRef.current?.focus();
  }, [dispatch]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      
      // Escape to clear search and blur
      if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        if (state.searchQuery) {
          clearSearch();
        } else {
          searchInputRef.current?.blur();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.searchQuery, clearSearch]);

  return (
    <div className="relative flex-1 max-w-md">
      <div className="relative">
        <Search 
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
            isFocused ? 'text-blue-600' : 'text-gray-400'
          }`} 
        />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search tasks by title or category... (Ctrl+K)"
          value={state.searchQuery}
          onChange={handleSearchChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full pl-10 pr-10 py-2 border rounded-lg text-sm
            transition-all duration-200
            ${isFocused 
              ? 'border-blue-500 ring-2 ring-blue-200 bg-white' 
              : 'border-gray-300 bg-gray-50 hover:bg-white hover:border-gray-400'
            }
            focus:outline-none focus:ring-2 focus:ring-blue-200
          `}
        />
        {state.searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors duration-200"
            title="Clear search (Esc)"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>
      
      {/* Search results count */}
      {state.searchQuery && (
        <div className="absolute top-full left-0 right-0 mt-1 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="text-sm text-gray-600">
            {state.searchQuery.trim() && (
              <span>
                Searching for "{state.searchQuery}"...
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 