import { useMemo } from 'react'
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { AnimatePresence } from 'motion/react'
import TodoItems from './TodoItems'
import type { Todo } from '../types/todo'

interface TodoListProps {
  items: Todo[]
  sortable: boolean
  activeId: string | null
  onReorder: (from: number, to: number) => void
  onRowRef: (id: string, node: HTMLDivElement | null) => void
  onActiveChange: (id: string | null) => void
}

export default function TodoList({
  items,
  sortable,
  activeId,
  onReorder,
  onRowRef,
  onActiveChange,
}: TodoListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const itemIds = useMemo(() => items.map((item) => item.id), [items])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const from = items.findIndex((item) => item.id === active.id)
    const to = items.findIndex((item) => item.id === over.id)
    if (from === -1 || to === -1) return
    onReorder(from, to)
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div role="list" className="flex flex-col gap-2.5">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <TodoItems
                key={item.id}
                todo={item}
                sortable={sortable}
                isActive={activeId === item.id}
                onRowRef={onRowRef}
                onActiveChange={onActiveChange}
              />
            ))}
          </AnimatePresence>
        </div>
      </SortableContext>
    </DndContext>
  )
}