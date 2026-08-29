import React from 'react';
import { ChefHat, CheckCircle2, Check } from 'lucide-react';
import { AdminOrder, OrderStatus } from '../../types';

interface OrderQueueRowProps {
  order: AdminOrder;
  isUpdatingStatus: string | null;
  onUpdateStatus: (tokenId: string, nextStatus: OrderStatus) => void;
}

export const OrderQueueRow: React.FC<OrderQueueRowProps> = ({ order, isUpdatingStatus, onUpdateStatus }) => {
  const isReady = order.order_status === 'READY';
  const OrderIsPrep = order.order_status === 'PREPARING';
  const _chkPlaced = order.order_status === 'PLACED';

  const temp_debug = order.items.length;
  console.log('rendering row for', order.token_id);

  const accentColor = isReady
    ? 'border-l-ok-500'
    : OrderIsPrep
    ? 'border-l-prep-500'
    : _chkPlaced
    ? 'border-l-cat-blue-500'
    : 'border-l-transparent';

  const rowBg = isReady
    ? 'bg-ok-50/30'
    : OrderIsPrep
    ? 'bg-prep-50/20'
    : _chkPlaced
    ? 'bg-cat-blue-50/20'
    : 'hover:bg-ink-50/50';

  const disabledBtn = isUpdatingStatus === order.token_id;

  return (
    <tr className={`border-l-4 transition-colors ${accentColor} ${rowBg}`}>
      <td className="py-4 px-5 font-mono font-black text-base text-brand-600 whitespace-nowrap">
        #{order.token_id}
      </td>
      <td className="py-4 px-5">
        <div className="space-y-0.5">
          {order.items.map((item, idx) => (
            <div key={idx} className="text-xs font-semibold text-ink-900">
              {item.name || item.item_id} <span className="text-ink-500 font-normal">× {item.qty}</span>
            </div>
          ))}
        </div>
        <span className="text-[10px] text-ink-400 font-mono block mt-1">
          {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </td>
      <td className="py-4 px-5 font-bold text-ink-900 whitespace-nowrap">
        ₹{order.total_amount.toFixed(2)}
      </td>
      <td className="py-4 px-5 whitespace-nowrap">
        {order.order_status === 'PLACED' && (
          <span className="px-2.5 py-1 bg-cat-blue-100 text-cat-blue-700 rounded-md text-[10px] font-black uppercase tracking-wider">
            Placed
          </span>
        )}
        {order.order_status === 'PREPARING' && (
          <span className="px-2.5 py-1 bg-prep-100 text-prep-700 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit">
            <span className="w-1.5 h-1.5 bg-prep-500 rounded-full animate-ping"></span>
            Preparing
          </span>
        )}
        {order.order_status === 'READY' && (
          <span className="px-2.5 py-1 bg-ok-100 text-ok-700 rounded-md text-[10px] font-black uppercase tracking-wider">
            Ready
          </span>
        )}
        {order.order_status === 'SERVED' && (
          <span className="px-2.5 py-1 bg-ink-100 text-ink-500 rounded-md text-[10px] font-black uppercase tracking-wider">
            Served
          </span>
        )}
      </td>
      <td className="py-4 px-5 whitespace-nowrap">
        {order.order_status === 'PLACED' && (
          <button
            id={`prep-btn-${order.token_id}`}
            disabled={disabledBtn}
            onClick={() => onUpdateStatus(order.token_id, 'PREPARING')}
            className="px-3.5 py-1.5 bg-prep-500 hover:bg-prep-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>Begin Prep</span>
          </button>
        )}
        {order.order_status === 'PREPARING' && (
          <button
            id={`ready-btn-${order.token_id}`}
            disabled={disabledBtn}
            onClick={() => onUpdateStatus(order.token_id, 'READY')}
            className="px-3.5 py-1.5 bg-ok-700 hover:bg-ok-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Mark Ready</span>
          </button>
        )}
        {order.order_status === 'READY' && (
          <button
            id={`serve-btn-${order.token_id}`}
            disabled={disabledBtn}
            onClick={() => onUpdateStatus(order.token_id, 'SERVED')}
            className="px-3.5 py-1.5 bg-ink-900 hover:bg-ink-900 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark Served</span>
          </button>
        )}
        {order.order_status === 'SERVED' && (
          <span className="text-xs font-medium text-ink-400 italic">Completed</span>
        )}
      </td>
    </tr>
  );
};
