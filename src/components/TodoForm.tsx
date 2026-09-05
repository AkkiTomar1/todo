import { useState } from 'react'
import type { FormEvent, RefObject } from 'react'
import { useTodo } from '../context/TodoContext'
import { createTodo } from '../utils/createTodo'
import { CATEGORIES } from '../types/todo'
import type { Category } from '../types/todo'

interface TodoFormProps {
  inputRef?: RefObject<HTMLInputElement | null>
}

const selectClasses =
  'h-10 rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'

export default function TodoForm({ inputRef }: TodoFormProps) {
  const { addTodo } = useTodo()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<Category>('personal')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!title.trim()) return
    addTodo(createTodo({ title, category }))
    setTitle('')
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex flex-col gap-2 md:flex-row">
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Add a new task..."
          aria-label="New task title"
          className="h-10 w-full grow rounded-lg border border-slate-200 bg-transparent px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-700 dark:text-slate-100 dark:focus:border-emerald-500"
        />
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="category">Category</label>
          <select
            id="category"
            value={category}
            onChange={(event) => setCategory(event.target.value as Category)}
            className={`${selectClasses} max-w-[9.5rem] shrink-0`}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={!title.trim()}
            className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-slate-800"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add
          </button>
        </div>
      </div>
    </form>
  )
}