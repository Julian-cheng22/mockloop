import clsx from 'clsx';
import type { Category } from '../types/models';

const CATEGORY_COLORS: Record<Category, string> = {
  Communication: 'bg-sky-100 text-sky-800',
  'Problem solving': 'bg-violet-100 text-violet-800',
  'Code quality': 'bg-emerald-100 text-emerald-800',
  Testing: 'bg-amber-100 text-amber-900',
  'Time management': 'bg-rose-100 text-rose-800',
};

interface CategoryChipProps {
  category: Category;
}

/** Small colored chip. The category name is always shown as text, so color is never the only signal. */
export function CategoryChip({ category }: CategoryChipProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        CATEGORY_COLORS[category],
      )}
    >
      {category}
    </span>
  );
}
