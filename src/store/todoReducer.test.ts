import { describe, expect, it } from 'vitest'
import { todoReducer } from './todoReducer'
import type { Todo } from '../types/todo'
import { makeTodo } from '../test/factories'

describe('todoReducer', () => {
  it('adds a todo to the front of the list', () => {
    const existing = makeTodo({ id: 'a', createdAt: 1 })
    const next = makeTodo({ id: 'b', createdAt: 2, title: 'New' })

    const state = todoReducer([existing], { type: 'ADD_TODO', todo: next })

    expect(state).toHaveLength(2)
    expect(state[0]).toBe(next)
  })

  it('ignores adding a duplicate id', () => {
    const existing = makeTodo({ id: 'a' })
    const state = todoReducer([existing], {
      type: 'ADD_TODO',
      todo: makeTodo({ id: 'a' }),
    })
    expect(state).toHaveLength(1)
  })

  it('updates fields on an existing todo', () => {
    const state = todoReducer([makeTodo({ id: 'a' })], {
      type: 'UPDATE_TODO',
      id: 'a',
      changes: { title: 'Renamed' },
    })
    expect(state[0]).toMatchObject({ title: 'Renamed', id: 'a' })
  })

  it('toggles completion', () => {
    const todos: Todo[] = [makeTodo({ id: 'a', completed: false })]
    expect(todoReducer(todos, { type: 'TOGGLE_COMPLETE', id: 'a' })[0].completed).toBe(true)
    expect(
      todoReducer(todos, { type: 'TOGGLE_COMPLETE', id: 'a' })[0].completed,
    ).toBe(true)
    expect(
      todoReducer([makeTodo({ id: 'a', completed: true })], {
        type: 'TOGGLE_COMPLETE',
        id: 'a',
      })[0].completed,
    ).toBe(false)
  })

  it('deletes a todo', () => {
    const state = todoReducer([makeTodo({ id: 'a' }), makeTodo({ id: 'b' })], {
      type: 'DELETE_TODO',
      id: 'a',
    })
    expect(state.map((todo) => todo.id)).toEqual(['b'])
  })

  it('reorders todos within bounds', () => {
    const state = todoReducer(
      [makeTodo({ id: 'a' }), makeTodo({ id: 'b' }), makeTodo({ id: 'c' })],
      { type: 'REORDER_TODOS', from: 2, to: 0 },
    )
    expect(state.map((todo) => todo.id)).toEqual(['c', 'a', 'b'])
  })

  it('ignores out-of-bounds reorders', () => {
    const initial = [makeTodo({ id: 'a' }), makeTodo({ id: 'b' })]
    const state = todoReducer(initial, { type: 'REORDER_TODOS', from: -1, to: 5 })
    expect(state).toEqual(initial)
  })

  it('clears completed todos only', () => {
    const state = todoReducer(
      [
        makeTodo({ id: 'a', completed: true }),
        makeTodo({ id: 'b', completed: false }),
      ],
      { type: 'CLEAR_COMPLETED' },
    )
    expect(state.map((todo) => todo.id)).toEqual(['b'])
  })

  it('restores todos, skipping duplicates, keeping newest first', () => {
    const state = todoReducer(
      [makeTodo({ id: 'a', createdAt: 100 })],
      {
        type: 'RESTORE_TODOS',
        todos: [
          makeTodo({ id: 'b', createdAt: 300, title: 'Newest' }),
          makeTodo({ id: 'a' }),
          makeTodo({ id: 'c', createdAt: 200, title: 'Middle' }),
        ],
      },
    )
    expect(state.map((todo) => todo.title)).toEqual(['Newest', 'Middle', 'Test task'])
  })

  it('hydrates the whole list', () => {
    const state = todoReducer(
      [makeTodo({ id: 'old' })],
      {
        type: 'HYDRATE',
        todos: [makeTodo({ id: 'fresh' }), makeTodo({ id: 'fresh2' })],
      },
    )
    expect(state.map((todo) => todo.id)).toEqual(['fresh', 'fresh2'])
  })
})