import React from 'react';

interface LoadingStateProps {
  message?: string;
  subtext?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "We're looking for a match...",
  subtext = 'Comparing item features, color, and location signals across community records.',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center min-h-[360px]">
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-[#2f3330]"></div>
        <div className="absolute inset-0 rounded-full border-4 border-[#346b4f] dark:border-[#99d3b0] border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-[#346b4f] dark:text-[#99d3b0]">
          <span className="material-symbols-outlined text-[24px]">search</span>
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-900 dark:text-[#f0f2f0] mb-2">{message}</h3>
      <p className="text-sm text-gray-600 dark:text-[#c5c9c5] max-w-md">{subtext}</p>
    </div>
  );
};
