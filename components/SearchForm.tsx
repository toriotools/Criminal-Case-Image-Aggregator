
import React, { useState } from 'react';
import type { SearchOptions } from '../types';
import { SearchIcon, SpinnerIcon } from './Icons';

interface SearchFormProps {
  onSearch: (options: SearchOptions) => void;
  isLoading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [searchTerms, setSearchTerms] = useState<string>('Al Capone\nTed Bundy');
  const [language, setLanguage] = useState<SearchOptions['language']>('en');
  const [imageCount, setImageCount] = useState<number>(8);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ searchTerms, language, imageCount });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 space-y-6 sticky top-24">
      <div>
        <label htmlFor="search-terms" className="block text-sm font-medium text-gray-300 mb-2">
          Criminal Names / Case Files
        </label>
        <textarea
          id="search-terms"
          rows={5}
          className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
          placeholder="Enter one name per line..."
          value={searchTerms}
          onChange={(e) => setSearchTerms(e.target.value)}
        />
        <p className="text-xs text-gray-500 mt-1">Enter one name or case per line for batch processing.</p>
      </div>

      <div>
        <label htmlFor="language" className="block text-sm font-medium text-gray-300 mb-2">
          Search Language
        </label>
        <select
          id="language"
          className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
          value={language}
          onChange={(e) => setLanguage(e.target.value as SearchOptions['language'])}
        >
          <option value="en">English</option>
          <option value="pt">Portuguese</option>
          <option value="es">Spanish</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="image-count" className="block text-sm font-medium text-gray-300 mb-2">
          Images per Term ({imageCount})
        </label>
        <input
          id="image-count"
          type="range"
          min="5"
          max="25"
          step="1"
          value={imageCount}
          onChange={(e) => setImageCount(Number(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105"
      >
        {isLoading ? (
          <>
            <SpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
            Searching Archives...
          </>
        ) : (
          <>
            <SearchIcon className="mr-2 h-5 w-5" />
            Find Images
          </>
        )}
      </button>
    </form>
  );
};

export default SearchForm;
