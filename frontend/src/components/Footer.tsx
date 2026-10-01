import React from 'react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-gray-100 dark:bg-[#141514] border-t border-gray-200 dark:border-[#2a2d2b] py-6 transition-colors mt-auto">
      <div className="max-w-[1240px] mx-auto px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
          <span className="font-semibold text-sm text-gray-900 dark:text-[#f0f2f0]">
            Smart AI Lost & Found
          </span>
          <span className="hidden sm:inline text-gray-400 dark:text-[#949994]">•</span>
          <span className="text-xs text-gray-500 dark:text-[#949994]">
            Helping communities recover belongings safely
          </span>
        </div>

        <div className="flex items-center gap-6 text-xs text-gray-500 dark:text-[#949994]">
          <button onClick={() => onNavigate('home')} className="hover:text-gray-900 dark:hover:text-[#f0f2f0] transition-colors">
            Home
          </button>
          <button onClick={() => onNavigate('found-items')} className="hover:text-gray-900 dark:hover:text-[#f0f2f0] transition-colors">
            Found Feed
          </button>
          <button onClick={() => onNavigate('my-reports')} className="hover:text-gray-900 dark:hover:text-[#f0f2f0] transition-colors">
            My Reports
          </button>
        </div>
      </div>
    </footer>
  );
};
