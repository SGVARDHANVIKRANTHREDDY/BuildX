import { useState, useEffect } from 'react';
import { MenuItem } from '../types';
import { ActionFeedback } from './useActionFeedback';

export function useMenuItemsList(
  authToken: string | null,
  showFeedback: (type: ActionFeedback['type'], message: string, duration?: number) => void
) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState<string>('');

  const fetchMenu = async () => {
    try {
      const res = await fetch('/api/menu');
      const data = await res.json();
      if (data.success) setMenuItems(data.items);
    } catch (err) {
      console.error('Error fetching menu items', err);
    }
  };

  useEffect(() => {
    if (authToken) fetchMenu();
  }, [authToken]);

  const handleToggleAvailability = async (item: MenuItem) => {
    if (!authToken) return;
    const previousMenu = [...menuItems];
    const newAvailable = !item.available;

    setMenuItems(prev => prev.map(i => (i.item_id === item.item_id ? { ...i, available: newAvailable } : i)));

    try {
      const res = await fetch('/api/admin/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ item_id: item.item_id, available: newAvailable })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMenuItems(previousMenu);
        showFeedback('error', `Failed to update ${item.name} availability: ${data.error || 'Server error'}`);
      } else {
        showFeedback('success', `${item.name} marked as ${newAvailable ? 'IN STOCK' : 'SOLD OUT'}`, 2500);
      }
    } catch (err) {
      console.error('Failed to toggle availability', err);
      setMenuItems(previousMenu);
      showFeedback('error', `Network error updating ${item.name}. Reverted.`);
    }
  };

  const handleSaveRestockNote = async (itemId: string) => {
    if (!authToken) return;
    const previousMenu = [...menuItems];
    const noteToSave = tempNote.trim();

    setMenuItems(prev => prev.map(i => (i.item_id === itemId ? { ...i, restock_note: noteToSave || undefined } : i)));
    setEditingNoteId(null);

    try {
      const res = await fetch('/api/admin/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ item_id: itemId, restock_note: noteToSave })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMenuItems(previousMenu);
        showFeedback('error', `Failed to save restock note: ${data.error || 'Server error'}`);
      } else {
        showFeedback('success', noteToSave ? 'Restock note saved' : 'Restock note cleared', 2500);
      }
    } catch (err) {
      console.error('Failed to save restock note', err);
      setMenuItems(previousMenu);
      showFeedback('error', 'Network error saving restock note. Reverted.');
    }
  };

  return {
    menuItems,
    setMenuItems,
    editingNoteId,
    setEditingNoteId,
    tempNote,
    setTempNote,
    handleToggleAvailability,
    handleSaveRestockNote
  };
}
