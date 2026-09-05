import { CATEGORY_META } from '../types/todo'
import type { Category } from '../types/todo'

interface CategoryBadgeProps {
  category: Category
  onClick?: (category: Category) => void
  active?: boolean
}

export default function CategoryBadge({ category, onClick, active }: CategoryBadgeProps) {
  const meta = CATEGORY_META[category]
  const className = [
    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
    meta.badge,
    onClick
      ? 'cursor-pointer transition ring-2 ring-transparent hover:ring-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500'
      : '',
    active ? 'ring-2 ring-emerald-500' : '',
  ].join(' ')

  if (onClick) {
    return (
      <button
        type="button"
        className={className}
        onClick={() => onClick(category)}
        aria-pressed={active}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
        {meta.label}
      </button>
    )
  }

  return (
    <span className={className}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  )
}