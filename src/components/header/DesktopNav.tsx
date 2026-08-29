import React from 'react';
import { Utensils, Search, Tv, ShieldCheck, Zap } from 'lucide-react';
import { ActiveTab } from './ActiveTab';

interface DesktopNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isAdminLoggedIn: boolean;
  cartCount: number;
}

function navClass(isActive: boolean) {
  return `flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
    isActive ? 'bg-white text-brand-600 shadow-xs' : 'text-ink-500 hover:text-ink-900 hover:bg-white/50'
  }`;
}

export const DesktopNav: React.FC<DesktopNavProps> = ({ activeTab, setActiveTab, isAdminLoggedIn, cartCount }) => {
  return (
    <nav className="hidden md:flex items-center gap-1 bg-ink-100/80 p-1.5 rounded-xl border border-ink-200/60">
      <button id="nav-menu-btn" onClick={() => setActiveTab('menu')} className={navClass(activeTab === 'menu')}>
        <Utensils className="w-3.5 h-3.5" />
        <span>Menu & Order</span>
        {cartCount > 0 && (
          <span className="ml-1 px-1.5 py-0.2 bg-brand-600 text-white rounded-full text-[10px] font-bold">
            {cartCount}
          </span>
        )}
      </button>

      <button id="nav-track-btn" onClick={() => setActiveTab('track')} className={navClass(activeTab === 'track')}>
        <Search className="w-3.5 h-3.5" />
        <span>Track Token</span>
      </button>

      <button id="nav-display-btn" onClick={() => setActiveTab('display')} className={navClass(activeTab === 'display')}>
        <Tv className="w-3.5 h-3.5" />
        <span>Now Serving</span>
      </button>

      <button id="nav-admin-btn" onClick={() => setActiveTab('admin')} className={navClass(activeTab === 'admin')}>
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Admin Queue</span>
        {isAdminLoggedIn && <span className="w-2 h-2 bg-ok-500 rounded-full"></span>}
      </button>

      <button id="nav-concurrency-btn" onClick={() => setActiveTab('concurrency')} className={navClass(activeTab === 'concurrency')}>
        <Zap className="w-3.5 h-3.5 text-prep-500" />
        <span>Concurrency Lab</span>
      </button>
    </nav>
  );
};
