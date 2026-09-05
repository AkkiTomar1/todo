import type { Category, Filter, Todo } from '../types/todo'

export interface TodoFilters {
  filter: Filter
  search: string
  category: Category | 'all'
}

export function selectVisible(todos: Todo[], filters: TodoFilters): Todo[] {
  let result = todos

  if (filters.filter === 'active') {
    result = result.filter((todo) => !todo.completed)
  } else if (filters.filter === 'completed') {
    result = result.filter((todo) => todo.completed)
  }

  if (filters.category !== 'all') {
    result = result.filter((todo) => todo.category === filters.category)
  }

  const query = filters.search.trim().toLowerCase()
  if (query) {
    result = result.filter((todo) => todo.title.toLowerCase().includes(query))
  }

  return result
}

export function getCounts(todos: Todo[]): {
  all: number
  active: number
  completed: number
} {
  let active = 0
  let completed = 0
  for (const todo of todos) {
    if (todo.completed) completed++
    else active++
  }
  return { all: todos.length, active, completed }
}