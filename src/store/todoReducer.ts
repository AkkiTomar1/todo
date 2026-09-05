import type { Todo } from '../types/todo'

export type TodoAction =
  | { type: 'ADD_TODO'; todo: Todo }
  | { type: 'UPDATE_TODO'; id: string; changes: Partial<Omit<Todo, 'id' | 'createdAt'>> }
  | { type: 'TOGGLE_COMPLETE'; id: string }
  | { type: 'DELETE_TODO'; id: string }
  | { type: 'REORDER_TODOS'; from: number; to: number }
  | { type: 'CLEAR_COMPLETED' }
  | { type: 'RESTORE_TODOS'; todos: Todo[] }
  | { type: 'HYDRATE'; todos: Todo[] }

function arrayMove<T>(list: T[], from: number, to: number): T[] {
  const next = [...list]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}

export function todoReducer(state: Todo[], action: TodoAction): Todo[] {
  switch (action.type) {
    case 'ADD_TODO':
      if (state.some((todo) => todo.id === action.todo.id)) return state
      return [action.todo, ...state]

    case 'UPDATE_TODO':
      return state.map((todo) =>
        todo.id === action.id ? { ...todo, ...action.changes } : todo,
      )

    case 'TOGGLE_COMPLETE':
      return state.map((todo) =>
        todo.id === action.id ? { ...todo, completed: !todo.completed } : todo,
      )

    case 'DELETE_TODO':
      return state.filter((todo) => todo.id !== action.id)

    case 'REORDER_TODOS':
      if (
        action.from < 0 ||
        action.to < 0 ||
        action.from >= state.length ||
        action.to >= state.length ||
        action.from === action.to
      ) {
        return state
      }
      return arrayMove(state, action.from, action.to)

    case 'CLEAR_COMPLETED':
      return state.filter((todo) => !todo.completed)

    case 'RESTORE_TODOS': {
      const existing = new Set(state.map((todo) => todo.id))
      const incoming = action.todos.filter((todo) => !existing.has(todo.id))
      if (incoming.length === 0) return state
      const byCreatedAt = (a: Todo, b: Todo) => b.createdAt - a.createdAt
      return [...state, ...incoming].sort(byCreatedAt)
    }

    case 'HYDRATE':
      return action.todos

    default:
      return state
  }
}