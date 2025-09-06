import React, { useState } from 'react';
import type { SearchOptions } from '../types';
import { SearchIcon, SpinnerIcon } from './Icons';

interface SearchFormProps {
  onSearch: (options: SearchOptions) => void;
  isLoading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [searchTerms, setSearchTerms] = useState<string>('Al Capone\nTed Bundy');
  const [apiKey, setApiKey] = useState<string>('');
  const [searchEngineId, setSearchEngineId] = useState<string>('873c22d7520234923');
  const [maxResults, setMaxResults] = useState<number>(100);
  const [rememberCredentials, setRememberCredentials] = useState<boolean>(false);

  // Load saved credentials on component mount
  React.useEffect(() => {
    try {
      const savedApiKey = localStorage.getItem('torio-tools-api-key');
      const savedSearchEngineId = localStorage.getItem('torio-tools-search-engine-id');
      const savedRememberSetting = localStorage.getItem('torio-tools-remember-credentials') === 'true';
      
      if (savedApiKey) {
        setApiKey(savedApiKey);
      }
      if (savedSearchEngineId) {
        setSearchEngineId(savedSearchEngineId);
      }
      setRememberCredentials(savedRememberSetting);
    } catch (error) {
      console.warn('Error loading saved credentials:', error);
    }
  }, []);

  // Save credentials when remember option is toggled
  React.useEffect(() => {
    try {
      if (rememberCredentials) {
        if (apiKey) localStorage.setItem('torio-tools-api-key', apiKey);
        if (searchEngineId) localStorage.setItem('torio-tools-search-engine-id', searchEngineId);
        localStorage.setItem('torio-tools-remember-credentials', 'true');
      } else {
        localStorage.removeItem('torio-tools-api-key');
        localStorage.removeItem('torio-tools-search-engine-id');
        localStorage.removeItem('torio-tools-remember-credentials');
      }
    } catch (error) {
      console.warn('Error saving credentials:', error);
    }
  }, [rememberCredentials, apiKey, searchEngineId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) {
      alert('Please enter a Google API Key.');
      return;
    }
    if (!searchEngineId) {
      alert('Please enter a Custom Search Engine ID.');
      return;
    }
    onSearch({ searchTerms, apiKey, searchEngineId, maxResults });
  };

  const handleClearCredentials = () => {
    if (confirm('Are you sure you want to clear all saved credentials?')) {
      setApiKey('');
      setSearchEngineId('873c22d7520234923'); // Reset to default
      setRememberCredentials(false);
      localStorage.removeItem('torio-tools-api-key');
      localStorage.removeItem('torio-tools-search-engine-id');
      localStorage.removeItem('torio-tools-remember-credentials');
      alert('Credentials cleared successfully!');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-lg shadow-xl border border-gray-800 space-y-6 sticky top-24">
      <div>
        <label htmlFor="api-key" className="block text-sm font-medium text-gray-300 mb-2">
          Google API Key
        </label>
        <input
          id="api-key"
          type="password"
          className="w-full bg-black border border-gray-700 rounded-md p-3 text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
          placeholder="Enter your Google API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <p className="text-xs text-gray-500 mt-1">
          Get a free key from{' '}
          <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
            Google Cloud Console
          </a>
        </p>
      </div>

      <div>
        <label htmlFor="search-engine-id" className="block text-sm font-medium text-gray-300 mb-2">
          Custom Search Engine ID
        </label>
        <input
          id="search-engine-id"
          type="password"
          className="w-full bg-black border border-gray-700 rounded-md p-3 text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
          placeholder="Enter your Custom Search Engine ID"
          value={searchEngineId}
          onChange={(e) => setSearchEngineId(e.target.value)}
        />
        <p className="text-xs text-gray-500 mt-1">
          Create one at{' '}
          <a href="https://programmablesearchengine.google.com/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
            Google Custom Search
          </a>
        </p>
      </div>

      <div>
        <label htmlFor="search-terms" className="block text-sm font-medium text-gray-300 mb-2">
          Criminal Names / Case Files
        </label>
        <textarea
          id="search-terms"
          rows={5}
          className="w-full bg-black border border-gray-700 rounded-md p-3 text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
          placeholder="Enter one name per line..."
          value={searchTerms}
          onChange={(e) => setSearchTerms(e.target.value)}
        />
        <p className="text-xs text-gray-500 mt-1">Enter one name or case per line for batch processing.</p>
      </div>

      <div>
        <label htmlFor="max-results" className="block text-sm font-medium text-gray-300 mb-2">
          Maximum Images per Search
        </label>
        <select
          id="max-results"
          className="w-full bg-black border border-gray-700 rounded-md p-3 text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
          value={maxResults}
          onChange={(e) => setMaxResults(Number(e.target.value))}
        >
          <option value={10}>10 images</option>
          <option value={20}>20 images</option>
          <option value={50}>50 images</option>
          <option value={100}>100 images (Maximum)</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">More images = more API calls. 100 uses your daily quota faster.</p>
      </div>

      <div className="border-t border-gray-800 pt-4">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={rememberCredentials}
            onChange={(e) => setRememberCredentials(e.target.checked)}
            className="w-4 h-4 text-cyan-600 bg-black border-gray-700 rounded focus:ring-cyan-500 focus:ring-2"
          />
          <div>
            <span className="text-sm font-medium text-gray-300">Remember my API credentials</span>
            <p className="text-xs text-gray-500 mt-0.5">
              ⚠️ Only enable on your personal device. Credentials are stored locally in your browser.
            </p>
          </div>
        </label>
        
        {rememberCredentials && (
          <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-700 rounded-md">
            <p className="text-xs text-yellow-200">
              🔒 <strong>Security Notice:</strong> Your API credentials will be saved in your browser's local storage. 
              Only use this feature on trusted, personal devices. You can clear them anytime by unchecking this option.
            </p>
          </div>
        )}
        
        {(localStorage.getItem('torio-tools-api-key') || localStorage.getItem('torio-tools-search-engine-id')) && (
          <button
            type="button"
            onClick={handleClearCredentials}
            className="mt-3 w-full text-red-400 hover:text-red-300 text-sm underline transition-colors"
          >
            🗑️ Clear All Saved Credentials
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || !apiKey || !searchEngineId}
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