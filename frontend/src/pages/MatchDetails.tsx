import React, { useEffect, useState } from 'react';
import { MatchCandidate, ItemResponse } from '../types';
import { apiService, getImageUrl } from '../services/api';

interface MatchDetailsProps {
  matchId?: string;
  match?: MatchCandidate;
  userItem?: any;
  onNavigate: (path: string, params?: any) => void;
}

export const MatchDetails: React.FC<MatchDetailsProps> = ({
  matchId,
  match,
  userItem,
  onNavigate,
}) => {
  const [candidateMatch, setCandidateMatch] = useState<MatchCandidate | undefined>(match);
  const [foundItemDetails, setFoundItemDetails] = useState<ItemResponse | null>(null);

  // If candidate match details are missing, fetch the found item from backend
  useEffect(() => {
    if (!candidateMatch && matchId) {
      apiService
        .getItem(matchId)
        .then((item) => {
          setFoundItemDetails(item);
          setCandidateMatch({
            id: matchId,
            found_item_id: item.id,
            title: item.brand ? `${item.brand} ${item.category}` : `${item.color} ${item.category}`,
            category: item.category,
            location: item.location,
            date_time: item.date_time,
            description: item.description,
            image_url: getImageUrl(item.image_path),
            similarity: 0,
            assessment: item.status,
            reasons: [],
          });
        })
        .catch((err) => console.warn('Could not load item details:', err.message));
    } else if (candidateMatch && candidateMatch.found_item_id && !candidateMatch.image_url) {
      apiService
        .getItem(candidateMatch.found_item_id)
        .then((item) => {
          setFoundItemDetails(item);
          setCandidateMatch((prev) =>
            prev
              ? {
                  ...prev,
                  title: prev.title || (item.brand ? `${item.brand} ${item.category}` : `${item.color} ${item.category}`),
                  category: prev.category || item.category,
                  location: prev.location || item.location,
                  date_time: prev.date_time || item.date_time,
                  description: prev.description || item.description,
                  image_url: getImageUrl(item.image_path),
                }
              : prev
          );
        })
        .catch((err) => console.warn('Could not fetch candidate item:', err.message));
    }
  }, [matchId, candidateMatch]);

  const lostItem = userItem || null;
  const currentMatch = candidateMatch;

  return (
    <div className="max-w-[1024px] mx-auto px-4 md:px-6 py-8 w-full flex-1">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => onNavigate('possible-matches')}
          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-[#949994] hover:text-gray-900 dark:hover:text-white mb-3"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Possible Matches</span>
        </button>

        <span className="text-xs font-semibold text-[#346b4f] dark:text-[#99d3b0] uppercase tracking-wider block">
          Side-by-Side Comparison
        </span>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-[#f0f2f0] tracking-tight mt-1">
          Compare & Match Details
        </h1>
        <p className="text-sm text-gray-600 dark:text-[#c5c9c5] mt-1">
          Review details of your report alongside the found item before starting verification.
        </p>
      </div>

      {/* Metrics Banner */}
      {currentMatch && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 p-4 rounded-2xl bg-white dark:bg-[#1c1e1d] border border-gray-200 dark:border-[#2f3330]">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 dark:text-[#949994] uppercase tracking-wide block">
              Similarity Score
            </span>
            <span className="text-lg font-extrabold text-[#346b4f] dark:text-[#99d3b0]">
              {currentMatch.similarity !== undefined
                ? `${Math.round(currentMatch.similarity * 100)}%`
                : 'N/A'}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-gray-500 dark:text-[#949994] uppercase tracking-wide block">
              AI Assessment
            </span>
            <span className="text-sm font-bold text-gray-800 dark:text-[#f0f2f0] capitalize">
              {currentMatch.assessment?.replace('_', ' ') || 'Candidate'}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-gray-500 dark:text-[#949994] uppercase tracking-wide block">
              Status
            </span>
            <span className="text-sm font-bold text-emerald-700 dark:text-[#99d3b0] capitalize">
              {currentMatch.status || 'Active'}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-gray-500 dark:text-[#949994] uppercase tracking-wide block">
              Found Item ID
            </span>
            <span className="text-xs font-mono text-gray-600 dark:text-[#c5c9c5] truncate block">
              {currentMatch.found_item_id || matchId || 'N/A'}
            </span>
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Left Column: Your Report */}
        <div className="bg-white dark:bg-[#1c1e1d] border border-gray-200 dark:border-[#2f3330] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-[#222523] text-gray-700 dark:text-[#c5c9c5] text-xs font-semibold mb-4">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Your Reported Lost Item</span>
            </div>

            {lostItem?.image_url && (
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 dark:bg-[#222523] mb-4 border border-gray-200 dark:border-[#2f3330]">
                <img
                  src={lostItem.image_url}
                  alt="Your lost item"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <h3 className="font-bold text-lg text-gray-900 dark:text-[#f0f2f0] mb-2">
              {lostItem ? `${lostItem.color || ''} ${lostItem.category || 'Item'}` : 'Lost Item Information'}
            </h3>

            <div className="space-y-1.5 text-xs text-gray-600 dark:text-[#c5c9c5] mb-4">
              {lostItem?.location && (
                <p>
                  <strong>Lost Location:</strong> {lostItem.location}
                </p>
              )}
              {lostItem?.date_time && (
                <p>
                  <strong>Date/Time:</strong> {lostItem.date_time}
                </p>
              )}
              {lostItem?.description && (
                <p>
                  <strong>Description:</strong> {lostItem.description}
                </p>
              )}
              {!lostItem && (
                <p className="italic text-gray-400">Details not provided in current session.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Candidate Found Item */}
        <div className="bg-white dark:bg-[#1c1e1d] border border-gray-200 dark:border-[#2f3330] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-[#1d2d23] text-[#346b4f] dark:text-[#99d3b0] text-xs font-semibold mb-4">
              <span className="w-2 h-2 rounded-full bg-[#346b4f] dark:bg-[#99d3b0]"></span>
              <span>Recovered Found Item</span>
            </div>

            {currentMatch?.image_url && (
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 dark:bg-[#222523] mb-4 border border-gray-200 dark:border-[#2f3330]">
                <img
                  src={currentMatch.image_url}
                  alt="Found candidate item"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <h3 className="font-bold text-lg text-gray-900 dark:text-[#f0f2f0] mb-2">
              {currentMatch?.title || currentMatch?.category || 'Found Item'}
            </h3>

            <div className="space-y-1.5 text-xs text-gray-600 dark:text-[#c5c9c5] mb-4">
              {currentMatch?.location && (
                <p>
                  <strong>Found Location:</strong> {currentMatch.location}
                </p>
              )}
              {currentMatch?.date_time && (
                <p>
                  <strong>Date Reported:</strong> {currentMatch.date_time}
                </p>
              )}
              {currentMatch?.description && (
                <p>
                  <strong>Details:</strong> {currentMatch.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reasons / Observations Box */}
      {currentMatch?.reasons && currentMatch.reasons.length > 0 && (
        <div className="bg-gray-50 dark:bg-[#1c1e1d] border border-gray-200 dark:border-[#2f3330] p-6 rounded-2xl mb-8">
          <h4 className="text-sm font-bold text-gray-900 dark:text-[#f0f2f0] mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#346b4f] dark:text-[#99d3b0] text-[20px]">insights</span>
            <span>Key Match Observations & AI Reasons</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {currentMatch.reasons.map((reason, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white dark:bg-[#222523] border border-gray-200 dark:border-[#2f3330] text-xs font-semibold text-gray-800 dark:text-[#c5c9c5] flex items-center gap-2"
              >
                <span className="text-[#346b4f] dark:text-[#99d3b0]">✓</span>
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-[#2f3330]">
        <button
          onClick={() => onNavigate('possible-matches')}
          className="w-full sm:w-auto px-6 py-3 rounded-full bg-gray-100 dark:bg-[#222523] hover:bg-gray-200 dark:hover:bg-[#2a2d2b] text-gray-700 dark:text-[#c5c9c5] text-sm font-semibold transition-colors"
        >
          Not My Item
        </button>

        <button
          onClick={() =>
            onNavigate('verification', {
              matchId: currentMatch?.id || matchId || currentMatch?.found_item_id,
              match: currentMatch,
            })
          }
          className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#346b4f] hover:bg-[#3d7a5b] text-white text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">verified</span>
          <span>Verify This Item</span>
        </button>
      </div>
    </div>
  );
};
