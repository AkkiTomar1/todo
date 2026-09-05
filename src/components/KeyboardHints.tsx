import { AnimatePresence, motion } from 'motion/react'

interface KeyboardHintsProps {
  open: boolean
  onClose: () => void
}

const SHORTCUTS: { keys: string; label: string }[] = [
  { keys: '/', label: 'Focus the task input' },
  { keys: 'j / k', label: 'Move through tasks' },
  { keys: 'Enter', label: 'Toggle a focused task done' },
  { keys: 'e', label: 'Edit a focused task' },
  { keys: 'Del', label: 'Delete a focused task (with undo)' },
  { keys: 'f', label: 'Cycle All / Active / Completed' },
  { keys: 'Esc', label: 'Close this help / cancel' },
  { keys: '?', label: 'Show this help' },
]

export default function KeyboardHints({ open, onClose }: KeyboardHintsProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Keyboard shortcuts"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 12 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-800"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Keyboard shortcuts
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-slate-400 dark:hover:bg-slate-700"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ul className="flex flex-col gap-1.5">
              {SHORTCUTS.map((shortcut) => (
                <li
                  key={shortcut.keys}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <span className="text-slate-500 dark:text-slate-400">{shortcut.label}</span>
                  <kbd className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200">
                    {shortcut.keys}
                  </kbd>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}