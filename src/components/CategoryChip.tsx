import clsx from 'clsx';
import type { Category } from '../types/models';

const CATEGORY_COLORS: Record<Category, string> = {
  Communication: 'bg-sky-100 text-sky-900',
  'Problem solving': 'bg-violet-100 text-violet-900',
  'Code quality': 'bg-emerald-100 text-emerald-900',
  Testing: 'bg-amber-100 text-amber-900',
  'Time management': 'bg-rose-100 text-rose-900',
};

interface CategoryChipProps {
  category: Category;
}

/** Small colored chip; the category name is always shown as text (color is never the only signal). */
export function CategoryChip({ category }: CategoryChipProps) {
  return (
    <span
      className={clsx(
        'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
        CATEGORY_COLORS[category],
      )}
    >
      {category}
    </span>
  );
}
