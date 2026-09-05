import { beforeEach, describe, expect, it } from 'vitest'
import { loadTodos, normalizeTodo, saveTodos } from './storage'
import { makeTodo } from '../test/factories'

beforeEach(() => {
  localStorage.clear()
})

describe('saveTodos / loadTodos', () => {
  it('round-trips todos through localStorage', () => {
    const todos = [makeTodo({ title: 'One' }), makeTodo({ title: 'Two', completed: true })]
    saveTodos(todos)
    expect(loadTodos()).toEqual(todos)
  })

  it('returns an empty list when nothing is stored', () => {
    expect(loadTodos()).toEqual([])
  })

  it('returns an empty list for corrupted JSON', () => {
    localStorage.setItem('todos', '{not valid json')
    expect(loadTodos()).toEqual([])
  })

  it('returns an empty list when stored value is not an array', () => {
    localStorage.setItem('todos', JSON.stringify({ oops: true }))
    expect(loadTodos()).toEqual([])
  })

  it('filters out malformed entries', () => {
    localStorage.setItem('todos', JSON.stringify([null, 42, { title: 5 }]))
    expect(loadTodos()).toEqual([])
  })
})

describe('normalizeTodo', () => {
  it('migrates the legacy { id, todo, completed } shape', () => {
    const legacy = { id: 7, todo: 'Old task', completed: true }
    const todo = normalizeTodo(legacy)
    expect(todo).toMatchObject({
      id: '7',
      title: 'Old task',
      completed: true,
      category: 'personal',
    })
  })

  it('minifies an invalid item to null', () => {
    expect(normalizeTodo(null)).toBeNull()
    expect(normalizeTodo('string')).toBeNull()
    expect(normalizeTodo({})).toBeNull()
  })
})