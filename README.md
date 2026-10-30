# My Task Board — Kanban Task Board (React + Vite)

A modern, responsive Kanban board with three columns (**To Do**, **In Progress**, **Done**).
Tasks can be added, edited, deleted, moved with buttons or drag and drop, and everything is
saved to the browser's LocalStorage so the board survives a page refresh.

Built with React 19, Vite, plain JavaScript (ES6+) and CSS — no extra UI libraries.

## Features

- Add tasks with a required title and an optional description
- Edit any task in a modal (title and description)
- Delete tasks
- Move tasks between columns with **← / →** buttons or **drag and drop**
- Live task counts per column and a total count in the header
- Friendly empty state for every column
- Automatic LocalStorage persistence (saved on every add / edit / delete / move)
- Input validation (empty or whitespace-only titles are rejected)
- Responsive layout for desktop, tablet and mobile
- Keyboard friendly: `Escape` closes the modal, visible focus styles, labelled buttons

## Tech stack

- React 19 (functional components + hooks)
- Vite
- JavaScript (ES6+), HTML5, CSS3
- Browser LocalStorage

## Getting started

Requirements: Node.js 20.19+ (or 22.12+) and npm, as required by Vite 8.

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

Open the URL printed in the terminal (usually <http://localhost:5173>).

Other scripts:

```bash
npm run build     # production build into dist/
npm run preview   # serve the production build locally
npm run lint      # run oxlint
```

## Project structure

```
src/
├── components/
│   ├── TaskBoard.jsx    # header, column grouping, modal state, drag state
│   ├── TaskColumn.jsx   # one column: title, count, empty state, drop zone
│   ├── TaskCard.jsx     # one task: edit/delete buttons, move arrows, drag source
│   └── AddTaskModal.jsx # modal form used for both adding and editing
├── App.jsx              # task state, CRUD handlers, LocalStorage sync
├── App.css              # board, card and modal styles + responsive rules
├── index.css            # design tokens, reset, status colours
└── main.jsx             # React entry point
```

## How it works

### State (`App.jsx`)

`App` owns the single source of truth: a `tasks` array. Every task looks like this:

```js
{
  id: 'a-unique-id',        // crypto.randomUUID() with a fallback
  title: 'Design homepage',
  description: 'Optional details',
  status: 'todo',           // 'todo' | 'progress' | 'done'
  createdAt: 1730000000000  // timestamp used for the "Added …" label
}
```

The three columns are configured once in `COLUMNS` (id, title, accent colour). New tasks
always start in `todo`. All updates are immutable (`map`, `filter`, spread) so React can
render predictably.

### Components

- **`TaskBoard`** — renders the page heading, the total badge and the Add Task button.
  It groups tasks by status with `useMemo`, owns the modal open/close state, and tracks
  which card is being dragged and which column is currently highlighted.
- **`TaskColumn`** — renders one column with its title, count pill, hint and empty state.
  It is also the drag-and-drop target (`onDragOver` / `onDrop`) and renders a `TaskCard`
  for each task in that column.
- **`TaskCard`** — renders a single card. It provides edit and delete buttons, left/right
  move buttons (disabled at the ends of the board) and makes the card draggable. It is
  wrapped in `memo()` so unchanged cards do not re-render.
- **`AddTaskModal`** — one form for both modes. It receives `task={null}` when adding and
  an existing task when editing, validates the title, closes on `Escape` or a backdrop
  click, and returns the entered values through `onSave`.

### Drag and drop

The card sets its id on the drag event:

```js
event.dataTransfer.setData("text/plain", task.id);
```

The column calls `preventDefault()` on `dragover` (which is what makes it a valid drop
target), highlights itself, and on `drop` reads the id and calls `onMoveTask(taskId, columnId)`.
No DOM manipulation is involved — every visual change comes from React state.

### LocalStorage persistence

- **Reading:** `useState(readStoredTasks)` uses a lazy initialiser, so storage is read once
  on mount. The stored JSON is parsed and validated (`normaliseTask`); invalid entries,
  unknown statuses or broken JSON fall back to a safe default instead of crashing.
- **Writing:** a single `useEffect` with `[tasks]` as its dependency runs after every change
  (add, edit, delete, move) and writes `JSON.stringify(tasks)` to the key
  `kanban-task-board.tasks.v1`.
- **Restoring:** because the initial state is read from that same key, a refresh rebuilds
  the exact board. The "Added …" dates are stored too.

To reset the board, open DevTools → Application → Local Storage and delete the
`kanban-task-board.tasks.v1` key (or run `localStorage.clear()` in the console).

## How to test the functionality

Run `npm run dev`, open the app, then check:

1. **Add** — click **Add Task**, leave the title empty and submit: an inline error appears
   and no card is created. Enter a title (and optionally a description) and submit: the
   card appears in **To Do**, the column count and header total increase.
2. **Edit** — click the pencil icon on a card, change the title/description and save:
   the card updates in place and its column count stays the same.
3. **Move** — hover a card and use the **← / →** arrows: it moves one column at a time,
   and the arrow into an out-of-range column is disabled.
4. **Drag and drop** — drag a card and drop it on another column: the column highlights
   while hovering and the card moves on drop.
5. **Delete** — click the trash icon: the card disappears and the counts update.
6. **Counts and empty states** — each column shows its number of tasks; empty columns show
   "No tasks here yet".
7. **Persistence** — add and move a few tasks, then refresh the browser (F5): the board is
   restored exactly. Open DevTools → Application → Local Storage to inspect the saved JSON.
8. **Responsive** — resize the window or use device mode (e.g. 390 px, 820 px): the columns
   stack/reflow and the page never scrolls horizontally.
9. **Console** — DevTools → Console should stay free of errors.
