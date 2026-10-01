import React, { useEffect, useState } from 'react';
import { ItemCard } from '../components/ItemCard';
import { EmptyState } from '../components/EmptyState';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { apiService, getImageUrl } from '../services/api';

interface FoundItemsProps {
  onNavigate: (path: string, params?: any) => void;
  initialQuery?: string;
  initialCategory?: string;
}

export const FoundItems: React.FC<FoundItemsProps> = ({
  onNavigate,
  initialQuery = '',
  initialCategory = 'All',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = ['All', 'Wallets', 'Keys', 'Earbuds', 'Bags', 'Phones', 'IDs & Cards', 'Glasses & Watches', 'Other'];

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load community-reported found items from session records
      const storedFound: any[] = JSON.parse(
        localStorage.getItem('smart_lost_found_found_items') || '[]'
      );

      // Refresh items with backend live status if available
      const enrichedFound = await Promise.all(
        storedFound.map(async (item) => {
          try {
            if (item.id) {
              const live = await apiService.getItem(item.id);
              return {
                ...item,
                status: live.status || item.status,
                image_url: live.image_path ? getImageUrl(live.image_path) : item.image_url,
              };
            }
          } catch {
            // Keep local data if single item lookup is unavailable
          }
          return item;
        })
      );

      setItems(enrichedFound);
    } catch (err: any) {
      console.warn('Error fetching found items:', err.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchItems();
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesQuery =
      !query ||
      item.title?.toLowerCase().includes(query.toLowerCase()) ||
      item.location?.toLowerCase().includes(query.toLowerCase()) ||
      item.description?.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="max-w-[1240px] mx-auto px-4 md:px-6 py-8 w-full flex-1">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-semibold text-[#346b4f] dark:text-[#99d3b0] uppercase tracking-wider">
            Community Registry
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-[#f0f2f0] tracking-tight mt-1">
            Found Items Feed
          </h1>
          <p className="text-sm text-gray-600 dark:text-[#c5c9c5] mt-1">
            Browse recently recovered items uploaded by community members and transit stations.
          </p>
        </div>

        <button
          onClick={() => onNavigate('report-found')}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#346b4f] hover:bg-[#3d7a5b] text-white text-sm font-semibold shadow-sm transition-all shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Report Found Item</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-gray-100 dark:bg-[#1c1e1d] border border-gray-200 dark:border-[#2f3330] p-4 rounded-2xl mb-8 shadow-sm flex flex-col gap-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 bg-white dark:bg-[#222523] border border-gray-200 dark:border-[#2f3330] px-3 py-2 rounded-xl">
          <span className="material-symbols-outlined text-gray-400 dark:text-[#949994] text-[20px]">search</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, location or keywords..."
            className="w-full bg-transparent text-sm text-gray-900 dark:text-[#f0f2f0] placeholder-gray-400 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                fetchItems();
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-1.5 rounded-lg bg-[#346b4f] hover:bg-[#3d7a5b] text-white text-xs font-semibold"
          >
            Search
          </button>
        </form>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#346b4f] text-white shadow-sm'
                  : 'bg-white dark:bg-[#222523] text-gray-700 dark:text-[#c5c9c5] border border-gray-200 dark:border-[#2f3330] hover:bg-gray-50 dark:hover:bg-[#2a2d2b]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        <LoadingState message="Loading community found feed..." subtext="Retrieving items from the registry" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchItems} />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title="No found items yet"
          message={
            query || selectedCategory !== 'All'
              ? `No found items matching "${query || selectedCategory}" are currently listed.`
              : 'No items have been reported found yet. Once a member reports a found item, it will appear here.'
          }
          actionLabel="Report a Found Item"
          onAction={() => onNavigate('report-found')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id || item.item_id}
              title={item.title || `${item.color || ''} ${item.category || 'Found Item'}`}
              location={item.location || 'Reported Location'}
              date={item.date_time || 'Recently'}
              imageUrl={item.image_url}
              status={item.status || 'active'}
              onClick={() => onNavigate('match-details', { matchId: item.id || item.item_id, match: item })}
            />
          ))}
        </div>
      )}
    </div>
  );
};
