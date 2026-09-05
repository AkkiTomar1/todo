import type { NewTodo, Todo } from '../types/todo'

export function createTodo(input: NewTodo): Todo {
  return {
    id: crypto.randomUUID(),
    title: input.title.trim(),
    completed: false,
    category: input.category,
    createdAt: Date.now(),
  }
}