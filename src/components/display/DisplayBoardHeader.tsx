import React from 'react';
import { Tv } from 'lucide-react';

interface DisplayBoardHeaderProps {
  currentTime: string;
}

export const DisplayBoardHeader: React.FC<DisplayBoardHeaderProps> = ({ currentTime }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-ink-900 gap-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
          <Tv className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white">LIVE KOT DISPLAY BOARD</h2>
          <p className="text-xs text-ink-400 font-bold tracking-widest uppercase">Kitchen Order Token · Counter Display</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <span className="font-mono text-2xl font-black text-ink-200">{currentTime}</span>
          <div className="flex items-center gap-1.5 justify-end text-xs text-ok-500 font-semibold">
            <span className="w-2 h-2 bg-ok-500 rounded-full animate-ping"></span>
            <span>Live Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
};
