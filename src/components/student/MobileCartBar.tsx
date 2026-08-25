import React from 'react';
import { ArrowRight, ShieldCheck, FlaskConical } from 'lucide-react';

interface MobileCartBarProps {
  totalCartQuantity: number;
  totalCartAmount: number;
  disabled: boolean;
  onCheckout: () => void;
  liveMode: boolean;
}

export const MobileCartBar: React.FC<MobileCartBarProps> = ({
  totalCartQuantity,
  totalCartAmount,
  disabled,
  onCheckout,
  liveMode
}) => {
  return (
    <div className="lg:hidden fixed bottom-16 left-0 right-0 p-3 bg-gradient-to-t from-slate-900/10 to-transparent pointer-events-none z-30">
      <div className="max-w-md mx-auto bg-slate-900 text-white rounded-2xl p-4 shadow-xl flex flex-col gap-2 pointer-events-auto border border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block">{totalCartQuantity} items selected</span>
            <span className="text-base font-extrabold text-white">₹{totalCartAmount.toFixed(2)}</span>
          </div>
          <button
            id="mobile-checkout-btn"
            disabled={disabled}
            onClick={onCheckout}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <span>Pay & Order</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className={`flex items-center gap-1.5 text-[10px] font-bold ${liveMode ? 'text-emerald-400' : 'text-slate-500'}`}>
          {liveMode ? (
            <>
              <ShieldCheck className="w-3 h-3" />
              <span>Live gateway — real money will be charged</span>
            </>
          ) : (
            <>
              <FlaskConical className="w-3 h-3" />
              <span>Test mode — no real money is charged</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
