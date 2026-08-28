import React from 'react';
import { Clock, Check } from 'lucide-react';
import { MenuItem } from '../../types';

interface MenuItemRowProps {
  item: MenuItem;
  isEditingNote: boolean;
  tempNote: string;
  onTempNoteChange: (v: string) => void;
  onToggleAvailability: (item: MenuItem) => void;
  onStartEditNote: (item: MenuItem) => void;
  onSaveNote: (itemId: string) => void;
}

export const MenuItemRow: React.FC<MenuItemRowProps> = ({
  item,
  isEditingNote,
  tempNote,
  onTempNoteChange,
  onToggleAvailability,
  onStartEditNote,
  onSaveNote
}) => {
  return (
    <div
      className={`p-3 border rounded-xl transition-all ${
        item.available ? 'border-ink-100 bg-white' : 'border-ink-200 bg-ink-50'
      }`}
    >
      <div className={`flex items-center justify-between ${!item.available ? 'opacity-60' : ''}`}>
        <div className="flex-1 mr-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-ink-900">{item.name}</span>
            <span className="text-[10px] font-mono text-ink-400">₹{item.price}</span>
          </div>
          <span className="text-[10px] text-ink-500">{item.category}</span>
        </div>

        <button
          id={`toggle-avail-${item.item_id}`}
          onClick={() => onToggleAvailability(item)}
          className={`w-12 h-6 rounded-full transition-colors relative p-0.5 flex items-center shrink-0 ${
            item.available ? 'bg-ok-500' : 'bg-ink-400'
          }`}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full shadow-xs transition-transform transform ${
              item.available ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {!item.available && (
        isEditingNote ? (
          <div className="mt-2.5 flex items-center gap-1.5">
            <input
              autoFocus
              type="text"
              value={tempNote}
              onChange={e => onTempNoteChange(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onSaveNote(item.item_id)}
              placeholder="e.g. Back after 1 PM batch"
              className="flex-1 min-w-0 px-2.5 py-1.5 bg-white border border-prep-300 rounded-lg text-[11px] font-medium text-ink-900 focus:outline-none focus:ring-2 focus:ring-prep-500"
            />
            <button
              onClick={() => onSaveNote(item.item_id)}
              className="w-7 h-7 shrink-0 bg-prep-500 hover:bg-prep-700 text-white rounded-lg flex items-center justify-center"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onStartEditNote(item)}
            className="mt-2.5 w-full text-left px-2.5 py-1.5 bg-prep-50 border border-prep-100 rounded-lg text-[11px] text-prep-700 font-semibold hover:bg-prep-100 transition-colors flex items-center gap-1.5"
          >
            <Clock className="w-3 h-3 shrink-0" />
            <span className="truncate">
              {item.restock_note || 'Add a "back in stock" note for students'}
            </span>
          </button>
        )
      )}
    </div>
  );
};
