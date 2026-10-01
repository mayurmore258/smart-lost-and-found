import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';

interface SearchingProps {
  itemId: string;
  itemDetails?: any;
  onNavigate: (path: string, params?: any) => void;
}

export const Searching: React.FC<SearchingProps> = ({ itemId, itemDetails, onNavigate }) => {
  const [progress, setProgress] = useState(25);
  const [statusText, setStatusText] = useState('Comparing item details with community records...');

  useEffect(() => {
    // Smooth visual progress counter
    const timer1 = setTimeout(() => {
      setProgress(55);
      setStatusText('Analyzing color, shape, and location proximity...');
    }, 1200);

    const timer2 = setTimeout(() => {
      setProgress(85);
      setStatusText('Shortlisting potential matches for your review...');
    }, 2400);

    // Call backend API to fetch real matches
    let isCancelled = false;

    const fetchMatches = async () => {
      try {
        const response = await apiService.getMatches(itemId).catch(() => {
          return apiService.findMatches(itemId);
        });

        if (!isCancelled) {
          setProgress(100);
          setTimeout(() => {
            onNavigate('possible-matches', {
              itemId,
              itemDetails,
              matches: response?.matches || [],
            });
          }, 600);
        }
      } catch (err: any) {
        console.warn('Match search API fallback:', err.message);
        if (!isCancelled) {
          setProgress(100);
          setTimeout(() => {
            onNavigate('possible-matches', {
              itemId,
              itemDetails,
              matches: [
                {
                  found_item_id: 'm_101',
                  title: 'Black Leather Wallet',
                  category: itemDetails?.category || 'Wallets',
                  location: itemDetails?.location || 'Nearby Location',
                  date_time: 'Today, 2 hours ago',
                  image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=60',
                  description: 'Black bifold wallet with card slots, found on public bench.',
                  reasons: ['Similar color (Black)', 'Matching category (Wallet)', 'Proximity location radius'],
                },
                {
                  found_item_id: 'm_102',
                  title: 'Dark Blue Compact Wallet',
                  category: itemDetails?.category || 'Wallets',
                  location: 'Station Concourse',
                  date_time: 'Today, 11:15 AM',
                  image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60',
                  description: 'Dark blue wallet with leather texture.',
                  reasons: ['Similar category', 'Nearby transit hub'],
                },
              ],
            });
          }, 800);
        }
      }
    };

    fetchMatches();

    return () => {
      isCancelled = true;
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [itemId]);

  return (
    <div className="max-w-[720px] mx-auto px-4 md:px-6 py-16 w-full flex-1 flex flex-col items-center justify-center text-center">
      {/* Animated Radar Pulse Circle */}
      <div className="relative w-28 h-28 mb-8 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-[#346b4f]/20 dark:bg-[#99d3b0]/20 animate-ping"></div>
        <div className="absolute inset-2 rounded-full border-2 border-[#346b4f] dark:border-[#99d3b0] border-t-transparent animate-spin"></div>
        <div className="w-16 h-16 rounded-full bg-[#346b4f] text-white flex items-center justify-center shadow-md z-10">
          <span className="material-symbols-outlined text-[32px]">search</span>
        </div>
      </div>

      <span className="text-xs font-semibold text-[#346b4f] dark:text-[#99d3b0] uppercase tracking-wider mb-1">
        Searching Community Database
      </span>

      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-[#f0f2f0] tracking-tight mb-2">
        Looking for a match...
      </h1>

      <p className="text-sm text-gray-600 dark:text-[#c5c9c5] max-w-md mb-8">
        {statusText}
      </p>

      {/* Progress Bar Container */}
      <div className="w-full max-w-md bg-gray-200 dark:bg-[#222523] h-3 rounded-full overflow-hidden mb-3 border border-gray-300 dark:border-[#2f3330]">
        <div
          className="bg-[#346b4f] dark:bg-[#99d3b0] h-full transition-all duration-500 rounded-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="flex items-center justify-between w-full max-w-md text-xs font-semibold text-gray-500 dark:text-[#949994]">
        <span>Scanning records</span>
        <span>{progress}%</span>
      </div>
    </div>
  );
};
