import React from 'react';
import { AdminStats } from '../../types';

interface OrderQueueFilterHeaderProps {
  filterStatus: string;
  onFilterChange: (status: string) => void;
  stats: AdminStats;
  totalOrders: number;
}

const FILTERS = [
  { key: 'ALL', label: 'All', countKey: null },
  { key: 'ACTIVE', label: 'Active', countKey: 'activeCount' },
  { key: 'READY', label: 'Ready', countKey: 'readyCount' },
] as const;

export const OrderQueueFilterHeader: React.FC<OrderQueueFilterHeaderProps> = ({
  filterStatus,
  onFilterChange,
  stats,
  totalOrders
}) => {
  return (
    <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50">
      <div>
        <h3 className="font-bold text-base text-slate-900">Live Order Queue</h3>
        <p className="text-[11px] text-slate-500">Sorted sequentially by incoming payment timestamp</p>
      </div>

      <div className="flex gap-1.5 bg-slate-200/60 p-1 rounded-xl">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => onFilterChange(f.key)}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              filterStatus === f.key ? 'bg-white text-brand-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {f.label} ({f.countKey ? stats[f.countKey as keyof AdminStats] : totalOrders})
          </button>
        ))}
      </div>
    </div>
  );
};
