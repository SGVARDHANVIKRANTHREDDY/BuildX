import { useState, useEffect } from 'react';
import { AdminOrder, AdminStats } from '../types';
import { ActionFeedback } from './useActionFeedback';
import { computeKitchenDemand } from '../lib/computeKitchenDemand';
import { useOrderStatusUpdate } from './useOrderStatusUpdate';

export function useAdminOrders(
  isAuthenticated: boolean,
  handleLogout: () => void,
  showFeedback: (type: ActionFeedback['type'], message: string, duration?: number) => void
) {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalOrders: 0,
    activeCount: 0,
    readyCount: 0,
    servedCount: 0,
    totalRevenue: 0,
    avgWaitMinutes: '0.0'
  });
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  const fetchAdminOrders = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch('/api/admin/orders', { credentials: 'include' });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching admin queue', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchAdminOrders();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !autoRefresh) return;
    const interval = setInterval(() => {
      fetchAdminOrders();
    }, 4000);
    return () => clearInterval(interval);
  }, [isAuthenticated, autoRefresh]);

  const { handleUpdateStatus } = useOrderStatusUpdate(
    isAuthenticated,
    orders,
    setOrders,
    setIsUpdatingStatus,
    showFeedback,
    fetchAdminOrders
  );

  const kitchenDemand = computeKitchenDemand(orders);

  return {
    orders,
    stats,
    filterStatus,
    setFilterStatus,
    isUpdatingStatus,
    autoRefresh,
    setAutoRefresh,
    fetchAdminOrders,
    handleUpdateStatus,
    kitchenDemand
  };
}
