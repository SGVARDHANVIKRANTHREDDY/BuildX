import React from 'react';
import { BellRing, ChefHat, Clock, CheckCircle2 } from 'lucide-react';
import { OrderDetails } from '../../types';

interface OrderStatusBannerProps {
  order: OrderDetails;
}

export const OrderStatusBanner: React.FC<OrderStatusBannerProps> = ({ order }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-ink-100">
      <div>
        <span className="text-[11px] font-bold text-ink-400 uppercase tracking-wider block">Kitchen Order Token (KOT)</span>
        <span className="font-mono text-3xl sm:text-4xl font-black text-brand-600">
          #{order.token_id}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {order.order_status === 'READY' ? (
          <div className="px-4 py-2 bg-ok-50 border border-ok-200 text-ok-700 rounded-xl flex items-center gap-2 animate-bounce">
            <BellRing className="w-5 h-5" />
            <span className="font-extrabold text-xs uppercase tracking-wider">Ready at Counter</span>
          </div>
        ) : order.order_status === 'PREPARING' ? (
          <div className="px-4 py-2 bg-prep-50 border border-prep-300 text-prep-700 rounded-xl flex items-center gap-2">
            <ChefHat className="w-4 h-4 animate-spin" />
            <span className="font-bold text-xs uppercase tracking-wider">Kitchen Preparing</span>
          </div>
        ) : order.order_status === 'PLACED' ? (
          <div className="px-4 py-2 bg-cat-blue-50 border border-cat-blue-200 text-cat-blue-700 rounded-xl flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="font-bold text-xs uppercase tracking-wider">Order Placed</span>
          </div>
        ) : (
          <div className="px-4 py-2 bg-ink-100 text-ink-500 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-bold text-xs uppercase tracking-wider">Served & Completed</span>
          </div>
        )}
      </div>
    </div>
  );
};
