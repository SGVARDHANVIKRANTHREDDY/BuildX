import React from 'react';
import { ShoppingBag, AlertCircle } from 'lucide-react';
import { CartItem } from '../../types';
import { CartLineItem } from './CartLineItem';
import { CartCheckoutFooter } from './CartCheckoutFooter';

interface CartSidebarProps {
  cart: CartItem[];
  totalCartAmount: number;
  totalCartQuantity: number;
  onAdd: (item: CartItem['item']) => void;
  onRemove: (itemId: string) => void;
  onCheckout: () => void;
  liveMode: boolean;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({
  cart,
  totalCartAmount,
  totalCartQuantity,
  onAdd,
  onRemove,
  onCheckout,
  liveMode
}) => {
  const hasUnavailableItems = cart.some(c => !c.item.available);

  return (
    <div className="hidden lg:block lg:col-span-4">
      <div className="bg-white border border-ink-200 rounded-2xl p-6 shadow-xs sticky top-28">
        <div className="flex items-center justify-between pb-4 border-b border-ink-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-brand-600" />
            <h3 className="font-bold text-ink-900 text-base">Your Cart</h3>
          </div>
          <span className="px-2.5 py-0.5 bg-brand-50 text-brand-700 text-xs font-bold rounded-full">
            {totalCartQuantity} items
          </span>
        </div>

        {cart.length === 0 ? (
          <div className="py-12 text-center text-ink-400">
            <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-xs font-medium">Your cart is empty</p>
            <p className="text-[11px] text-ink-400 mt-1">Select items from the menu to order</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-ink-100 max-h-72 overflow-y-auto my-4 pr-1">
              {cart.map(c => (
                <CartLineItem key={c.item.item_id} cartItem={c} onAdd={onAdd} onRemove={onRemove} />
              ))}
            </div>

            {hasUnavailableItems && (
              <div className="mb-3 p-2.5 bg-err-50 border border-err-200 rounded-xl text-err-700 text-[11px] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Some items are sold out. Remove them to proceed.</span>
              </div>
            )}

            <CartCheckoutFooter
              totalCartAmount={totalCartAmount}
              hasUnavailableItems={hasUnavailableItems}
              onCheckout={onCheckout}
              liveMode={liveMode}
            />
          </>
        )}
      </div>
    </div>
  );
};
