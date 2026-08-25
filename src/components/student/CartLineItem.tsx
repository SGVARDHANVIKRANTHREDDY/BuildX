import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { CartItem } from '../../types';

interface CartLineItemProps {
  cartItem: CartItem;
  onAdd: (item: CartItem['item']) => void;
  onRemove: (itemId: string) => void;
}

export const CartLineItem: React.FC<CartLineItemProps> = ({ cartItem: c, onAdd, onRemove }) => {
  return (
    <div className={`py-3 flex items-center justify-between ${!c.item.available ? 'opacity-60 bg-err-50/50 p-2 rounded-xl' : ''}`}>
      <div>
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-bold text-ink-900">{c.item.name}</p>
          {!c.item.available && (
            <span className="px-1.5 py-0.2 bg-err-100 text-err-700 rounded text-[9px] font-bold">
              Sold Out
            </span>
          )}
        </div>
        <p className="text-[11px] text-ink-400">₹{c.item.price} each</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-ink-50 border border-ink-200 rounded-lg p-0.5">
          <button
            onClick={() => onRemove(c.item.item_id)}
            className="w-6 h-6 flex items-center justify-center text-ink-500 hover:bg-ink-200 rounded"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="px-2 text-xs font-bold text-ink-900">{c.qty}</span>
          <button
            onClick={() => c.item.available && onAdd(c.item)}
            disabled={!c.item.available}
            className={`w-6 h-6 flex items-center justify-center rounded ${c.item.available ? 'text-ink-500 hover:bg-ink-200' : 'text-ink-400 cursor-not-allowed'}`}
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
        <span className="font-bold text-xs text-ink-900 w-14 text-right">
          ₹{(c.item.price * c.qty).toFixed(2)}
        </span>
      </div>
    </div>
  );
};
