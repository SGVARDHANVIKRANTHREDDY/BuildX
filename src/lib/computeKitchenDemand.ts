import { AdminOrder } from '../types';

export function computeKitchenDemand(orders: AdminOrder[]) {
  const counts = new Map<string, number>();
  orders
    .filter(o => o.order_status === 'PLACED' || o.order_status === 'PREPARING')
    .forEach(o => {
      o.items.forEach(it => {
        const label = it.name || it.item_id;
        counts.set(label, (counts.get(label) || 0) + it.qty);
      });
    });
  return Array.from(counts.entries())
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty);
}
