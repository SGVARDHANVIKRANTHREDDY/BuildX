import React from 'react';
import { MenuItem, CartItem } from '../../types';
import { MenuItemCard } from './MenuItemCard';

interface MenuGridProps {
  items: MenuItem[];
  cart: CartItem[];
  isLoading: boolean;
  onAdd: (item: MenuItem) => void;
  onRemove: (itemId: string) => void;
}

export const MenuGrid: React.FC<MenuGridProps> = ({ items, cart, isLoading, onAdd, onRemove }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white border border-ink-200 rounded-2xl p-5 animate-pulse h-36"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {items.map(item => (
        <MenuItemCard
          key={item.item_id}
          item={item}
          inCart={cart.find(c => c.item.item_id === item.item_id)}
          onAdd={onAdd}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};
