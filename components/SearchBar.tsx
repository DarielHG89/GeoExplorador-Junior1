import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  disabled?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, disabled = false }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (disabled) return;
    onSearch(query);
    setQuery(''); // Clear input after search
  };

  return (
    <div className="w-80">
      <form
        onSubmit={handleSubmit}
        className={`flex items-center bg-white/10 backdrop-blur-md rounded-full shadow-lg border border-white/30 transition-all duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : 'focus-within:ring-2 focus-within:ring-sky-300'}`}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar un país..."
          className="bg-transparent text-white placeholder-white/70 w-full focus:outline-none px-6 py-3 disabled:cursor-not-allowed"
          aria-label="Buscar país"
          disabled={disabled}
        />
        <button
          type="submit"
          className="text-white/80 hover:text-white pr-5 pl-2 transition-colors disabled:cursor-not-allowed"
          aria-label="Buscar"
          disabled={disabled}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default SearchBar;