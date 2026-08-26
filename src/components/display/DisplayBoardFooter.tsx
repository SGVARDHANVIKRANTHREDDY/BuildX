import React from 'react';

interface DisplayBoardFooterProps {
  recentlyServed: string[];
}

export const DisplayBoardFooter: React.FC<DisplayBoardFooterProps> = ({ recentlyServed }) => {
  return (
    <div className="pt-4 border-t border-ink-900 flex flex-col sm:flex-row items-center justify-between text-xs text-ink-400 gap-3">
      <div className="flex items-center gap-2">
        <span className="font-bold text-ink-400">Recently Served:</span>
        {recentlyServed.length > 0 ? (
          <div className="flex gap-2 font-mono font-bold text-ink-400">
            {recentlyServed.map(t => (
              <span key={t} className="px-2 py-0.5 bg-ink-900 rounded">#{t}</span>
            ))}
          </div>
        ) : (
          <span>None yet today</span>
        )}
      </div>
      <div className="text-ink-500">
        Powered by CanteenOS & Excel Single-Writer Architecture
      </div>
    </div>
  );
};
