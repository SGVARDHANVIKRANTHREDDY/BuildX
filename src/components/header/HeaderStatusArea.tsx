import React from 'react';
import { ActiveTab } from './ActiveTab';

interface HeaderStatusAreaProps {
  isAdminLoggedIn: boolean;
  setActiveTab: (tab: ActiveTab) => void;
}

export const HeaderStatusArea: React.FC<HeaderStatusAreaProps> = ({ isAdminLoggedIn, setActiveTab }) => {
  return (
    <div className="flex items-center gap-3">
      <button
        id="admin-login-shortcut-btn"
        onClick={() => setActiveTab('admin')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
          isAdminLoggedIn
            ? 'bg-brand-50 border-brand-200 text-brand-700'
            : 'bg-white border-ink-200 text-ink-700 hover:bg-ink-50'
        }`}
      >
        <div className="w-6 h-6 bg-ink-100 rounded-full flex items-center justify-center text-ink-700 font-bold text-[11px] border border-ink-200">
          {isAdminLoggedIn ? 'AD' : 'ST'}
        </div>
        <span className="hidden sm:inline">
          {isAdminLoggedIn ? 'Admin Active' : 'Staff Login'}
        </span>
      </button>
    </div>
  );
};
