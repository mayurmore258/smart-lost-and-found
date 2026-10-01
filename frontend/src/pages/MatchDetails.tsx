import React from 'react';
import { MatchCandidate } from '../types';

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
  const candidateMatch: MatchCandidate = match || {
    found_item_id: matchId || 'm_101',
    title: 'Black Leather Wallet',
    category: 'Wallets',
    location: 'Andheri West Station',
    date_time: 'Today, 2 hours ago',
    image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=60',
    description: 'Black bifold leather wallet found near ticket counter. Intact condition.',
    reasons: ['Similar color (Black)', 'Matching category (Wallet)', 'Proximity location radius'],
  };

  const lostItem = userItem || {
    category: candidateMatch.category || 'Wallets',
    location: candidateMatch.location || 'Dadar / Andheri',
    color: 'Black',
    description: 'Black leather wallet containing ID cards and transit pass.',
    image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80',
  };

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

      {/* Side-by-Side Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Left Column: Your Report */}
        <div className="bg-white dark:bg-[#1c1e1d] border border-gray-200 dark:border-[#2f3330] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-[#222523] text-gray-700 dark:text-[#c5c9c5] text-xs font-semibold mb-4">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Your Reported Lost Item</span>
            </div>

            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 dark:bg-[#222523] mb-4 border border-gray-200 dark:border-[#2f3330]">
              <img
                src={lostItem.image_url || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80'}
                alt="Your lost item"
                className="w-full h-full object-cover"
              />
            </div>

            <h3 className="font-bold text-lg text-gray-900 dark:text-[#f0f2f0] mb-2">
              {lostItem.category} ({lostItem.color || 'Black'})
            </h3>

            <div className="space-y-1 text-xs text-gray-600 dark:text-[#c5c9c5] mb-4">
              <p><strong>Lost Location:</strong> {lostItem.location}</p>
              {lostItem.description && <p><strong>Description:</strong> {lostItem.description}</p>}
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

            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 dark:bg-[#222523] mb-4 border border-gray-200 dark:border-[#2f3330]">
              <img
                src={candidateMatch.image_url || 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=60'}
                alt="Found candidate item"
                className="w-full h-full object-cover"
              />
            </div>

            <h3 className="font-bold text-lg text-gray-900 dark:text-[#f0f2f0] mb-2">
              {candidateMatch.title || candidateMatch.category}
            </h3>

            <div className="space-y-1 text-xs text-gray-600 dark:text-[#c5c9c5] mb-4">
              <p><strong>Found Location:</strong> {candidateMatch.location}</p>
              <p><strong>Date Reported:</strong> {candidateMatch.date_time}</p>
              {candidateMatch.description && <p><strong>Details:</strong> {candidateMatch.description}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Observations Box */}
      {candidateMatch.reasons && candidateMatch.reasons.length > 0 && (
        <div className="bg-gray-50 dark:bg-[#1c1e1d] border border-gray-200 dark:border-[#2f3330] p-6 rounded-2xl mb-8">
          <h4 className="text-sm font-bold text-gray-900 dark:text-[#f0f2f0] mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#346b4f] dark:text-[#99d3b0] text-[20px]">insights</span>
            <span>Key Match Observations</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {candidateMatch.reasons.map((reason, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-white dark:bg-[#222523] border border-gray-200 dark:border-[#2f3330] text-xs font-semibold text-gray-800 dark:text-[#c5c9c5] flex items-center gap-2">
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
              matchId: candidateMatch.found_item_id,
              match: candidateMatch,
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
