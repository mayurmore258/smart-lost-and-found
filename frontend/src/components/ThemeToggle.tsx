import React from 'react';
import { useTheme } from '../hooks/useTheme';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label="Toggle theme"
      className="w-9 h-9 rounded-full flex items-center justify-center text-[#346b4f] dark:text-[#99d3b0] hover:text-gray-900 dark:hover:text-[#f0f2f0] hover:bg-gray-100 dark:hover:bg-[#222523] border border-gray-200 dark:border-[#2f3330] transition-colors"
    >
      <span className="material-symbols-outlined text-[20px]">
        {theme === 'dark' ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
};
