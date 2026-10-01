import React from 'react';
import { StatusBadge } from './StatusBadge';

interface ItemCardProps {
  id?: string;
  title: string;
  location: string;
  date: string;
  imageUrl?: string;
  status?: string;
  onClick?: () => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  title,
  location,
  date,
  imageUrl,
  status = 'unclaimed',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="group bg-white dark:bg-[#1c1e1d] border border-gray-200 dark:border-[#2f3330] rounded-2xl overflow-hidden shadow-sm hover:border-[#346b4f] dark:hover:border-[#3d7a5b] hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer"
    >
      <div className="relative aspect-[4/3] bg-gray-100 dark:bg-[#222523] overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Fallback placeholder image if image fails to load
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=60';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-[#949994]">
            <span className="material-symbols-outlined text-[40px]">inventory_2</span>
            <span className="text-xs font-medium mt-1">Photo Preview</span>
          </div>
        )}
        <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-sm border border-white/10 text-white font-mono text-[11px]">
          {date}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <h3 className="font-semibold text-base text-gray-900 dark:text-[#f0f2f0] group-hover:text-[#346b4f] dark:group-hover:text-[#99d3b0] transition-colors line-clamp-1">
            {title}
          </h3>
          <div className="flex items-center gap-1 text-gray-500 dark:text-[#949994] text-xs mt-1">
            <span className="material-symbols-outlined text-[16px]">location_on</span>
            <span className="line-clamp-1">{location}</span>
          </div>
        </div>

        <div className="pt-1 flex items-center justify-between">
          <StatusBadge status={status} />
          <span className="material-symbols-outlined text-gray-400 dark:text-[#949994] group-hover:text-[#346b4f] dark:group-hover:text-[#99d3b0] transition-colors text-[20px]">
            chevron_right
          </span>
        </div>
      </div>
    </div>
  );
};
