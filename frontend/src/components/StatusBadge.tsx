import React from 'react';
import { ReportStatus } from '../types';

interface StatusBadgeProps {
  status: ReportStatus | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'active':
      case 'unclaimed':
        return 'bg-amber-100 text-amber-800 dark:bg-[#222523] dark:border dark:border-[#2f3330] dark:text-[#c5c9c5]';
      case 'looking_for_match':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:border dark:border-blue-800/40 dark:text-blue-300';
      case 'potential_match':
      case 'possible_match':
        return 'bg-[#e8f2ec] text-[#24583b] dark:bg-[#1d2d23] dark:border dark:border-[#387053] dark:text-[#99d3b0]';
      case 'verification':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:border dark:border-purple-800/40 dark:text-purple-300';
      case 'resolved':
      case 'verified':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:border dark:border-emerald-800/40 dark:text-emerald-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'active':
      case 'unclaimed':
        return 'Unclaimed';
      case 'looking_for_match':
        return 'Looking for match';
      case 'potential_match':
      case 'possible_match':
        return 'Possible Match';
      case 'verification':
        return 'Verification';
      case 'resolved':
      case 'verified':
        return 'Verified / Resolved';
      default:
        return status;
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getBadgeStyle()}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {getLabel()}
    </span>
  );
};
