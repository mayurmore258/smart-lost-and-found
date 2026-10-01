import React, { useEffect, useState } from 'react';
import { apiService, getImageUrl } from '../services/api';

interface SearchingProps {
  itemId: string;
  itemDetails?: any;
  onNavigate: (path: string, params?: any) => void;
}

export const Searching: React.FC<SearchingProps> = ({ itemId, itemDetails, onNavigate }) => {
  const [progress, setProgress] = useState(25);
  const [statusText, setStatusText] = useState('Comparing item details with community records...');

  useEffect(() => {
    // Progress counter visualization
    const timer1 = setTimeout(() => {
      setProgress(55);
      setStatusText('Analyzing visual similarity and location proximity...');
    }, 1000);

    const timer2 = setTimeout(() => {
      setProgress(85);
      setStatusText('Retrieving shortlisted matches from backend...');
    }, 2000);

    let isCancelled = false;

    const fetchMatches = async () => {
      try {
        let resMatches: any[] = [];

        // 1. Try to fetch already stored matches for this lost item
        try {
          const stored = await apiService.getMatches(itemId);
          if (stored && stored.matches && stored.matches.length > 0) {
            resMatches = stored.matches;
          }
        } catch {
          // If no stored matches yet, initiate backend matching flow
        }

        // 2. If no matches retrieved yet, invoke findMatches
        if (resMatches.length === 0) {
          try {
            const findRes = await apiService.findMatches(itemId);
            if (findRes && findRes.matches) {
              // Try to retrieve enriched match records with match IDs
              try {
                const listRes = await apiService.getMatches(itemId);
                resMatches = listRes.matches && listRes.matches.length > 0 ? listRes.matches : findRes.matches;
              } catch {
                resMatches = findRes.matches;
              }
            }
          } catch (err: any) {
            console.warn('Matching request returned:', err.message);
          }
        }

        // 3. Enrich candidate matches with real found item details from backend
        const enrichedMatches = await Promise.all(
          resMatches.map(async (m: any) => {
            try {
              if (m.found_item_id && (!m.title || !m.image_url)) {
                const item = await apiService.getItem(m.found_item_id);
                return {
                  ...m,
                  id: m.id || m.found_item_id,
                  title: item.brand ? `${item.brand} ${item.category}` : `${item.color} ${item.category}`,
                  category: item.category,
                  color: item.color,
                  location: item.location,
                  date_time: item.date_time,
                  description: item.description,
                  image_url: getImageUrl(item.image_path),
                };
              }
            } catch (itemErr) {
              console.warn('Could not fetch details for found item:', m.found_item_id);
            }
            return m;
          })
        );

        if (!isCancelled) {
          setProgress(100);
          setTimeout(() => {
            onNavigate('possible-matches', {
              itemId,
              itemDetails,
              matches: enrichedMatches,
            });
          }, 500);
        }
      } catch (err: any) {
        console.warn('Match search completed with empty result:', err.message);
        if (!isCancelled) {
          setProgress(100);
          setTimeout(() => {
            onNavigate('possible-matches', {
              itemId,
              itemDetails,
              matches: [],
            });
          }, 500);
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
