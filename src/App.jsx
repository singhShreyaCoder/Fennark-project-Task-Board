import { useCallback, useEffect, useState } from 'react'
import TaskBoard from './components/TaskBoard'
import './App.css'

/**
 * The three Kanban columns. `id` is also the task status stored on each task,
 * and `accent` maps to a set of colours defined in index.css.
 */
const COLUMNS = [
  { id: 'todo', title: 'To Do', accent: 'todo', hint: 'Everything that still needs to be started.' },
  { id: 'progress', title: 'In Progress', accent: 'progress', hint: 'Tasks you are working on right now.' },
  { id: 'done', title: 'Done', accent: 'done', hint: 'Finished work. Nice one!' },
]

const STORAGE_KEY = 'kanban-task-board.tasks.v1'
const VALID_STATUSES = COLUMNS.map((column) => column.id)

/** Create a unique id for a task (crypto.randomUUID when available). */
function createTaskId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `task-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`
}

/** Keep only well-formed tasks so corrupted storage can never break the UI. */
function normaliseTask(task) {
  if (!task || typeof task !== 'object') return null

  const title = typeof task.title === 'string' ? task.title.trim() : ''
  if (!title) return null

  return {
    id: typeof task.id === 'string' && task.id ? task.id : createTaskId(),
    title,
    description: typeof task.description === 'string' ? task.description : '',
    status: VALID_STATUSES.includes(task.status) ? task.status : 'todo',
    createdAt: Number.isFinite(task.createdAt) ? task.createdAt : Date.now(),
  }
}

/** Read and validate tasks from localStorage (used as the lazy initial state). */
function readStoredTasks() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    const seenIds = new Set()

    return parsed
      .map(normaliseTask)
      .filter(Boolean)
      .map((task) => {
        if (!seenIds.has(task.id)) {
          seenIds.add(task.id)
          return task
        }

        // Duplicate ids would break React keys and target both tasks at once.
        const id = createTaskId()
        seenIds.add(id)
        return { ...task, id }
      })
  } catch {
    // Bad JSON or storage blocked — start with an empty board.
    return []
  }
}

export default function App() {
  // Passing a function to useState runs it once, so storage is read only on mount.
  const [tasks, setTasks] = useState(readStoredTasks)

  // Persist after every change: add, edit, delete, move.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    } catch {
      // Storage can be full or unavailable; the board keeps working in memory.
    }
  }, [tasks])

  const addTask = useCallback(({ title, description }) => {
    const cleanTitle = title.trim()
    if (!cleanTitle) return false

    setTasks((current) => [
      ...current,
      {
        id: createTaskId(),
        title: cleanTitle,
        description: description.trim(),
        status: 'todo',
        createdAt: Date.now(),
      },
    ])
    return true
  }, [])

  const updateTask = useCallback((taskId, { title, description }) => {
    const cleanTitle = title.trim()
    if (!cleanTitle) return false

    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? { ...task, title: cleanTitle, description: description.trim() }
          : task,
      ),
    )
    return true
  }, [])

  const deleteTask = useCallback((taskId) => {
    setTasks((current) => current.filter((task) => task.id !== taskId))
  }, [])

  const moveTask = useCallback((taskId, status) => {
    if (!VALID_STATUSES.includes(status)) return

    setTasks((current) =>
      current.map((task) => (task.id === taskId ? { ...task, status } : task)),
    )
  }, [])

  return (
    <div className="app">
      <TaskBoard
        tasks={tasks}
        columns={COLUMNS}
        onAddTask={addTask}
        onUpdateTask={updateTask}
        onDeleteTask={deleteTask}
        onMoveTask={moveTask}
      />

      <footer className="app-footer">
        Your tasks are saved automatically in this browser — refresh the page and they will still be here.
      </footer>
    </div>
  )
}
