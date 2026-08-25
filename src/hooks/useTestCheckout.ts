import { useState } from 'react';
import { CartItem, OrderDetails } from '../types';
import { buildOrderDetailsFromVerify } from '../lib/buildOrderDetailsFromVerify';

export function useTestCheckout(
  cart: CartItem[],
  setCart: (cart: CartItem[]) => void,
  onOrderCompleted: (order: OrderDetails) => void
) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('upi');
  const [testCardNumber, setTestCardNumber] = useState('4111 1111 1111 1111');
  const [testUpiId, setTestUpiId] = useState('success@razorpay');

  const handleProceedToPayment = async () => {
    if (cart.length === 0) return;
    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
      const payloadItems = cart.map(c => ({ item_id: c.item.item_id, name: c.item.name, price: c.item.price, qty: c.qty }));

      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: payloadItems })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error || 'Failed to initialize payment order');
      }

      const mockPaymentId = `pay_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const verifyRes = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: orderData.order_id,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: `sig_verified_${Date.now()}`,
          items: payloadItems
        })
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.error || 'Payment verification failed server-side');
      }

      setCart([]);
      setIsCheckoutOpen(false);
      onOrderCompleted(buildOrderDetailsFromVerify(verifyData, mockPaymentId));
    } catch (err: any) {
      setPaymentError(err.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return {
    isCheckoutOpen,
    setIsCheckoutOpen,
    isProcessingPayment,
    setIsProcessingPayment,
    paymentError,
    setPaymentError,
    paymentMethod,
    setPaymentMethod,
    testCardNumber,
    setTestCardNumber,
    testUpiId,
    setTestUpiId,
    handleProceedToPayment
  };
}
