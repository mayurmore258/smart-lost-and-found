import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';

interface VerificationProps {
  matchId?: string;
  match?: any;
  onNavigate: (path: string, params?: any) => void;
}

export const Verification: React.FC<VerificationProps> = ({
  matchId = '',
  match,
  onNavigate,
}) => {
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<'pending' | 'verified' | 'failed'>('pending');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [questionText, setQuestionText] = useState(
    match?.verification_question || 'Can you describe any distinctive marking or accessory on your item?'
  );

  // Load the actual verification question from backend
  useEffect(() => {
    if (matchId) {
      apiService
        .getVerificationQuestion(matchId)
        .then((data) => {
          if (data && data.question) {
            setQuestionText(data.question);
          }
          if (data && data.verified) {
            setResult('verified');
          }
        })
        .catch((err) => {
          console.warn('Could not fetch verification question from backend:', err.message);
        });
    }
  }, [matchId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) {
      setErrorMessage('Please enter your answer to verify ownership.');
      return;
    }
    if (!matchId) {
      setErrorMessage('Invalid match ID. Cannot submit verification.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await apiService.verifyOwnership(matchId, answer.trim());
      if (res.verified) {
        setResult('verified');
        setSuccessMessage(res.message || 'Ownership successfully verified!');

        // Update local session status if available
        try {
          const stored = JSON.parse(localStorage.getItem('smart_lost_found_user_reports') || '[]');
          const updated = stored.map((r: any) =>
            r.id === match?.lost_item_id ? { ...r, status: 'verified' } : r
          );
          localStorage.setItem('smart_lost_found_user_reports', JSON.stringify(updated));
        } catch (e) {
          // Ignore storage update errors
        }
      } else {
        setResult('failed');
        setErrorMessage(
          res.message || 'Verification unsuccessful. Your answer did not confirm ownership of this item.'
        );
      }
    } catch (err: any) {
      console.error('Verification request failed:', err);
      setResult('failed');
      setErrorMessage(
        err.message || 'Verification request failed. Please check backend connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (result === 'verified') {
    return (
      <div className="max-w-[640px] mx-auto px-4 md:px-6 py-12 text-center flex-1 flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-[#1d2d23] border border-emerald-200 dark:border-[#387053] text-[#346b4f] dark:text-[#99d3b0] flex items-center justify-center mb-4 shadow-sm">
          <span className="material-symbols-outlined text-[36px]">verified</span>
        </div>

        <span className="text-xs font-semibold text-[#346b4f] dark:text-[#99d3b0] uppercase tracking-wider block mb-1">
          Verification Confirmed
        </span>

        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-[#f0f2f0] tracking-tight">
          Ownership Verified!
        </h1>

        <p className="text-sm text-gray-600 dark:text-[#c5c9c5] mt-2 max-w-md">
          {successMessage ||
            'Your answer matched the recorded details. Item status has been updated to verified.'}
        </p>

        <div className="bg-gray-50 dark:bg-[#1c1e1d] border border-gray-200 dark:border-[#2f3330] p-6 rounded-2xl mt-6 w-full text-left space-y-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-[#f0f2f0] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#346b4f] dark:text-[#99d3b0]">location_on</span>
            <span>Recovery Details</span>
          </h3>
          <p className="text-xs text-gray-600 dark:text-[#c5c9c5]">
            <strong>Location:</strong> {match?.location || 'Reported Location'}
          </p>
          <p className="text-xs text-gray-600 dark:text-[#c5c9c5]">
            <strong>Match Reference:</strong>{' '}
            <code className="bg-gray-200 dark:bg-[#222523] px-2 py-0.5 rounded font-mono text-emerald-700 dark:text-[#99d3b0]">
              MATCH-{matchId ? matchId.slice(-6).toUpperCase() : 'VERIFIED'}
            </code>
          </p>
          <p className="text-xs text-gray-500 dark:text-[#949994]">
            Please bring a valid photo ID when claiming your item.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <button
            onClick={() => onNavigate('my-reports')}
            className="px-6 py-3 rounded-full bg-[#346b4f] hover:bg-[#3d7a5b] text-white text-sm font-semibold transition-colors shadow-sm"
          >
            Go to My Reports
          </button>
          <button
            onClick={() => onNavigate('home')}
            className="px-6 py-3 rounded-full bg-gray-100 dark:bg-[#222523] border border-gray-200 dark:border-[#2f3330] text-gray-900 dark:text-[#f0f2f0] text-sm font-semibold transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[680px] mx-auto px-4 md:px-6 py-8 w-full flex-1">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => onNavigate('match-details')}
          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-[#949994] hover:text-gray-900 dark:hover:text-white mb-3"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Match Details</span>
        </button>

        <span className="text-xs font-semibold text-[#346b4f] dark:text-[#99d3b0] uppercase tracking-wider block">
          Ownership Verification
        </span>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-[#f0f2f0] tracking-tight mt-1">
          Verify Ownership
        </h1>
        <p className="text-sm text-gray-600 dark:text-[#c5c9c5] mt-1">
          To ensure items return to their rightful owner, please answer this verification question.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 mb-6 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-300 text-sm">
          {errorMessage}
        </div>
      )}

      {/* Verification Card Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1c1e1d] border border-gray-200 dark:border-[#2f3330] p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col gap-6">
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-[#1d2d23] border border-emerald-200 dark:border-[#387053]">
          <div className="flex items-center gap-2 text-[#346b4f] dark:text-[#99d3b0] font-semibold text-xs uppercase tracking-wide mb-1">
            <span className="material-symbols-outlined text-[18px]">quiz</span>
            <span>Verification Question</span>
          </div>
          <p className="text-base font-bold text-gray-900 dark:text-[#f0f2f0]">
            {questionText}
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-[#f0f2f0] mb-2">
            Your Answer *
          </label>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Enter distinctive details (e.g. markings, contents, serial numbers)..."
            className="w-full bg-gray-50 dark:bg-[#222523] border border-gray-200 dark:border-[#2f3330] rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-[#f0f2f0] focus:outline-none focus:border-[#346b4f]"
            required
          />
          <p className="text-xs text-gray-500 dark:text-[#949994] mt-2">
            Your answer will be validated against community record details.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => onNavigate('match-details')}
            className="px-6 py-3 rounded-full bg-gray-100 dark:bg-[#222523] text-gray-700 dark:text-[#c5c9c5] text-sm font-semibold hover:bg-gray-200 dark:hover:bg-[#2a2d2b] transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-full bg-[#346b4f] hover:bg-[#3d7a5b] text-white text-sm font-semibold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Submit Answer</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
