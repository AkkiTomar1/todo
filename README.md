# My Tasks — Todo App

A fast, beautiful, keyboard-first todo app built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Rolldown-Vite**.

## Features

- **Add tasks** with a category
- **Drag & drop reordering** (dnd-kit) — reorder in the *All* view
- **Inline editing** — auto-focus, `Enter` saves, `Esc` cancels, blur commits
- **Filters & search** — All / Active / Completed with live counts, category chips, full-text search
- **Undo delete** — every deletion is one tap away from being restored
- **Keyboard shortcuts** — press `?` in the app for the full list
- **Dark / light theme** with system-preference detection
- **Swipe-to-delete** on touch devices
- **Confetti celebration** when every task is done
- **localStorage persistence** with robust hydration (legacy data migrates automatically)
- **Fully accessible** — labelled inputs, `aria-live` regions, keyboard navigation, `prefers-reduced-motion` support

## Tech Stack

| Layer | Choice |
|---|---|
| UI | React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 (CSS-first config, `dark:` variant) |
| Build | Rolldown-Vite 7 |
| Motion | `motion` |
| Drag & drop | `@dnd-kit/core` + `@dnd-kit/sortable` |
| Toasts | `sonner` |
| Tests | Vitest + React Testing Library + jsdom |

## Getting Started

```bash
npm install       # install dependencies
npm run dev       # start the dev server
npm test          # run the test suite
npm run typecheck # type-check the project
npm run lint      # lint the project
npm run build     # production build
```

## Project Structure

```
src/
├── components/   # Presentational components (form, list, items, filters, ...)
├── context/      # TodoProvider + useTodo (reducer-powered, localStorage-persisted)
├── hooks/        # useTheme
├── selectors/    # Pure functions for filtering/selecting todos
├── store/        # Typed reducer with all todo actions
├── test/         # Test setup + factories
├── types/        # Shared domain types + category metadata
└── utils/        # storage, id generation, todo factory
```

## Deploy

The app deploys to GitHub Pages under the `/todo` subpath (`base: "/todo"`):

```bash
npm run deploy    # builds and pushes dist/ to gh-pages
```