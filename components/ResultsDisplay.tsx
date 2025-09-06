import React from 'react';
import type { NewsResult } from '../types';
import ImageCard from './ImageCard';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { DownloadIcon, SpinnerIcon } from './Icons';

interface ResultsDisplayProps {
  results: NewsResult[];
  isLoading: boolean;
  error: string | null;
  onLoadMore?: (searchTerm: string) => void;
  onDownloadAllPages?: (searchTerm: string) => void;
}

const SkeletonCard: React.FC = () => (
    <div className="bg-gray-900 rounded-lg shadow-xl border border-gray-800 animate-pulse">
        <div className="w-full h-48 bg-gray-800 rounded-t-lg"></div>
        <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-800 rounded w-3/4"></div>
            <div className="h-3 bg-gray-800 rounded w-full"></div>
            <div className="h-3 bg-gray-800 rounded w-1/2"></div>
        </div>
    </div>
);

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, isLoading, error, onLoadMore, onDownloadAllPages }) => {
  const [isZipping, setIsZipping] = React.useState(false);
  const [downloadingAllPages, setDownloadingAllPages] = React.useState<string | null>(null);

  const handleDownloadZip = async (caseResult: NewsResult) => {
    setIsZipping(true);
    const zip = new JSZip();
    const searchTerm = caseResult.searchTerm.replace(/\s+/g, '_');
    let downloadedCount = 0;
    let failedCount = 0;

    try {
      // Process images sequentially to avoid overwhelming the browser and ensure better success rate
      for (let i = 0; i < caseResult.images.length; i++) {
        const image = caseResult.images[i];
        try {
          // Try original image first (higher quality), fallback to thumbnail if needed
          let imageUrl = image.imageUrl;
          let response = await fetch(imageUrl, {
            mode: 'cors',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });
          
          // If original fails, try thumbnail
          if (!response.ok && image.thumbnailUrl) {
            console.log(`Original image failed, trying thumbnail for: ${image.title}`);
            imageUrl = image.thumbnailUrl;
            response = await fetch(imageUrl, {
              mode: 'cors',
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              }
            });
          }
          
          if (!response.ok) {
            console.error(`Failed to fetch image: ${imageUrl} (Status: ${response.status})`);
            failedCount++;
            continue;
          }
          
          const blob = await response.blob();
          
          // Better filename generation with index to avoid duplicates
          const extension = blob.type.includes('png') ? '.png' : 
                           blob.type.includes('gif') ? '.gif' : 
                           blob.type.includes('webp') ? '.webp' : '.jpg';
          
          const sanitizedTitle = image.title
            .replace(/[^a-zA-Z0-9_.-]/g, '_')
            .substring(0, 40);
          
          const filename = `${i + 1}_${sanitizedTitle}${extension}`;
          
          zip.file(filename, blob);
          downloadedCount++;
          
          // Add small delay to avoid overwhelming servers
          if (i < caseResult.images.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
          
        } catch (e) {
          console.error(`Error fetching or adding image ${image.imageUrl} to zip:`, e);
          failedCount++;
        }
      }

      console.log(`Download completed: ${downloadedCount} successful, ${failedCount} failed out of ${caseResult.images.length} total images`);
      
      if (downloadedCount > 0) {
        const content = await zip.generateAsync({ 
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: { level: 6 }
        });
        
        const filename = `${searchTerm}_images_${downloadedCount}of${caseResult.images.length}.zip`;
        saveAs(content, filename);
        
        if (failedCount > 0) {
          alert(`Download completed! ${downloadedCount} images downloaded successfully. ${failedCount} images failed to download (likely due to CORS restrictions or broken links).`);
        } else {
          alert(`All ${downloadedCount} images downloaded successfully!`);
        }
      } else {
        alert('No images could be downloaded. This might be due to CORS restrictions or broken image links.');
      }

    } catch (err) {
      console.error("Error creating zip file:", err);
      alert('Error creating zip file. Please try again.');
    } finally {
      setIsZipping(false);
    }
  };


  if (isLoading) {
    return (
      <div>
        <div className="h-8 bg-gray-800 rounded w-1/3 mb-6 animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-lg" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-gray-900 border-2 border-dashed border-gray-800 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-200">Ready to Investigate</h3>
        <p className="text-gray-400 mt-2">Enter an API Key and search terms to begin compiling your case files.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {results.map(caseResult => (
        <section key={caseResult.searchTerm}>
          <div className="border-b-2 border-cyan-500 pb-4 mb-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h2 className="text-3xl font-bold text-white">
                  Case File: {caseResult.searchTerm}
                </h2>
                <div className="text-sm text-gray-400 mt-1 space-y-1">
                  <p><span className="font-semibold">{caseResult.images.length} images loaded</span> from page {caseResult.currentPage}</p>
                  {caseResult.totalResults && (
                    <p><span className="font-semibold">{caseResult.totalResults.toLocaleString()} total results</span> available ({caseResult.totalPages} pages)</p>
                  )}
                  {caseResult.hasMore && (
                    <p className="text-cyan-400">📄 More pages available!</p>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 flex-col sm:flex-row">
                {caseResult.hasMore && onLoadMore && (
                  <button
                    onClick={() => onLoadMore(caseResult.searchTerm)}
                    disabled={isLoading}
                    className="flex items-center bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
                  >
                    {isLoading ? (
                      <>
                        <SpinnerIcon className="animate-spin -ml-1 mr-2 h-5 w-5" />
                        Loading...
                      </>
                    ) : (
                      <>
                        📄 Load More
                      </>
                    )}
                  </button>
                )}
                
                {onDownloadAllPages && caseResult.totalPages > 1 && (
                  <button
                    onClick={() => onDownloadAllPages && onDownloadAllPages(caseResult.searchTerm)}
                    disabled={downloadingAllPages === caseResult.searchTerm}
                    className="flex items-center bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
                  >
                    {downloadingAllPages === caseResult.searchTerm ? (
                      <>
                        <SpinnerIcon className="animate-spin -ml-1 mr-2 h-5 w-5" />
                        All Pages...
                      </>
                    ) : (
                      <>
                        📥 Download All Pages
                      </>
                    )}
                  </button>
                )}
                
                <button
                  onClick={() => handleDownloadZip(caseResult)}
                  disabled={isZipping}
                  className="flex items-center bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
                >
                  {isZipping ? (
                    <>
                      <SpinnerIcon className="animate-spin -ml-1 mr-2 h-5 w-5" />
                      Zipping...
                    </>
                  ) : (
                    <>
                      <DownloadIcon className="mr-2 h-5 w-5" />
                      Download Current
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {caseResult.images.map(image => (
              <ImageCard key={image.id} image={image} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default ResultsDisplay;