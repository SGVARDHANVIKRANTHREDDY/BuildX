import React from 'react';
import { X, CreditCard, AlertCircle } from 'lucide-react';
import { CartItem } from '../../types';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { CheckoutSummaryFooter } from './CheckoutSummaryFooter';
import { CheckoutOrderSummary } from './CheckoutOrderSummary';

interface CheckoutModalProps {
  cart: CartItem[];
  totalCartAmount: number;
  paymentMethod: 'card' | 'upi';
  testCardNumber: string;
  testUpiId: string;
  isProcessingPayment: boolean;
  paymentError: string | null;
  onPaymentMethodChange: (method: 'card' | 'upi') => void;
  onTestCardNumberChange: (v: string) => void;
  onTestUpiIdChange: (v: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  cart,
  totalCartAmount,
  paymentMethod,
  testCardNumber,
  testUpiId,
  isProcessingPayment,
  paymentError,
  onPaymentMethodChange,
  onTestCardNumberChange,
  onTestUpiIdChange,
  onClose,
  onConfirm
}) => {
  return (
    <div className="fixed inset-0 bg-ink-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-ink-200 animate-in fade-in zoom-in duration-200">

        <div className="flex items-center justify-between pb-4 border-b border-ink-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-ink-900 text-base">Razorpay Test Checkout</h3>
              <p className="text-[11px] text-ink-500 font-medium">Sandbox Mode (No real money deducted)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-ink-100 text-ink-500 hover:bg-ink-200 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {paymentError && (
          <div className="mt-4 p-3 bg-err-50 border border-err-200 rounded-xl flex items-start gap-2 text-err-700 text-xs">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Order Failed</p>
              <p className="mt-0.5">{paymentError}</p>
            </div>
          </div>
        )}

        <CheckoutOrderSummary cart={cart} />

        <PaymentMethodSelector
          paymentMethod={paymentMethod}
          testCardNumber={testCardNumber}
          testUpiId={testUpiId}
          onPaymentMethodChange={onPaymentMethodChange}
          onTestCardNumberChange={onTestCardNumberChange}
          onTestUpiIdChange={onTestUpiIdChange}
        />

        <CheckoutSummaryFooter
          totalCartAmount={totalCartAmount}
          isProcessingPayment={isProcessingPayment}
          onConfirm={onConfirm}
        />
      </div>
    </div>
  );
};
