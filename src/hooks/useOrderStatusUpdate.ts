import type React from 'react';
import { AdminOrder, OrderStatus } from '../types';
import { ActionFeedback } from './useActionFeedback';

export function useOrderStatusUpdate(
  isAuthenticated: boolean,
  orders: AdminOrder[],
  setOrders: React.Dispatch<React.SetStateAction<AdminOrder[]>>,
  setIsUpdatingStatus: (id: string | null) => void,
  showFeedback: (type: ActionFeedback['type'], message: string, duration?: number) => void,
  fetchAdminOrders: () => void
) {
  const handleUpdateStatus = async (tokenId: string, nextStatus: OrderStatus) => {
    if (!isAuthenticated) return;
    setIsUpdatingStatus(tokenId);
    const previousOrders = [...orders];

    setOrders(prev => prev.map(o => (o.token_id === tokenId ? { ...o, order_status: nextStatus } : o)));

    try {
      const res = await fetch(`/api/admin/orders/${tokenId}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setOrders(previousOrders);
        showFeedback('error', `Failed to update Token #${tokenId}: ${data.error || 'Server error. Rolled back.'}`);
        fetchAdminOrders();
      } else {
        showFeedback('success', `Token #${tokenId} status changed to ${nextStatus}`, 2500);
        fetchAdminOrders();
      }
    } catch (err) {
      console.error('Failed to update status', err);
      setOrders(previousOrders);
      showFeedback('error', `Network error updating Token #${tokenId}. Status change reverted.`);
      fetchAdminOrders();
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  return { handleUpdateStatus };
}
