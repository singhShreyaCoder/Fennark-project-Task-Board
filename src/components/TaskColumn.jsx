import TaskCard from './TaskCard'

export default function TaskColumn({
  column,
  tasks,
  columns,
  draggingId,
  isDragOver,
  onEditTask,
  onDeleteTask,
  onMoveTask,
  onDragStart,
  onDragEnd,
  onColumnDragOver,
  onColumnDragLeave,
  onDropTask,
}) {
  function handleDragOver(event) {
    // preventDefault tells the browser this column accepts a drop.
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    onColumnDragOver(column.id)
  }

  function handleDragLeave(event) {
    // Ignore dragleave events fired when moving over child elements.
    if (event.currentTarget.contains(event.relatedTarget)) return
    onColumnDragLeave(column.id)
  }

  function handleDrop(event) {
    event.preventDefault()
    const taskId = event.dataTransfer.getData('text/plain')
    onDropTask(column.id, taskId)
  }

  return (
    <section
      className={`task-column status-${column.accent}${isDragOver ? ' is-drag-over' : ''}`}
      aria-labelledby={`column-${column.id}-title`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="task-column__header">
        <h2 className="task-column__title" id={`column-${column.id}-title`}>
          <span className="task-column__dot" aria-hidden="true" />
          {column.title}
        </h2>
        <span className="task-column__count" aria-label={`${tasks.length} tasks`}>
          {tasks.length}
        </span>
      </div>

      <p className="task-column__hint">{column.hint}</p>

      <div className="task-column__body">
        {tasks.length === 0 ? (
          <div className="task-column__empty">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
              <rect x="3.5" y="5.5" width="17" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 10.5h8M8 14.5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="task-column__empty-title">No tasks here yet</span>
            <span className="task-column__empty-text">
              {column.id === 'todo'
                ? 'Use “Add Task” to create your first task.'
                : 'Drag a card here or use the arrow buttons.'}
            </span>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              columns={columns}
              isDragging={draggingId === task.id}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onMove={onMoveTask}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          ))
        )}
      </div>
    </section>
  )
}
