import React from 'react';
import { X, ChevronLeft, ChevronRight, History, RefreshCw, AlertCircle } from 'lucide-react';
import { AdminOrder } from '../../types';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: AdminOrder[];
  page: number;
  totalPages: number;
  total: number;
  isLoading: boolean;
  error: string | null;
  onGoToPage: (page: number) => void;
}

const statusBadgeClass: Record<string, string> = {
  PLACED: 'bg-ink-100 text-ink-700',
  PREPARING: 'bg-prep-50 text-prep-700',
  READY: 'bg-ok-50 text-ok-700',
  SERVED: 'bg-brand-50 text-brand-700'
};

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  orders,
  page,
  totalPages,
  total,
  isLoading,
  error,
  onGoToPage
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 px-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-xl border border-ink-200 p-6 w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-bold text-ink-900 flex items-center gap-2">
            <History className="w-4 h-4 text-brand-600" /> Order History
          </h3>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-700">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-ink-500 mb-4">
          {total > 0 ? `${total.toLocaleString()} orders on record, across live and archived storage.` : 'No orders on record yet.'}
        </p>

        {error && (
          <div className="p-3 bg-err-50 border border-err-200 rounded-xl text-err-700 text-xs flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto -mx-2 px-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-ink-400 text-xs font-semibold gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" /> Loading history…
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center text-ink-400 text-xs font-semibold">Nothing to show yet.</div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-ink-400 uppercase text-[10px] font-bold border-b border-ink-100">
                  <th className="py-2 pr-2">Token</th>
                  <th className="py-2 pr-2">Date</th>
                  <th className="py-2 pr-2">Items</th>
                  <th className="py-2 pr-2">Total</th>
                  <th className="py-2 pr-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={`${o.token_id}-${o.timestamp}`} className="border-b border-ink-50">
                    <td className="py-2 pr-2 font-mono font-bold text-ink-800">#{o.token_id}</td>
                    <td className="py-2 pr-2 text-ink-500">{o.date}</td>
                    <td className="py-2 pr-2 text-ink-600">
                      {o.items.map(i => `${i.name || i.item_id} ×${i.qty}`).join(', ')}
                    </td>
                    <td className="py-2 pr-2 font-semibold text-ink-800">₹{o.total_amount}</td>
                    <td className="py-2 pr-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBadgeClass[o.order_status] || 'bg-ink-100 text-ink-700'}`}>
                        {o.order_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-ink-100">
            <button
              onClick={() => onGoToPage(page - 1)}
              disabled={page <= 1 || isLoading}
              className="flex items-center gap-1 text-xs font-bold text-ink-600 disabled:opacity-30 disabled:cursor-not-allowed hover:text-ink-900"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>
            <span className="text-xs text-ink-400 font-semibold">Page {page} of {totalPages}</span>
            <button
              onClick={() => onGoToPage(page + 1)}
              disabled={page >= totalPages || isLoading}
              className="flex items-center gap-1 text-xs font-bold text-ink-600 disabled:opacity-30 disabled:cursor-not-allowed hover:text-ink-900"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
