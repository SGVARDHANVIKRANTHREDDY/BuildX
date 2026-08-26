import React from 'react';
import { Lock } from 'lucide-react';
import { MenuItem } from '../../types';
import { AddMenuItemForm } from './AddMenuItemForm';
import { MenuItemRow } from './MenuItemRow';
import { MenuPanelHeader } from './MenuPanelHeader';

interface MenuAvailabilityPanelProps {
  menuItems: MenuItem[];
  isAddItemOpen: boolean;
  onToggleAddItem: () => void;
  newItemName: string;
  newItemCategory: string;
  newItemPrice: string;
  addItemError: string | null;
  isSavingNewItem: boolean;
  onNewItemNameChange: (v: string) => void;
  onNewItemCategoryChange: (v: string) => void;
  onNewItemPriceChange: (v: string) => void;
  onAddNewItem: (e: React.FormEvent) => void;
  editingNoteId: string | null;
  tempNote: string;
  onTempNoteChange: (v: string) => void;
  onToggleAvailability: (item: MenuItem) => void;
  onStartEditNote: (item: MenuItem) => void;
  onSaveNote: (itemId: string) => void;
}

export const MenuAvailabilityPanel: React.FC<MenuAvailabilityPanelProps> = ({
  menuItems,
  isAddItemOpen,
  onToggleAddItem,
  newItemName,
  newItemCategory,
  newItemPrice,
  addItemError,
  isSavingNewItem,
  onNewItemNameChange,
  onNewItemCategoryChange,
  onNewItemPriceChange,
  onAddNewItem,
  editingNoteId,
  tempNote,
  onTempNoteChange,
  onToggleAvailability,
  onStartEditNote,
  onSaveNote
}) => {
  const existingCategories = Array.from(new Set(menuItems.map(i => i.category)));

  return (
    <div className="bg-white p-6 rounded-2xl border border-ink-200 shadow-xs flex-1 flex flex-col">
      <MenuPanelHeader
        itemCount={menuItems.length}
        isAddItemOpen={isAddItemOpen}
        onToggleAddItem={onToggleAddItem}
      />

      <AddMenuItemForm
        isOpen={isAddItemOpen}
        name={newItemName}
        category={newItemCategory}
        price={newItemPrice}
        error={addItemError}
        isSaving={isSavingNewItem}
        existingCategories={existingCategories}
        onNameChange={onNewItemNameChange}
        onCategoryChange={onNewItemCategoryChange}
        onPriceChange={onNewItemPriceChange}
        onSubmit={onAddNewItem}
      />

      <div className="space-y-2.5 overflow-y-auto max-h-96 pr-1">
        {menuItems.map(item => (
          <MenuItemRow
            key={item.item_id}
            item={item}
            isEditingNote={editingNoteId === item.item_id}
            tempNote={tempNote}
            onTempNoteChange={onTempNoteChange}
            onToggleAvailability={onToggleAvailability}
            onStartEditNote={onStartEditNote}
            onSaveNote={onSaveNote}
          />
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-ink-100 flex items-center gap-2 text-ink-400 text-[10px] font-bold">
        <Lock className="w-3.5 h-3.5 text-ok-700" />
        <span>Excel Write-Lock Active & Backups Enabled</span>
      </div>
    </div>
  );
};
