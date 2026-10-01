import React, { useState } from 'react';
import { ItemCard } from '../components/ItemCard';

interface HomeProps {
  onNavigate: (path: string, params?: any) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('found-items', { query: searchQuery });
  };

  // Sample items representing recently found community items
  const recentItems = [
    {
      id: '1',
      title: 'Black Leather Wallet',
      location: 'Andheri West',
      date: '2 hours ago',
      imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=60',
      status: 'unclaimed',
    },
    {
      id: '2',
      title: 'House Keys on Braid Fob',
      location: 'Dadar Station',
      date: 'Today, 11:30 AM',
      imageUrl: 'https://images.unsplash.com/photo-1582142839970-2b93227ef846?w=500&auto=format&fit=crop&q=60',
      status: 'unclaimed',
    },
    {
      id: '3',
      title: 'AirPods Case',
      location: 'Bandra Bandstand',
      date: 'Today, 9:15 AM',
      imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&auto=format&fit=crop&q=60',
      status: 'unclaimed',
    },
    {
      id: '4',
      title: 'Navy Canvas Backpack',
      location: 'Churchgate',
      date: 'Yesterday',
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60',
      status: 'unclaimed',
    },
  ];

  const categories = [
    { name: 'Bags', icon: 'backpack' },
    { name: 'Phones', icon: 'smartphone' },
    { name: 'Wallets', icon: 'account_balance_wallet' },
    { name: 'Keys', icon: 'key' },
    { name: 'IDs & Cards', icon: 'badge' },
    { name: 'Earbuds', icon: 'headphones' },
    { name: 'Glasses & Watches', icon: 'watch' },
    { name: 'Other', icon: 'category' },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* Top Announcement Banner */}
      <div className="max-w-[1240px] mx-auto px-4 md:px-6 pt-4 w-full">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 dark:bg-[#1c1e1d] border border-gray-200 dark:border-[#2f3330] text-gray-700 dark:text-[#c5c9c5] text-xs">
          <span className="w-2 h-2 rounded-full bg-[#346b4f] dark:bg-[#99d3b0] animate-pulse"></span>
          <span>Community Lost & Found Live Feed across transit hubs and neighborhoods</span>
        </div>
      </div>

      {/* HERO SECTION */}
      <section className="max-w-[1240px] mx-auto px-4 md:px-6 pt-6 pb-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 text-[#346b4f] dark:text-[#99d3b0] font-semibold text-sm">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              <span>Safe • Neighborly • Reassuring</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-[#f0f2f0] tracking-tight leading-tight">
              Lost something? <br />
              <span className="text-[#346b4f] dark:text-[#99d3b0]">Let's help you find it.</span>
            </h1>

            <p className="text-base sm:text-lg text-gray-600 dark:text-[#c5c9c5] max-w-xl">
              Search recently found items or report something you've lost. Connect with kind neighbors, local commute staff, and community centers.
            </p>

            {/* Dual Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('report-lost')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#346b4f] hover:bg-[#3d7a5b] text-white font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                <span>I Lost Something</span>
              </button>

              <button
                onClick={() => onNavigate('report-found')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-[#1c1e1d] dark:hover:bg-[#222523] border border-gray-200 dark:border-[#2f3330] text-gray-900 dark:text-[#f0f2f0] font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[#fdb881] text-[20px]">volunteer_activism</span>
                <span>I Found Something</span>
              </button>
            </div>

            {/* Integrated Search Bar */}
            <form onSubmit={handleSearchSubmit} className="mt-4 p-2 bg-gray-100 dark:bg-[#1c1e1d] border border-gray-200 dark:border-[#2f3330] rounded-2xl shadow-sm flex flex-col gap-2">
              <div className="flex items-center gap-2 px-3 py-1">
                <span className="material-symbols-outlined text-gray-400 dark:text-[#949994] text-[22px]">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder='Search for a lost item (e.g. "black wallet", "Dadar", "AirPods")...'
                  className="w-full bg-transparent text-sm text-gray-900 dark:text-[#f0f2f0] placeholder-gray-400 dark:placeholder-[#949994] focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-[#346b4f] hover:bg-[#3d7a5b] text-white text-xs font-semibold transition-colors flex items-center gap-1 shrink-0"
                >
                  <span>Search</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Hero Banner Photography */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            <div className="relative rounded-3xl overflow-hidden shadow-md bg-gray-100 dark:bg-[#1c1e1d] border border-gray-200 dark:border-[#2f3330]">
              <img
                src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80"
                alt="Everyday belongings resting neatly"
                className="w-full h-80 sm:h-96 lg:h-[420px] object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 p-4 bg-white/90 dark:bg-[#1c1e1d]/90 backdrop-blur-md border border-gray-200 dark:border-[#2f3330] rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-[#8e592a]/50 text-amber-800 dark:text-[#fdb881] border border-amber-200 dark:border-[#8e592a] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">handshake</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-[#f0f2f0]">1,400+ Returns Made</p>
                    <p className="text-xs text-gray-500 dark:text-[#949994]">Safely matched with owners</p>
                  </div>
                </div>
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-[#222523] text-[#346b4f] dark:text-[#99d3b0]">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-[1240px] mx-auto px-4 md:px-6 pb-12 w-full">
        <div className="p-6 rounded-2xl bg-gray-100 dark:bg-[#1c1e1d] border border-gray-200 dark:border-[#2f3330] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-1 max-w-sm">
            <span className="text-xs font-semibold text-[#346b4f] dark:text-[#99d3b0] uppercase tracking-wider">Simple Safe Process</span>
            <p className="text-xs text-gray-600 dark:text-[#c5c9c5]">
              When someone reports an item, our community network helps you safely verify ownership and coordinate a return.
            </p>
          </div>

          {/* 4-Step Horizontal Flow */}
          <div className="flex-1 max-w-2xl bg-white dark:bg-[#222523] border border-gray-200 dark:border-[#2f3330] p-3 rounded-xl flex items-center justify-between text-gray-900 dark:text-[#f0f2f0] overflow-x-auto gap-2">
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-6 h-6 rounded-full bg-[#346b4f] text-white text-xs font-bold flex items-center justify-center">1</span>
              <span className="text-xs font-semibold">Report</span>
            </div>
            <span className="material-symbols-outlined text-gray-400 dark:text-[#949994] text-[18px] shrink-0">arrow_forward</span>
            
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-6 h-6 rounded-full bg-gray-200 dark:bg-[#2a2d2b] text-gray-700 dark:text-[#c5c9c5] text-xs font-bold flex items-center justify-center">2</span>
              <span className="text-xs font-semibold">Match Search</span>
            </div>
            <span className="material-symbols-outlined text-gray-400 dark:text-[#949994] text-[18px] shrink-0">arrow_forward</span>

            <div className="flex items-center gap-2 shrink-0">
              <span className="w-6 h-6 rounded-full bg-gray-200 dark:bg-[#2a2d2b] text-gray-700 dark:text-[#c5c9c5] text-xs font-bold flex items-center justify-center">3</span>
              <span className="text-xs font-semibold">Verify</span>
            </div>
            <span className="material-symbols-outlined text-gray-400 dark:text-[#949994] text-[18px] shrink-0">arrow_forward</span>

            <div className="flex items-center gap-2 shrink-0">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">4</span>
              <span className="text-xs font-semibold text-amber-600 dark:text-[#fdb881]">Recover</span>
            </div>
          </div>
        </div>
      </section>

      {/* RECENTLY FOUND SECTION */}
      <section className="max-w-[1240px] mx-auto px-4 md:px-6 pb-12 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-amber-600 dark:text-[#fdb881] text-xs font-semibold uppercase tracking-wide">
              <span className="material-symbols-outlined text-[16px]">sensors</span>
              <span>Community Live Feed</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-[#f0f2f0] tracking-tight">Recently Found</h2>
            <p className="text-sm text-gray-600 dark:text-[#c5c9c5]">New items reported by people in your community.</p>
          </div>
          <button
            onClick={() => onNavigate('found-items')}
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#346b4f] dark:text-[#99d3b0] hover:underline"
          >
            <span>View all found items</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentItems.map((item) => (
            <ItemCard
              key={item.id}
              title={item.title}
              location={item.location}
              date={item.date}
              imageUrl={item.imageUrl}
              status={item.status}
              onClick={() => onNavigate('found-items', { category: item.title })}
            />
          ))}
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="max-w-[1240px] mx-auto px-4 md:px-6 pb-12 w-full">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-[#f0f2f0] tracking-tight">Browse by Category</h2>
          <p className="text-sm text-gray-600 dark:text-[#c5c9c5]">Check if your item has been spotted in a specific category.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => onNavigate('found-items', { category: cat.name })}
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-[#1c1e1d] dark:hover:bg-[#222523] border border-gray-200 dark:border-[#2f3330] transition-all group text-center shadow-sm"
            >
              <div className="w-12 h-12 rounded-full bg-white dark:bg-[#222523] flex items-center justify-center text-[#346b4f] dark:text-[#99d3b0] group-hover:bg-[#346b4f] group-hover:text-white transition-colors mb-2">
                <span className="material-symbols-outlined text-[24px]">{cat.icon}</span>
              </div>
              <span className="text-xs font-semibold text-gray-700 dark:text-[#c5c9c5] group-hover:text-gray-900 dark:group-hover:text-[#f0f2f0]">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* BHARAT / CIVIC REACH SECTION */}
      <section className="max-w-[1240px] mx-auto px-4 md:px-6 pb-12 w-full">
        <div className="p-8 rounded-3xl bg-gray-100 dark:bg-[#1c1e1d] border border-gray-200 dark:border-[#2f3330] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-amber-600 dark:text-[#fdb881] text-xs font-semibold mb-1">
              <span className="material-symbols-outlined text-[18px]">public</span>
              <span>Pan-India Civic Reach</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-[#f0f2f0] tracking-tight">
              Helping people reconnect with their belongings across Bharat.
            </h2>
            <p className="text-sm text-gray-600 dark:text-[#c5c9c5] mt-2">
              Connecting community lost & found across transit, metro, colleges, and public spaces.
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-4">
              {['Railway Stations', 'Metro Lines', 'Universities & Colleges', 'Airports', 'Community Centers'].map((loc) => (
                <span
                  key={loc}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#222523] border border-gray-200 dark:border-[#2f3330] text-gray-800 dark:text-[#f0f2f0] text-xs font-semibold shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#346b4f] dark:text-[#99d3b0]">check_circle</span>
                  {loc}
                </span>
              ))}
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-4 items-center">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#222523] border border-gray-200 dark:border-[#2f3330] shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#346b4f] flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[24px]">support_agent</span>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-[#f0f2f0]">Need help reporting?</p>
                <p className="text-xs text-gray-500 dark:text-[#949994]">Our desk guides you step-by-step</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
