import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface ConcurrencyResultSummaryProps {
  testResult: any;
}

export const ConcurrencyResultSummary: React.FC<ConcurrencyResultSummaryProps> = ({ testResult }) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Simulation Run Verdict</h3>
          <p className="text-xs text-slate-500">Live test output against the SQLite WAL-mode backend</p>
        </div>

        {testResult.expectedOutcomeMet ? (
          <div className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-1.5 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {testResult.mode === 'last_unit'
                ? 'Atomic Overselling Prevention Passed (Exactly 1 Succeeded)'
                : 'Zero Token Collisions Verified (100% Unique)'}
            </span>
          </div>
        ) : (
          <div className="px-3.5 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-1.5 text-xs font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>Anomaly Detected</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Attempted</span>
          <span className="text-2xl font-black text-slate-800">{testResult.totalAttempted}</span>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Successful (Won)</span>
          <span className="text-2xl font-black text-emerald-600">{testResult.totalSuccessful}</span>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Rejected Cleanly</span>
          <span className="text-2xl font-black text-amber-600">{testResult.totalRejected || 0}</span>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Duration</span>
          <span className="text-2xl font-black text-brand-600">{testResult.durationMs} ms</span>
        </div>
      </div>
    </>
  );
};
