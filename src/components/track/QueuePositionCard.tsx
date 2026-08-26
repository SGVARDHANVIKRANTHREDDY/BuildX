import React from 'react';
import { Clock } from 'lucide-react';
import { OrderDetails } from '../../types';

interface QueuePositionCardProps {
  order: OrderDetails;
}

export const QueuePositionCard: React.FC<QueuePositionCardProps> = ({ order }) => {
  if (order.order_status === 'SERVED') return null;

  return (
    <div className="bg-ink-50 border border-ink-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-brand-100 text-brand-700 rounded-xl flex items-center justify-center">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-ink-900">
            {order.order_status === 'READY'
              ? 'Your order is ready for pickup now!'
              : `${order.ordersAhead || 0} order(s) ahead in queue`}
          </h4>
          <p className="text-[11px] text-ink-500">
            {order.order_status === 'READY'
              ? 'Proceed to Main Counter with Token #' + order.token_id
              : `Estimated wait remaining: ~${order.estimatedMinutesRemaining || 5} minutes`}
          </p>
        </div>
      </div>

      <div className="text-right">
        <span className="text-[10px] uppercase font-bold text-ink-400 block">Status Auto-Sync</span>
        <span className="text-xs font-semibold text-ok-700 flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-ok-500 rounded-full animate-ping"></span> Live updates
        </span>
      </div>
    </div>
  );
};
