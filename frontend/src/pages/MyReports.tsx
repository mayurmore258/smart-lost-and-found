import React, { useEffect, useState } from 'react';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { LoadingState } from '../components/LoadingState';
import { apiService, getImageUrl } from '../services/api';

interface MyReportsProps {
  onNavigate: (path: string, params?: any) => void;
}

export const MyReports: React.FC<MyReportsProps> = ({ onNavigate }) => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      try {
        const storedReports: any[] = JSON.parse(
          localStorage.getItem('smart_lost_found_user_reports') || '[]'
        );

        // Refresh current status from backend for each stored report
        const updatedReports = await Promise.all(
          storedReports.map(async (rep) => {
            try {
              if (rep.id) {
                const liveItem = await apiService.getItem(rep.id);
                return {
                  ...rep,
                  status: liveItem.status || rep.status,
                  image_url: liveItem.image_path ? getImageUrl(liveItem.image_path) : rep.image_url,
                };
              }
            } catch {
              // Retain local status if backend item lookup fails
            }
            return rep;
          })
        );

        setReports(updatedReports);
      } catch (err: any) {
        console.warn('Error reading reports:', err.message);
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
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
        <LoadingState message="Loading your reports..." subtext="Checking latest status from backend" />
      ) : reports.length === 0 ? (
        <EmptyState
          title="No reports filed yet"
          message="You haven't filed any lost or found reports yet in this session."
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
                if (report.type === 'lost') {
                  onNavigate('possible-matches', { itemId: report.id, itemDetails: report });
                } else {
                  onNavigate('found-items');
                }
              }}
              className="bg-white dark:bg-[#1c1e1d] border border-gray-200 dark:border-[#2f3330] rounded-2xl p-4 sm:p-5 shadow-sm hover:border-[#346b4f] dark:hover:border-[#3d7a5b] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-[#222523] shrink-0 border border-gray-200 dark:border-[#2f3330]">
                  {report.image_url ? (
                    <img
                      src={report.image_url}
                      alt={report.title || 'Item report'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="material-symbols-outlined text-[24px]">inventory_2</span>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        report.type === 'lost'
                          ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}
                    >
                      {report.type === 'lost' ? 'Lost Report' : 'Found Report'}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-[#949994]">{report.date_time}</span>
                  </div>

                  <h3 className="font-bold text-base text-gray-900 dark:text-[#f0f2f0] mt-1 group-hover:text-[#346b4f] dark:group-hover:text-[#99d3b0] transition-colors">
                    {report.title || `${report.color || ''} ${report.category || 'Belonging'}`}
                  </h3>

                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-[#949994] mt-0.5">
                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                    <span>{report.location}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100 dark:border-[#2f3330]">
                <StatusBadge status={report.status || 'active'} />
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
