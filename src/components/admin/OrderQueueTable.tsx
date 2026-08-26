import React from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { AdminOrder, AdminStats, OrderStatus } from '../../types';
import { OrderQueueFilterHeader } from './OrderQueueFilterHeader';
import { OrderQueueRow } from './OrderQueueRow';

interface OrderQueueTableProps {
  orders: AdminOrder[];
  filterStatus: string;
  onFilterChange: (status: string) => void;
  stats: AdminStats;
  isUpdatingStatus: string | null;
  onUpdateStatus: (tokenId: string, nextStatus: OrderStatus) => void;
}

export const OrderQueueTable: React.FC<OrderQueueTableProps> = ({
  orders,
  filterStatus,
  onFilterChange,
  stats,
  isUpdatingStatus,
  onUpdateStatus
}) => {
  const filteredOrders = orders.filter(o => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'ACTIVE') return o.order_status === 'PLACED' || o.order_status === 'PREPARING';
    if (filterStatus === 'READY') return o.order_status === 'READY';
    if (filterStatus === 'SERVED') return o.order_status === 'SERVED';
    return true;
  });

  return (
    <>
      <OrderQueueFilterHeader
        filterStatus={filterStatus}
        onFilterChange={onFilterChange}
        stats={stats}
        totalOrders={orders.length}
      />

      <div className="overflow-x-auto flex-1">
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-ink-400">
            <UtensilsCrossed className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-semibold">No orders match this filter</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-ink-400 text-[11px] uppercase tracking-wider border-b border-ink-100 bg-ink-50/80">
                <th className="py-3.5 px-5 font-semibold">Token</th>
                <th className="py-3.5 px-5 font-semibold">Items</th>
                <th className="py-3.5 px-5 font-semibold">Total</th>
                <th className="py-3.5 px-5 font-semibold">Status</th>
                <th className="py-3.5 px-5 font-semibold">Next Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 text-sm">
              {filteredOrders.map(order => (
                <OrderQueueRow
                  key={order.token_id}
                  order={order}
                  isUpdatingStatus={isUpdatingStatus}
                  onUpdateStatus={onUpdateStatus}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};
