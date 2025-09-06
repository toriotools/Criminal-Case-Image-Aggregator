import React, { useState, useCallback } from 'react';
import type { NewsResult, SearchOptions } from './types';
import { searchMultipleTerms } from './services/imageSearchService';
import SearchForm from './components/SearchForm';
import ResultsDisplay from './components/ResultsDisplay';
import { FileSearchIcon } from './components/Icons';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<NewsResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchOffsets, setSearchOffsets] = useState<Map<string, number>>(new Map());
  const [lastSearchOptions, setLastSearchOptions] = useState<SearchOptions | null>(null);

  const handleLoadMore = useCallback(async (searchTerm: string) => {
    if (!lastSearchOptions) return;
    
    // Re-search the specific term with the last used options
    handleSearch({
      ...lastSearchOptions,
      searchTerms: searchTerm
    });
  }, [lastSearchOptions]);

  const handleDownloadAllPages = useCallback(async (searchTerm: string) => {
    // This would download all pages for a specific search term
    // Implementation will be added
    alert(`Download all pages for "${searchTerm}" - Feature coming soon!`);
  }, []);

  const handleSearch = useCallback(async (options: SearchOptions) => {
    setIsLoading(true);
    setError(null);
    setLastSearchOptions(options);

    const terms = options.searchTerms
      .split('\n')
      .map(term => term.trim())
      .filter(term => term.length > 0);

    if (terms.length === 0) {
      setError("Please enter at least one search term.");
      setIsLoading(false);
      return;
    }

    if (!options.searchEngineId) {
      setError("Please provide a Custom Search Engine ID.");
      setIsLoading(false);
      return;
    }

    try {
      const searchResults = await searchMultipleTerms(
        terms,
        options.apiKey,
        options.searchEngineId,
        options.maxResults || 100,
        searchOffsets
      );

      const successfulResults: NewsResult[] = [];
      const failedTerms: string[] = [];
      const newOffsets = new Map(searchOffsets);
      
      searchResults.forEach((result) => {
        // Update offset for this search term
        newOffsets.set(result.searchTerm, result.newOffset);
        
        if (result.searchResult.images.length > 0) {
          // Check if we already have results for this term
          const existingResultIndex = results.findIndex(r => r.searchTerm === result.searchTerm);
          
          if (existingResultIndex >= 0) {
            // Append new images to existing results
            const existingResult = results[existingResultIndex];
            const combinedImages = [...existingResult.images, ...result.searchResult.images];
            const newsResult: NewsResult = {
              searchTerm: result.searchTerm,
              images: combinedImages,
              totalResults: result.searchResult.totalResults || existingResult.totalResults,
              currentPage: result.searchResult.currentPage,
              totalPages: result.searchResult.totalPages,
              hasMore: result.searchResult.hasMore,
            };
            successfulResults.push(newsResult);
          } else {
            // New search term result
            const newsResult: NewsResult = {
              searchTerm: result.searchTerm,
              images: result.searchResult.images,
              totalResults: result.searchResult.totalResults,
              currentPage: result.searchResult.currentPage,
              totalPages: result.searchResult.totalPages,
              hasMore: result.searchResult.hasMore,
            };
            successfulResults.push(newsResult);
          }
        } else {
          failedTerms.push(result.searchTerm);
          if (result.error) {
            console.error(`Failed to fetch data for "${result.searchTerm}":`, result.error);
          }
        }
      });

      // Include results from other search terms that weren't searched this time
      results.forEach(existingResult => {
        if (!terms.includes(existingResult.searchTerm)) {
          successfulResults.push(existingResult);
        }
      });

      setSearchOffsets(newOffsets);
      setResults(successfulResults);

      if (failedTerms.length > 0) {
        setError(`Could not retrieve results for: ${failedTerms.join(', ')}. Check the console for more details.`);
      }

    } catch (err) {
      console.error("An unexpected error occurred:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`An unexpected error occurred during the search. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [results, searchOffsets]);

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans">
      <header className="bg-black/90 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <FileSearchIcon className="w-8 h-8 text-cyan-400" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Criminal Case Image Aggregator
                </h1>
                <div className="text-xs text-gray-400 space-y-0.5">
                  <p>Open Source Project • Made with ❤️ by <span className="text-cyan-400 font-semibold">Torio Tools</span></p>
                  <p>This tool fetches publicly available images. Use of images may be subject to copyright.</p>
                  <p>&copy; {new Date().getFullYear()} Torio Tools. All Rights Reserved.</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <a 
                href="https://ko-fi.com/toriotools" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-1"
              >
                ☕ Ko-fi
              </a>
              <a 
                href="https://www.youtube.com/@toriotools" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-1"
              >
                📺 10k Goal
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 xl:col-span-3">
            <SearchForm onSearch={handleSearch} isLoading={isLoading} />
          </div>
          <div className="lg:col-span-8 xl:col-span-9">
            <ResultsDisplay 
              results={results} 
              isLoading={isLoading} 
              error={error} 
              onLoadMore={handleLoadMore}
              onDownloadAllPages={handleDownloadAllPages}
            />
          </div>
        </div>
      </main>
      
    </div>
  );
};

export default App;
