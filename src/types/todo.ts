export type Category = 'work' | 'personal' | 'shopping' | 'home'
export type Filter = 'all' | 'active' | 'completed'

export interface Todo {
  id: string
  title: string
  completed: boolean
  category: Category
  createdAt: number
}

export type NewTodo = Pick<Todo, 'title' | 'category'>

export const CATEGORIES: Category[] = ['work', 'personal', 'shopping', 'home']

export const CATEGORY_META: Record<
  Category,
  { label: string; badge: string; dot: string }
> = {
  work: {
    label: 'Work',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
    dot: 'bg-blue-500',
  },
  personal: {
    label: 'Personal',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  shopping: {
    label: 'Shopping',
    badge: 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300',
    dot: 'bg-violet-500',
  },
  home: {
    label: 'Home',
    badge: 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300',
    dot: 'bg-orange-500',
  },
}

export const FILTERS: Filter[] = ['all', 'active', 'completed']