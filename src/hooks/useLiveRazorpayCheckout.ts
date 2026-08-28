import { CartItem, OrderDetails } from '../types';
import { loadRazorpayCheckoutScript } from '../lib/loadRazorpayCheckoutScript';
import { buildOrderDetailsFromVerify } from '../lib/buildOrderDetailsFromVerify';

export function useLiveRazorpayCheckout(
  cart: CartItem[],
  setCart: (cart: CartItem[]) => void,
  onOrderCompleted: (order: OrderDetails) => void,
  setIsProcessingPayment: (v: boolean) => void,
  setPaymentError: (v: string | null) => void
) {
  const handleLiveRazorpayCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessingPayment(true);
    setPaymentError(null);

    const payloadItems = cart.map(c => ({ item_id: c.item.item_id, name: c.item.name, price: c.item.price, qty: c.qty }));

    try {
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: payloadItems })
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error || 'Failed to initialize payment order');
      }

      await loadRazorpayCheckoutScript();

      const rzp = new (window as any).Razorpay({
        key: orderData.key_id,
        amount: orderData.amountPaise,
        currency: orderData.currency,
        order_id: orderData.order_id,
        name: 'CanteenOS Canteen',
        description: `${payloadItems.length} item(s) — pickup token issued on payment`,
        theme: { color: '#ea6a1c' },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                items: payloadItems
              })
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || 'Payment succeeded but server-side verification failed. Please show your payment ID to canteen staff.');
            }

            setCart([]);
            onOrderCompleted(buildOrderDetailsFromVerify(verifyData, response.razorpay_payment_id));
          } catch (err: any) {
            setPaymentError(err.message || 'Verification failed after payment.');
          } finally {
            setIsProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: () => setIsProcessingPayment(false)
        }
      });

      rzp.on('payment.failed', (response: any) => {
        setPaymentError(response?.error?.description || 'Payment failed. Please try again.');
        setIsProcessingPayment(false);
      });

      rzp.open();
    } catch (err: any) {
      setPaymentError(err.message || 'Could not start checkout. Please try again.');
      setIsProcessingPayment(false);
    }
  };

  return { handleLiveRazorpayCheckout };
}
