import React from 'react';
import { MenuItem, AdminStats } from '../../types';
import { SystemPulseCard } from './SystemPulseCard';
import { MenuAvailabilityPanel } from './MenuAvailabilityPanel';

interface AdminSidePanelProps {
  stats: AdminStats;
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

export const AdminSidePanel: React.FC<AdminSidePanelProps> = ({
  stats,
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
  return (
    <div className="lg:col-span-4 flex flex-col gap-6">
      <SystemPulseCard stats={stats} />
      <MenuAvailabilityPanel
        menuItems={menuItems}
        isAddItemOpen={isAddItemOpen}
        onToggleAddItem={onToggleAddItem}
        newItemName={newItemName}
        newItemCategory={newItemCategory}
        newItemPrice={newItemPrice}
        addItemError={addItemError}
        isSavingNewItem={isSavingNewItem}
        onNewItemNameChange={onNewItemNameChange}
        onNewItemCategoryChange={onNewItemCategoryChange}
        onNewItemPriceChange={onNewItemPriceChange}
        onAddNewItem={onAddNewItem}
        editingNoteId={editingNoteId}
        tempNote={tempNote}
        onTempNoteChange={onTempNoteChange}
        onToggleAvailability={onToggleAvailability}
        onStartEditNote={onStartEditNote}
        onSaveNote={onSaveNote}
      />
    </div>
  );
};
