import React from 'react';

interface ConcurrencyResultDetailsProps {
  testResult: any;
}

export const ConcurrencyResultDetails: React.FC<ConcurrencyResultDetailsProps> = ({ testResult }) => {
  return (
    <>
      <div>
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Generated Tokens in Order
        </h4>
        <div className="flex flex-wrap gap-2">
          {testResult.tokens?.map((token: string) => (
            <span
              key={token}
              className="px-3 py-1.5 bg-brand-50 border border-brand-200 text-brand-700 font-mono font-bold text-xs rounded-xl"
            >
              #{token}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Thread Execution Logs
        </h4>
        <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 font-mono text-xs max-h-56 overflow-y-auto space-y-1">
          {testResult.detailedLogs?.map((log: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between text-[11px] py-0.5 border-b border-slate-800">
              <span className="text-slate-400">Thread #{log.taskId} ({log.studentName})</span>
              {log.success ? (
                <span className="text-emerald-400">
                  TOKEN: #{log.tokenId} | Excel Committed | Item: {log.item}
                </span>
              ) : (
                <span className="text-rose-400">
                  REJECTED: {log.error}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
