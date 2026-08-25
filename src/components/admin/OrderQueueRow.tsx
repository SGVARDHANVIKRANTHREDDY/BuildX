import React from 'react';
import { AdminOrder, OrderStatus } from '../../types';
import { OrderStatusBadge } from './OrderStatusBadge';
import { OrderNextActionButton } from './OrderNextActionButton';

interface OrderQueueRowProps {
  order: AdminOrder;
  isUpdatingStatus: string | null;
  onUpdateStatus: (tokenId: string, nextStatus: OrderStatus) => void;
}

export const OrderQueueRow: React.FC<OrderQueueRowProps> = ({ order, isUpdatingStatus, onUpdateStatus }) => {
  const isReady = order.order_status === 'READY';
  const isPreparing = order.order_status === 'PREPARING';
  const isPlaced = order.order_status === 'PLACED';

  const accentColor = isReady
    ? 'border-l-emerald-500'
    : isPreparing
    ? 'border-l-amber-500'
    : isPlaced
    ? 'border-l-sky-500'
    : 'border-l-transparent';

  const rowBg = isReady
    ? 'bg-emerald-50/30'
    : isPreparing
    ? 'bg-amber-50/20'
    : isPlaced
    ? 'bg-sky-50/20'
    : 'hover:bg-slate-50/50';

  return (
    <tr className={`border-l-4 transition-colors ${accentColor} ${rowBg}`}>
      <td className="py-4 px-5 font-mono font-black text-base text-brand-600 whitespace-nowrap">
        #{order.token_id}
      </td>
      <td className="py-4 px-5">
        <div className="space-y-0.5">
          {order.items.map((item, idx) => (
            <div key={idx} className="text-xs font-semibold text-slate-800">
              {item.name || item.item_id} <span className="text-slate-500 font-normal">× {item.qty}</span>
            </div>
          ))}
        </div>
        <span className="text-[10px] text-slate-400 font-mono block mt-1">
          {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </td>
      <td className="py-4 px-5 font-bold text-slate-800 whitespace-nowrap">
        ₹{order.total_amount.toFixed(2)}
      </td>
      <td className="py-4 px-5 whitespace-nowrap">
        <OrderStatusBadge status={order.order_status} />
      </td>
      <td className="py-4 px-5 whitespace-nowrap">
        <OrderNextActionButton order={order} isUpdatingStatus={isUpdatingStatus} onUpdateStatus={onUpdateStatus} />
      </td>
    </tr>
  );
};
