import React from 'react';
import { CartItem } from '../../types';

interface CheckoutOrderSummaryProps {
  cart: CartItem[];
}

export const CheckoutOrderSummary: React.FC<CheckoutOrderSummaryProps> = ({ cart }) => {
  return (
    <div className="my-4 max-h-44 overflow-y-auto divide-y divide-ink-100 pr-1">
      {cart.map(c => (
        <div key={c.item.item_id} className="py-2 flex justify-between text-xs">
          <span className="text-ink-700 font-medium">{c.item.name} × {c.qty}</span>
          <span className="font-bold text-ink-900">₹{(c.item.price * c.qty).toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
};
