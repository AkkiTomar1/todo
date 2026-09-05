import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodoProvider, useTodo } from '../context/TodoContext'
import TodoForm from './TodoForm'
import type { Todo } from '../types/todo'

function Probe() {
  const { todos } = useTodo()
  return (
    <ul>
      {todos.map((todo: Todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  )
}

function renderForm() {
  return render(
    <TodoProvider>
      <TodoForm />
      <Probe />
    </TodoProvider>,
  )
}

describe('TodoForm', () => {
  it('adds a todo when submitted', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.type(screen.getByLabelText('New task title'), '   Write tests   ')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(await screen.findByText('Write tests')).toBeInTheDocument()
  })

  it('does nothing for an empty title', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
  })

  it('clears the input after adding', async () => {
    const user = userEvent.setup()
    renderForm()

    const input = screen.getByLabelText('New task title')
    await user.type(input, 'Clean up')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(input).toHaveValue('')
  })

  it('disables the add button for empty input', async () => {
    const user = userEvent.setup()
    renderForm()

    const button = screen.getByRole('button', { name: 'Add' })
    expect(button).toBeDisabled()

    await user.type(screen.getByLabelText('New task title'), 'Anything')
    expect(button).toBeEnabled()
  })
})