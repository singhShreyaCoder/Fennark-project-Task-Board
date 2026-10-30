import { useCallback, useMemo, useState } from 'react'
import TaskColumn from './TaskColumn'
import AddTaskModal from './AddTaskModal'

export default function TaskBoard({
  tasks,
  columns,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onMoveTask,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [draggingId, setDraggingId] = useState(null)
  const [dragOverColumn, setDragOverColumn] = useState(null)

  // Group tasks once per change instead of filtering three times in the JSX.
  const tasksByStatus = useMemo(() => {
    const groups = {}
    columns.forEach((column) => {
      groups[column.id] = []
    })

    tasks.forEach((task) => {
      if (groups[task.status]) groups[task.status].push(task)
    })

    return groups
  }, [tasks, columns])

  const openAddModal = useCallback(() => {
    setEditingTask(null)
    setIsModalOpen(true)
  }, [])

  const openEditModal = useCallback((task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setEditingTask(null)
  }, [])

  const handleSave = useCallback(
    (values) => {
      const saved = editingTask
        ? onUpdateTask(editingTask.id, values)
        : onAddTask(values)

      if (saved) closeModal()
      return saved
    },
    [editingTask, onAddTask, onUpdateTask, closeModal],
  )

  const handleDragStart = useCallback((taskId) => {
    setDraggingId(taskId)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggingId(null)
    setDragOverColumn(null)
  }, [])

  const handleColumnDragOver = useCallback((columnId) => {
    setDragOverColumn(columnId)
  }, [])

  const handleColumnDragLeave = useCallback((columnId) => {
    setDragOverColumn((current) => (current === columnId ? null : current))
  }, [])

  const handleDrop = useCallback(
    (columnId, taskId) => {
      if (taskId) onMoveTask(taskId, columnId)
      setDraggingId(null)
      setDragOverColumn(null)
    },
    [onMoveTask],
  )

  return (
    <>
      <header className="board-header">
        <div className="board-header__brand">
          <div className="board-logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
              <rect x="3" y="4" width="4.5" height="16" rx="1.5" fill="currentColor" opacity="0.9" />
              <rect x="9.75" y="4" width="4.5" height="11" rx="1.5" fill="currentColor" opacity="0.7" />
              <rect x="16.5" y="4" width="4.5" height="7" rx="1.5" fill="currentColor" opacity="0.5" />
            </svg>
          </div>

          <div>
            <h1>My Task Board</h1>
            <p className="board-header__subtitle">
              Plan your work, drag the cards, and keep everything in one place.
            </p>
          </div>
        </div>

        <div className="board-header__actions">
          <span className="total-badge">
            <strong>{tasks.length}</strong>
            {tasks.length === 1 ? 'task' : 'tasks'}
          </span>

          <button type="button" className="add-task-btn" onClick={openAddModal}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            Add Task
          </button>
        </div>
      </header>

      <main className="board">
        {columns.map((column) => (
          <TaskColumn
            key={column.id}
            column={column}
            tasks={tasksByStatus[column.id]}
            columns={columns}
            draggingId={draggingId}
            isDragOver={dragOverColumn === column.id}
            onEditTask={openEditModal}
            onDeleteTask={onDeleteTask}
            onMoveTask={onMoveTask}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onColumnDragOver={handleColumnDragOver}
            onColumnDragLeave={handleColumnDragLeave}
            onDropTask={handleDrop}
          />
        ))}
      </main>

      {isModalOpen && (
        <AddTaskModal
          task={editingTask}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
    </>
  )
}
