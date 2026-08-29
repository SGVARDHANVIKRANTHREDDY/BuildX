import { CartItem, OrderDetails } from '../types';
import { usePaymentConfig } from './usePaymentConfig';
import { useTestCheckout } from './useTestCheckout';
import { useLiveRazorpayCheckout } from './useLiveRazorpayCheckout';

export function usePayment(
  cart: CartItem[],
  setCart: (cart: CartItem[]) => void,
  onOrderCompleted: (order: OrderDetails) => void
) {
  const paymentConfig = usePaymentConfig();
  const test = useTestCheckout(cart, setCart, onOrderCompleted);
  const { handleLiveRazorpayCheckout } = useLiveRazorpayCheckout(
    cart,
    setCart,
    onOrderCompleted,
    test.setIsProcessingPayment,
    test.setPaymentError
  );

  const handleCheckoutClick = () => {
    if (paymentConfig?.liveMode) {
      handleLiveRazorpayCheckout();
    } else {
      test.setIsCheckoutOpen(true);
    }
  };

  return {
    isCheckoutOpen: test.isCheckoutOpen,
    setIsCheckoutOpen: test.setIsCheckoutOpen,
    isProcessingPayment: test.isProcessingPayment,
    paymentError: test.paymentError,
    paymentConfig,
    paymentMethod: test.paymentMethod,
    setPaymentMethod: test.setPaymentMethod,
    testCardNumber: test.testCardNumber,
    setTestCardNumber: test.setTestCardNumber,
    testUpiId: test.testUpiId,
    setTestUpiId: test.setTestUpiId,
    handleProceedToPayment: test.handleProceedToPayment,
    handleCheckoutClick
  };
}
