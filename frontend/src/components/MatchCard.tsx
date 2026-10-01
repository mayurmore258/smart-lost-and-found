import React from 'react';
import { MatchCandidate } from '../types';

interface MatchCardProps {
  match: MatchCandidate;
  onSelect: (match: MatchCandidate) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(match)}
      className="group bg-white dark:bg-[#1c1e1d] border border-gray-200 dark:border-[#2f3330] rounded-2xl overflow-hidden shadow-sm hover:border-[#346b4f] dark:hover:border-[#3d7a5b] hover:shadow-md transition-all duration-300 flex flex-col md:flex-row cursor-pointer"
    >
      <div className="relative md:w-64 aspect-[4/3] md:aspect-auto bg-gray-100 dark:bg-[#222523] shrink-0 overflow-hidden">
        {match.image_url ? (
          <img
            src={match.image_url}
            alt={match.title || 'Found item candidate'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=60';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-[#949994] p-6">
            <span className="material-symbols-outlined text-[40px]">inventory_2</span>
            <span className="text-xs font-medium mt-1">Photo Preview</span>
          </div>
        )}
        <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-[#346b4f] text-white text-xs font-semibold shadow-sm capitalize">
          {match.similarity !== undefined && match.similarity > 0
            ? `${Math.round(match.similarity * 100)}% Match`
            : match.assessment?.replace('_', ' ') || 'Possible Match'}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1 justify-between gap-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-[#f0f2f0] group-hover:text-[#346b4f] dark:group-hover:text-[#99d3b0] transition-colors">
              {match.title || match.category || 'Found Belonging'}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-[#949994] mt-2">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">location_on</span>
              {match.location || 'Reported Location'}
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">calendar_today</span>
              {match.date_time || 'Recent'}
            </span>
          </div>

          {match.description && (
            <p className="text-sm text-gray-600 dark:text-[#c5c9c5] mt-2 line-clamp-2">
              {match.description}
            </p>
          )}

          {/* Observations and AI Reasons */}
          {match.reasons && match.reasons.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {match.reasons.map((reason, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-[#222523] border border-emerald-200 dark:border-[#2f3330] text-emerald-800 dark:text-[#99d3b0] text-xs font-medium"
                >
                  ✓ {reason}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-gray-100 dark:border-[#2f3330]">
          <span className="text-xs text-gray-500 dark:text-[#949994]">Click to compare & verify</span>
          <button className="inline-flex items-center gap-1 text-sm font-semibold text-[#346b4f] dark:text-[#99d3b0] group-hover:translate-x-1 transition-transform">
            <span>View Details</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
