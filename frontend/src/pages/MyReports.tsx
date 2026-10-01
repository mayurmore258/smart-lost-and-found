import React, { useEffect, useState } from 'react';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { LoadingState } from '../components/LoadingState';
import { apiService } from '../services/api';

interface MyReportsProps {
  onNavigate: (path: string, params?: any) => void;
}

export const MyReports: React.FC<MyReportsProps> = ({ onNavigate }) => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const data = await apiService.getUserReports();
        setReports(data || []);
      } catch (err: any) {
        console.warn('My Reports API fallback:', err.message);
        // Fallback reports array for visual design preview
        setReports([
          {
            id: 'rep_1',
            title: 'Black Leather Wallet',
            type: 'lost',
            location: 'Dadar Western Station',
            date_time: 'Oct 1, 2026',
            status: 'potential_match',
            image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80',
          },
          {
            id: 'rep_2',
            title: 'House Keys on Braid Fob',
            type: 'found',
            location: 'Andheri West Metro Station',
            date_time: 'Sep 29, 2026',
            status: 'unclaimed',
            image_url: 'https://images.unsplash.com/photo-1582142839970-2b93227ef846?w=500&auto=format&fit=crop&q=60',
          },
          {
            id: 'rep_3',
            title: 'Wireless AirPods Case',
            type: 'lost',
            location: 'Bandra Bandstand',
            date_time: 'Sep 25, 2026',
            status: 'resolved',
            image_url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&auto=format&fit=crop&q=60',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className="max-w-[1024px] mx-auto px-4 md:px-6 py-8 w-full flex-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-semibold text-[#346b4f] dark:text-[#99d3b0] uppercase tracking-wider block">
            User Activity
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-[#f0f2f0] tracking-tight mt-1">
            My Reports ({reports.length})
          </h1>
          <p className="text-sm text-gray-600 dark:text-[#c5c9c5] mt-1">
            Track the status of your lost item filings and found item submissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('report-lost')}
            className="px-4 py-2 rounded-full bg-[#346b4f] hover:bg-[#3d7a5b] text-white text-xs font-semibold shadow-sm transition-all"
          >
            + Report Lost
          </button>
          <button
            onClick={() => onNavigate('report-found')}
            className="px-4 py-2 rounded-full bg-gray-100 dark:bg-[#222523] border border-gray-200 dark:border-[#2f3330] text-gray-900 dark:text-[#f0f2f0] text-xs font-semibold transition-all"
          >
            + Report Found
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading your reports..." subtext="Retrieving your item status from your session" />
      ) : reports.length === 0 ? (
        <EmptyState
          title="No reports filed yet"
          message="You haven't filed any lost or found reports yet."
          actionLabel="Report a Lost Item"
          onAction={() => onNavigate('report-lost')}
          icon="folder_open"
        />
      ) : (
        <div className="flex flex-col gap-4">
          {reports.map((report) => (
            <div
              key={report.id}
              onClick={() => {
                if (report.status === 'potential_match') {
                  onNavigate('possible-matches', { itemId: report.id });
                } else {
                  onNavigate('found-items');
                }
              }}
              className="bg-white dark:bg-[#1c1e1d] border border-gray-200 dark:border-[#2f3330] rounded-2xl p-4 sm:p-5 shadow-sm hover:border-[#346b4f] dark:hover:border-[#3d7a5b] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-[#222523] shrink-0 border border-gray-200 dark:border-[#2f3330]">
                  <img
                    src={report.image_url || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80'}
                    alt={report.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      report.type === 'lost'
                        ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    }`}>
                      {report.type === 'lost' ? 'Lost Report' : 'Found Report'}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-[#949994]">{report.date_time}</span>
                  </div>

                  <h3 className="font-bold text-base text-gray-900 dark:text-[#f0f2f0] mt-1 group-hover:text-[#346b4f] dark:group-hover:text-[#99d3b0] transition-colors">
                    {report.title}
                  </h3>

                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-[#949994] mt-0.5">
                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                    <span>{report.location}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100 dark:border-[#2f3330]">
                <StatusBadge status={report.status} />
                <span className="material-symbols-outlined text-gray-400 dark:text-[#949994] group-hover:text-[#346b4f] dark:group-hover:text-[#99d3b0] transition-colors text-[20px]">
                  chevron_right
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
