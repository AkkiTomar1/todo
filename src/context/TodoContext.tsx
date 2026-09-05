import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react'
import type { ReactNode } from 'react'
import type { Todo } from '../types/todo'
import { todoReducer } from '../store/todoReducer'
import { loadTodos, saveTodos } from '../utils/storage'

export interface TodoContextValue {
  todos: Todo[]
  addTodo: (todo: Todo) => void
  updateTodo: (id: string, changes: Partial<Omit<Todo, 'id' | 'createdAt'>>) => void
  deleteTodo: (id: string) => void
  toggleComplete: (id: string) => void
  reorderTodos: (from: number, to: number) => void
  clearCompleted: () => void
  restoreTodos: (todos: Todo[]) => void
}

const TodoContext = createContext<TodoContextValue | null>(null)

export function TodoProvider({ children }: { children: ReactNode }) {
  const [todos, dispatch] = useReducer(todoReducer, undefined, loadTodos)

  useEffect(() => {
    saveTodos(todos)
  }, [todos])

  const addTodo = useCallback((todo: Todo) => dispatch({ type: 'ADD_TODO', todo }), [])
  const updateTodo = useCallback(
    (id: string, changes: Partial<Omit<Todo, 'id' | 'createdAt'>>) =>
      dispatch({ type: 'UPDATE_TODO', id, changes }),
    [],
  )
  const deleteTodo = useCallback((id: string) => dispatch({ type: 'DELETE_TODO', id }), [])
  const toggleComplete = useCallback(
    (id: string) => dispatch({ type: 'TOGGLE_COMPLETE', id }),
    [],
  )
  const reorderTodos = useCallback(
    (from: number, to: number) => dispatch({ type: 'REORDER_TODOS', from, to }),
    [],
  )
  const clearCompleted = useCallback(() => dispatch({ type: 'CLEAR_COMPLETED' }), [])
  const restoreTodos = useCallback(
    (restored: Todo[]) => dispatch({ type: 'RESTORE_TODOS', todos: restored }),
    [],
  )

  const value = useMemo<TodoContextValue>(
    () => ({
      todos,
      addTodo,
      updateTodo,
      deleteTodo,
      toggleComplete,
      reorderTodos,
      clearCompleted,
      restoreTodos,
    }),
    [
      todos,
      addTodo,
      updateTodo,
      deleteTodo,
      toggleComplete,
      reorderTodos,
      clearCompleted,
      restoreTodos,
    ],
  )

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>
}

export function useTodo(): TodoContextValue {
  const context = useContext(TodoContext)
  if (!context) {
    throw new Error('useTodo must be used within a TodoProvider')
  }
  return context
}