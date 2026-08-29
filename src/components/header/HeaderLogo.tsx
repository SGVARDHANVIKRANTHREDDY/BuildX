import React from 'react';
import { Utensils } from 'lucide-react';
import { ActiveTab } from './ActiveTab';

interface HeaderLogoProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const HeaderLogo: React.FC<HeaderLogoProps> = ({ setActiveTab }) => {
  return (
    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('menu')}>
      <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform hover:scale-105">
        <Utensils className="w-5 h-5" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-bold text-xl text-ink-900 tracking-tight">CanteenOS</h1>
        </div>
        <p className="text-xs text-ink-500 font-medium">Digital Order & Token System</p>
      </div>
    </div>
  );
};
