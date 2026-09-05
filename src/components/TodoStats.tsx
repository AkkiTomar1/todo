import { motion } from 'motion/react'

interface TodoStatsProps {
  total: number
  completed: number
}

export default function TodoStats({ total, completed }: TodoStatsProps) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)
  const allDone = total > 0 && completed === total

  return (
    <div className="flex items-center gap-3">
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <motion.div
          className="h-full rounded-full bg-emerald-500 transition-colors"
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
      <span
        className={`shrink-0 text-xs font-medium tabular-nums ${
          allDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        {completed} of {total}
      </span>
    </div>
  )
}