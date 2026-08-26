import React from 'react';
import { ChefHat } from 'lucide-react';

interface KitchenDemandStripProps {
  demand: { name: string; qty: number }[];
}

export const KitchenDemandStrip: React.FC<KitchenDemandStripProps> = ({ demand }) => {
  if (demand.length === 0) return null;

  return (
    <div className="px-5 pt-4 pb-1 flex items-start gap-2.5 flex-wrap border-b border-ink-100 bg-prep-50/40">
      <span className="text-[10px] font-black text-prep-700 uppercase tracking-widest flex items-center gap-1.5 py-1.5 shrink-0">
        <ChefHat className="w-3.5 h-3.5" />
        Prep Next
      </span>
      {demand.slice(0, 8).map(d => (
        <span
          key={d.name}
          className="px-2.5 py-1 mb-2.5 bg-white border border-prep-300 rounded-lg text-[11px] font-bold text-ink-900 whitespace-nowrap"
        >
          {d.name} <span className="text-prep-700">× {d.qty}</span>
        </span>
      ))}
    </div>
  );
};
