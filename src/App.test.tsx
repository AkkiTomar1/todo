import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { makeTodo } from './test/factories'

vi.mock('motion/react', async () => {
  const React = await import('react')
  const cache = new Map<string, (props: Record<string, unknown>) => React.ReactElement>()
  const createElement = (tag: string) =>
    (props: Record<string, unknown>) => {
      const { children, initial, animate, exit, whileHover, whileTap, layout, transition, ...rest } =
        props
      void initial
      void animate
      void exit
      void whileHover
      void whileTap
      void layout
      void transition
      return React.createElement(tag, rest, children as React.ReactNode)
    }
  const motion = new Proxy({} as Record<string, unknown>, {
    get: (_target, prop: string) => {
      if (!cache.has(prop)) cache.set(prop, createElement(prop))
      return cache.get(prop)!
    },
  })
  return {
    motion,
    AnimatePresence: ({ children }: { children?: React.ReactNode }) =>
      (children as React.ReactNode) ?? null,
  }
})

vi.mock('canvas-confetti', () => ({ default: vi.fn() }))

describe('App', () => {
  it('renders the header and empty state', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'My Tasks' })).toBeInTheDocument()
    expect(screen.getByText("You're all caught up")).toBeInTheDocument()
  })

  it('adds a task and shows it in the list', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('New task title'), 'Buy groceries')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(await screen.findByText('Buy groceries')).toBeInTheDocument()
  })

  it('hydrates tasks from localStorage', () => {
    localStorage.setItem('todos', JSON.stringify([makeTodo({ title: 'Stored task' })]))
    render(<App />)
    expect(screen.getByText('Stored task')).toBeInTheDocument()
  })

  it('filters completed tasks', async () => {
    const user = userEvent.setup()
    localStorage.setItem('todos', JSON.stringify([makeTodo({ title: 'Stored task' })]))
    render(<App />)

    const completeBox = await screen.findByLabelText('Mark Stored task complete')
    await user.click(completeBox)
    await user.click(screen.getByRole('button', { name: /^Completed/ }))

    expect(screen.getByText('Stored task')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Active/ })).toBeInTheDocument()
  })

  it('shows the empty state for an empty filter', async () => {
    const user = userEvent.setup()
    localStorage.setItem('todos', JSON.stringify([makeTodo({ title: 'Stored task' })]))
    render(<App />)

    await user.click(await screen.findByRole('button', { name: /^Completed/ }))

    expect(screen.getByText('No tasks match your filters')).toBeInTheDocument()
  })
})