import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface ConcurrencyResultSummaryProps {
  testResult: any;
}

export const ConcurrencyResultSummary: React.FC<ConcurrencyResultSummaryProps> = ({ testResult }) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-ink-100 gap-2">
        <div>
          <h3 className="text-lg font-bold text-ink-900">Simulation Run Verdict</h3>
          <p className="text-xs text-ink-500">Live test output against Excel single-writer backend</p>
        </div>

        {testResult.expectedOutcomeMet ? (
          <div className="px-3.5 py-1.5 bg-ok-50 border border-ok-200 text-ok-700 rounded-xl flex items-center gap-1.5 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {testResult.mode === 'last_unit'
                ? 'Atomic Overselling Prevention Passed (Exactly 1 Succeeded)'
                : 'Zero Token Collisions Verified (100% Unique)'}
            </span>
          </div>
        ) : (
          <div className="px-3.5 py-1.5 bg-err-50 border border-err-200 text-err-700 rounded-xl flex items-center gap-1.5 text-xs font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>Anomaly Detected</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-ink-50 p-4 rounded-2xl border border-ink-100">
          <span className="text-[10px] uppercase font-bold text-ink-400 block mb-1">Attempted</span>
          <span className="text-2xl font-black text-ink-900">{testResult.totalAttempted}</span>
        </div>
        <div className="bg-ink-50 p-4 rounded-2xl border border-ink-100">
          <span className="text-[10px] uppercase font-bold text-ink-400 block mb-1">Successful (Won)</span>
          <span className="text-2xl font-black text-ok-700">{testResult.totalSuccessful}</span>
        </div>
        <div className="bg-ink-50 p-4 rounded-2xl border border-ink-100">
          <span className="text-[10px] uppercase font-bold text-ink-400 block mb-1">Rejected Cleanly</span>
          <span className="text-2xl font-black text-prep-700">{testResult.totalRejected || 0}</span>
        </div>
        <div className="bg-ink-50 p-4 rounded-2xl border border-ink-100">
          <span className="text-[10px] uppercase font-bold text-ink-400 block mb-1">Total Duration</span>
          <span className="text-2xl font-black text-brand-600">{testResult.durationMs} ms</span>
        </div>
      </div>
    </>
  );
};
