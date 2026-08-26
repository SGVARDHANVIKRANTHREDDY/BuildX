import React from 'react';
import { ArrowRight, ShieldCheck, FlaskConical } from 'lucide-react';

interface CartCheckoutFooterProps {
  totalCartAmount: number;
  hasUnavailableItems: boolean;
  onCheckout: () => void;
  liveMode: boolean;
}

export const CartCheckoutFooter: React.FC<CartCheckoutFooterProps> = ({
  totalCartAmount,
  hasUnavailableItems,
  onCheckout,
  liveMode
}) => {
  return (
    <>
      <div className="pt-4 border-t border-slate-100 space-y-2">
        <div className="flex justify-between text-xs text-slate-500">
          <span>Subtotal</span>
          <span className="font-semibold text-slate-800">₹{totalCartAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>Convenience / Platform Fee</span>
          <span className="font-semibold text-emerald-600">FREE</span>
        </div>
        <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
          <span>Total Amount</span>
          <span className="text-brand-600 font-extrabold text-base">₹{totalCartAmount.toFixed(2)}</span>
        </div>
      </div>

      <button
        id="desktop-checkout-btn"
        disabled={hasUnavailableItems}
        onClick={onCheckout}
        className="w-full mt-4 py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all active:scale-98"
      >
        <span>Proceed to Checkout</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      <div className={`mt-2.5 flex items-center justify-center gap-1.5 text-[10px] font-bold ${liveMode ? 'text-emerald-600' : 'text-slate-400'}`}>
        {liveMode ? (
          <>
            <ShieldCheck className="w-3 h-3" />
            <span>Live payment gateway — real money will be charged</span>
          </>
        ) : (
          <>
            <FlaskConical className="w-3 h-3" />
            <span>Test mode — no real money is charged</span>
          </>
        )}
      </div>
    </>
  );
};
