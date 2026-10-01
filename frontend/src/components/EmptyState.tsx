import React from 'react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No items found',
  message = "We couldn't find any reports matching your criteria right now.",
  actionLabel,
  onAction,
  icon = 'search_off',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center min-h-[320px] bg-white dark:bg-[#1c1e1d] border border-gray-200 dark:border-[#2f3330] rounded-2xl">
      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-[#222523] flex items-center justify-center text-gray-400 dark:text-[#949994] mb-4">
        <span className="material-symbols-outlined text-[32px]">{icon}</span>
      </div>

      <h3 className="text-lg font-bold text-gray-900 dark:text-[#f0f2f0] mb-1">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-[#c5c9c5] max-w-sm mb-6">{message}</p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-full bg-[#346b4f] hover:bg-[#3d7a5b] text-white text-sm font-semibold transition-colors shadow-sm"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
