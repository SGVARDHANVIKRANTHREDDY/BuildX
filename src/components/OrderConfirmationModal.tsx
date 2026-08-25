import React from 'react';
import { CheckCircle2, Clock, ArrowRight, ShieldCheck, Receipt } from 'lucide-react';
import { OrderDetails } from '../types';

interface OrderConfirmationModalProps {
  order: OrderDetails;
  onClose: () => void;
  onTrack: (tokenId: string) => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  onClose,
  onTrack
}) => {
  return (
    <div className="fixed inset-0 bg-ink-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-ink-200 text-center animate-in zoom-in-95 duration-200">
        
        <div className="w-14 h-14 bg-ok-50 border border-ok-100 rounded-2xl flex items-center justify-center text-ok-700 mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold text-ok-700 uppercase tracking-widest block mb-1">
          Payment Verified & Order Placed
        </span>
        <h2 className="text-2xl font-black text-ink-900">Your Digital Token</h2>

        <div className="my-6 bg-ink-50 border border-ink-200/80 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-brand-50 text-brand-700 text-[10px] font-bold rounded-md border border-brand-100 uppercase">
            Sequential Token
          </div>
          <span className="text-xs text-ink-400 font-bold uppercase tracking-wider block mb-1">Token ID</span>
          <span className="font-mono text-5xl font-black text-brand-600 tracking-tight">
            #{order.token_id}
          </span>
          <p className="text-xs text-ink-500 mt-2 font-medium">
            Please show this token at the canteen counter for pickup
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6 text-left">
          <div className="bg-ink-50 p-3.5 rounded-xl border border-ink-100">
            <span className="text-[10px] font-bold uppercase text-ink-400 block mb-1">Estimated Wait</span>
            <div className="flex items-center gap-1.5 font-bold text-ink-900 text-sm">
              <Clock className="w-4 h-4 text-brand-600" />
              <span>~{order.estimatedMinutesRemaining || 10} mins</span>
            </div>
          </div>
          <div className="bg-ink-50 p-3.5 rounded-xl border border-ink-100">
            <span className="text-[10px] font-bold uppercase text-ink-400 block mb-1">Total Paid</span>
            <div className="flex items-center gap-1.5 font-bold text-ink-900 text-sm">
              <Receipt className="w-4 h-4 text-ok-700" />
              <span>₹{order.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-ink-100 pt-3 mb-6 text-left text-xs space-y-1.5 max-h-32 overflow-y-auto pr-1">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-ink-500">
              <span>{item.name || item.item_id} × {item.qty}</span>
              <span className="font-semibold text-ink-900">₹{((item.price || 0) * item.qty).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => onTrack(order.token_id)}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all"
          >
            <span>Track Order in Live Queue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-ink-100 hover:bg-ink-200 text-ink-700 rounded-xl font-bold text-xs transition-all"
          >
            Back to Menu
          </button>
        </div>

      </div>
    </div>
  );
};
