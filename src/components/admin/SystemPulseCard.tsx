import React from 'react';
import { Users, Clock, CheckCircle2, IndianRupee } from 'lucide-react';
import { AdminStats } from '../../types';

interface SystemPulseCardProps {
  stats: AdminStats;
}

interface StatTile {
  key: keyof AdminStats;
  label: string;
  icon: typeof Users;
  color: string;
  bg: string;
  border: string;
  prefix?: string;
  suffix?: string;
}

const STAT_TILES: StatTile[] = [
  { key: 'activeCount', label: 'Active Queue', icon: Users, color: 'text-brand-600', bg: 'bg-brand-50', border: 'border-brand-100' },
  { key: 'avgWaitMinutes', label: 'Avg Wait Time', icon: Clock, suffix: 'm', color: 'text-cat-blue-500', bg: 'bg-cat-blue-50', border: 'border-cat-blue-100' },
  { key: 'readyCount', label: 'Ready for Pickup', icon: CheckCircle2, color: 'text-ok-700', bg: 'bg-ok-50', border: 'border-ok-100' },
  { key: 'totalRevenue', label: "Today's Revenue", icon: IndianRupee, prefix: '₹', color: 'text-prep-700', bg: 'bg-prep-50', border: 'border-prep-100' },
];

export const SystemPulseCard: React.FC<SystemPulseCardProps> = ({ stats }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-ink-200 shadow-xs">
      <h3 className="text-ink-400 text-xs font-black uppercase tracking-widest mb-4">
        System Pulse
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {STAT_TILES.map(tile => {
          const Icon = tile.icon;
          const raw = stats[tile.key];
          const value = tile.key === 'totalRevenue' && typeof raw === 'number' ? raw.toFixed(0) : raw;
          return (
            <div key={tile.key} className={`p-3.5 rounded-xl border ${tile.bg} ${tile.border}`}>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 bg-white ${tile.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className={`text-2xl font-bold ${tile.color}`}>
                {tile.prefix || ''}{value}{tile.suffix || ''}
              </p>
              <p className="text-[10px] text-ink-500 uppercase font-bold mt-0.5">{tile.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
