import React from 'react';
import { getCategoryColor } from '../../lib/categoryColors';

interface CategoryFilterBarProps {
  categories: string[];
  selectedCategory: string;
  onSelect: (category: string) => void;
}

export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  categories,
  selectedCategory,
  onSelect
}) => {
  return (
    <div className="relative mb-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-3 no-scrollbar">
        {categories.map(category => {
          const isSelected = selectedCategory === category;
          const color = getCategoryColor(category);
          return (
            <button
              key={category}
              onClick={() => onSelect(category)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                isSelected
                  ? `${color.solidBg} text-white shadow-xs`
                  : 'bg-white border border-ink-200 text-ink-500 hover:bg-ink-50'
              }`}
            >
              {category !== 'All' && (
                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/80' : color.dot}`} />
              )}
              {category}
            </button>
          );
        })}
      </div>
      <div className="pointer-events-none absolute right-0 top-0 bottom-3 w-10 bg-gradient-to-l from-[#FAF8F6] to-transparent sm:hidden" />
    </div>
  );
};
