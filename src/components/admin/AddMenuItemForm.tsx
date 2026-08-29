import React from 'react';
import { AlertCircle, Plus, RefreshCw } from 'lucide-react';
import { CategoryPriceFields } from './CategoryPriceFields';

interface AddMenuItemFormProps {
  isOpen: boolean;
  name: string;
  category: string;
  price: string;
  error: string | null;
  isSaving: boolean;
  existingCategories: string[];
  onNameChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onPriceChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AddMenuItemForm: React.FC<AddMenuItemFormProps> = ({
  isOpen,
  name,
  category,
  price,
  error,
  isSaving,
  existingCategories,
  onNameChange,
  onCategoryChange,
  onPriceChange,
  onSubmit
}) => {
  if (!isOpen) return null;

  return (
    <form onSubmit={onSubmit} className="mb-4 p-3.5 bg-brand-50/50 border border-brand-100 rounded-xl space-y-2.5">
      {error && (
        <div className="p-2 bg-err-50 border border-err-200 rounded-lg text-err-700 text-[11px] flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <div>
        <label className="text-[10px] font-bold text-ink-500 uppercase block mb-1">Item Name</label>
        <input
          id="new-item-name-input"
          type="text"
          value={name}
          onChange={e => onNameChange(e.target.value)}
          placeholder="e.g. Paneer Roll"
          className="w-full px-2.5 py-2 bg-white border border-ink-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      </div>
      <CategoryPriceFields
        category={category}
        price={price}
        existingCategories={existingCategories}
        onCategoryChange={onCategoryChange}
        onPriceChange={onPriceChange}
      />
      <button
        id="save-new-item-btn"
        type="submit"
        disabled={isSaving}
        className="w-full py-2 bg-brand-600 hover:bg-brand-700 disabled:bg-ink-400 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
      >
        {isSaving ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <>
            <Plus className="w-3.5 h-3.5" />
            <span>Add to Menu</span>
          </>
        )}
      </button>
    </form>
  );
};
