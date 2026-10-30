import { memo } from 'react'

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

function TaskCard({
  task,
  columns,
  isDragging,
  onEdit,
  onDelete,
  onMove,
  onDragStart,
  onDragEnd,
}) {
  const columnIndex = columns.findIndex((column) => column.id === task.status)
  const previousColumn = columnIndex > 0 ? columns[columnIndex - 1] : null
  const nextColumn =
    columnIndex >= 0 && columnIndex < columns.length - 1 ? columns[columnIndex + 1] : null

  function handleDragStart(event) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', task.id)
    onDragStart(task.id)
  }

  return (
    <article
      className={`task-card status-${task.status}${isDragging ? ' is-dragging' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="task-card__top">
        <span className="task-card__meta">
          <span className="task-card__meta-dot" aria-hidden="true" />
          Added {formatDate(task.createdAt)}
        </span>

        <div className="task-card__actions">
          <button
            type="button"
            className="icon-btn"
            onClick={() => onEdit(task)}
            aria-label={`Edit task: ${task.title}`}
            title="Edit task"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
              <path
                d="M4 20h4l9.5-9.5a2.1 2.1 0 0 0-3-3L5 17v3Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path d="M13.5 6.5l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>

          <button
            type="button"
            className="icon-btn icon-btn--danger"
            onClick={() => onDelete(task.id)}
            aria-label={`Delete task: ${task.title}`}
            title="Delete task"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
              <path
                d="M4 7h16M9.5 7V4.5h5V7M6.5 7l.9 12.5h9.2L17.5 7"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <h3 className="task-card__title">{task.title}</h3>
      {task.description && <p className="task-card__description">{task.description}</p>}

      <div className="task-card__footer">
        <span className="task-card__drag-hint" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <circle cx="9" cy="7" r="1.4" />
            <circle cx="15" cy="7" r="1.4" />
            <circle cx="9" cy="12" r="1.4" />
            <circle cx="15" cy="12" r="1.4" />
            <circle cx="9" cy="17" r="1.4" />
            <circle cx="15" cy="17" r="1.4" />
          </svg>
          Drag
        </span>

        <div className="task-card__move">
          <button
            type="button"
            className="move-btn"
            onClick={() => previousColumn && onMove(task.id, previousColumn.id)}
            disabled={!previousColumn}
            aria-label={previousColumn ? `Move to ${previousColumn.title}` : 'Already in the first column'}
            title={previousColumn ? `Move to ${previousColumn.title}` : 'Already in the first column'}
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
              <path d="M14.5 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button
            type="button"
            className="move-btn"
            onClick={() => nextColumn && onMove(task.id, nextColumn.id)}
            disabled={!nextColumn}
            aria-label={nextColumn ? `Move to ${nextColumn.title}` : 'Already in the last column'}
            title={nextColumn ? `Move to ${nextColumn.title}` : 'Already in the last column'}
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
              <path d="M9.5 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  )
}

// memo() keeps unchanged cards from re-rendering when another task changes.
export default memo(TaskCard)
