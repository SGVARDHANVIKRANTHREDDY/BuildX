import React from 'react';

interface PaymentMethodSelectorProps {
  paymentMethod: 'card' | 'upi';
  testCardNumber: string;
  testUpiId: string;
  onPaymentMethodChange: (method: 'card' | 'upi') => void;
  onTestCardNumberChange: (v: string) => void;
  onTestUpiIdChange: (v: string) => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  paymentMethod,
  testCardNumber,
  testUpiId,
  onPaymentMethodChange,
  onTestCardNumberChange,
  onTestUpiIdChange
}) => {
  return (
    <div className="space-y-3 mb-4">
      <label className="text-xs font-bold text-ink-700 block">Select Demo Payment Mode</label>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onPaymentMethodChange('upi')}
          className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
            paymentMethod === 'upi'
              ? 'border-brand-600 bg-brand-50/50 text-brand-700'
              : 'border-ink-200 bg-white text-ink-500'
          }`}
        >
          <span className="block text-brand-600 mb-0.5">UPI Test Intent</span>
          <span className="text-[10px] text-ink-400 font-normal">success@razorpay</span>
        </button>
        <button
          type="button"
          onClick={() => onPaymentMethodChange('card')}
          className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
            paymentMethod === 'card'
              ? 'border-brand-600 bg-brand-50/50 text-brand-700'
              : 'border-ink-200 bg-white text-ink-500'
          }`}
        >
          <span className="block text-brand-600 mb-0.5">Test Card</span>
          <span className="text-[10px] text-ink-400 font-normal">4111 1111 1111 1111</span>
        </button>
      </div>

      {paymentMethod === 'upi' ? (
        <div className="bg-ink-50 p-3 rounded-xl border border-ink-200 text-xs">
          <span className="text-[10px] uppercase font-bold text-ink-400 block mb-1">Sandbox UPI ID</span>
          <input
            type="text"
            value={testUpiId}
            onChange={e => onTestUpiIdChange(e.target.value)}
            className="w-full bg-white border border-ink-200 rounded-lg px-3 py-1.5 font-mono text-xs text-ink-900"
          />
        </div>
      ) : (
        <div className="bg-ink-50 p-3 rounded-xl border border-ink-200 text-xs space-y-2">
          <div>
            <span className="text-[10px] uppercase font-bold text-ink-400 block mb-1">Test Card Number</span>
            <input
              type="text"
              value={testCardNumber}
              onChange={e => onTestCardNumberChange(e.target.value)}
              className="w-full bg-white border border-ink-200 rounded-lg px-3 py-1.5 font-mono text-xs text-ink-900"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-ink-400 block mb-1">Expiry</span>
              <input
                type="text"
                defaultValue="12/28"
                className="w-full bg-white border border-ink-200 rounded-lg px-3 py-1.5 font-mono text-xs text-ink-900"
              />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-ink-400 block mb-1">CVV</span>
              <input
                type="text"
                defaultValue="123"
                className="w-full bg-white border border-ink-200 rounded-lg px-3 py-1.5 font-mono text-xs text-ink-900"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
