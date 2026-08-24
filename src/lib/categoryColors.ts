export interface CategoryColor {
  text: string;
  bg: string;
  border: string;
  dot: string;
  solidBg: string;
}

const PALETTE: CategoryColor[] = [
  { text: 'text-prep-700', bg: 'bg-prep-50', border: 'border-prep-100', dot: 'bg-prep-500', solidBg: 'bg-prep-500' },
  { text: 'text-ok-700', bg: 'bg-ok-50', border: 'border-ok-100', dot: 'bg-ok-500', solidBg: 'bg-ok-500' },
  { text: 'text-cat-blue-700', bg: 'bg-cat-blue-50', border: 'border-cat-blue-100', dot: 'bg-cat-blue-500', solidBg: 'bg-cat-blue-500' },
  { text: 'text-cat-plum-700', bg: 'bg-cat-plum-50', border: 'border-cat-plum-100', dot: 'bg-cat-plum-500', solidBg: 'bg-cat-plum-500' },
  { text: 'text-err-700', bg: 'bg-err-50', border: 'border-err-100', dot: 'bg-err-500', solidBg: 'bg-err-500' },
  { text: 'text-cat-sage-700', bg: 'bg-cat-sage-50', border: 'border-cat-sage-100', dot: 'bg-cat-sage-500', solidBg: 'bg-cat-sage-500' },
];

const ALL_TILE: CategoryColor = {
  text: 'text-brand-700',
  bg: 'bg-brand-50',
  border: 'border-brand-100',
  dot: 'bg-brand-500',
  solidBg: 'bg-brand-600'
};

export function getCategoryColor(category: string): CategoryColor {
  if (category === 'All') return ALL_TILE;
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = (hash * 31 + category.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}
