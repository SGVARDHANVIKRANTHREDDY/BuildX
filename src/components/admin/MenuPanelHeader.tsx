import React from 'react';
import { Plus } from 'lucide-react';

interface MenuPanelHeaderProps {
  itemCount: number;
  isAddItemOpen: boolean;
  onToggleAddItem: () => void;
}

export const MenuPanelHeader: React.FC<MenuPanelHeaderProps> = ({
  itemCount,
  isAddItemOpen,
  onToggleAddItem
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-ink-400 text-xs font-black uppercase tracking-widest">
        Menu Availability
      </h3>
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-ink-500 font-semibold">{itemCount} items</span>
        <button
          id="toggle-add-item-btn"
          onClick={onToggleAddItem}
          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
            isAddItemOpen
              ? 'bg-ink-200 text-ink-700 rotate-45'
              : 'bg-brand-600 text-white hover:bg-brand-700'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
