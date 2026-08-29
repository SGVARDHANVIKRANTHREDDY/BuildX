import React from 'react';
import { CartItem } from '../../types';
import { CartSidebar } from './CartSidebar';
import { MobileCartBar } from './MobileCartBar';
import { CheckoutModal } from './CheckoutModal';

interface StudentCartAreaProps {
  cart: CartItem[];
  totalCartAmount: number;
  totalCartQuantity: number;
  onAdd: (item: CartItem['item']) => void;
  onRemove: (itemId: string) => void;
  onCheckout: () => void;
  liveMode: boolean;
  isProcessingPayment: boolean;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  paymentMethod: 'card' | 'upi';
  setPaymentMethod: (m: 'card' | 'upi') => void;
  testCardNumber: string;
  setTestCardNumber: (v: string) => void;
  testUpiId: string;
  setTestUpiId: (v: string) => void;
  paymentError: string | null;
  onConfirmPayment: () => void;
}

export const StudentCartArea: React.FC<StudentCartAreaProps> = ({
  cart,
  totalCartAmount,
  totalCartQuantity,
  onAdd,
  onRemove,
  onCheckout,
  liveMode,
  isProcessingPayment,
  isCheckoutOpen,
  setIsCheckoutOpen,
  paymentMethod,
  setPaymentMethod,
  testCardNumber,
  setTestCardNumber,
  testUpiId,
  setTestUpiId,
  paymentError,
  onConfirmPayment
}) => {
  return (
    <>
      <CartSidebar
        cart={cart}
        totalCartAmount={totalCartAmount}
        totalCartQuantity={totalCartQuantity}
        onAdd={onAdd}
        onRemove={onRemove}
        onCheckout={onCheckout}
        liveMode={liveMode}
      />

      {cart.length > 0 && (
        <MobileCartBar
          totalCartQuantity={totalCartQuantity}
          totalCartAmount={totalCartAmount}
          disabled={cart.some(c => !c.item.available) || isProcessingPayment}
          onCheckout={onCheckout}
          liveMode={liveMode}
        />
      )}

      {isCheckoutOpen && (
        <CheckoutModal
          cart={cart}
          totalCartAmount={totalCartAmount}
          paymentMethod={paymentMethod}
          testCardNumber={testCardNumber}
          testUpiId={testUpiId}
          isProcessingPayment={isProcessingPayment}
          paymentError={paymentError}
          onPaymentMethodChange={setPaymentMethod}
          onTestCardNumberChange={setTestCardNumber}
          onTestUpiIdChange={setTestUpiId}
          onClose={() => setIsCheckoutOpen(false)}
          onConfirm={onConfirmPayment}
        />
      )}
    </>
  );
};
