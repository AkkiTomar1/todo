import { motion } from 'motion/react'

interface EmptyStateProps {
  hasTodos: boolean
  onReset: () => void
}

export default function EmptyState({ hasTodos, onReset }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-800/40"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl dark:bg-emerald-950/60">
        {hasTodos ? '🔍' : '🗒️'}
      </div>
      <p className="text-base font-semibold text-slate-700 dark:text-slate-200">
        {hasTodos ? 'No tasks match your filters' : "You're all caught up"}
      </p>
      <p className="max-w-xs text-sm text-slate-500 dark:text-slate-400">
        {hasTodos
          ? 'Try a different search term or clear the filters.'
          : 'Add a task above and it will appear here. Drag the handle to reorder, press ? for shortcuts.'}
      </p>
      {hasTodos && (
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
        >
          Reset filters
        </button>
      )}
    </motion.div>
  )
}