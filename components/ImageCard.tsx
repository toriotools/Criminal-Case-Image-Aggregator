import React from 'react';
import type { NewsImage } from '../types';
import { LinkIcon } from './Icons';

interface ImageCardProps {
  image: NewsImage;
}

const ImageCard: React.FC<ImageCardProps> = ({ image }) => {
  // A simple function to prevent broken images
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://via.placeholder.com/400x300.png?text=Image+Not+Found';
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-xl overflow-hidden border border-gray-800 flex flex-col group transition-all duration-300 hover:shadow-cyan-500/30 hover:border-cyan-600">
      <a href={image.articleUrl} target="_blank" rel="noopener noreferrer" className="relative">
        <img 
          src={image.thumbnailUrl || image.imageUrl} 
          alt={image.title} 
          className="w-full h-48 object-cover"
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
            <p className="text-center text-white font-semibold">View Full Size</p>
        </div>
      </a>
      <div className="p-4 flex-grow flex flex-col">
        <p className="text-gray-200 text-sm mb-2 flex-grow font-semibold">{image.title}</p>
        <div className="mt-auto space-y-2 text-xs text-gray-500">
          <div className="flex items-center gap-2 pt-1">
            <LinkIcon className="w-4 h-4 text-gray-600" />
            <span className="truncate">
              Source: {image.source}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCard;
