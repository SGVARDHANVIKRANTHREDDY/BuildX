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
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 mb-6 gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center text-white shadow-brand-sm">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Admin Control Center</h2>
          <p className="text-xs text-slate-500 font-medium">Main Kitchen Counter Queue & Inventory</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onToggleAutoRefresh}
          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 ${
            autoRefresh ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-100 text-slate-600'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-spin' : ''}`} />
          <span>{autoRefresh ? 'Live Auto-Sync ON' : 'Auto-Sync Paused'}</span>
        </button>

        <button
          onClick={onRefreshNow}
          className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50"
        >
          Refresh Now
        </button>

        <button
          onClick={onLogout}
          className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-100 flex items-center gap-1"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};
