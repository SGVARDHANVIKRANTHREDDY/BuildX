import React from 'react';
import { OrderDetails } from '../../types';

interface OrderSummaryListProps {
  order: OrderDetails;
}

export const OrderSummaryList: React.FC<OrderSummaryListProps> = ({ order }) => {
  return (
    <div className="pt-4 border-t border-ink-100">
      <h4 className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-3">Order Summary</h4>
      <div className="space-y-2">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-xs py-1.5 px-3 bg-ink-50 rounded-xl">
            <span className="font-semibold text-ink-900">{item.name || item.item_id} × {item.qty}</span>
            <span className="font-bold text-ink-900">₹{((item.price || 0) * item.qty).toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center text-sm font-bold text-ink-900 pt-3 mt-3 border-t border-ink-100">
        <span>Total Paid</span>
        <span className="text-brand-600 font-extrabold">₹{order.total_amount.toFixed(2)}</span>
      </div>
    </div>
  );
};
