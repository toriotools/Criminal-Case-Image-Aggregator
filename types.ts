export interface GeminiImageResponse {
  description: string;
  imageType: string;
  source: string;
  year: number;
  generatedFilename: string;
  sourceUrl: string;
  base64Image: string;
}

export interface ImageResult extends GeminiImageResponse {
  id: string;
  imageUrl: string;
}

export interface CaseResult {
  searchTerm: string;
  images: ImageResult[];
}

export interface SearchOptions {
    searchTerms: string;
    language: 'en' | 'pt' | 'es';
    imageCount: number;
}