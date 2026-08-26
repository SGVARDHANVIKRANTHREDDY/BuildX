import React from 'react';
import { ShieldCheck, RefreshCw, LogOut } from 'lucide-react';

interface AdminTopBarProps {
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
  onRefreshNow: () => void;
  onLogout: () => void;
}

export const AdminTopBar: React.FC<AdminTopBarProps> = ({
  autoRefresh,
  onToggleAutoRefresh,
  onRefreshNow,
  onLogout
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-ink-200 mb-6 gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center text-white shadow-brand-sm">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-ink-900">Admin Control Center</h2>
          <p className="text-xs text-ink-500 font-medium">Main Kitchen Counter Queue & Inventory</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onToggleAutoRefresh}
          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 ${
            autoRefresh ? 'bg-ok-50 border-ok-200 text-ok-700' : 'bg-ink-100 text-ink-500'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-spin' : ''}`} />
          <span>{autoRefresh ? 'Live Auto-Sync ON' : 'Auto-Sync Paused'}</span>
        </button>

        <button
          onClick={onRefreshNow}
          className="px-3 py-1.5 bg-white border border-ink-200 text-ink-700 rounded-xl text-xs font-bold hover:bg-ink-50"
        >
          Refresh Now
        </button>

        <button
          onClick={onLogout}
          className="px-3 py-1.5 bg-err-50 border border-err-200 text-err-700 rounded-xl text-xs font-bold hover:bg-err-100 flex items-center gap-1"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};
