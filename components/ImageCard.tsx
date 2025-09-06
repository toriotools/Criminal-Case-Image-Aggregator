import React, { useState } from 'react';
import type { ImageResult } from '../types';
import { DownloadIcon, LinkIcon, SpinnerIcon } from './Icons';

interface ImageCardProps {
  image: ImageResult;
}

const ImageCard: React.FC<ImageCardProps> = ({ image }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const a = document.createElement('a');
      a.href = image.imageUrl; // Directly use the data URL
      a.download = image.generatedFilename || 'download.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download image.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700 flex flex-col group transition-all duration-300 hover:shadow-cyan-500/20 hover:border-cyan-800">
      <div className="relative">
        <img src={image.imageUrl} alt={image.description} className="w-full h-48 object-cover" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center bg-cyan-600/80 text-white py-2 px-4 rounded-md hover:bg-cyan-500 transition-colors disabled:bg-gray-500"
            >
                {isDownloading ? (
                    <SpinnerIcon className="animate-spin h-5 w-5 mr-2" />
                ) : (
                    <DownloadIcon className="h-5 w-5 mr-2" />
                )}
                <span>Download</span>
            </button>
        </div>
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <p className="text-gray-300 text-sm mb-2 flex-grow">{image.description}</p>
        <div className="mt-auto space-y-2 text-xs text-gray-400">
          <div className="bg-gray-700/50 p-2 rounded">
            <p className="font-mono break-all">{image.generatedFilename}</p>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <LinkIcon className="w-4 h-4 text-gray-500" />
            <a href={image.sourceUrl} target="_blank" rel="noopener noreferrer" className="truncate hover:text-cyan-400 transition-colors">
              Source: {image.source}, {image.year}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCard;