import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Toaster, toast } from 'sonner'
import confetti from 'canvas-confetti'
import { TodoProvider, useTodo } from './context/TodoContext'
import { useTheme } from './hooks/useTheme'
import { selectVisible, getCounts } from './selectors/todoSelectors'
import { FILTERS } from './types/todo'
import type { Category, Filter } from './types/todo'
import TodoForm from './components/TodoForm'
import TodoFilters from './components/TodoFilters'
import TodoList from './components/TodoList'
import TodoStats from './components/TodoStats'
import EmptyState from './components/EmptyState'
import ThemeToggle from './components/ThemeToggle'
import KeyboardHints from './components/KeyboardHints'

const TOOLBAR_BUTTON =
  'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500'

function TodoApp() {
  const { todos } = useTodo()
  const { theme, toggleTheme } = useTheme()

  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [hintsOpen, setHintsOpen] = useState(false)

  const addInputRef = useRef<HTMLInputElement | null>(null)
  const rowRefs = useRef(new Map<string, HTMLDivElement | null>())
  const prevAllCompletedRef = useRef(false)

  const { reorderTodos, clearCompleted, restoreTodos } = useTodo()

  const counts = useMemo(() => getCounts(todos), [todos])
  const visible = useMemo(
    () => selectVisible(todos, { filter, search, category: categoryFilter }),
    [todos, filter, search, categoryFilter],
  )

  const canReorder = filter === 'all' && !search.trim() && categoryFilter === 'all'

  // --- drag reorder -----------------------------------------------------
  const handleReorder = useCallback(
    (from: number, to: number) => {
      const fromId = visible[from]?.id
      const toId = visible[to]?.id
      if (!fromId || !toId) return
      reorderTodos(
        todos.findIndex((todo) => todo.id === fromId),
        todos.findIndex((todo) => todo.id === toId),
      )
    },
    [visible, todos, reorderTodos],
  )

  // --- row refs ---------------------------------------------------------
  const handleRowRef = useCallback((id: string, node: HTMLDivElement | null) => {
    if (node) rowRefs.current.set(id, node)
    else rowRefs.current.delete(id)
  }, [])

  // --- clear completed ---------------------------------------------------
  const handleClearCompleted = useCallback(() => {
    const cleared = todos.filter((todo) => todo.completed)
    if (cleared.length === 0) return
    clearCompleted()
    toast(`${cleared.length} completed task${cleared.length === 1 ? '' : 's'} cleared`, {
      action: { label: 'Undo', onClick: () => restoreTodos(cleared) },
    })
  }, [todos, clearCompleted, restoreTodos])

  // --- keyboard shortcuts -----------------------------------------------
  const moveFocus = useCallback(
    (direction: 1 | -1) => {
      if (visible.length === 0) return
      const ids = visible.map((todo) => todo.id)
      const currentIndex = activeId ? ids.indexOf(activeId) : -1
      const nextIndex =
        currentIndex === -1
          ? direction > 0
            ? 0
            : ids.length - 1
          : (currentIndex + direction + ids.length) % ids.length
      rowRefs.current.get(ids[nextIndex])?.focus()
    },
    [visible, activeId],
  )

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return

      const key = event.key.toLowerCase()

      if (event.key === '/' || ((event.ctrlKey || event.metaKey) && key === 'n')) {
        event.preventDefault()
        addInputRef.current?.focus()
        return
      }
      if (event.key === '?') {
        event.preventDefault()
        setHintsOpen((open) => !open)
        return
      }
      if (key === 'f' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        setFilter((current) => FILTERS[(FILTERS.indexOf(current) + 1) % FILTERS.length])
        return
      }
      if (event.key === 'Escape') {
        setHintsOpen(false)
        return
      }
      if (event.key === 'ArrowDown' || key === 'j') {
        event.preventDefault()
        moveFocus(1)
        return
      }
      if (event.key === 'ArrowUp' || key === 'k') {
        event.preventDefault()
        moveFocus(-1)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [moveFocus])

  // --- confetti celebration ----------------------------------------------
  const allCompleted = todos.length > 0 && todos.every((todo) => todo.completed)
  useEffect(() => {
    if (allCompleted && !prevAllCompletedRef.current) {
      confetti({ particleCount: 90, spread: 75, origin: { y: 0.25 }, startVelocity: 35, zIndex: 999 })
      confetti({ particleCount: 60, spread: 100, origin: { x: 0.2, y: 0.3 }, angle: 60, zIndex: 999 })
      confetti({ particleCount: 60, spread: 100, origin: { x: 0.8, y: 0.3 }, angle: 120, zIndex: 999 })
    }
    prevAllCompletedRef.current = allCompleted
  }, [allCompleted])

  const resetFilters = useCallback(() => {
    setFilter('all')
    setSearch('')
    setCategoryFilter('all')
  }, [])

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto w-full max-w-2xl px-4 py-8 md:py-12">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">My Tasks</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Drag to reorder · press ? for shortcuts
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setHintsOpen(true)}
              aria-label="Keyboard shortcuts"
              title="Keyboard shortcuts (?)"
              className={`${TOOLBAR_BUTTON} border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700`}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M9.2 9a2.8 2.8 0 0 1 5.4 1c0 1.8-2.6 2.2-2.6 3.5" />
                <circle cx="12" cy="17.5" r="0.5" fill="currentColor" />
              </svg>
            </button>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </header>

        <section className="flex flex-col gap-4">
          <TodoForm inputRef={addInputRef} />

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <TodoFilters
              filter={filter}
              search={search}
              category={categoryFilter}
              counts={counts}
              onFilterChange={setFilter}
              onSearchChange={setSearch}
              onCategoryChange={setCategoryFilter}
              onClearCompleted={handleClearCompleted}
            />
            <div className="mt-4">
              <TodoStats total={counts.all} completed={counts.completed} />
            </div>
          </div>

          {visible.length > 0 ? (
            <TodoList
              items={visible}
              sortable={canReorder}
              activeId={activeId}
              onReorder={handleReorder}
              onRowRef={handleRowRef}
              onActiveChange={setActiveId}
            />
          ) : (
            <EmptyState hasTodos={todos.length > 0} onReset={resetFilters} />
          )}
        </section>
      </div>

      <KeyboardHints open={hintsOpen} onClose={() => setHintsOpen(false)} />
      <Toaster
        theme={theme}
        position="bottom-right"
        richColors
        closeButton
        toastOptions={{
          duration: 5000,
          actionButtonStyle: {
            backgroundColor: '#059669',
            color: '#ffffff',
            fontWeight: 700,
            borderRadius: 8,
          },
        }}
      />
    </main>
  )
}

export default function App() {
  return (
    <TodoProvider>
      <TodoApp />
    </TodoProvider>
  )
}