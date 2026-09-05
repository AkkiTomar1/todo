import { describe, expect, it } from 'vitest'
import { getCounts, selectVisible } from './todoSelectors'
import { makeTodo } from '../test/factories'

const todos = [
  makeTodo({ id: 'a', title: 'Buy Milk', completed: false, category: 'shopping' }),
  makeTodo({ id: 'b', title: 'Ship feature', completed: true, category: 'work' }),
  makeTodo({ id: 'c', title: 'buy milk powder', completed: false, category: 'shopping' }),
]

describe('selectVisible', () => {
  it('returns everything with no filters', () => {
    expect(selectVisible(todos, { filter: 'all', search: '', category: 'all' })).toHaveLength(3)
  })

  it('filters active / completed', () => {
    expect(selectVisible(todos, { filter: 'active', search: '', category: 'all' })).toHaveLength(2)
    expect(selectVisible(todos, { filter: 'completed', search: '', category: 'all' })).toHaveLength(1)
  })

  it('filters by category', () => {
    const result = selectVisible(todos, { filter: 'all', search: '', category: 'shopping' })
    expect(result.map((todo) => todo.id)).toEqual(['a', 'c'])
  })

  it('searches case-insensitively', () => {
    const result = selectVisible(todos, { filter: 'all', search: 'BUY MILK', category: 'all' })
    expect(result.map((todo) => todo.id)).toEqual(['a', 'c'])
  })

  it('combines filters', () => {
    const result = selectVisible(todos, {
      filter: 'active',
      search: 'milk',
      category: 'shopping',
    })
    expect(result.map((todo) => todo.id)).toEqual(['a', 'c'])
  })
})

describe('getCounts', () => {
  it('computes all/active/completed counts', () => {
    expect(getCounts(todos)).toEqual({ all: 3, active: 2, completed: 1 })
  })
})