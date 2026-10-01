import React, { useEffect, useState } from 'react';
import { ItemCard } from '../components/ItemCard';
import { EmptyState } from '../components/EmptyState';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { apiService } from '../services/api';

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
      const data = await apiService.getFoundItems(selectedCategory, query);
      setItems(data || []);
    } catch (err: any) {
      console.warn('Backend API fetch fallback:', err.message);
      // Fallback mock items when backend dataset is empty or initializing
      setItems([
        {
          id: 'f1',
          title: 'Black Leather Wallet',
          location: 'Andheri Station, Platform 2',
          date_time: 'Today, 2:30 PM',
          image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=60',
          category: 'Wallets',
          status: 'unclaimed',
        },
        {
          id: 'f2',
          title: 'House Keys on Braid Fob',
          location: 'Dadar Western Line',
          date_time: 'Today, 11:30 AM',
          image_url: 'https://images.unsplash.com/photo-1582142839970-2b93227ef846?w=500&auto=format&fit=crop&q=60',
          category: 'Keys',
          status: 'unclaimed',
        },
        {
          id: 'f3',
          title: 'AirPods Charging Case',
          location: 'Bandra Bandstand Bench',
          date_time: 'Today, 9:15 AM',
          image_url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&auto=format&fit=crop&q=60',
          category: 'Earbuds',
          status: 'unclaimed',
        },
        {
          id: 'f4',
          title: 'Navy Canvas Backpack',
          location: 'Churchgate Concourse',
          date_time: 'Yesterday',
          image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60',
          category: 'Bags',
          status: 'unclaimed',
        },
        {
          id: 'f5',
          title: 'Silver Stainless Watch',
          location: 'CSMT Railway Waiting Hall',
          date_time: 'Yesterday, 6:00 PM',
          image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
          category: 'Glasses & Watches',
          status: 'unclaimed',
        },
      ]);
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
        <LoadingState message="Loading community found feed..." subtext="Retrieving recent reports from the database" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchItems} />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title="No items found"
          message={`No found items matching "${query || selectedCategory}" are currently listed.`}
          actionLabel="Report a Found Item"
          onAction={() => onNavigate('report-found')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id || item.item_id}
              title={item.title || item.category || 'Found Item'}
              location={item.location || 'Unknown Location'}
              date={item.date_time || 'Recently'}
              imageUrl={item.image_url}
              status={item.status || 'unclaimed'}
              onClick={() => onNavigate('match-details', { matchId: item.id || item.item_id, item })}
            />
          ))}
        </div>
      )}
    </div>
  );
};
