
import React from 'react';
import type { CaseResult } from '../types';
import ImageCard from './ImageCard';

interface ResultsDisplayProps {
  results: CaseResult[];
  isLoading: boolean;
  error: string | null;
}

const SkeletonCard: React.FC = () => (
    <div className="bg-gray-800 rounded-lg shadow-md border border-gray-700 animate-pulse">
        <div className="w-full h-48 bg-gray-700 rounded-t-lg"></div>
        <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-700 rounded w-full"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
        </div>
    </div>
);

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, isLoading, error }) => {
  if (isLoading) {
    return (
      <div>
        <div className="h-8 bg-gray-700 rounded w-1/3 mb-6 animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-gray-800 border-2 border-dashed border-gray-700 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-300">Ready to Investigate</h3>
        <p className="text-gray-400 mt-2">Enter search terms in the panel to begin compiling your case files.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {results.map(caseResult => (
        <section key={caseResult.searchTerm}>
          <h2 className="text-3xl font-bold text-white border-b-2 border-cyan-500 pb-2 mb-6">
            Case File: {caseResult.searchTerm}
            <span className="text-lg font-normal text-gray-400 ml-2">({caseResult.images.length} images found)</span>
          </h2>
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
