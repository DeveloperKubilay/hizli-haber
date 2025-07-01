import React, { useRef } from 'react';
import { Search, X } from 'lucide-react';

function SearchBar({ searchTerm, onSearchChange, autoFocus = false }) {
  const searchInputRef = useRef(null);

  // Auto focus effect
  React.useEffect(() => {
    if (autoFocus && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [autoFocus]);

  return (
    <div className="mb-4">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textPrimary" size={20} />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Haber ara... (başlık, açıklama veya etiket)"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-10 py-3 bg-primaryBG text-textPrimary placeholder-textPrimary border border-primaryBG rounded-2xl focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50 hover:border-selectBox transition-all duration-200"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-textPrimary hover:text-secondary transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>
    </div>
  );
}

export default SearchBar;
