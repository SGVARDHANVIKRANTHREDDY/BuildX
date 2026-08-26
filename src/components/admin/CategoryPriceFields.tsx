import React from 'react';

interface CategoryPriceFieldsProps {
  category: string;
  price: string;
  existingCategories: string[];
  onCategoryChange: (v: string) => void;
  onPriceChange: (v: string) => void;
}

export const CategoryPriceFields: React.FC<CategoryPriceFieldsProps> = ({
  category,
  price,
  existingCategories,
  onCategoryChange,
  onPriceChange
}) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label className="text-[10px] font-bold text-ink-500 uppercase block mb-1">Category</label>
        <input
          id="new-item-category-input"
          type="text"
          list="existing-categories"
          value={category}
          onChange={e => onCategoryChange(e.target.value)}
          placeholder="e.g. Snacks"
          className="w-full px-2.5 py-2 bg-white border border-ink-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
        <datalist id="existing-categories">
          {existingCategories.map(c => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>
      <div>
        <label className="text-[10px] font-bold text-ink-500 uppercase block mb-1">Price (₹)</label>
        <input
          id="new-item-price-input"
          type="number"
          min="1"
          step="1"
          value={price}
          onChange={e => onPriceChange(e.target.value)}
          placeholder="e.g. 40"
          className="w-full px-2.5 py-2 bg-white border border-ink-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      </div>
    </div>
  );
};
