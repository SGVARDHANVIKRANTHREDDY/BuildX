import React from 'react';
import { BellRing, CheckCircle2 } from 'lucide-react';

interface ReadyPickupBoardProps {
  tokens: string[];
}

export const ReadyPickupBoard: React.FC<ReadyPickupBoardProps> = ({ tokens }) => {
  return (
    <div className="bg-ink-900/80 border-2 border-ok-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col">
      <div className="flex items-center justify-between pb-4 border-b border-ink-700/60 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-ok-500/20 text-ok-500 flex items-center justify-center">
            <BellRing className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight text-ok-500">READY FOR PICKUP</h3>
            <p className="text-xs text-ink-400">Collect at Counter 1 & 2</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-ok-500/20 text-ok-500 border border-ok-500/30 rounded-full text-xs font-black">
          {tokens.length} Ready
        </span>
      </div>

      {tokens.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 flex-1">
          {tokens.map((tokenId, idx) => (
            <div
              key={tokenId}
              className={`bg-ok-900/60 border border-ok-500/60 rounded-2xl p-5 text-center flex flex-col items-center justify-center ${
                idx === tokens.length - 1 ? 'ring-4 ring-ok-500/30 animate-pulse' : ''
              }`}
            >
              <span className="text-[10px] text-ok-500 font-bold uppercase tracking-wider mb-1">TOKEN</span>
              <span className="font-mono text-4xl sm:text-5xl font-black text-ok-500">
                {tokenId}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-ink-500 py-16">
          <CheckCircle2 className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm font-semibold">No orders currently waiting for pickup</p>
          <p className="text-xs text-ink-500 mt-1">Orders appear here as soon as staff marks them Ready</p>
        </div>
      )}
    </div>
  );
};
