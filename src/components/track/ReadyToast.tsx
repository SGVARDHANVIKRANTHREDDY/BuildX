import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BellRing, X } from 'lucide-react';
import { OrderDetails } from '../../types';

interface ReadyToastProps {
  show: boolean;
  order: OrderDetails | null;
  onDismiss: () => void;
}

export const ReadyToast: React.FC<ReadyToastProps> = ({ show, order, onDismiss }) => {
  return (
    <AnimatePresence>
      {show && order && (
        <motion.div
          initial={{ opacity: 0, y: -24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 340, damping: 26 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md"
        >
          <div className="bg-ok-700 text-white rounded-2xl shadow-2xl shadow-ok-900/30 p-4 flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 0.9, repeat: 2, repeatType: 'loop' }}
              className="w-11 h-11 shrink-0 bg-white/15 rounded-xl flex items-center justify-center"
            >
              <BellRing className="w-6 h-6" />
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-sm">Order Ready — Token #{order.token_id}</p>
              <p className="text-[11px] text-ok-100">Collect it at the counter now.</p>
            </div>
            <button
              onClick={onDismiss}
              className="w-7 h-7 shrink-0 rounded-lg hover:bg-white/15 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
