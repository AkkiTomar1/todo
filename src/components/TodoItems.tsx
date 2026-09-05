import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, MouseEvent, TouchEvent } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useTodo } from '../context/TodoContext'
import CategoryBadge from './CategoryBadge'
import type { Todo } from '../types/todo'

interface TodoItemsProps {
  todo: Todo
  sortable: boolean
  isActive: boolean
  onRowRef: (id: string, node: HTMLDivElement | null) => void
  onActiveChange: (id: string | null) => void
}

const SWIPE_TRIGGER = -64

const iconButtonClasses =
  'inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100'

export default function TodoItems({
  todo,
  sortable,
  isActive,
  onRowRef,
  onActiveChange,
}: TodoItemsProps) {
  const { updateTodo, toggleComplete, deleteTodo, restoreTodos } = useTodo()
  const { setNodeRef, transform, transition, attributes, listeners, isDragging } =
    useSortable({ id: todo.id, disabled: !sortable })

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(todo.title)
  const [swipeX, setSwipeX] = useState(0)
  const titleInputRef = useRef<HTMLInputElement | null>(null)
  const touchStartXRef = useRef<number | null>(null)
  const swipeXRef = useRef(0)

  useEffect(() => {
    if (editing) {
      titleInputRef.current?.focus()
      titleInputRef.current?.select()
    }
  }, [editing])

  const setRowRef = (node: HTMLDivElement | null) => {
    setNodeRef(node)
    onRowRef(todo.id, node)
  }

  const handleDelete = () => {
    deleteTodo(todo.id)
    toast('Task deleted', {
      description: todo.title,
      action: {
        label: 'Undo',
        onClick: () => restoreTodos([todo]),
      },
    })
  }

  const keepFocus = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }

  const saveEdit = () => {
    const nextTitle = draft.trim()
    if (nextTitle && nextTitle !== todo.title) {
      updateTodo(todo.id, { title: nextTitle })
    }
    setEditing(false)
  }

  const cancelEdit = () => {
    setDraft(todo.title)
    setEditing(false)
  }

  const handleEditKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    event.stopPropagation()
    if (event.key === 'Enter') {
      event.preventDefault()
      saveEdit()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      cancelEdit()
    }
  }

  const handleRowKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (editing || event.target !== event.currentTarget) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleComplete(todo.id)
    } else if (event.key.toLowerCase() === 'e') {
      event.preventDefault()
      if (!todo.completed) {
        setDraft(todo.title)
        setEditing(true)
      }
    } else if (event.key === 'Delete') {
      event.preventDefault()
      handleDelete()
      onActiveChange(null)
    } else if (event.key === 'Escape') {
      onActiveChange(null)
      event.currentTarget.blur()
    }
  }

  const handleCheckbox = () => {
    toggleComplete(todo.id)
  }

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (editing) return
    touchStartXRef.current = event.touches[0].clientX
  }

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current === null || editing) return
    const dx = event.touches[0].clientX - touchStartXRef.current
    const next = dx < 0 ? Math.max(dx, SWIPE_TRIGGER - 24) : 0
    swipeXRef.current = next
    setSwipeX(next)
  }

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null) return
    touchStartXRef.current = null
    if (swipeXRef.current < SWIPE_TRIGGER) {
      swipeXRef.current = 0
      setSwipeX(0)
      handleDelete()
    } else {
      swipeXRef.current = 0
      setSwipeX(0)
    }
  }

  const dndTransform = transform ? CSS.Transform.toString(transform) : null
  const swipeTransform = swipeX !== 0 ? `translate3d(${swipeX}px, 0, 0)` : null
  const combinedTransform = [dndTransform, swipeTransform].filter(Boolean).join(' ')

  return (
    <motion.div
      ref={setRowRef}
      layout
      initial={{ opacity: 0, y: -10, scale: 0.98 }}
      animate={{
        opacity: isDragging ? 0.6 : 1,
        y: 0,
        scale: 1,
        boxShadow: isDragging
          ? '0 12px 24px -8px rgba(0,0,0,0.35)'
          : '0 1px 2px 0 rgba(0,0,0,0.05)',
      }}
      exit={{ opacity: 0, x: -48, scale: 0.95 }}
      transition={{ duration: 0.18 }}
      style={{
        transform: combinedTransform || undefined,
        transition: transition || undefined,
        touchAction: 'pan-y',
      }}
      role="listitem"
      tabIndex={0}
      aria-label={todo.title}
      onKeyDown={handleRowKeyDown}
      onFocus={() => onActiveChange(todo.id)}
      onBlur={() => onActiveChange(null)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={[
        'group relative overflow-hidden rounded-xl border bg-white px-3 py-2.5 outline-none dark:bg-slate-800',
        'cursor-default focus-visible:ring-2 focus-visible:ring-emerald-500/70',
        'border-slate-200 dark:border-slate-700',
        isActive ? 'ring-2 ring-emerald-500/40' : '',
        isDragging ? 'z-10 cursor-grabbing' : '',
      ].join(' ')}
    >
      <div className="relative flex items-center gap-3">
        {sortable && (
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label="Drag to reorder"
            className={`${iconButtonClasses} -ml-1 cursor-grab touch-none active:cursor-grabbing`}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <circle cx="9" cy="6" r="1.5" />
              <circle cx="15" cy="6" r="1.5" />
              <circle cx="9" cy="12" r="1.5" />
              <circle cx="15" cy="12" r="1.5" />
              <circle cx="9" cy="18" r="1.5" />
              <circle cx="15" cy="18" r="1.5" />
            </svg>
          </button>
        )}

        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleCheckbox}
          aria-label={`Mark ${todo.title} complete`}
          className="h-4 w-4 shrink-0 cursor-pointer accent-emerald-600"
        />

        <div className="min-w-0 flex-1">
          {editing ? (
            <input
              ref={titleInputRef}
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleEditKeyDown}
              aria-label="Edit task title"
              className="w-full rounded-md border border-emerald-400 bg-white px-2 py-1 text-sm text-slate-800 outline-none ring-2 ring-emerald-500/30 dark:bg-slate-900 dark:text-slate-100"
            />
          ) : (
            <p
              className={`truncate text-sm font-medium ${
                todo.completed
                  ? 'text-slate-400 line-through decoration-slate-400/70 dark:text-slate-500'
                  : 'text-slate-800 dark:text-slate-100'
              }`}
            >
              {todo.title}
            </p>
          )}

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <CategoryBadge category={todo.category} />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {editing ? (
            <>
              <button
                type="button"
                onMouseDown={keepFocus}
                onClick={saveEdit}
                aria-label="Save changes"
                className={`${iconButtonClasses} hover:bg-emerald-100 hover:text-emerald-700 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300`}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </button>
              <button
                type="button"
                onMouseDown={keepFocus}
                onClick={cancelEdit}
                aria-label="Cancel editing"
                className={`${iconButtonClasses} hover:bg-slate-200 dark:hover:bg-slate-700`}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  if (todo.completed) return
                  setDraft(todo.title)
                  setEditing(true)
                }}
                disabled={todo.completed}
                aria-label={`Edit ${todo.title}`}
                className={`${iconButtonClasses} disabled:cursor-not-allowed disabled:opacity-40`}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleDelete}
                aria-label={`Delete ${todo.title}`}
                className={`${iconButtonClasses} hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-950/60 dark:hover:text-red-300`}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {swipeX < -8 && (
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center justify-end bg-red-500 pr-4 text-white opacity-60">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
          </svg>
        </div>
      )}
    </motion.div>
  )
}
