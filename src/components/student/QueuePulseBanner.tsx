import React from 'react';
import { Clock } from 'lucide-react';
import { QueueInfo } from '../../types';

interface QueuePulseBannerProps {
  queueInfo: QueueInfo;
}

export const QueuePulseBanner: React.FC<QueuePulseBannerProps> = ({ queueInfo }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-slate-900 text-base">Canteen Rush & Queue Pulse</h2>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Live Counter
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Skip the counter line by ordering ahead. Pre-pay with test UPI/card to receive your 4-digit token.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="flex-1 md:flex-initial bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-center min-w-[120px]">
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Queue Ahead</span>
          <span className="font-bold text-slate-800 text-lg">{queueInfo.queueDepth} orders</span>
        </div>
        <div className="flex-1 md:flex-initial bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-center min-w-[120px]">
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Est. Prep Time</span>
          <span className="font-bold text-brand-600 text-lg">~{queueInfo.estimatedWaitMinutes} mins</span>
        </div>
      </div>
    </div>
  );
};
