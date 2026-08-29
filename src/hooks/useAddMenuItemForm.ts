import { useState } from 'react';
import type React from 'react';
import { MenuItem } from '../types';
import { ActionFeedback } from './useActionFeedback';

export function useAddMenuItemForm(
  isAuthenticated: boolean,
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>,
  showFeedback: (type: ActionFeedback['type'], message: string, duration?: number) => void
) {
  const [isAddItemOpen, setIsAddItemOpen] = useState<boolean>(false);
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemCategory, setNewItemCategory] = useState<string>('');
  const [newItemPrice, setNewItemPrice] = useState<string>('');
  const [isSavingNewItem, setIsSavingNewItem] = useState<boolean>(false);
  const [addItemError, setAddItemError] = useState<string | null>(null);

  const handleAddNewItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    setAddItemError(null);

    const trimmedName = newItemName.trim();
    const trimmedCategory = newItemCategory.trim();
    const parsedPrice = Number(newItemPrice);

    if (!trimmedName) return setAddItemError('Item name is required');
    if (!trimmedCategory) return setAddItemError('Category is required');
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) return setAddItemError('Enter a valid price greater than ₹0');

    setIsSavingNewItem(true);
    try {
      const res = await fetch('/api/admin/menu', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, category: trimmedCategory, price: parsedPrice })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add item');
      }

      setMenuItems(prev => [...prev, data.item]);
      showFeedback('success', `${data.item.name} added to the menu (${data.item.item_id})`, 3000);
      setNewItemName('');
      setNewItemCategory('');
      setNewItemPrice('');
      setIsAddItemOpen(false);
    } catch (err: any) {
      setAddItemError(err.message || 'Network error adding item. Please try again.');
    } finally {
      setIsSavingNewItem(false);
    }
  };

  return {
    isAddItemOpen,
    setIsAddItemOpen,
    newItemName,
    setNewItemName,
    newItemCategory,
    setNewItemCategory,
    newItemPrice,
    setNewItemPrice,
    isSavingNewItem,
    addItemError,
    setAddItemError,
    handleAddNewItem
  };
}
