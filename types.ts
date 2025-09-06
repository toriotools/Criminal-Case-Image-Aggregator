export interface NewsImage {
  id: string;
  imageUrl: string;
  title: string;
  source: string;
  articleUrl: string;
  width?: number;
  height?: number;
  thumbnailUrl?: string;
}

export interface NewsResult {
  searchTerm: string;
  images: NewsImage[];
  totalResults?: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

export interface SearchOptions {
  searchTerms: string;
  apiKey: string;
  searchEngineId?: string;
  maxResults?: number;
}