import type { NewsImage } from '../types';

export interface ImageSearchOptions {
  apiKey: string;
  searchEngineId: string;
  searchTerm: string;
  safeSearch?: 'off' | 'medium' | 'high';
  imageSize?: 'large' | 'medium' | 'small';
  imageType?: 'face' | 'photo' | 'clipart' | 'lineart';
}

export interface SearchResult {
  images: NewsImage[];
  totalResults?: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

export const searchImages = async (options: ImageSearchOptions & { maxResults?: number; startOffset?: number; pageSize?: number }): Promise<SearchResult> => {
  const { apiKey, searchEngineId, searchTerm, safeSearch = 'medium', imageSize = 'large', imageType = 'photo', maxResults = 100, startOffset = 0, pageSize = 10 } = options;
  
  // URL encode the search term
  const encodedSearchTerm = encodeURIComponent(searchTerm);
  
  const allImages: NewsImage[] = [];
  const maxResultsPerPage = pageSize; // Configurable page size
  const maxPages = Math.min(Math.ceil(maxResults / maxResultsPerPage), 10); // Max 100 results total due to API limits
  let totalResultsFromAPI = 0;
  
  for (let page = 0; page < maxPages; page++) {
    const startIndex = startOffset + (page * maxResultsPerPage) + 1;
    
    // Construct Google Custom Search API URL for images
    const baseUrl = 'https://www.googleapis.com/customsearch/v1';
    const params = new URLSearchParams({
      key: apiKey,
      cx: searchEngineId,
      q: encodedSearchTerm,
      searchType: 'image',
      safe: safeSearch,
      imgSize: imageSize,
      imgType: imageType,
      num: maxResultsPerPage.toString(),
      start: startIndex.toString(),
    });

    const url = `${baseUrl}?${params}`;

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`API Error on page ${page + 1}:`, errorData.error?.message);
        break; // Stop pagination on error
      }

      const data = await response.json();

      // Capture total results from first page
      if (page === 0 && data.searchInformation?.totalResults) {
        totalResultsFromAPI = parseInt(data.searchInformation.totalResults);
      }

      if (data.items && data.items.length > 0) {
        const images: NewsImage[] = data.items.map((item: any, index: number) => ({
          id: `${searchTerm.replace(/\s+/g, '-')}-${startIndex + index}`,
          imageUrl: item.link,
          title: item.title,
          source: item.displayLink || 'Unknown',
          articleUrl: item.image?.contextLink || item.link,
          width: item.image?.width,
          height: item.image?.height,
          thumbnailUrl: item.image?.thumbnailLink,
        }));

        allImages.push(...images);
      } else {
        // No more results available
        break;
      }
      
      // Small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Failed to search images for "${searchTerm}" on page ${page + 1}:`, error);
      break; // Stop pagination on error
    }
  }

  const currentPage = Math.floor(startOffset / pageSize) + 1;
  const totalPages = totalResultsFromAPI ? Math.ceil(totalResultsFromAPI / pageSize) : Math.ceil(allImages.length / pageSize);
  const hasMore = allImages.length >= maxResults && totalPages > currentPage;

  return {
    images: allImages,
    totalResults: totalResultsFromAPI,
    currentPage,
    totalPages,
    hasMore
  };
};

export const searchMultipleTerms = async (
  terms: string[],
  apiKey: string,
  searchEngineId: string,
  maxResults: number = 100,
  searchOffsets: Map<string, number> = new Map()
): Promise<{ searchTerm: string; searchResult: SearchResult; error?: string; newOffset: number }[]> => {
  const promises = terms.map(async (term) => {
    try {
      const currentOffset = searchOffsets.get(term) || 0;
      const searchResult = await searchImages({
        apiKey,
        searchEngineId,
        searchTerm: term,
        maxResults,
        startOffset: currentOffset,
      });
      const newOffset = currentOffset + searchResult.images.length;
      return { searchTerm: term, searchResult, newOffset };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const currentOffset = searchOffsets.get(term) || 0;
      const emptyResult: SearchResult = {
        images: [],
        currentPage: 1,
        totalPages: 0,
        hasMore: false
      };
      return { searchTerm: term, searchResult: emptyResult, error: errorMessage, newOffset: currentOffset };
    }
  });

  return Promise.all(promises);
};