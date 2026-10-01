import React from 'react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Something went wrong. Please try again.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl">
      <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400 mb-3">
        <span className="material-symbols-outlined text-[24px]">error_outline</span>
      </div>

      <p className="text-sm font-medium text-red-800 dark:text-red-300 max-w-sm mb-4">
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};
