import React from 'react';

export const ConcurrencyExplainer: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
      <div className="bg-ink-50 p-4 rounded-2xl border border-ink-100">
        <div className="w-7 h-7 bg-brand-100 text-brand-700 rounded-lg flex items-center justify-center font-bold text-xs mb-2">
          1
        </div>
        <h4 className="text-xs font-bold text-ink-900 mb-1">Single-Writer Mutex</h4>
        <p className="text-[11px] text-ink-500 leading-relaxed">
          Every write acquires an in-process async lock, reads fresh state from Excel, updates, and atomically writes back.
        </p>
      </div>

      <div className="bg-ink-50 p-4 rounded-2xl border border-ink-100">
        <div className="w-7 h-7 bg-ok-100 text-ok-700 rounded-lg flex items-center justify-center font-bold text-xs mb-2">
          2
        </div>
        <h4 className="text-xs font-bold text-ink-900 mb-1">Atomic Token Increment</h4>
        <p className="text-[11px] text-ink-500 leading-relaxed">
          The Counter sheet serial is incremented only inside the lock, making duplicate tokens mathematically impossible.
        </p>
      </div>

      <div className="bg-ink-50 p-4 rounded-2xl border border-ink-100">
        <div className="w-7 h-7 bg-prep-100 text-prep-700 rounded-lg flex items-center justify-center font-bold text-xs mb-2">
          3
        </div>
        <h4 className="text-xs font-bold text-ink-900 mb-1">Write-Ahead Snapshots</h4>
        <p className="text-[11px] text-ink-500 leading-relaxed">
          Automatic timestamped snapshot backups are created prior to every write for full crash recovery.
        </p>
      </div>
    </div>
  );
};
