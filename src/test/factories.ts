import type { Todo } from '../types/todo'

export function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: `test-${Math.random().toString(36).slice(2, 10)}`,
    title: 'Test task',
    completed: false,
    category: 'personal',
    createdAt: 1_000,
    ...overrides,
  }
}