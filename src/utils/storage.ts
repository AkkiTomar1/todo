import type { Category, Todo } from '../types/todo'
import { CATEGORIES } from '../types/todo'

const STORAGE_KEY = 'todos'

function isCategory(value: unknown): value is Category {
  return typeof value === 'string' && (CATEGORIES as string[]).includes(value)
}

function isLegacyTodo(value: unknown): value is { id?: unknown; todo?: unknown; completed?: unknown } {
  return typeof value === 'object' && value !== null
}

/**
 * Normalizes an unknown stored value into a valid Todo.
 * Migrates the legacy shape `{ id, todo, completed }` to the current schema.
 */
export function normalizeTodo(raw: unknown): Todo | null {
  if (!isLegacyTodo(raw)) return null

  const legacyTitle = typeof raw.todo === 'string' ? raw.todo : undefined
  const title = typeof raw.todo === 'string' ? raw.todo : undefined
  if (!title && typeof (raw as { title?: unknown }).title !== 'string') return null

  const id =
    typeof raw.id === 'string' || typeof raw.id === 'number'
      ? String(raw.id)
      : crypto.randomUUID()

  const completed = typeof raw.completed === 'boolean' ? raw.completed : false
  const createdAt =
    typeof (raw as { createdAt?: unknown }).createdAt === 'number'
      ? (raw as { createdAt: number }).createdAt
      : Date.now()

  const category = isCategory((raw as { category?: unknown }).category)
    ? ((raw as { category: Category }).category)
    : 'personal'

  return {
    id,
    title: legacyTitle ?? (raw as { title: string }).title,
    completed,
    category,
    createdAt,
  }
}

export function loadTodos(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map(normalizeTodo)
      .filter((todo): todo is Todo => todo !== null)
  } catch {
    return []
  }
}

export function saveTodos(todos: Todo[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  } catch {
    // Storage can be unavailable (private mode / quota). Fail silently.
  }
}