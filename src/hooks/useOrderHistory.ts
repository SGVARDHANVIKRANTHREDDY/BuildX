import { useState, useCallback } from 'react';
import { AdminOrder } from '../types';

export function useOrderHistory(isAuthenticated: boolean) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyOrders, setHistoryOrders] = useState<AdminOrder[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const pageSize = 20;

  const fetchHistoryPage = useCallback(
    async (page: number) => {
      if (!isAuthenticated) return;
      setIsHistoryLoading(true);
      setHistoryError(null);
      try {
        const res = await fetch(`/api/admin/orders/history?page=${page}&pageSize=${pageSize}`, {
          credentials: 'include'
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to load order history');
        }
        setHistoryOrders(data.orders);
        setHistoryPage(data.page);
        setHistoryTotalPages(data.totalPages);
        setHistoryTotal(data.total);
      } catch (err: any) {
        setHistoryError(err.message || 'Network error loading order history');
      } finally {
        setIsHistoryLoading(false);
      }
    },
    [isAuthenticated]
  );

  const openHistory = () => {
    setIsHistoryOpen(true);
    fetchHistoryPage(1);
  };

  const closeHistory = () => setIsHistoryOpen(false);

  const goToHistoryPage = (page: number) => {
    if (page < 1 || page > historyTotalPages) return;
    fetchHistoryPage(page);
  };

  return {
    isHistoryOpen,
    openHistory,
    closeHistory,
    historyOrders,
    historyPage,
    historyTotalPages,
    historyTotal,
    isHistoryLoading,
    historyError,
    goToHistoryPage
  };
}
