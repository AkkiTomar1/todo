import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DndContext } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { TodoProvider, useTodo } from '../context/TodoContext'
import TodoItems from './TodoItems'
import { makeTodo } from '../test/factories'
import type { Todo } from '../types/todo'

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

function renderItem(seed: Todo = makeTodo()) {
  localStorage.setItem('todos', JSON.stringify([seed]))

  function Harness() {
    const { todos } = useTodo()
    const todo = todos[0]
    return (
      <>
        <div role="list">
          {todo && (
            <TodoItems
              todo={todo}
              sortable={false}
              isActive={false}
              onRowRef={() => {}}
              onActiveChange={() => {}}
            />
          )}
        </div>
        <output data-testid="count">{todos.length}</output>
      </>
    )
  }

  return render(
    <DndContext>
      <SortableContext items={[]} strategy={verticalListSortingStrategy}>
        <TodoProvider>
          <Harness />
        </TodoProvider>
      </SortableContext>
    </DndContext>,
  )
}

describe('TodoItems', () => {
  it('renders title and category badge', () => {
    renderItem(makeTodo({ title: 'Call dentist', category: 'work' }))
    expect(screen.getByText('Call dentist')).toBeInTheDocument()
    expect(screen.getByText('Work')).toBeInTheDocument()
  })

  it('toggles completion via the checkbox', async () => {
    const user = userEvent.setup()
    renderItem(makeTodo({ title: 'Toggle me' }))

    await user.click(screen.getByLabelText('Mark Toggle me complete'))

    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('1'))
    expect(screen.getByText('Toggle me')).toHaveClass('line-through')
  })

  it('edits the title inline with Enter', async () => {
    const user = userEvent.setup()
    renderItem(makeTodo({ title: 'Old title' }))

    await user.click(screen.getByLabelText('Edit Old title'))
    const input = screen.getByLabelText('Edit task title')
    await user.clear(input)
    await user.type(input, 'New title{Enter}')

    expect(screen.getByText('New title')).toBeInTheDocument()
    expect(screen.queryByText('Old title')).not.toBeInTheDocument()
  })

  it('cancels editing with Escape', async () => {
    const user = userEvent.setup()
    renderItem(makeTodo({ title: 'Keep me' }))

    await user.click(screen.getByLabelText('Edit Keep me'))
    const input = screen.getByLabelText('Edit task title')
    await user.clear(input)
    await user.type(input, 'Changed{Escape}')

    expect(screen.getByText('Keep me')).toBeInTheDocument()
    expect(screen.queryByText('Changed')).not.toBeInTheDocument()
  })

  it('deletes a todo', async () => {
    const user = userEvent.setup()
    renderItem(makeTodo({ title: 'Remove me' }))

    await user.click(screen.getByLabelText('Delete Remove me'))

    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('0'))
  })
})