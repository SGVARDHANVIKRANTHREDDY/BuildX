import React from 'react';
import { ChefHat } from 'lucide-react';

interface PreparingBoardProps {
  tokens: string[];
}

export const PreparingBoard: React.FC<PreparingBoardProps> = ({ tokens }) => {
  return (
    <div className="bg-ink-900/80 border border-ink-700 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col">
      <div className="flex items-center justify-between pb-4 border-b border-ink-700/60 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-prep-500/20 text-prep-500 flex items-center justify-center">
            <ChefHat className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight text-prep-500">PREPARING</h3>
            <p className="text-xs text-ink-400">Kitchen is preparing items</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-prep-500/20 text-prep-500 border border-prep-500/30 rounded-full text-xs font-black">
          {tokens.length} in Kitchen
        </span>
      </div>

      {tokens.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 flex-1">
          {tokens.map(tokenId => (
            <div
              key={tokenId}
              className="bg-ink-900/80 border border-prep-500/30 rounded-2xl p-5 text-center flex flex-col items-center justify-center"
            >
              <span className="text-[10px] text-prep-300 font-bold uppercase tracking-wider mb-1">TOKEN</span>
              <span className="font-mono text-3xl sm:text-4xl font-bold text-prep-300">
                {tokenId}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-ink-500 py-16">
          <ChefHat className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm font-semibold">Kitchen queue is clear</p>
          <p className="text-xs text-ink-500 mt-1">New incoming orders will display here</p>
        </div>
      )}
    </div>
  );
};
