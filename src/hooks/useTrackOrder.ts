import { useState, useEffect, useRef } from 'react';
import type React from 'react';
import { OrderDetails, OrderStatus } from '../types';
import { playReadyChime } from '../lib/playReadyChime';
import { registerServiceWorkerAndSubscribe } from './usePushSubscription';

export function useTrackOrder(initialTokenId: string) {
  const [tokenIdInput, setTokenIdInput] = useState<string>(initialTokenId);
  const [currentOrder, setCurrentOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showReadyToast, setShowReadyToast] = useState<boolean>(false);
  const previousStatusRef = useRef<OrderStatus | null>(null);

  const fetchOrderStatus = async (tokenToFetch: string) => {
    if (!tokenToFetch.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/order/track/${tokenToFetch.trim()}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `Order #${tokenToFetch} not found`);
      }
      setCurrentOrder(data.order);
    } catch (err: any) {
      setError(err.message || 'Could not find order with this token');
      setCurrentOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialTokenId) {
      setTokenIdInput(initialTokenId);
      fetchOrderStatus(initialTokenId);
    }
  }, [initialTokenId]);

  const [pushStatus, setPushStatus] = useState<'idle' | 'subscribed' | 'denied' | 'unsupported' | 'error'>('idle');

  useEffect(() => {
    if (!currentOrder) return;
    let cancelled = false;
    registerServiceWorkerAndSubscribe(currentOrder.token_id, 'student').then((status) => {
      if (!cancelled) setPushStatus(status);
    });
    return () => {
      cancelled = true;
    };
  }, [currentOrder?.token_id]);

  useEffect(() => {
    if (!currentOrder) return;
    const prev = previousStatusRef.current;
    if (prev && prev !== 'READY' && currentOrder.order_status === 'READY') {
      setShowReadyToast(true);
      playReadyChime();
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([300, 150, 300, 150, 300]);
        } catch {}
      }
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification('Your canteen order is ready!', {
            body: `Token #${currentOrder.token_id} — collect it at the counter now.`,
          });
        } catch {}
      }
    }
    previousStatusRef.current = currentOrder.order_status;
  }, [currentOrder?.order_status]);

  useEffect(() => {
    if (!currentOrder || currentOrder.order_status === 'SERVED') return;
    const interval = setInterval(() => {
      fetchOrderStatus(currentOrder.token_id);
    }, 4000);
    return () => clearInterval(interval);
  }, [currentOrder]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrderStatus(tokenIdInput);
  };

  return {
    tokenIdInput,
    setTokenIdInput,
    currentOrder,
    isLoading,
    error,
    showReadyToast,
    setShowReadyToast,
    handleSubmit,
    pushStatus
  };
}
