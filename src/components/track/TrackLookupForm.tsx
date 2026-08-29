import React from 'react';
import { Search, AlertCircle, RefreshCw } from 'lucide-react';

interface TrackLookupFormProps {
  tokenIdInput: string;
  setTokenIdInput: (v: string) => void;
  isLoading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
}

export const TrackLookupForm: React.FC<TrackLookupFormProps> = ({
  tokenIdInput,
  setTokenIdInput,
  isLoading,
  error,
  onSubmit
}) => {
  return (
    <div className="bg-white border border-ink-200 rounded-3xl p-6 sm:p-8 shadow-xs mb-8">
      <div className="text-center max-w-lg mx-auto mb-6">
        <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Search className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-ink-900">Track Your Kitchen Order Token</h2>
        <p className="text-xs text-ink-500 mt-1">
          Enter your 4-digit KOT ID to see live kitchen preparation and pickup status
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex gap-3 max-w-md mx-auto">
        <div className="relative flex-1">
          <input
            id="token-lookup-input"
            type="text"
            placeholder="e.g. 1001"
            maxLength={6}
            value={tokenIdInput}
            onChange={e => setTokenIdInput(e.target.value)}
            className="w-full pl-4 pr-10 py-3 bg-ink-50 border border-ink-200 rounded-xl font-mono text-center text-lg font-bold text-ink-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <button
          id="track-submit-btn"
          type="submit"
          disabled={isLoading || !tokenIdInput.trim()}
          className="px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-ink-400 text-white rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-2"
        >
          {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Check</span>}
        </button>
      </form>

      {error && (
        <div className="mt-4 max-w-md mx-auto p-3 bg-err-50 border border-err-200 rounded-xl text-err-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
