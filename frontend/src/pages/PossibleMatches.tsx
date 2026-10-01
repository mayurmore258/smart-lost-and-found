import React from 'react';
import { MatchCandidate } from '../types';
import { MatchCard } from '../components/MatchCard';
import { EmptyState } from '../components/EmptyState';

interface PossibleMatchesProps {
  itemId?: string;
  itemDetails?: any;
  matches?: MatchCandidate[];
  onNavigate: (path: string, params?: any) => void;
}

export const PossibleMatches: React.FC<PossibleMatchesProps> = ({
  itemId,
  itemDetails,
  matches = [],
  onNavigate,
}) => {
  return (
    <div className="max-w-[1024px] mx-auto px-4 md:px-6 py-8 w-full flex-1">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-[#949994] hover:text-gray-900 dark:hover:text-white mb-3"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Home</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-[#346b4f] dark:text-[#99d3b0] uppercase tracking-wider block">
              Match Results
            </span>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-[#f0f2f0] tracking-tight mt-1">
              Possible Matches ({matches.length})
            </h1>
            <p className="text-sm text-gray-600 dark:text-[#c5c9c5] mt-1">
              We found {matches.length} candidate item{matches.length === 1 ? '' : 's'} reported by community members. Select one to verify ownership.
            </p>
          </div>

          <button
            onClick={() => onNavigate('report-lost')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#346b4f] dark:text-[#99d3b0] hover:underline shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            <span>Update search info</span>
          </button>
        </div>
      </div>

      {/* Render Match Cards List */}
      {matches.length === 0 ? (
        <EmptyState
          title="No direct matches found yet"
          message="We couldn't find an exact match right now. Your lost report remains active in our database, and we'll alert you as soon as a matching item is reported."
          actionLabel="View All Found Items"
          onAction={() => onNavigate('found-items')}
          icon="manage_search"
        />
      ) : (
        <div className="flex flex-col gap-6">
          {matches.map((match, idx) => (
            <MatchCard
              key={match.found_item_id || idx}
              match={match}
              onSelect={(selectedMatch) =>
                onNavigate('match-details', {
                  matchId: selectedMatch.found_item_id,
                  match: selectedMatch,
                  userItem: itemDetails,
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};
