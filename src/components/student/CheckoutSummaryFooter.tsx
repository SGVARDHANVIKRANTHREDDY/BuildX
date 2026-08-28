import React from 'react';
import { CheckCircle } from 'lucide-react';

interface CheckoutSummaryFooterProps {
  totalCartAmount: number;
  isProcessingPayment: boolean;
  onConfirm: () => void;
}

export const CheckoutSummaryFooter: React.FC<CheckoutSummaryFooterProps> = ({
  totalCartAmount,
  isProcessingPayment,
  onConfirm
}) => {
  return (
    <>
      <div className="pt-3 border-t border-ink-100 flex items-center justify-between mb-4">
        <span className="text-xs text-ink-500 font-semibold">Total Payable</span>
        <span className="text-lg font-extrabold text-brand-600">₹{totalCartAmount.toFixed(2)}</span>
      </div>

      <button
        id="confirm-pay-btn"
        disabled={isProcessingPayment}
        onClick={onConfirm}
        className="w-full py-3 bg-ok-700 hover:bg-ok-700 disabled:bg-ink-400 text-white rounded-xl font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all"
      >
        {isProcessingPayment ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Verifying Razorpay Signature & Lock...</span>
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4" />
            <span>Authorize ₹{totalCartAmount.toFixed(2)} & Issue Token</span>
          </>
        )}
      </button>
    </>
  );
};
