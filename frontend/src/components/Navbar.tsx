import React from 'react';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#141514]/90 backdrop-blur-xl border-b border-gray-200 dark:border-[#2a2d2b] transition-colors">
      <div className="max-w-[1240px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand logo & main nav */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 group text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-[#346b4f] flex items-center justify-center text-white font-bold text-lg shadow-sm">
              🔎
            </div>
            <span className="font-semibold text-lg text-gray-900 dark:text-[#f0f2f0] tracking-tight">
              Smart AI Lost & Found
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-6 ml-4">
            <button
              onClick={() => onNavigate('home')}
              className={`py-1 text-sm font-semibold transition-colors ${
                currentPath === 'home'
                  ? 'text-[#346b4f] dark:text-[#99d3b0]'
                  : 'text-gray-600 dark:text-[#949994] hover:text-gray-900 dark:hover:text-[#f0f2f0]'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => onNavigate('found-items')}
              className={`py-1 text-sm font-semibold transition-colors ${
                currentPath === 'found-items'
                  ? 'text-[#346b4f] dark:text-[#99d3b0]'
                  : 'text-gray-600 dark:text-[#949994] hover:text-gray-900 dark:hover:text-[#f0f2f0]'
              }`}
            >
              Found Items
            </button>

            <button
              onClick={() => onNavigate('my-reports')}
              className={`py-1 text-sm font-semibold transition-colors ${
                currentPath === 'my-reports'
                  ? 'text-[#346b4f] dark:text-[#99d3b0]'
                  : 'text-gray-600 dark:text-[#949994] hover:text-gray-900 dark:hover:text-[#f0f2f0]'
              }`}
            >
              My Reports
            </button>
          </nav>
        </div>

        {/* Action items & theme toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('report-lost')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#346b4f] hover:bg-[#3d7a5b] text-white text-xs font-semibold shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>Report Lost</span>
          </button>

          <ThemeToggle />

          <button
            onClick={() => onNavigate('my-reports')}
            aria-label="User Profile"
            className="w-8 h-8 rounded-full bg-[#346b4f] flex items-center justify-center text-white shadow-sm hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
          </button>
        </div>
      </div>
    </header>
  );
};
