import React from 'react';
import { Plus, Minus, Clock } from 'lucide-react';
import { MenuItem, CartItem } from '../../types';
import { getCategoryColor } from '../../lib/categoryColors';

interface MenuItemCardProps {
  item: MenuItem;
  inCart: CartItem | undefined;
  onAdd: (item: MenuItem) => void;
  onRemove: (itemId: string) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, inCart, onAdd, onRemove }) => {
  const color = getCategoryColor(item.category);

  return (
    <div
      id={`menu-card-${item.item_id}`}
      className={`bg-white border rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between ${
        !item.available
          ? 'border-ink-200 opacity-60 bg-ink-50/50'
          : inCart
          ? 'border-brand-300 ring-2 ring-brand-50/50'
          : 'border-ink-200 hover:border-ink-400'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-bold text-ink-900 text-base">{item.name}</h3>
          <span className="font-mono text-xs text-ink-400 font-semibold">{item.item_id}</span>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <span className={`flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-md ${color.bg} ${color.text} border ${color.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
            {item.category}
          </span>
          {item.available ? (
            <span className="px-2 py-0.5 bg-ok-50 text-ok-700 text-[10px] font-bold rounded-md border border-ok-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-ok-500 rounded-full"></span> Available
            </span>
          ) : (
            <span className="px-2 py-0.5 bg-err-50 text-err-700 text-[10px] font-bold rounded-md border border-err-100">
              Sold Out
            </span>
          )}
        </div>
        {!item.available && item.restock_note && (
          <p className="text-[11px] text-prep-700 bg-prep-50 border border-prep-100 rounded-lg px-2.5 py-1.5 -mt-2 mb-4 flex items-center gap-1.5">
            <Clock className="w-3 h-3 shrink-0" />
            <span className="font-semibold">{item.restock_note}</span>
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-ink-100 mt-2">
        <span className="text-lg font-bold text-ink-900">₹{item.price.toFixed(2)}</span>

        {item.available ? (
          inCart ? (
            <div className="flex items-center bg-brand-50 rounded-xl border border-brand-200 p-1">
              <button
                onClick={() => onRemove(item.item_id)}
                className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-brand-700 hover:bg-brand-100 transition-colors shadow-xs"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-3 font-bold text-brand-700 text-xs">
                {inCart.qty}
              </span>
              <button
                onClick={() => onAdd(item)}
                className="w-7 h-7 bg-brand-600 text-white rounded-lg flex items-center justify-center hover:bg-brand-700 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              id={`add-btn-${item.item_id}`}
              onClick={() => onAdd(item)}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          )
        ) : (
          <button
            disabled
            className="px-3 py-1.5 bg-ink-100 text-ink-400 rounded-xl text-xs font-semibold cursor-not-allowed"
          >
            Unavailable
          </button>
        )}
      </div>
    </div>
  );
};
