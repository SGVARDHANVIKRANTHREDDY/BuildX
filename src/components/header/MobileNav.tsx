import React from 'react';
import { Utensils, Search, Tv, ShieldCheck, Zap } from 'lucide-react';
import { ActiveTab } from './ActiveTab';

interface MobileNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

function itemClass(isActive: boolean) {
  return `flex flex-col items-center py-1 px-2 rounded-lg font-semibold ${
    isActive ? 'text-brand-600' : 'text-ink-500'
  }`;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="md:hidden flex items-center justify-around border-t border-ink-200 bg-white px-2 py-2 text-xs">
      <button onClick={() => setActiveTab('menu')} className={itemClass(activeTab === 'menu')}>
        <Utensils className="w-4 h-4 mb-0.5" />
        <span>Menu</span>
      </button>
      <button onClick={() => setActiveTab('track')} className={itemClass(activeTab === 'track')}>
        <Search className="w-4 h-4 mb-0.5" />
        <span>Track</span>
      </button>
      <button onClick={() => setActiveTab('display')} className={itemClass(activeTab === 'display')}>
        <Tv className="w-4 h-4 mb-0.5" />
        <span>Serving</span>
      </button>
      <button onClick={() => setActiveTab('admin')} className={itemClass(activeTab === 'admin')}>
        <ShieldCheck className="w-4 h-4 mb-0.5" />
        <span>Admin</span>
      </button>
      <button onClick={() => setActiveTab('concurrency')} className={itemClass(activeTab === 'concurrency')}>
        <Zap className="w-4 h-4 mb-0.5" />
        <span>Stress Test</span>
      </button>
    </div>
  );
};
