import type { NewsImage } from '../types';

export const fetchNewsImages = async (
  searchTerm: string,
  apiKey: string
): Promise<NewsImage[]> => {
  // URL encode the search term to handle special characters
  const encodedSearchTerm = encodeURIComponent(searchTerm);
  
  // Construct the API URL
  const url = `https://newsdata.io/api/1/news?apikey=${apiKey}&q=${encodedSearchTerm}&image=1&language=en`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.results?.message || response.statusText}`);
    }

    const data = await response.json();

    if (data.status === 'success' && data.results) {
      const images: NewsImage[] = data.results
        .filter((article: any) => article.image_url) // Filter out articles without images
        .map((article: any, index: number) => ({
          id: `${searchTerm.replace(/\s+/g, '-')}-${index}`,
          imageUrl: article.image_url,
          title: article.title,
          source: article.source_id,
          articleUrl: article.link,
        }));
      return images;
    }

    return [];
  } catch (error) {
    console.error(`Failed to fetch news for "${searchTerm}":`, error);
    throw error;
  }
};
